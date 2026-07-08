import { describe, expect, it } from 'vitest';
import { formatPrice, formatNumber, formatDate } from '../lib/format';

describe('formatPrice', () => {
  it('formats sale prices in USD', () => {
    expect(formatPrice(142000, 'SALE')).toBe('USD 142.000');
  });

  it('formats rent prices in ARS por mes', () => {
    expect(formatPrice(350000, 'RENT')).toBe('ARS 350.000/mes');
  });

  it('rounds decimal prices', () => {
    expect(formatPrice(142000.6, 'SALE')).toBe('USD 142.001');
  });
});

describe('formatNumber', () => {
  it('formats with thousands separator', () => {
    expect(formatNumber(12345)).toBe('12.345');
  });
});

describe('formatDate', () => {
  it('formats an ISO date as dd/mm/yyyy', () => {
    expect(formatDate('2026-07-08T00:00:00Z')).toMatch(/^\d{2}\/\d{2}\/2026$/);
  });
});
