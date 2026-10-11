import { describe, it, expect } from 'vitest';
import { PLAN_TABS, tabFromHash, defaultTabFor } from '../lib/planesTabs';

describe('planesTabs', () => {
  it('cada ancla de la URL lleva a su pestaña', () => {
    expect(tabFromHash('#busco')).toBe('busco');
    expect(tabFromHash('#packs')).toBe('busco');
    expect(tabFromHash('#duenos')).toBe('duenos');
    expect(tabFromHash('#destacados')).toBe('duenos');
    expect(tabFromHash('#profesionales')).toBe('profesionales');
  });

  it('un hash vacío o desconocido no elige pestaña', () => {
    expect(tabFromHash('')).toBeNull();
    expect(tabFromHash(undefined)).toBeNull();
    expect(tabFromHash('#cualquiera')).toBeNull();
  });

  it('las anclas no se repiten entre pestañas', () => {
    const all = PLAN_TABS.flatMap(tab => tab.anchors);
    expect(new Set(all).size).toBe(all.length);
  });

  it('las cuentas profesionales arrancan en su pestaña y el resto en "Busco propiedad"', () => {
    expect(defaultTabFor({ accountType: 'PROFESSIONAL' })).toBe('profesionales');
    expect(defaultTabFor({ accountType: 'PERSONAL' })).toBe('busco');
    expect(defaultTabFor(null)).toBe('busco');
  });
});
