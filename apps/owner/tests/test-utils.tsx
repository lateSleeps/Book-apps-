import { render, type RenderOptions, type RenderResult } from '@testing-library/react';
import React from 'react';

/** Wrapper with all providers for testing */
function AllProviders({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

/** Custom render with providers */
function customRender(
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
): RenderResult {
  return render(ui, { wrapper: AllProviders, ...options });
}

export * from '@testing-library/react';
export { customRender as render };
