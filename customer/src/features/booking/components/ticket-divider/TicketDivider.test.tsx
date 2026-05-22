import { describe, it, expect } from 'vitest';
import { render, screen } from '../../../../../tests/test-utils';
import { TicketDivider } from './TicketDivider';

describe('TicketDivider', () => {
  it('renders SVG line', () => {
    const { container } = render(<TicketDivider />);
    const line = container.querySelector('line');
    expect(line).toBeInTheDocument();
  });

  it('renders two notch circles', () => {
    const { container } = render(<TicketDivider />);
    // The two notch circles are divs with rounded-full
    const notches = container.querySelectorAll('.rounded-full');
    expect(notches).toHaveLength(2);
  });

  it('applies custom notchColor', () => {
    const { container } = render(<TicketDivider notchColor="#ff0000" />);
    const notches = container.querySelectorAll('.rounded-full');
    notches.forEach((notch) => {
      expect((notch as HTMLElement).style.backgroundColor).toBe('#ff0000');
    });
  });
});
