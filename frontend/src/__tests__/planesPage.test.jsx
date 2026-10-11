import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

const catalog = {};
for (const [code, name, price, audience] of [
  ['ANALYSIS_PASS','Pase de análisis',6,'ANY'],['OWNER_4','Dueño 4',5,'PERSONAL'],['OWNER_5','Dueño 5',8,'PERSONAL'],['OWNER_6','Dueño 6',10,'PERSONAL'],
  ['PRO_INMOBILIARIA','Inmobiliaria',20,'PROFESSIONAL'],['PRO_PLUS','Inmobiliaria Plus',50,'PROFESSIONAL'],['PUBLICATIONS_50','+50 publicaciones',20,'PROFESSIONAL'],
  ['USES_VALUATION_10','+10 tasaciones',2,'ANY'],['USES_RECOMMENDATION_10','+10 recomendaciones',2,'ANY'],['USES_LIFE_SCORE_10','+10 Life Score',2,'ANY'],
  ['FEATURED_PACK_5','Pack 5 destacados',32,'PROFESSIONAL'],['FEATURED_SINGLE','Destacado 7 días',8,'ANY'],
]) catalog[code] = { code, name, description: 'desc', priceUsd: price, audience };

vi.mock('../lib/billing', () => ({ useCatalog: () => ({ byCode: catalog, error: null }) }));
vi.mock('../lib/cardRate', () => ({ useCardRate: () => ({ cardRate: null }), formatArs: () => '', formatUsd: v => `USD ${v}`, arsApprox: () => null }));
vi.mock('../lib/auth', () => ({ useAuth: () => ({ user: { accountType: 'PERSONAL', role: 'USER' } }) }));
vi.mock('react-toastify', () => ({ toast: { info: vi.fn(), success: vi.fn() } }));
vi.mock('../components/billing/CheckoutDialog', () => ({ CheckoutDialog: () => null }));

import Planes from '../pages/Planes';

function renderAt(path) {
  return render(<MemoryRouter initialEntries={[path]}><Planes /></MemoryRouter>);
}

describe('Planes con pestañas', () => {
  it('abre "Busco propiedad" por defecto y muestra solo esa sección', () => {
    renderAt('/planes');
    expect(screen.getByRole('tab', { name: /busco propiedad/i })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByText('Pase de análisis', { selector: 'h3' })).toBeInTheDocument();
    expect(screen.queryByText(/si sos dueño y publicás/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/inmobiliarias, corredores/i)).not.toBeInTheDocument();
  });

  it('cambia de pestaña al hacer click', () => {
    renderAt('/planes');
    fireEvent.click(screen.getByRole('tab', { name: /soy dueño/i }));
    expect(screen.getByText(/si sos dueño y publicás/i)).toBeInTheDocument();
    expect(screen.queryByText('Pase de análisis', { selector: 'h3' })).not.toBeInTheDocument();
    // dueño: destacados sin el pack (es solo profesional)
    expect(screen.getByText('Destacado 7 días', { selector: 'h3' })).toBeInTheDocument();
    expect(screen.queryByText('Pack 5 destacados')).not.toBeInTheDocument();
  });

  it('la pestaña profesional incluye el pack de destacados', () => {
    renderAt('/planes');
    fireEvent.click(screen.getByRole('tab', { name: /inmobiliaria o profesional/i }));
    expect(screen.getByText('Inmobiliaria Plus', { selector: 'h3' })).toBeInTheDocument();
    expect(screen.getByText('Pack 5 destacados', { selector: 'h3' })).toBeInTheDocument();
  });

  it('un hash como #destacados abre la pestaña de dueños', () => {
    renderAt('/planes#destacados');
    expect(screen.getByRole('tab', { name: /soy dueño/i })).toHaveAttribute('aria-selected', 'true');
  });

  it('las flechas del teclado mueven entre pestañas', () => {
    renderAt('/planes');
    fireEvent.keyDown(screen.getByRole('tab', { name: /busco propiedad/i }), { key: 'ArrowRight' });
    expect(screen.getByRole('tab', { name: /soy dueño/i })).toHaveAttribute('aria-selected', 'true');
  });
});
