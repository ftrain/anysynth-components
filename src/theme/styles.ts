/**
 * Centralized Styles System
 *
 * Provides:
 * - CSS custom properties injection for theming
 * - Light/dark mode support
 * - Common style patterns as objects
 * - Utility functions for dynamic styling
 */

import { colors, typography, spacing, components, animation } from './tokens';

// Light mode color overrides
export const lightColors = {
  bg: {
    void: '#f5f5f5',
    base: '#ffffff',
    surface: '#fafafa',
    elevated: '#f0f0f0',
    highlight: '#e8e8e8',
    border: '#d0d0d0',
  },
  text: {
    primary: '#1a1a1a',
    secondary: '#505050',
    muted: '#808080',
    disabled: '#b0b0b0',
  },
  // Accent colors remain the same but can be adjusted for contrast
  accent: { ...colors.accent },
  semantic: { ...colors.semantic },
  meter: { ...colors.meter },
} as const;

/**
 * Generate CSS custom properties for theme injection
 */
export const generateCSSVariables = (isDark = true): string => {
  const c = isDark ? colors : lightColors;

  return `
    /* Background colors */
    --color-bg-void: ${c.bg.void};
    --color-bg-base: ${c.bg.base};
    --color-bg-surface: ${c.bg.surface};
    --color-bg-elevated: ${c.bg.elevated};
    --color-bg-highlight: ${c.bg.highlight};
    --color-bg-border: ${c.bg.border};

    /* Text colors */
    --color-text-primary: ${c.text.primary};
    --color-text-secondary: ${c.text.secondary};
    --color-text-muted: ${c.text.muted};
    --color-text-disabled: ${c.text.disabled};

    /* Accent colors */
    --color-accent-coral: ${c.accent.coral};
    --color-accent-orange: ${c.accent.orange};
    --color-accent-yellow: ${c.accent.yellow};
    --color-accent-green: ${c.accent.green};
    --color-accent-cyan: ${c.accent.cyan};
    --color-accent-teal: ${c.accent.teal};
    --color-accent-purple: ${c.accent.purple};
    --color-accent-pink: ${c.accent.pink};

    /* Semantic colors */
    --color-active: ${c.semantic.active};
    --color-inactive: ${c.semantic.inactive};
    --color-playing: ${c.semantic.playing};
    --color-recording: ${c.semantic.recording};

    /* Typography */
    --font-display: ${typography.family.display};
    --font-mono: ${typography.family.mono};
    --font-numeric: ${typography.family.numeric};

    --text-xs: ${typography.size.xs};
    --text-sm: ${typography.size.sm};
    --text-md: ${typography.size.md};
    --text-lg: ${typography.size.lg};
    --text-xl: ${typography.size.xl};

    /* Spacing */
    --space-1: ${spacing[1]};
    --space-2: ${spacing[2]};
    --space-3: ${spacing[3]};
    --space-4: ${spacing[4]};
    --space-6: ${spacing[6]};
    --space-8: ${spacing[8]};

    /* Component dimensions */
    --slider-h-track: ${components.sliderHorizontal.trackHeight}px;
    --slider-h-thumb-w: ${components.sliderHorizontal.thumbWidth}px;
    --slider-h-thumb-h: ${components.sliderHorizontal.thumbHeight}px;
    --slider-h-padding: ${components.sliderHorizontal.padding}px;

    --slider-v-track: ${components.sliderVertical.trackWidth}px;
    --slider-v-height: ${components.sliderVertical.height}px;

    --knob-track: ${components.knobCircular.trackWidth}px;
    --knob-gap: ${components.knobCircular.gap}px;

    --module-padding: ${components.module.padding}px;
    --module-radius: ${components.module.borderRadius}px;
    --module-gap: ${components.module.gap}px;

    /* Animation */
    --duration-fast: ${animation.duration.fast};
    --duration-normal: ${animation.duration.normal};
    --ease-out: ${animation.easing.easeOut};
  `;
};

/**
 * Inject theme CSS variables into document
 */
export const injectThemeStyles = (isDark = true): void => {
  const styleId = 'synth-theme-vars';
  let styleEl = document.getElementById(styleId) as HTMLStyleElement;

  if (!styleEl) {
    styleEl = document.createElement('style');
    styleEl.id = styleId;
    document.head.appendChild(styleEl);
  }

  styleEl.textContent = `:root { ${generateCSSVariables(isDark)} }`;
};

// ============================================================
// Common Style Objects (for inline use until full CSS migration)
// ============================================================

/**
 * Module container base styles
 */
export const moduleStyles = {
  base: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: components.module.gap,
    padding: components.module.padding,
    background: colors.bg.surface,
    borderRadius: components.module.borderRadius,
  },
  compact: {
    gap: components.module.gapCompact,
    padding: components.module.paddingCompact,
  },
};

/**
 * Label styles
 */
export const labelStyles = {
  module: {
    fontFamily: 'var(--font-numeric)',
    fontSize: 12,
    fontWeight: 500,
    color: colors.text.muted,
  },
  parameter: {
    fontFamily: 'var(--font-mono)',
    fontSize: 9,
    color: colors.text.muted,
    textTransform: 'uppercase' as const,
  },
  value: {
    fontFamily: 'var(--font-numeric)',
    fontSize: 14,
    fontWeight: 600,
    color: colors.text.primary,
    fontVariantNumeric: 'tabular-nums',
    minWidth: 32,
    textAlign: 'right' as const,
  },
};

/**
 * Horizontal slider track styles
 */
export const sliderHorizontalStyles = {
  container: {
    position: 'relative' as const,
    width: '100%',
    paddingLeft: components.sliderHorizontal.padding,
    paddingRight: components.sliderHorizontal.padding,
  },
  track: (height: number = components.sliderHorizontal.trackHeight) => ({
    position: 'relative' as const,
    height,
    background: colors.bg.elevated,
    borderRadius: height / 2,
    cursor: 'ew-resize',
    touchAction: 'none' as const,
  }),
  fill: (color: string, value: number) => ({
    position: 'absolute' as const,
    left: 0,
    top: 0,
    bottom: 0,
    width: `${value * 100}%`,
    background: color,
    borderRadius: 'inherit',
    opacity: 0.8,
    transition: `width ${animation.duration.fast}`,
  }),
  thumb: (color: string, value: number, trackHeight: number = components.sliderHorizontal.trackHeight) => ({
    position: 'absolute' as const,
    left: `${value * 100}%`,
    top: '50%',
    transform: 'translate(-50%, -50%)',
    width: components.sliderHorizontal.thumbWidth,
    height: Math.min(components.sliderHorizontal.thumbHeight, trackHeight + 8),
    background: colors.text.primary,
    border: `2px solid ${color}`,
    borderRadius: components.sliderHorizontal.thumbRadius,
    boxShadow: `0 0 4px ${color}60`,
    cursor: 'grab',
  }),
  label: {
    position: 'absolute' as const,
    left: 4,
    top: '50%',
    transform: 'translateY(-50%)',
    ...labelStyles.parameter,
    pointerEvents: 'none' as const,
  },
  valueDisplay: (color: string) => ({
    position: 'absolute' as const,
    right: 4,
    top: '50%',
    transform: 'translateY(-50%)',
    fontFamily: 'var(--font-numeric)',
    fontSize: 11,
    fontWeight: 600,
    color,
    pointerEvents: 'none' as const,
  }),
};

/**
 * Vertical slider track styles
 */
export const sliderVerticalStyles = {
  container: (width: number = components.sliderVertical.trackWidth) => ({
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    gap: 8,
    width: width + 20, // Account for indicator overflow
  }),
  track: (height: number = components.sliderVertical.height, width: number = components.sliderVertical.trackWidth) => ({
    position: 'relative' as const,
    height,
    width,
    background: colors.bg.elevated,
    borderRadius: width / 2,
    cursor: 'ns-resize',
    touchAction: 'none' as const,
  }),
  fill: (color: string, value: number) => ({
    position: 'absolute' as const,
    left: 0,
    right: 0,
    bottom: 0,
    height: `${value * 100}%`,
    background: color,
    borderRadius: 'inherit',
    opacity: 0.6,
    transition: `height ${animation.duration.fast}`,
  }),
  indicator: (color: string, value: number) => ({
    position: 'absolute' as const,
    bottom: `${value * 100}%`,
    left: -components.sliderVertical.indicatorOverflow,
    right: -components.sliderVertical.indicatorOverflow,
    height: components.sliderVertical.indicatorHeight,
    background: color,
    borderRadius: components.sliderVertical.indicatorHeight / 2,
    transform: 'translateY(50%)',
    boxShadow: `0 0 6px ${color}80`,
  }),
};

/**
 * Knob/circular control styles
 */
export const knobStyles = {
  container: (size: number) => ({
    width: size,
    height: size,
    position: 'relative' as const,
  }),
  svg: {
    display: 'block',
    touchAction: 'none' as const,
    cursor: 'ns-resize',
    userSelect: 'none' as const,
  },
};

/**
 * Button styles
 */
export const buttonStyles = {
  base: (size: number = 44) => ({
    width: size,
    height: size,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: colors.bg.elevated,
    border: 'none',
    borderRadius: 4,
    cursor: 'pointer',
    transition: `background ${animation.duration.fast}`,
  }),
  active: (color: string) => ({
    background: color,
  }),
};

/**
 * Grid layout styles
 */
export const gridStyles = {
  responsive: (minWidth: number, gap: number = 8) => ({
    display: 'grid',
    gridTemplateColumns: `repeat(auto-fill, minmax(${minWidth}px, 1fr))`,
    gap,
  }),
  fixed: (columns: number, gap: number = 8) => ({
    display: 'grid',
    gridTemplateColumns: `repeat(${columns}, 1fr)`,
    gap,
  }),
};

/**
 * Header row styles (label + value display)
 */
export const headerStyles = {
  row: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
};

/**
 * Get color from accent name or return default
 */
export const getAccentColor = (colorName?: string): string => {
  if (!colorName) return colors.accent.cyan;
  return (colors.accent as Record<string, string>)[colorName] || colorName;
};

/**
 * Create a glow shadow for a color
 */
export const glowShadow = (color: string, intensity: number = 0.4): string => {
  return `0 0 12px ${color}${Math.round(intensity * 255).toString(16).padStart(2, '0')}`;
};

export default {
  moduleStyles,
  labelStyles,
  sliderHorizontalStyles,
  sliderVerticalStyles,
  knobStyles,
  buttonStyles,
  gridStyles,
  headerStyles,
  getAccentColor,
  glowShadow,
  generateCSSVariables,
  injectThemeStyles,
  lightColors,
};
