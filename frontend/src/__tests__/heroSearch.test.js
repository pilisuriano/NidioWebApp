import { describe, expect, it } from 'vitest';
import { buildMapUrl, parseSearchIntent } from '@/lib/heroSearch';

describe('parseSearchIntent', () => {
  it('understands the operation instead of searching it as a word', () => {
    expect(parseSearchIntent('alquiler')).toEqual({ operationType: 'RENT', propertyType: null, rooms: [], search: '' });
    expect(parseSearchIntent('Venta').operationType).toBe('SALE');
    expect(parseSearchIntent('quiero comprar').operationType).toBe('SALE');
  });

  it('pulls out type, rooms and keeps the neighborhood as the search', () => {
    expect(parseSearchIntent('alquiler 2 ambientes en Palermo')).toEqual({
      operationType: 'RENT', propertyType: null, rooms: [2], search: 'Palermo'
    });
    expect(parseSearchIntent('depto 3 amb Villa Crespo')).toEqual({
      operationType: null, propertyType: 'APARTMENT', rooms: [3], search: 'Villa Crespo'
    });
    expect(parseSearchIntent('casas en Núñez').propertyType).toBe('HOUSE');
    expect(parseSearchIntent('PH Caballito').propertyType).toBe('PH');
    expect(parseSearchIntent('monoambiente').rooms).toEqual([1]);
  });

  it('keeps accents of what is left and connectors inside neighborhood names', () => {
    expect(parseSearchIntent('alquiler Núñez').search).toBe('Núñez');
    expect(parseSearchIntent('venta Parque de los Patricios').search).toBe('Parque de los Patricios');
  });

  it('does not take a street number as rooms and caps rooms at 5+', () => {
    expect(parseSearchIntent('Corrientes 1234')).toMatchObject({ rooms: [], search: 'Corrientes 1234' });
    expect(parseSearchIntent('7 ambientes').rooms).toEqual([5]);
    expect(parseSearchIntent('3 ambientes 4 ambientes').rooms).toEqual([3, 4]);
  });

  it('handles empty input', () => {
    expect(parseSearchIntent('   ')).toEqual({ operationType: null, propertyType: null, rooms: [], search: '' });
    expect(parseSearchIntent(undefined).search).toBe('');
  });
});

describe('buildMapUrl', () => {
  it('goes to the plain map when there is nothing', () => {
    expect(buildMapUrl('')).toBe('/mapa');
  });

  it('sends what was understood in the URL', () => {
    const params = new URLSearchParams(buildMapUrl('alquiler 2 ambientes Palermo').split('?')[1]);
    expect(params.get('operationType')).toBe('RENT');
    expect(params.get('rooms')).toBe('2');
    expect(params.get('search')).toBe('Palermo');
    expect(params.has('propertyType')).toBe(false);
  });

  it('uses the buttons when the text says nothing and the text wins on conflict', () => {
    expect(buildMapUrl('Palermo', { operationType: 'RENT', propertyType: 'HOUSE' }))
      .toBe('/mapa?operationType=RENT&propertyType=HOUSE&search=Palermo');
    expect(new URLSearchParams(buildMapUrl('venta', { operationType: 'RENT' }).split('?')[1]).get('operationType')).toBe('SALE');
  });
});
