import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

vi.mock('@/lib/blueRate', () => ({ useBlueRate: () => ({ blueRate: 1500, blueRateError: false }) }));
vi.mock('@/lib/environment', () => ({ usePropertyEnvironment: () => ({}) }));
vi.mock('@/components/recommender/Nidi', () => ({ Nidi: () => null }));
vi.mock('@/components/property/FavoriteButton', () => ({ FavoriteButton: () => null }));

import { RecommendationResults } from '../components/recommender/RecommendationResults';

function item(id) {
  return {
    property: { id, title: `Depto ${id}`, propertyType: 'APARTMENT', operationType: 'SALE', neighborhoodName: 'Palermo', price: 100000, surfaceM2: 40, rooms: 2, bathrooms: 1, imageUrl: null },
    matchScore: 80, priceStatus: 'IN_RANGE', reasons: [], tradeoff: null, explanation: `Explicación ${id}`, expensesUsd: null,
  };
}

function renderResults(result) {
  return render(<MemoryRouter><RecommendationResults result={result} onEdit={() => {}} onRestart={() => {}} /></MemoryRouter>);
}

describe('RecommendationResults: más resultados', () => {
  it('sin pase muestra 3 y avisa cuántas más encajan, con el link a los planes', () => {
    renderResults({ items: [item(1), item(2), item(3)], totalMatches: 30, moreUnlocked: false, funnel: [] });

    expect(screen.getAllByText(/^Depto \d$/)).toHaveLength(3);
    const note = screen.getByTestId('more-locked');
    expect(note).toHaveTextContent('Hay 27 propiedades más que también encajan');
    expect(screen.getByRole('link', { name: /ver planes/i })).toHaveAttribute('href', '/planes');
    expect(screen.queryByRole('button', { name: /propiedades más/i })).not.toBeInTheDocument();
  });

  it('sin pase y sin más propiedades que encajen no muestra el aviso', () => {
    renderResults({ items: [item(1), item(2), item(3)], totalMatches: 3, moreUnlocked: false, funnel: [] });
    expect(screen.queryByTestId('more-locked')).not.toBeInTheDocument();
  });

  it('con pase muestra 3 y un botón para ver el resto, que las muestra todas', async () => {
    const user = userEvent.setup();
    const items = Array.from({ length: 10 }, (_, i) => item(i + 1));
    renderResults({ items, totalMatches: 14, moreUnlocked: true, funnel: [] });

    expect(screen.getAllByText(/^Depto \d+$/)).toHaveLength(3);
    expect(screen.queryByTestId('more-locked')).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /ver 7 propiedades más/i }));

    expect(screen.getAllByText(/^Depto \d+$/)).toHaveLength(10);
    expect(screen.getByText(/te muestro las 10 que mejor encajan; hay 4 más/i)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /propiedades más/i })).not.toBeInTheDocument();
  });

  it('con pase y menos de 4 resultados no hay botón', () => {
    renderResults({ items: [item(1), item(2)], totalMatches: 2, moreUnlocked: true, funnel: [] });
    expect(screen.queryByRole('button', { name: /más/i })).not.toBeInTheDocument();
  });
});
