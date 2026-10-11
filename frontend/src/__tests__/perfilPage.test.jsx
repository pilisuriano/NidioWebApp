import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

vi.mock('../lib/auth', () => ({
  useAuth: () => ({ user: { name: 'Pili', email: 'p@x.com', accountType: 'PERSONAL', role: 'USER' }, logout: vi.fn(), updateProfile: vi.fn() }),
}));
vi.mock('../components/billing/SubscriptionSection', () => ({ SubscriptionSection: () => <div>CONTENIDO SUSCRIPCION</div> }));

import Perfil from '../pages/Perfil';

const renderAt = path => render(<MemoryRouter initialEntries={[path]}><Perfil /></MemoryRouter>);

describe('Perfil con pestañas', () => {
  it('abre "Mi cuenta" por defecto y no muestra la suscripción', () => {
    renderAt('/perfil');
    expect(screen.getByRole('tab', { name: /mi cuenta/i })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByLabelText(/nombre y apellido/i)).toBeInTheDocument();
    expect(screen.queryByText('CONTENIDO SUSCRIPCION')).not.toBeInTheDocument();
  });

  it('pasa a "Suscripción y pagos" y oculta el formulario', () => {
    renderAt('/perfil');
    fireEvent.click(screen.getByRole('tab', { name: /suscripción y pagos/i }));
    expect(screen.getByText('CONTENIDO SUSCRIPCION')).toBeInTheDocument();
    expect(screen.queryByLabelText(/nombre y apellido/i)).not.toBeInTheDocument();
  });

  it('el hash #suscripcion abre directo esa pestaña', () => {
    renderAt('/perfil#suscripcion');
    expect(screen.getByRole('tab', { name: /suscripción y pagos/i })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByText('CONTENIDO SUSCRIPCION')).toBeInTheDocument();
  });

  it('lo escrito en el formulario no se pierde al ir y volver de la otra pestaña', () => {
    renderAt('/perfil');
    fireEvent.change(screen.getByLabelText(/teléfono/i), { target: { value: '11 5555 0000' } });
    fireEvent.click(screen.getByRole('tab', { name: /suscripción y pagos/i }));
    fireEvent.click(screen.getByRole('tab', { name: /mi cuenta/i }));
    expect(screen.getByLabelText(/teléfono/i)).toHaveValue('11 5555 0000');
  });
});
