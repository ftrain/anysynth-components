# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

A comprehensive React/TypeScript component library for synthesizer UIs. Designed for:
- DAW plugin frontends (VST/AU)
- Browser-based DAWs (WASM compilation)
- Native mobile apps (React Native compatible patterns)

## Commands

```bash
npm install          # Install dependencies
npm run dev          # Start Storybook on port 6006
npm run build        # Build library
npm run typecheck    # TypeScript check
```

## Project Structure

```
src/
├── components/      # All UI components
│   ├── NestedSlider/   # Horizontal, Vertical, Circular, Grid variants
│   ├── Sequencer/      # Step sequencer with note editor
│   ├── ADSR/           # Envelope visualizer
│   ├── Transport/      # Play/stop/record controls
│   ├── LevelMeter/     # VU/PPM meter
│   ├── Oscilloscope/   # Waveform/spectrum display
│   ├── PianoKeyboard/  # Interactive keyboard
│   └── LFO/            # LFO with shape visualization
├── theme/           # Design tokens, themes, ThemeProvider
├── types/           # TypeScript interfaces
├── stories/         # Storybook stories and demo layouts
└── index.ts         # Main export
```

## Design System

**Theme modes**: Dark (default) and Light - use `ThemeProvider` with `defaultMode`

**Colors** (semantic usage):
- `coral` - Gain, amplitude, volume
- `orange` - Filter, resonance
- `yellow` - LFO rate, modulation
- `green` - Oscillator, pitch
- `cyan` - Effects, delay
- `teal` - Reverb, spatial
- `purple` - Modulation depth
- `pink` - Envelope, ADSR
- `blue` - Sequencer, timing

**Typography**:
- Monospace (`JetBrains Mono`) for labels and parameters
- System UI for numeric values

## Component Patterns

### Controls philosophy
- **Continuous parameters** (rate, depth, cutoff): Direct manipulation via drag
- **Stepped/categorical** (waveform, filter type): Halo selectors or dropdowns
- Live-playable controls should be immediately accessible without modals

### Interaction conventions
- Tap/click: Select or toggle
- Vertical drag: Adjust value (up = increase)
- Double-tap: Reset to default
- Long-press: Open detailed editor
- Arrow keys: Fine control (Shift for 10x steps)
- Delete/Backspace: Reset

### Responsive behavior

**IMPORTANT: Box Layout Pattern**
- All modules should be fixed-size squares (e.g., 320px × 320px)
- Use flexbox with `flex-wrap: wrap` for natural reflow
- Set explicit `width` and `height` with `flex-shrink: 0` to prevent scaling
- Boxes wrap like words in a sentence as window narrows
- **Never use CSS Grid with `auto-fill`** - it tries to fit columns and shrinks rightmost boxes
- **Never use responsive `1fr` columns** - boxes must maintain constant size

```css
/* CORRECT: Fixed-size boxes with flexbox wrap */
.module-container {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}
.module-container > * {
  width: 320px;
  height: 320px;
  flex-shrink: 0;  /* Critical: prevents shrinking */
}

/* WRONG: Grid with auto-fill or 1fr */
.module-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, 320px);  /* Will shrink boxes */
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));  /* Will scale boxes */
}
```

## SquareModule Pattern

The standard module wrapper used in all plugin UIs:

```tsx
const SquareModule: React.FC<{
  title?: string;
  children: React.ReactNode;
  color?: string;  // Border accent color
}> = ({ title, children, color }) => (
  <div style={{
    background: colors.bg.surface,
    borderRadius: 12,
    border: `1px solid ${color ? color + '33' : colors.bg.border}`,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  }}>
    {title && (
      <div className="label" style={{ padding: '10px 8px', color: color || colors.text.muted, flexShrink: 0 }}>
        {title}
      </div>
    )}
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 8 }}>
      {children}
    </div>
  </div>
);
```

## Component Selection Guide

| Module Type | Component | Recommended Size |
|-------------|-----------|-----------------|
| VCO, Filter, Master | `NestedSliderCircular` | size=180-220 |
| Envelope (ADSR) | `ADSR` | width=280, height=200 |
| Sequencer velocity | `NestedSliderVertical` | height=220 |
| Sequencer pitch | `NestedSliderGrid` | columns=4, cellSize=60 |
| Keyboard | `PianoKeyboard` | compact, octaves=2 |
| Toggle (waveform, run) | `LEDButton` | 40x40 |
| Simple parameter | `CompactSlider` | thick=true |

### Usage Example

```tsx
<div className="synth-grid" style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
  <SquareModule title="VCO 1" color={colors.accent.green}>
    <NestedSliderCircular
      parameters={[
        { id: 'freq', name: 'FREQ', value: 0.5, color: 'green' },
        { id: 'level', name: 'LEVEL', value: 0.7, color: 'coral' },
      ]}
      onChange={handleChange}
      size={220}
    />
  </SquareModule>

  <SquareModule title="AMP ENV" color={colors.accent.pink}>
    <ADSR
      value={{ attack: 10, decay: 200, sustain: 0.7, release: 300 }}
      onChange={handleEnvChange}
      width={280}
      height={200}
      showValues={false}
    />
  </SquareModule>
</div>
```

## State Management

Uses Zustand for lightweight state. Components accept controlled values via props with `onChange` callbacks.

## Key Files

- `COMPONENTS.md` - Quick reference for all components and types
- `src/theme/tokens.ts` - All design tokens
- `src/theme/themes.ts` - Dark/light theme definitions
- `src/types/index.ts` - All TypeScript interfaces

## Legacy Components

The root-level `.jsx` files are the original standalone components (pre-TypeScript):
- `nested-knob-set.jsx` - Original circular nested knobs
- `fraction-picker.jsx` - Fraction selector
- `sequencer.jsx` - Original sequencer

These are preserved for reference but the `src/` library is the active codebase.
