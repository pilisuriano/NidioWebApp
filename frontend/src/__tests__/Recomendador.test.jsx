import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, act, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

vi.mock('@/lib/api', () => ({
  api: { get: vi.fn(), post: vi.fn() },
  apiErrorMessage: (e, fallback) => fallback,
}));
vi.mock('@/lib/blueRate', () => ({ useBlueRate: () => ({ blueRate: 1515, blueRateError: false }) }));
vi.mock('@/components/property/FavoriteButton', () => ({
  FavoriteButton: ({ propertyId }) => <button type="button" aria-label="Agregar a favoritos" data-property={propertyId} />,
}));
vi.mock('react-toastify', () => ({ toast: { error: vi.fn(), success: vi.fn() } }));

import { api } from '@/lib/api';
import { toast } from 'react-toastify';
import Recomendador from '../pages/Recomendador';

const PRICES = [400000, 500000, 600000, 700000, 800000, 900000, 1000000, 1200000, 1500000, 2000000];
const RESULT = {
  broadened: true,
  message: 'Ampliamos un poco la búsqueda: había pocas propiedades.',
  funnel: [
    { code: 'CATALOG', remaining: 10 }, { code: 'TYPE', remaining: 10 }, { code: 'BUDGET', remaining: 5 },
    { code: 'ROOMS', remaining: 4 }, { code: 'PRICE', remaining: 3 }, { code: 'DEALBREAKER', remaining: 3 },
  ],
  items: [{
    property: { id: 7, title: 'Depto luminoso', propertyType: 'APARTMENT', operationType: 'RENT', neighborhoodName: 'Palermo', price: 900000, surfaceM2: 45, rooms: 2, bathrooms: 1, imageUrl: null },
    matchScore: 81, priceStatus: 'IN_RANGE', reasons: ['x'], tradeoff: null, expensesUsd: 100,
    explanation: 'Te la recomendamos porque tiene mucho transporte público cerca.',
  }],
};

function renderPage() {
  return render(<MemoryRouter><Recomendador /></MemoryRouter>);
}

describe('Recomendador', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    api.get.mockResolvedValue({ data: PRICES });
    api.post.mockResolvedValue({ data: RESULT });
  });
  afterEach(() => { vi.useRealTimers(); });

  it('walks the 8 questions, skips the optional steps and shows the recommendation without scores', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    renderPage();

    await user.click(screen.getByRole('button', { name: /empezar/i }));
    const next = () => user.click(screen.getByRole('button', { name: /siguiente/i }));

    // 1. operación (no se puede avanzar sin responder)
    expect(screen.getByRole('button', { name: /siguiente/i })).toBeDisabled();
    await user.click(screen.getByRole('radio', { name: 'Alquilar' }));
    await next();
    // 2. tipo
    await user.click(screen.getByRole('radio', { name: /casa o ph/i }));
    expect(screen.getByText(/menos precisa en casas y ph/i)).toBeInTheDocument();
    await next();
    // 3. presupuesto: barra armada con los precios reales (en pesos por mes); arranca sin tope y se arrastra hasta el tope
    const slider = await screen.findByRole('slider', { name: /presupuesto máximo/i });
    expect(api.get).toHaveBeenCalledWith('/api/recommendations/budget-prices', { params: { operationType: 'RENT' } });
    expect(screen.getByText('Sin tope de presupuesto')).toBeInTheDocument();
    expect(screen.getByText('10 de 10 propiedades publicadas entran en ese tope.')).toBeInTheDocument();
    fireEvent.change(slider, { target: { value: '50' } }); // mitad de la barra = entre los precios 800.000 y 900.000
    expect(screen.getByText(/hasta ars 850\.000 por mes/i)).toBeInTheDocument();
    expect(screen.getByText('5 de 10 propiedades publicadas entran en ese tope.')).toBeInTheDocument();
    await next();
    // 4 a 6
    expect(screen.queryByRole('radiogroup', { name: 'Ambientes mínimos' })).not.toBeInTheDocument(); // aparece al elegir con quién
    await user.click(screen.getByRole('radio', { name: /en pareja/i }));
    // Ambientes: arranca en lo que sugiere la convivencia (pareja = 2+) y se puede cambiar
    expect(screen.getByRole('radio', { name: '2+' })).toHaveAttribute('aria-checked', 'true');
    await user.click(screen.getByRole('radio', { name: '3+' }));
    expect(screen.getByRole('radio', { name: '3+' })).toHaveAttribute('aria-checked', 'true');
    expect(screen.getByRole('radio', { name: '2+' })).toHaveAttribute('aria-checked', 'false');
    await next();
    await user.click(screen.getByRole('radio', { name: /que sea insegura/i }));
    await next();
    await user.click(screen.getByRole('radio', { name: /una zona tranquila/i }));
    await next();
    // 7. las 7 categorías, todas en "Me importa"; se marca una como clave
    expect(screen.getAllByRole('radiogroup')).toHaveLength(7);
    const transport = screen.getByRole('radiogroup', { name: 'Transporte público' });
    expect(transport.querySelector('[aria-checked="true"]')).toHaveTextContent('Me importa');
    await user.click(transport.querySelectorAll('[role="radio"]')[2]);
    await next();
    // 8. precio por encima del estimado
    await user.click(screen.getByRole('radio', { name: /no quiero que me la muestren/i }));
    await next();
    // 9. detalles opcionales (en alquiler no aparece "apto crédito")
    expect(screen.getByRole('checkbox', { name: 'Amoblado' })).toBeInTheDocument();
    expect(screen.queryByRole('checkbox', { name: 'Apto crédito' })).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /saltar/i }));
    // 10. dirección: se saltea y se busca
    await user.click(screen.getByRole('button', { name: /saltar/i }));

    expect(await screen.findByText(/estoy buscando tu lugar/i)).toBeInTheDocument();
    await act(async () => { await vi.advanceTimersByTimeAsync(8000); });

    expect(await screen.findByText(/encontré una propiedad para vos/i)).toBeInTheDocument();
    expect(screen.getByText(/ampliamos un poco la búsqueda/i)).toBeInTheDocument();
    expect(screen.getByText(/te la recomendamos porque/i)).toBeInTheDocument();
    expect(screen.getByText(/ars 151\.500 por mes/i)).toBeInTheDocument(); // 100 USD × 1515
    expect(screen.getByText('Precio dentro de lo que estima Nidio')).toBeInTheDocument();
    expect(screen.queryByText('81')).not.toBeInTheDocument(); // el puntaje no se muestra
    // Cómo se llegó al resultado, con los números reales del backend
    expect(screen.getByText('¿Cómo llegué a estas?')).toBeInTheDocument();
    expect(screen.getByText('10 propiedades publicadas')).toBeInTheDocument();
    expect(screen.getByText('5 dentro de tu presupuesto')).toBeInTheDocument();
    expect(screen.queryByText(/del tipo que elegiste/)).not.toBeInTheDocument(); // ese filtro no sacó ninguna
    // Toda la tarjeta abre la propiedad en una pestaña nueva, y el corazón de favoritos está en la tarjeta.
    const card = screen.getByRole('link', { name: /depto luminoso/i });
    expect(card).toHaveAttribute('href', '/propiedades/7');
    expect(card).toHaveAttribute('target', '_blank');
    expect(card.getAttribute('rel')).toContain('noopener');
    expect(card.querySelector('button[aria-label="Agregar a favoritos"]')).toHaveAttribute('data-property', '7');

    expect(api.post).toHaveBeenCalledTimes(1);
    const [url, body] = api.post.mock.calls[0];
    expect(url).toBe('/api/recommendations');
    expect(body).toMatchObject({
      operationType: 'RENT', propertyTypes: ['HOUSE', 'PH'], budgetMin: null, budgetMax: 850000,
      household: 'COUPLE', dealbreaker: 'UNSAFE', noisePreference: 'QUIET', overpricedPolicy: 'HIDE', blueRate: 1515,
    });
    expect(body.minRooms).toBe(3);
    expect(body.proximity.TRANSPORT).toBe('KEY');
    expect('details' in body).toBe(false);
    expect('workLat' in body).toBe(false);
  });

  it('goes back to the questions with a message when the request fails', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    api.post.mockRejectedValue(new Error('boom'));
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    renderPage();
    await user.click(screen.getByRole('button', { name: /empezar/i }));
    const next = () => user.click(screen.getByRole('button', { name: /siguiente/i }));
    await user.click(screen.getByRole('radio', { name: 'Comprar' })); await next();
    await user.click(screen.getByRole('radio', { name: /me da igual/i })); await next();
    await screen.findByRole('slider', { name: /presupuesto máximo/i });
    await next(); // la barra arranca en "sin tope": se puede seguir sin tocarla
    await user.click(screen.getByRole('radio', { name: /solo\/a/i })); await next();
    await user.click(screen.getByRole('radio', { name: /poco transporte/i })); await next();
    await user.click(screen.getByRole('radio', { name: /tolero algo/i })); await next();
    await next();
    await user.click(screen.getByRole('radio', { name: /que aparezca después/i }));
    await user.click(screen.getByRole('button', { name: /buscar sin los pasos opcionales/i }));
    await act(async () => { await vi.advanceTimersByTimeAsync(8000); });

    await waitFor(() => expect(toast.error).toHaveBeenCalled());
    expect(await screen.findByRole('button', { name: /siguiente/i })).toBeInTheDocument();
  });

  it('shows the expenses bar only when looking for an apartment', async () => {
    api.get.mockImplementation(url => Promise.resolve({
      data: url.includes('budget-expenses') ? [100, 150, 200, 260, 300] : PRICES,
    }));
    const user = userEvent.setup();
    renderPage();
    await user.click(screen.getByRole('button', { name: /empezar/i }));
    const next = () => user.click(screen.getByRole('button', { name: /siguiente/i }));
    await user.click(screen.getByRole('radio', { name: 'Alquilar' })); await next();
    await user.click(screen.getByRole('radio', { name: 'Departamento' })); await next();

    expect(await screen.findByRole('slider', { name: /expensas máximas/i })).toBeInTheDocument();
    expect(screen.getByText('Sin tope de expensas')).toBeInTheDocument();
    fireEvent.change(screen.getByRole('slider', { name: /expensas máximas/i }), { target: { value: '0' } });
    // 100 USD × 1515 = 151.500 → redondeado hacia arriba al paso de 10.000
    expect(await screen.findByText(/Hasta ARS 1[5-6]0\.000 por mes/)).toBeInTheDocument();
    expect(api.get).toHaveBeenCalledWith('/api/recommendations/budget-expenses', { params: { operationType: 'RENT' } });
  });

  it('does not ask for expenses when looking for a house', async () => {
    const user = userEvent.setup();
    renderPage();
    await user.click(screen.getByRole('button', { name: /empezar/i }));
    const next = () => user.click(screen.getByRole('button', { name: /siguiente/i }));
    await user.click(screen.getByRole('radio', { name: 'Alquilar' })); await next();
    await user.click(screen.getByRole('radio', { name: /casa o ph/i })); await next();

    await screen.findByRole('slider', { name: /presupuesto máximo/i });
    expect(screen.queryByRole('slider', { name: /expensas máximas/i })).not.toBeInTheDocument();
    expect(api.get).not.toHaveBeenCalledWith('/api/recommendations/budget-expenses', expect.anything());
  });
});
