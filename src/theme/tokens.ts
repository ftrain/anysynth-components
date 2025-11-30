/**
 * Design Tokens for Synth Components
 *
 * A crisp, digital aesthetic with precise values.
 * All measurements support responsive scaling.
 */

export const colors = {
  // Backgrounds - depth hierarchy
  bg: {
    void: '#050505',      // Deepest - behind everything
    base: '#0a0a0a',      // Primary background
    surface: '#141414',   // Card/module surface
    elevated: '#1a1a1a',  // Raised elements
    highlight: '#242424', // Hover states, active
    border: '#2a2a2a',    // Subtle borders
  },

  // Text hierarchy
  text: {
    primary: '#ffffff',
    secondary: '#a0a0a0',
    muted: '#666666',
    disabled: '#404040',
  },

  // Accent colors - signal/parameter coding
  accent: {
    coral: '#ff6b6b',     // Gain, amplitude, volume
    orange: '#ff9f43',    // Filter, resonance
    yellow: '#feca57',    // LFO rate, modulation
    green: '#1dd1a1',     // Oscillator, pitch
    cyan: '#48dbfb',      // Effects, delay
    teal: '#00d2d3',      // Reverb, spatial
    purple: '#5f27cd',    // Modulation depth
    pink: '#ee5a9b',      // Envelope, ADSR
    blue: '#4a90d9',      // Sequencer, timing
  },

  // Semantic colors
  semantic: {
    active: '#1dd1a1',    // On/enabled state
    inactive: '#333333',  // Off/disabled state
    playing: '#48dbfb',   // Currently playing
    recording: '#ff6b6b', // Recording state
    warning: '#feca57',   // Clip warning
    error: '#ff6b6b',     // Error/overload
  },

  // Level meter gradient stops
  meter: {
    low: '#1dd1a1',
    mid: '#feca57',
    high: '#ff9f43',
    clip: '#ff6b6b',
  },
} as const;

export const typography = {
  // Font families
  family: {
    // Display: Sharp, technical, distinctive
    display: "'JetBrains Mono', 'SF Mono', 'Consolas', monospace",
    // Labels: Clean monospace for parameters
    mono: "'JetBrains Mono', 'SF Mono', 'Consolas', monospace",
    // Values: System UI for crisp numerics
    numeric: "system-ui, -apple-system, 'Segoe UI', sans-serif",
  },

  // Font sizes (rem-based for scaling)
  size: {
    xs: '0.625rem',   // 10px - tiny labels
    sm: '0.75rem',    // 12px - parameter names
    md: '0.875rem',   // 14px - values
    lg: '1rem',       // 16px - module titles
    xl: '1.25rem',    // 20px - section headers
    xxl: '1.5rem',    // 24px - plugin title
  },

  // Font weights
  weight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },

  // Letter spacing
  tracking: {
    tight: '-0.02em',
    normal: '0',
    wide: '0.05em',
    wider: '0.1em',
  },
} as const;

export const spacing = {
  // Base unit: 4px
  px: '1px',
  0: '0',
  1: '0.25rem',   // 4px
  2: '0.5rem',    // 8px
  3: '0.75rem',   // 12px
  4: '1rem',      // 16px
  5: '1.25rem',   // 20px
  6: '1.5rem',    // 24px
  8: '2rem',      // 32px
  10: '2.5rem',   // 40px
  12: '3rem',     // 48px
  16: '4rem',     // 64px
} as const;

export const sizing = {
  // Control heights
  control: {
    xs: '1.5rem',   // 24px - tiny buttons
    sm: '2rem',     // 32px - small controls
    md: '2.5rem',   // 40px - standard controls
    lg: '3rem',     // 48px - large controls
    xl: '4rem',     // 64px - prominent controls
  },

  // Slider track widths
  track: {
    thin: '2px',
    normal: '4px',
    thick: '6px',
    chunky: '8px',
  },

  // Border radius
  radius: {
    none: '0',
    sm: '2px',
    md: '4px',
    lg: '8px',
    xl: '12px',
    full: '9999px',
  },
} as const;

// Component-specific dimensions (numeric for calculations)
export const components = {
  // Horizontal slider defaults
  sliderHorizontal: {
    trackHeight: 32,        // Default track height in px
    trackHeightCompact: 20, // Compact track height
    thumbWidth: 16,         // Thumb width
    thumbHeight: 24,        // Thumb height
    thumbRadius: 4,         // Thumb border radius
    padding: 8,             // Thumb overflow padding (half of thumbWidth)
    labelHeight: 16,        // Label area height
    gap: 4,                 // Gap between tracks
  },

  // Vertical slider defaults
  sliderVertical: {
    trackWidth: 32,         // Match horizontal trackHeight
    trackWidthCompact: 20,  // Match horizontal compact
    height: 160,            // Default height
    heightCompact: 120,     // Compact height
    indicatorHeight: 3,     // Position indicator height
    indicatorOverflow: 4,   // How much indicator extends past track
    gap: 12,                // Gap between tracks
  },

  // Circular knob defaults
  knobCircular: {
    minSize: 120,           // Minimum knob size
    defaultSize: 180,       // Default knob size
    arcRange: 270,          // Arc sweep in degrees
    arcStart: -135,         // Arc start angle
    trackWidth: 8,          // Default ring track width
    trackWidthCompact: 6,   // Compact ring track width
    gap: 3,                 // Gap between rings
    centerRatio: 0.25,      // Center area ratio of total size
  },

  // Grid knob defaults
  knobGrid: {
    cellSize: 52,           // Default cell size
    cellSizeCompact: 40,    // Compact cell size
    columns: 4,             // Default columns
    gap: 8,                 // Gap between cells
    infoHeight: 20,         // Info display height
  },

  // Sequencer defaults (4x4 grid)
  sequencer: {
    cellSize: 64,           // Default cell size (square)
    cellSizeCompact: 48,    // Compact cell size
    gap: 8,                 // Gap between cells
    gapCompact: 6,          // Compact gap
  },

  // Module container defaults
  module: {
    padding: 16,            // Default padding
    paddingCompact: 8,      // Compact padding
    borderRadius: 8,        // Border radius
    gap: 12,                // Internal gap
    gapCompact: 8,          // Compact internal gap
  },

  // ADSR envelope
  adsr: {
    width: 280,             // SVG viewBox width
    height: 120,            // Default height
    heightCompact: 80,      // Compact height
    pointRadius: 8,         // Control point radius
    hitRadius: 16,          // Hit area radius for touch
  },

  // Transport
  transport: {
    buttonSize: 44,         // Default button size
    buttonSizeCompact: 36,  // Compact button size
    iconSize: 20,           // Default icon size
    iconSizeCompact: 16,    // Compact icon size
  },

  // Oscilloscope
  oscilloscope: {
    width: 280,             // Default width
    height: 140,            // Default height
    widthCompact: 200,      // Compact width
    heightCompact: 100,     // Compact height
  },

  // Keyboard
  keyboard: {
    height: 100,            // Default height
    heightCompact: 60,      // Compact height
    whiteKeyRatio: 0.14,    // White key width as ratio of total width per octave
    blackKeyRatio: 0.6,     // Black key width as ratio of white key
    blackKeyHeight: 0.6,    // Black key height as ratio of white key
  },
} as const;

export const animation = {
  // Durations
  duration: {
    instant: '0ms',
    fast: '100ms',
    normal: '200ms',
    slow: '300ms',
    slower: '500ms',
  },

  // Easing curves
  easing: {
    linear: 'linear',
    easeOut: 'cubic-bezier(0.0, 0.0, 0.2, 1)',
    easeIn: 'cubic-bezier(0.4, 0.0, 1, 1)',
    easeInOut: 'cubic-bezier(0.4, 0.0, 0.2, 1)',
    spring: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
  },
} as const;

export const shadows = {
  none: 'none',
  sm: '0 1px 2px rgba(0, 0, 0, 0.5)',
  md: '0 2px 4px rgba(0, 0, 0, 0.5)',
  lg: '0 4px 8px rgba(0, 0, 0, 0.5)',
  xl: '0 8px 16px rgba(0, 0, 0, 0.5)',
  // Glow effects for active states
  glow: {
    coral: '0 0 12px rgba(255, 107, 107, 0.4)',
    cyan: '0 0 12px rgba(72, 219, 251, 0.4)',
    green: '0 0 12px rgba(29, 209, 161, 0.4)',
    purple: '0 0 12px rgba(95, 39, 205, 0.4)',
  },
} as const;

// Breakpoints for responsive design
export const breakpoints = {
  mobile: '320px',
  tablet: '768px',
  desktop: '1024px',
  wide: '1440px',
} as const;

// Z-index layers
export const zIndex = {
  base: 0,
  dropdown: 100,
  modal: 200,
  popup: 300,
  tooltip: 400,
  notification: 500,
} as const;

// Export everything as a theme object
export const theme = {
  colors,
  typography,
  spacing,
  sizing,
  components,
  animation,
  shadows,
  breakpoints,
  zIndex,
} as const;

export type Theme = typeof theme;
export type ColorAccent = keyof typeof colors.accent;
