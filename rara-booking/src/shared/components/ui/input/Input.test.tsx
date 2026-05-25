import { describe, it, expect } from 'vitest';
import { render, screen } from '../../../../../tests/test-utils';
import { Input } from './Input';

describe('Input', () => {
  it('renders label', () => {
    render(<Input label="Nama" />);
    expect(screen.getByText('Nama')).toBeInTheDocument();
  });

  it('shows error message', () => {
    render(<Input error="Field required" />);
    expect(screen.getByText('Field required')).toBeInTheDocument();
  });

  it('associates label with input', () => {
    render(<Input label="Email" id="email" />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('id', 'email');
  });
});
