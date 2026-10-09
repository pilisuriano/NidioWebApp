import { describe, expect, it } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { QuotaNotice } from '../components/ui/QuotaNotice';

const base = { feature: 'VALUATION', limit: 3, unlimited: false, resetsAt: '2026-11-01T03:00:00Z' };

describe('QuotaNotice', () => {
  it('muestra cuántos usos gratis quedan', () => {
    render(<QuotaNotice feature="valuation" status={{ ...base, used: 1, remaining: 2 }} />);
    expect(screen.getByRole('status')).toHaveTextContent('Te quedan 2 de 3 tasaciones gratis este mes.');
  });

  it('al llegar al límite bloquea e invita al plan pago', () => {
    render(<QuotaNotice feature="recommendation" status={{ ...base, used: 3, remaining: 0 }} />);
    expect(screen.getByRole('alert')).toHaveTextContent('Usaste tus 3 recomendaciones gratis de este mes');
    expect(screen.getByRole('alert')).toHaveTextContent('Se renuevan el 1/11');
    fireEvent.click(screen.getByRole('button', { name: /conocer el plan pago/i }));
    expect(screen.getByRole('dialog')).toHaveTextContent('Plan pago de Nidio');
  });

  it('no muestra nada para cuentas sin límite (admin)', () => {
    const { container } = render(<QuotaNotice feature="valuation" status={{ ...base, limit: null, remaining: null, unlimited: true }} />);
    expect(container).toBeEmptyDOMElement();
  });
});
