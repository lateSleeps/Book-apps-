import React from 'react';
import { render, type RenderOptions } from '@testing-library/react';

/** Wrapper with all providers for testing */
function AllProviders({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

/** Custom render with providers */
function customRender(ui: React.ReactElement, options?: Omit<RenderOptions, 'wrapper'>) {
  return render(ui, { wrapper: AllProviders, ...options });
}

export * from '@testing-library/react';
export { customRender as render };
