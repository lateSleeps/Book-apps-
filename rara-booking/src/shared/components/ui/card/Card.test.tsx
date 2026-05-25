import { describe, it, expect } from 'vitest';
import { render, screen } from '../../../../../tests/test-utils';
import { Card } from './Card';

describe('Card', () => {
  it('renders children', () => {
    render(<Card>Content</Card>);
    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<Card className="border">Content</Card>);
    expect(screen.getByText('Content')).toHaveClass('border');
  });
});
