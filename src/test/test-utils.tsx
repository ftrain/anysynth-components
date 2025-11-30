import React from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { ThemeProvider } from '../theme/ThemeContext';

interface WrapperProps {
  children: React.ReactNode;
}

const AllProviders: React.FC<WrapperProps> = ({ children }) => {
  return (
    <ThemeProvider defaultMode="dark">
      {children}
    </ThemeProvider>
  );
};

const customRender = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllProviders, ...options });

export * from '@testing-library/react';
export { customRender as render };
