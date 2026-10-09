import { describe, it, expect } from 'vitest';
import { parseExplanation, prettifyText, markMissing } from '@/lib/explanation';

const TEXT = 'El rango de precio esperado para esta propiedad va de 79496 a 124627 USD, con una prediccion central de 105287 USD. '
  + 'El factor que mas influye en esta prediccion es el precio de referencia de mercado en la zona, que baja el precio. '
  + 'Tambien suben el precio: la superficie y la superficie cubierta. Bajan el precio: el barrio/zona y la cochera.';

describe('parseExplanation', () => {
  it('separa factor principal, lo que sube y lo que baja el precio', () => {
    const r = parseExplanation(TEXT);
    expect(r.centralPrediction).toBe(105287);
    expect(r.mainFactor).toBe('el precio de referencia de mercado en la zona');
    expect(r.mainFactorUp).toBe(false);
    expect(r.up).toEqual(['la superficie']);
    expect(r.down).toEqual(['el precio de referencia de mercado en la zona', 'el barrio/zona', 'la cochera']);
    expect(r.other).toEqual([]);
  });

  it('no repite la superficie si aparece del lado contrario', () => {
    const r = parseExplanation('Tambien suben el precio: la superficie. Bajan el precio: la superficie cubierta.');
    expect(r.up).toEqual(['la superficie']);
    expect(r.down).toEqual(['la superficie cubierta']);
  });

  it('corrige tildes y separa miles', () => {
    expect(prettifyText('Eso supera el maximo esperado. 124627')).toBe('Eso supera el máximo esperado. 124.627');
  });

  it('aclara los datos opcionales que no se cargaron', () => {
    expect(markMissing('la superficie total', { totalSurface: true })).toBe('la superficie total (sin cargar)');
    expect(markMissing('la superficie total', { totalSurface: false })).toBe('la superficie total');
    expect(markMissing('la cantidad de baños', { bathrooms: true })).toBe('la cantidad de baños (sin cargar)');
    expect(parseExplanation('Bajan el precio: la cantidad de banos.').down).toEqual(['la cantidad de baños']);
  });
});
