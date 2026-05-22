import { describe, it, expect } from 'vitest';
import { render, screen } from '../../../../../tests/test-utils';
import { StepIndicator } from './StepIndicator';

describe('StepIndicator', () => {
  it('renders correct number of dots', () => {
    render(<StepIndicator current={1} total={9} />);
    const progressbar = screen.getByRole('progressbar');
    expect(progressbar.children).toHaveLength(9);
  });

  it('has correct aria attributes', () => {
    render(<StepIndicator current={3} total={9} />);
    const progressbar = screen.getByRole('progressbar');
    expect(progressbar).toHaveAttribute('aria-valuenow', '3');
    expect(progressbar).toHaveAttribute('aria-valuemax', '9');
  });
});
