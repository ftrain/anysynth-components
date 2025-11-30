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
- Mobile (< 768px): Single column, stacked modules
- Tablet/Desktop: CSS Grid with `auto-fit` and `minmax(280px, 1fr)`
- Modules should fill available space organically

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
