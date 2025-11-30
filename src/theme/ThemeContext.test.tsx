import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { ThemeProvider, useTheme, useThemeColors } from './ThemeContext';

// Mock matchMedia
const mockMatchMedia = (matches: boolean) => {
  const listeners: Array<(e: MediaQueryListEvent) => void> = [];
  return vi.fn().mockImplementation(() => ({
    matches,
    addEventListener: (_event: string, listener: (e: MediaQueryListEvent) => void) => {
      listeners.push(listener);
    },
    removeEventListener: (_event: string, listener: (e: MediaQueryListEvent) => void) => {
      const index = listeners.indexOf(listener);
      if (index > -1) listeners.splice(index, 1);
    },
    // Expose for testing
    _triggerChange: (newMatches: boolean) => {
      listeners.forEach(l => l({ matches: newMatches } as MediaQueryListEvent));
    },
  }));
};

describe('ThemeContext', () => {
  beforeEach(() => {
    vi.stubGlobal('matchMedia', mockMatchMedia(true));
  });

  describe('ThemeProvider', () => {
    it('should provide dark theme by default', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <ThemeProvider>{children}</ThemeProvider>
      );

      const { result } = renderHook(() => useTheme(), { wrapper });

      expect(result.current.mode).toBe('dark');
      expect(result.current.resolvedMode).toBe('dark');
      expect(result.current.theme.bg.base).toBeDefined();
    });

    it('should allow changing theme mode', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <ThemeProvider>{children}</ThemeProvider>
      );

      const { result } = renderHook(() => useTheme(), { wrapper });

      act(() => {
        result.current.setMode('light');
      });

      expect(result.current.mode).toBe('light');
      expect(result.current.resolvedMode).toBe('light');
    });

    it('should respect defaultMode prop', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <ThemeProvider defaultMode="light">{children}</ThemeProvider>
      );

      const { result } = renderHook(() => useTheme(), { wrapper });

      expect(result.current.mode).toBe('light');
    });

    it('should resolve system mode based on media query', () => {
      vi.stubGlobal('matchMedia', mockMatchMedia(false)); // Light preference

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <ThemeProvider defaultMode="system">{children}</ThemeProvider>
      );

      const { result } = renderHook(() => useTheme(), { wrapper });

      expect(result.current.mode).toBe('system');
      expect(result.current.resolvedMode).toBe('light');
    });
  });

  describe('useTheme', () => {
    it('should throw error when used outside provider', () => {
      expect(() => {
        renderHook(() => useTheme());
      }).toThrow('useTheme must be used within a ThemeProvider');
    });

    it('should return theme colors and mode control', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <ThemeProvider>{children}</ThemeProvider>
      );

      const { result } = renderHook(() => useTheme(), { wrapper });

      expect(result.current.theme).toBeDefined();
      expect(result.current.mode).toBeDefined();
      expect(result.current.resolvedMode).toBeDefined();
      expect(typeof result.current.setMode).toBe('function');
    });
  });

  describe('useThemeColors', () => {
    it('should return just the theme colors', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <ThemeProvider>{children}</ThemeProvider>
      );

      const { result } = renderHook(() => useThemeColors(), { wrapper });

      expect(result.current.bg).toBeDefined();
      expect(result.current.text).toBeDefined();
      expect(result.current.accent).toBeDefined();
      expect(result.current.semantic).toBeDefined();
    });
  });

  describe('Theme values', () => {
    it('should have all required dark theme colors', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <ThemeProvider defaultMode="dark">{children}</ThemeProvider>
      );

      const { result } = renderHook(() => useTheme(), { wrapper });
      const { theme } = result.current;

      // Background colors
      expect(theme.bg.void).toBeDefined();
      expect(theme.bg.base).toBeDefined();
      expect(theme.bg.surface).toBeDefined();
      expect(theme.bg.elevated).toBeDefined();
      expect(theme.bg.highlight).toBeDefined();
      expect(theme.bg.border).toBeDefined();

      // Text colors
      expect(theme.text.primary).toBeDefined();
      expect(theme.text.secondary).toBeDefined();
      expect(theme.text.muted).toBeDefined();
      expect(theme.text.disabled).toBeDefined();

      // Accent colors
      expect(theme.accent.coral).toBeDefined();
      expect(theme.accent.orange).toBeDefined();
      expect(theme.accent.yellow).toBeDefined();
      expect(theme.accent.green).toBeDefined();
      expect(theme.accent.cyan).toBeDefined();
      expect(theme.accent.purple).toBeDefined();
      expect(theme.accent.pink).toBeDefined();
    });

    it('should have all required light theme colors', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <ThemeProvider defaultMode="light">{children}</ThemeProvider>
      );

      const { result } = renderHook(() => useTheme(), { wrapper });
      const { theme } = result.current;

      expect(theme.bg.base).toBeDefined();
      expect(theme.text.primary).toBeDefined();
      expect(theme.accent.cyan).toBeDefined();
    });
  });
});
