import { describe, expect, it, vi, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { SearchingScreen, SLOW_AFTER_MS } from '../components/recommender/SearchingScreen';

describe('SearchingScreen', () => {
  afterEach(() => { vi.useRealTimers(); });

  it('lists what is being evaluated without fake progress and warns only when it takes long', () => {
    vi.useFakeTimers();
    render(<SearchingScreen steps={['Filtrando por tipo, presupuesto y ambientes', 'Armando tu top 3 y explicando por qué encaja cada una']} />);
    expect(screen.getByText('Filtrando por tipo, presupuesto y ambientes')).toBeInTheDocument();
    expect(screen.getByText(/esperando la respuesta del servidor/i)).toBeInTheDocument();
    expect(screen.queryByText(/está tardando más de lo normal/i)).not.toBeInTheDocument();
    act(() => { vi.advanceTimersByTime(SLOW_AFTER_MS + 100); });
    expect(screen.getByText(/está tardando más de lo normal/i)).toBeInTheDocument();
  });
});
