/**
 * Theme Context & Provider
 *
 * Provides theme colors throughout the component tree.
 * Supports dark/light/system modes.
 */

import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { darkTheme, lightTheme, type ThemeColors, type ThemeMode } from './themes';

interface ThemeContextValue {
  theme: ThemeColors;
  mode: ThemeMode;
  resolvedMode: 'dark' | 'light';
  setMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultMode?: ThemeMode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  defaultMode = 'dark',
}) => {
  const [mode, setMode] = useState<ThemeMode>(defaultMode);
  const [systemPreference, setSystemPreference] = useState<'dark' | 'light'>('dark');

  // Listen for system preference changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setSystemPreference(mediaQuery.matches ? 'dark' : 'light');

    const handler = (e: MediaQueryListEvent) => {
      setSystemPreference(e.matches ? 'dark' : 'light');
    };

    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  const resolvedMode = mode === 'system' ? systemPreference : mode;
  const theme = resolvedMode === 'dark' ? darkTheme : lightTheme;

  // Apply CSS variables to document
  useEffect(() => {
    const root = document.documentElement;

    // Background colors
    root.style.setProperty('--color-bg-void', theme.bg.void);
    root.style.setProperty('--color-bg-base', theme.bg.base);
    root.style.setProperty('--color-bg-surface', theme.bg.surface);
    root.style.setProperty('--color-bg-elevated', theme.bg.elevated);
    root.style.setProperty('--color-bg-highlight', theme.bg.highlight);
    root.style.setProperty('--color-bg-border', theme.bg.border);

    // Text colors
    root.style.setProperty('--color-text-primary', theme.text.primary);
    root.style.setProperty('--color-text-secondary', theme.text.secondary);
    root.style.setProperty('--color-text-muted', theme.text.muted);
    root.style.setProperty('--color-text-disabled', theme.text.disabled);

    // Accent colors
    root.style.setProperty('--color-coral', theme.accent.coral);
    root.style.setProperty('--color-orange', theme.accent.orange);
    root.style.setProperty('--color-yellow', theme.accent.yellow);
    root.style.setProperty('--color-green', theme.accent.green);
    root.style.setProperty('--color-cyan', theme.accent.cyan);
    root.style.setProperty('--color-teal', theme.accent.teal);
    root.style.setProperty('--color-purple', theme.accent.purple);
    root.style.setProperty('--color-pink', theme.accent.pink);
    root.style.setProperty('--color-blue', theme.accent.blue);

    // Semantic colors
    root.style.setProperty('--color-active', theme.semantic.active);
    root.style.setProperty('--color-inactive', theme.semantic.inactive);
    root.style.setProperty('--color-playing', theme.semantic.playing);
    root.style.setProperty('--color-recording', theme.semantic.recording);
    root.style.setProperty('--color-warning', theme.semantic.warning);
    root.style.setProperty('--color-error', theme.semantic.error);

    // Set data attribute for CSS selectors
    root.dataset.theme = resolvedMode;
  }, [theme, resolvedMode]);

  const value = useMemo(() => ({
    theme,
    mode,
    resolvedMode,
    setMode,
  }), [theme, mode, resolvedMode]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextValue => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// Hook that returns just the colors (for components that don't need mode control)
export const useThemeColors = (): ThemeColors => {
  const { theme } = useTheme();
  return theme;
};
