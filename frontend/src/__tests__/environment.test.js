import { describe, expect, it } from 'vitest';
import { describeNoise, describeSecurity, levelStyle, normalizeIds } from '../lib/environment';

describe('levelStyle', () => {
  it('uses a different color for each of the four levels', () => {
    const colors = [1, 2, 3, 4].map(level => levelStyle(level).fg);
    expect(new Set(colors).size).toBe(4);
  });

  it('falls back to neutral gray for unknown levels', () => {
    expect(levelStyle(undefined)).toEqual(levelStyle(9));
  });
});

describe('describeNoise', () => {
  it('mentions day or night and the relative label, not decibels', () => {
    const text = describeNoise('night', { label: 'Ruidoso', source: '2025' });
    expect(text).toContain('de noche');
    expect(text).toContain('ruidoso');
    expect(text).not.toMatch(/dB/);
  });

  it('flags the 2018 data and the missing data', () => {
    expect(describeNoise('day', { label: 'Moderado', source: '2018' })).toContain('2018');
    expect(describeNoise('day', null)).toContain('sin dato');
  });
});

describe('describeSecurity', () => {
  it('describes level and the missing case', () => {
    expect(describeSecurity({ label: 'Media-alta' })).toContain('media-alta');
    expect(describeSecurity(null)).toContain('sin dato');
  });
});

describe('normalizeIds', () => {
  it('removes duplicates and empty values and caps at 100', () => {
    expect(normalizeIds([1, 2, 2, null, undefined, 3])).toEqual([1, 2, 3]);
    expect(normalizeIds(Array.from({ length: 150 }, (_, i) => i + 1))).toHaveLength(100);
    expect(normalizeIds(undefined)).toEqual([]);
  });
});
