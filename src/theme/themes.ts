/**
 * Theme Definitions - Dark & Light modes
 *
 * Dark: The primary synth aesthetic - easy on eyes, pro audio standard
 * Light: For daylight use, accessibility, contrast preference
 */

export interface ThemeColors {
  bg: {
    void: string;
    base: string;
    surface: string;
    elevated: string;
    highlight: string;
    border: string;
  };
  text: {
    primary: string;
    secondary: string;
    muted: string;
    disabled: string;
  };
  accent: {
    coral: string;
    orange: string;
    yellow: string;
    green: string;
    cyan: string;
    teal: string;
    purple: string;
    pink: string;
    blue: string;
  };
  semantic: {
    active: string;
    inactive: string;
    playing: string;
    recording: string;
    warning: string;
    error: string;
  };
}

export const darkTheme: ThemeColors = {
  bg: {
    void: '#050505',
    base: '#0a0a0a',
    surface: '#141414',
    elevated: '#1a1a1a',
    highlight: '#242424',
    border: '#2a2a2a',
  },
  text: {
    primary: '#ffffff',
    secondary: '#a0a0a0',
    muted: '#666666',
    disabled: '#404040',
  },
  accent: {
    coral: '#ff6b6b',
    orange: '#ff9f43',
    yellow: '#feca57',
    green: '#1dd1a1',
    cyan: '#48dbfb',
    teal: '#00d2d3',
    purple: '#5f27cd',
    pink: '#ee5a9b',
    blue: '#4a90d9',
  },
  semantic: {
    active: '#1dd1a1',
    inactive: '#333333',
    playing: '#48dbfb',
    recording: '#ff6b6b',
    warning: '#feca57',
    error: '#ff6b6b',
  },
};

export const lightTheme: ThemeColors = {
  bg: {
    void: '#f8f9fa',
    base: '#ffffff',
    surface: '#f1f3f4',
    elevated: '#e8eaed',
    highlight: '#dadce0',
    border: '#c4c7c5',
  },
  text: {
    primary: '#1f1f1f',
    secondary: '#5f6368',
    muted: '#80868b',
    disabled: '#bdc1c6',
  },
  accent: {
    coral: '#d93025',      // Slightly deeper for contrast
    orange: '#e37400',
    yellow: '#f9ab00',
    green: '#188038',
    cyan: '#1a73e8',
    teal: '#007b83',
    purple: '#7627bb',
    pink: '#c5185d',
    blue: '#1967d2',
  },
  semantic: {
    active: '#188038',
    inactive: '#dadce0',
    playing: '#1a73e8',
    recording: '#d93025',
    warning: '#f9ab00',
    error: '#d93025',
  },
};

export type ThemeMode = 'dark' | 'light' | 'system';

export const themes = {
  dark: darkTheme,
  light: lightTheme,
} as const;
