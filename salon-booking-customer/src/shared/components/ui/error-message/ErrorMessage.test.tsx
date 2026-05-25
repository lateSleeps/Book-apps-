import { describe, it, expect } from 'vitest';
import { render, screen } from '../../../../../tests/test-utils';
import { ErrorMessage } from './ErrorMessage';

describe('ErrorMessage', () => {
  it('renders message text', () => {
    render(<ErrorMessage message="File terlalu besar" />);
    expect(screen.getByText('File terlalu besar')).toBeInTheDocument();
  });

  it('has role alert', () => {
    render(<ErrorMessage message="Error" />);
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });
});
