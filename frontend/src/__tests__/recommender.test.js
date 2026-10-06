import { describe, expect, it } from 'vitest';
import {
  buildRequest, defaultProximity, formatBudgetRange, initialAnswers, isStepAnswered, allRequiredAnswered,
  searchingSteps, shuffle, effectiveMinRooms, suggestedMinRooms, budgetAtPosition, countWithinBudget, formatDistance, funnelSummary, PROXIMITY_CATEGORIES, STEP_IDS, REQUIRED_STEPS
} from '../lib/recommender';

function completeAnswers(overrides = {}) {
  return {
    ...initialAnswers(),
    operationType: 'RENT',
    typeChoice: 'APARTMENT',
    budget: { min: 550000, max: 850000 },
    household: 'COUPLE',
    dealbreaker: 'UNSAFE',
    noisePreference: 'QUIET',
    overpricedPolicy: 'HIDE',
    ...overrides,
  };
}

describe('funnelSummary', () => {
  it('lists the real counts after each filter and skips filters that removed nothing', () => {
    const funnel = [
      { code: 'CATALOG', remaining: 112 }, { code: 'TYPE', remaining: 112 }, { code: 'BUDGET', remaining: 47 },
      { code: 'ROOMS', remaining: 30 }, { code: 'PRICE', remaining: 30 }, { code: 'DEALBREAKER', remaining: 22 },
    ];
    expect(funnelSummary(funnel)).toEqual([
      '112 propiedades publicadas',
      '47 dentro de tu presupuesto',
      '30 con los ambientes que necesitás',
      '22 después de dejar de lado las zonas que descartarías',
    ]);
  });

  it('returns nothing without data (an older backend)', () => {
    expect(funnelSummary(undefined)).toEqual([]);
    expect(funnelSummary([])).toEqual([]);
  });
});

describe('budget bar', () => {
  const PRICES = [400000, 500000, 600000, 700000, 800000, 900000, 1000000, 1200000, 1500000, 2000000];

  it('maps the bar position to a rounded cap taken from the real prices; the right end is "no cap"', () => {
    expect(budgetAtPosition(PRICES, 100, 'RENT')).toBeNull();
    expect(budgetAtPosition(PRICES, 0, 'RENT')).toBe(400000); // el precio más bajo
    expect(budgetAtPosition(PRICES, 50, 'RENT')).toBe(850000); // entre 800.000 y 900.000
    expect(budgetAtPosition([], 50, 'RENT')).toBeNull();
  });

  it('rounds the cap up so it always covers the price at that position', () => {
    const cap = budgetAtPosition([100000, 123456, 480000], 50, 'SALE');
    expect(cap).toBeGreaterThanOrEqual(123456);
    expect(cap % 10000).toBe(0);
  });

  it('counts how many listings fit under the cap', () => {
    expect(countWithinBudget(PRICES, null)).toBe(10);
    expect(countWithinBudget(PRICES, 850000)).toBe(5);
    expect(countWithinBudget(PRICES, 100)).toBe(0);
  });

  it('writes the distance in meters below 1 km and in km above', () => {
    expect(formatDistance(0.6)).toBe('600 m');
    expect(formatDistance(0.04)).toBe('40 m');
    expect(formatDistance(2.34)).toBe('2,3 km');
    expect(formatDistance(null)).toBeNull();
  });
});

describe('buildRequest', () => {
  it('maps the answers to the backend contract', () => {
    const body = buildRequest(completeAnswers(), 1515);
    expect(body).toMatchObject({
      operationType: 'RENT',
      propertyTypes: ['APARTMENT'],
      budgetMin: 550000,
      budgetMax: 850000,
      household: 'COUPLE',
      dealbreaker: 'UNSAFE',
      noisePreference: 'QUIET',
      overpricedPolicy: 'HIDE',
      blueRate: 1515,
    });
    expect(Object.keys(body.proximity)).toHaveLength(7);
    expect(Object.values(body.proximity).every(v => v === 'IMPORTANT')).toBe(true);
  });

  it('groups "Casa o PH" and leaves the type empty for "Me da igual"', () => {
    expect(buildRequest(completeAnswers({ typeChoice: 'HOUSE_PH' }), 1500).propertyTypes).toEqual(['HOUSE', 'PH']);
    expect(buildRequest(completeAnswers({ typeChoice: 'ANY' }), 1500).propertyTypes).toEqual([]);
  });

  it('keeps open ends of the budget as null', () => {
    const body = buildRequest(completeAnswers({ budget: { min: 1800000, max: null } }), 1500);
    expect(body.budgetMin).toBe(1800000);
    expect(body.budgetMax).toBeNull();
  });

  it('sends the minimum of rooms only when the person chose one', () => {
    expect('minRooms' in buildRequest(completeAnswers(), 1500)).toBe(false);
    expect(buildRequest(completeAnswers({ minRooms: 4 }), 1500).minRooms).toBe(4);
  });

  it('uses the household suggestion for the rooms until the person picks a number', () => {
    expect(suggestedMinRooms('SOLO')).toBe(1);
    expect(suggestedMinRooms('COUPLE')).toBe(2);
    expect(suggestedMinRooms('FAMILY')).toBe(3);
    expect(suggestedMinRooms('SHARED')).toBe(3);
    expect(suggestedMinRooms(null)).toBeNull();
    expect(effectiveMinRooms(completeAnswers({ household: 'FAMILY' }))).toBe(3);
    expect(effectiveMinRooms(completeAnswers({ household: 'FAMILY', minRooms: 2 }))).toBe(2);
  });

  it('sends how much the work address matters only together with the address', () => {
    expect('workImportance' in buildRequest(completeAnswers(), 1500)).toBe(false);
    const withWork = completeAnswers({ work: { address: 'X', lat: -34.6, lon: -58.4 } });
    expect(buildRequest(withWork, 1500).workImportance).toBe('IMPORTANT'); // por defecto
    expect(buildRequest({ ...withWork, workImportance: 'KEY' }, 1500).workImportance).toBe('KEY');
  });

  it('omits the dollar rate when there is none (the backend then leaves the price unevaluated)', () => {
    expect('blueRate' in buildRequest(completeAnswers(), null)).toBe(false);
    expect('blueRate' in buildRequest(completeAnswers(), 0)).toBe(false);
  });

  it('only sends ticked details, and only those that apply to the operation', () => {
    const answers = completeAnswers({ details: { bright: true, garage: false, furnished: true, aptoCredito: true } });
    expect(buildRequest(answers, 1500).details).toEqual({ bright: true, furnished: true });
    const sale = completeAnswers({ operationType: 'SALE', details: { furnished: true, aptoCredito: true } });
    expect(buildRequest(sale, 1500).details).toEqual({ aptoCredito: true });
    expect('details' in buildRequest(completeAnswers(), 1500)).toBe(false);
  });

  it('sends the work address only when both coordinates are known', () => {
    expect(buildRequest(completeAnswers({ work: { address: 'X', lat: -34.6, lon: -58.4 } }), 1500)).toMatchObject({ workLat: -34.6, workLon: -58.4 });
    const without = buildRequest(completeAnswers({ work: null }), 1500);
    expect('workLat' in without).toBe(false);
    expect('workLon' in without).toBe(false);
  });

  it('keeps the three importance levels chosen for each category', () => {
    const proximity = { ...defaultProximity(), TRANSPORT: 'KEY', NIGHTLIFE: 'NOT_IMPORTANT' };
    const body = buildRequest(completeAnswers({ proximity }), 1500);
    expect(body.proximity.TRANSPORT).toBe('KEY');
    expect(body.proximity.NIGHTLIFE).toBe('NOT_IMPORTANT');
    expect(body.proximity.COMMERCE).toBe('IMPORTANT');
  });
});

describe('steps', () => {
  it('has 8 required steps and 2 optional ones', () => {
    expect(STEP_IDS).toHaveLength(10);
    expect(REQUIRED_STEPS).toBe(8);
  });

  it('requires an answer for every step except proximity and the optional ones', () => {
    const empty = initialAnswers();
    expect(isStepAnswered('operation', empty)).toBe(false);
    expect(isStepAnswered('budget', empty)).toBe(false);
    expect(isStepAnswered('proximity', empty)).toBe(true);
    expect(isStepAnswered('details', empty)).toBe(true);
    expect(isStepAnswered('work', empty)).toBe(true);
    expect(allRequiredAnswered(empty)).toBe(false);
    expect(allRequiredAnswered(completeAnswers())).toBe(true);
  });
});

describe('formatBudgetRange', () => {
  it('writes sale ranges in USD and rent ranges in ARS per month', () => {
    expect(formatBudgetRange({ min: 105000, max: 155000 }, 'SALE')).toBe('USD 105.000 a USD 155.000');
    expect(formatBudgetRange({ min: null, max: 550000 }, 'RENT')).toBe('Hasta ARS 550.000 por mes');
    expect(formatBudgetRange({ min: 1800000, max: null }, 'RENT')).toBe('Más de ARS 1.800.000 por mes');
  });
});

describe('shuffle', () => {
  it('returns the same items without touching the original', () => {
    const original = PROXIMITY_CATEGORIES.map(c => c.key);
    const mixed = shuffle(PROXIMITY_CATEGORIES, () => 0.3).map(c => c.key);
    expect([...mixed].sort()).toEqual([...original].sort());
    expect(PROXIMITY_CATEGORIES.map(c => c.key)).toEqual(original);
  });
});

describe('searchingSteps', () => {
  it('only lists what is evaluated for this request', () => {
    const base = searchingSteps(completeAnswers());
    expect(base.some(s => s.includes('distancia'))).toBe(false);
    expect(base.some(s => s.includes('clave'))).toBe(false);
    expect(base[1]).toBe('Descartando las zonas con menos seguridad');

    const full = searchingSteps(completeAnswers({
      work: { address: 'X', lat: -34.6, lon: -58.4 },
      proximity: { ...defaultProximity(), TRANSPORT: 'KEY', COMMERCE: 'KEY' },
    }));
    expect(full.some(s => s.includes('distancia'))).toBe(true);
    expect(full.find(s => s.includes('clave'))).toContain('transporte público, comercios del día a día');
  });
});
