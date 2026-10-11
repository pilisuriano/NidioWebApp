import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

const property = {
  id: 7, title: 'Depto luminoso', address: 'Av. Siempre Viva 123', neighborhoodName: 'Palermo', operationType: 'SALE',
  price: 120000, propertyType: 'APARTMENT', surfaceM2: 50, favoriteCount: 0, createdAt: '2026-10-01T10:00:00Z',
  active: true, deactivatedByAdmin: false, imageUrls: [],
};

const billing = vi.hoisted(() => ({
  getFeaturedAvailability: vi.fn(),
  activateFeatured: vi.fn(),
  invalidateFeaturedIds: vi.fn(),
  refresh: vi.fn(),
}));

vi.mock('../lib/api', () => ({
  api: { get: vi.fn(url => Promise.resolve({ data: url.includes('stats') ? { totalProperties: 1, activeCount: 1, inactiveCount: 0, totalFavorites: 0 } : { content: [property], page: 0, totalPages: 1 } })) },
  apiErrorMessage: (err, fallback) => err?.response?.data?.message ?? fallback,
}));
vi.mock('../lib/billing', () => ({
  getFeaturedAvailability: billing.getFeaturedAvailability,
  activateFeatured: billing.activateFeatured,
  invalidateFeaturedIds: billing.invalidateFeaturedIds,
  useCatalog: () => ({ byCode: { FEATURED_SINGLE: { code: 'FEATURED_SINGLE', name: 'Destacado 7 días', priceUsd: 8, description: 'd' } } }),
  useFeaturedIds: () => new Set(),
  useBillingSummary: () => ({ summary: { featured: { active: [] } }, refresh: billing.refresh }),
}));
vi.mock('react-toastify', () => ({ toast: { success: vi.fn(), info: vi.fn(), error: vi.fn() } }));
vi.mock('../components/billing/CheckoutDialog', () => ({ CheckoutDialog: ({ featuredStartsAt }) => <div>CHECKOUT reserva={String(featuredStartsAt)}</div> }));

import MisPublicaciones from '../pages/MisPublicaciones';

const full = { startsNow: false, startsAt: '2026-10-16T12:00:00Z', endsAt: '2026-10-23T12:00:00Z', blockedBy: 'GLOBAL' };

async function clickDestacar() {
  render(<MemoryRouter><MisPublicaciones /></MemoryRouter>);
  fireEvent.click(await screen.findByRole('button', { name: /destacar por 7 días/i }));
}

describe('Reserva de destacado cuando no hay lugar', () => {
  beforeEach(() => vi.clearAllMocks());

  it('con lugar hoy destaca directo, sin preguntar', async () => {
    billing.getFeaturedAvailability.mockResolvedValue({ startsNow: true, startsAt: '2026-10-12T12:00:00Z', endsAt: '2026-10-19T12:00:00Z', blockedBy: null });
    billing.activateFeatured.mockResolvedValue({});
    await clickDestacar();
    await waitFor(() => expect(billing.activateFeatured).toHaveBeenCalledWith(7, null));
    expect(screen.queryByText(/hoy no hay lugar/i)).not.toBeInTheDocument();
  });

  it('sin lugar, pregunta si acepta la fecha y al aceptar reserva con esa fecha', async () => {
    billing.getFeaturedAvailability.mockResolvedValue(full);
    billing.activateFeatured.mockResolvedValue({});
    await clickDestacar();
    expect(await screen.findByText(/hoy no hay lugar para destacar/i)).toBeInTheDocument();
    expect(screen.getByText(/todos ocupados/i)).toBeInTheDocument();
    expect(billing.activateFeatured).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: /reservar para el/i }));
    await waitFor(() => expect(billing.activateFeatured).toHaveBeenCalledWith(7, '2026-10-16T12:00:00Z'));
  });

  it('si cancela, no se reserva ni se cobra nada', async () => {
    billing.getFeaturedAvailability.mockResolvedValue(full);
    await clickDestacar();
    fireEvent.click(await screen.findByRole('button', { name: /no, cancelar/i }));
    expect(billing.activateFeatured).not.toHaveBeenCalled();
    expect(screen.queryByText(/hoy no hay lugar/i)).not.toBeInTheDocument();
  });

  it('si ya usó los créditos (402) abre el pago con la fecha de la reserva', async () => {
    billing.getFeaturedAvailability.mockResolvedValue(full);
    billing.activateFeatured.mockRejectedValue({ response: { status: 402, data: { message: 'Ya usaste tus destacados' } } });
    await clickDestacar();
    fireEvent.click(await screen.findByRole('button', { name: /reservar para el/i }));
    expect(await screen.findByText(/CHECKOUT reserva=2026-10-16T12:00:00Z/)).toBeInTheDocument();
  });

  it('cuando el tope es el de la cuenta lo dice', async () => {
    billing.getFeaturedAvailability.mockResolvedValue({ ...full, blockedBy: 'ACCOUNT' });
    await clickDestacar();
    expect(await screen.findByText(/máximo de destacados a la vez que permite tu cuenta/i)).toBeInTheDocument();
  });
});

describe('Filtro "Destacadas" en Mis publicaciones', () => {
  it('al elegirlo pide solo las destacadas al backend (featured=true, sin filtrar por estado)', async () => {
    const { api } = await import('../lib/api');
    render(<MemoryRouter><MisPublicaciones /></MemoryRouter>);
    await screen.findByRole('button', { name: /destacar por 7 días/i });
    api.get.mockClear();
    fireEvent.change(screen.getByDisplayValue('Todas'), { target: { value: 'featured' } });
    await waitFor(() => expect(api.get).toHaveBeenCalledWith('/api/my-properties', expect.objectContaining({
      params: expect.objectContaining({ featured: true, active: undefined }),
    })));
  });

  it('con "Activas" no manda el filtro de destacadas', async () => {
    const { api } = await import('../lib/api');
    render(<MemoryRouter><MisPublicaciones /></MemoryRouter>);
    await screen.findByRole('button', { name: /destacar por 7 días/i });
    api.get.mockClear();
    fireEvent.change(screen.getByDisplayValue('Todas'), { target: { value: 'true' } });
    await waitFor(() => expect(api.get).toHaveBeenCalledWith('/api/my-properties', expect.objectContaining({
      params: expect.objectContaining({ featured: undefined, active: true }),
    })));
  });
});
