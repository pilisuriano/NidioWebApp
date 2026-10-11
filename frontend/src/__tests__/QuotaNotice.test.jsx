import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QuotaNotice } from '../components/ui/QuotaNotice';

const base = { feature: 'VALUATION', limit: 3, unlimited: false, source: 'FREE', resetsAt: '2026-11-01T03:00:00Z' };

function renderNotice(feature, status) {
  return render(<MemoryRouter><QuotaNotice feature={feature} status={status} /></MemoryRouter>);
}

describe('QuotaNotice', () => {
  it('muestra cuántos usos gratis quedan', () => {
    renderNotice('valuation', { ...base, used: 1, remaining: 2 });
    expect(screen.getByRole('status')).toHaveTextContent('Te quedan 2 de 3 tasaciones gratis este mes.');
  });

  it('al llegar al límite bloquea y lleva a la página de planes', () => {
    renderNotice('recommendation', { ...base, used: 3, remaining: 0 });
    expect(screen.getByRole('alert')).toHaveTextContent('Usaste tus 3 recomendaciones gratis de este mes');
    expect(screen.getByRole('alert')).toHaveTextContent('Se renuevan el 1/11');
    expect(screen.getByRole('link', { name: /conocer el plan pago/i })).toHaveAttribute('href', '/planes');
  });

  it('con pase vigente indica hasta cuándo vale', () => {
    renderNotice('lifeScore', { ...base, source: 'PASS', limit: 30, used: 5, remaining: 25, resetsAt: '2026-11-09T12:00:00Z' });
    expect(screen.getByRole('status')).toHaveTextContent('Te quedan 25 de 30 cálculos de Life Score de tu pase (vence el 9/11).');
  });

  it('con el pase agotado ofrece el pack adicional', () => {
    renderNotice('valuation', { ...base, source: 'PASS', limit: 30, used: 30, remaining: 0, resetsAt: '2026-11-09T12:00:00Z' });
    expect(screen.getByRole('alert')).toHaveTextContent('Usaste los 30 tasaciones de tu pase');
    expect(screen.getByRole('link', { name: /comprar \+10 usos/i })).toHaveAttribute('href', '/planes#packs');
  });

  it('no muestra nada para cuentas sin límite (admin)', () => {
    const { container } = renderNotice('valuation', { ...base, limit: null, remaining: null, unlimited: true });
    expect(container).toBeEmptyDOMElement();
  });
});
