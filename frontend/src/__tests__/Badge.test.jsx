import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Badge } from '../components/ui/Badge';

describe('Badge', () => {
  it('renders its children', () => {
    render(<Badge>TOP VALUE</Badge>);
    expect(screen.getByText('TOP VALUE')).toBeInTheDocument();
  });

  it('applies a custom className alongside the variant classes', () => {
    render(<Badge className="custom-class">AVAILABLE</Badge>);
    expect(screen.getByText('AVAILABLE')).toHaveClass('custom-class');
  });
});
