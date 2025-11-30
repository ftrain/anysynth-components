# Synth Components - LLM Integration Guide

A comprehensive React component library for building synthesizer UIs. Use these components to create DAW plugins, browser-based instruments, and mobile music apps.

## Quick Reference

### Import Pattern
```tsx
import { ComponentName } from 'synth-components';
```

### Theme System
All components use a centralized theme system. Import utilities from theme:
```tsx
import { colors, components, moduleStyles, labelStyles, getAccentColor } from 'synth-components';

// Light mode support
import { lightColors, generateCSSVariables, injectThemeStyles } from 'synth-components';

// Inject theme at app startup
injectThemeStyles(isDarkMode);
```

### Available Components by Category

## 1. KNOBS & SLIDERS (Parameter Control)

### NestedSliderCircular
Concentric ring knobs with optional halo options.
```tsx
<NestedSliderCircular
  parameters={[
    { id: 'cutoff', name: 'CUTOFF', value: 0.5, defaultValue: 0.5, color: 'cyan' },
    { id: 'resonance', name: 'RES', value: 0.3, defaultValue: 0, color: 'coral' },
  ]}
  label="FILTER"
  size={180}
  onChange={(id, value) => console.log(id, value)}
  onOptionChange={(id, option) => console.log(id, option)}
  compact={false}
  fillContainer={false}  // When true, fills parent container
/>
```
**Props:** parameters, label, size (default 180), onChange, onOptionChange, dragSelectOptions (auto-select options on drag), compact, fillContainer

### NestedSliderHorizontal
Stacked horizontal sliders with thick touch-friendly tracks.
```tsx
<NestedSliderHorizontal
  parameters={[
    { id: 'attack', name: 'ATK', value: 0.1, defaultValue: 0.1, color: 'coral' },
    { id: 'decay', name: 'DCY', value: 0.3, defaultValue: 0.3, color: 'orange' },
  ]}
  label="ENVELOPE"
  trackHeight={32}  // Default 32px (touch-friendly)
  gap={4}
  compact={false}
  onChange={(id, value) => {}}
/>
```
**Props:** parameters, label, trackHeight (default 32), gap (default 4), showValues, compact

### NestedSliderVertical
Vertical fader-style sliders with simple indicator lines.
```tsx
<NestedSliderVertical
  parameters={[...]}
  label="MIXER"
  height={160}
  trackWidth={12}  // Default 12px (thicker for touch)
  compact={false}
/>
```
**Props:** parameters, label, height (default 160), trackWidth (default 12), showLabels, showValues, compact

### NestedSliderGrid
Grid of mini-knobs with fill visualization. Supports auto-fill width.
```tsx
<NestedSliderGrid
  parameters={[...]}
  columns={4}
  cellSize={52}
  label="MACROS"
  compact={false}
  fillWidth={true}  // Fills container width with auto-fill grid
/>
```
**Props:** parameters, columns, cellSize (default 52), gap (default 8), label, showLabels, bipolarVisualization, compact, fillWidth

## 2. PARAMETER TYPES

### Basic Parameter
```tsx
interface Parameter {
  id: string;
  name: string;
  value: number;          // 0-1 normalized
  defaultValue: number;
  color?: 'coral' | 'orange' | 'yellow' | 'green' | 'cyan' | 'teal' | 'purple' | 'pink' | 'blue';
  min?: number;           // Display min (default 0)
  max?: number;           // Display max (default 100)
  unit?: string;          // e.g., 'Hz', 'ms', '%'
  step?: number;          // For stepped values
  bipolar?: boolean;      // Centers at 0
}
```

### Parameter with Options
```tsx
interface ParameterWithOptions extends Parameter {
  options: string[];
  selectedOption: string;
}
// Example:
{ id: 'wave', name: 'WAVE', value: 0.5, defaultValue: 0.5,
  options: ['Saw', 'Square', 'Tri', 'Sine'], selectedOption: 'Saw' }
```

## 3. ENVELOPES

### ADSR
Responsive SVG envelope with viewBox-based scaling.
```tsx
<ADSR
  value={{ attack: 10, decay: 200, sustain: 0.7, release: 300 }}
  onChange={(params) => setEnvelope(params)}
  label="AMP ENV"
  color="#ff6b6b"
  height={120}
  attackRange={[0, 1000]}
  decayRange={[0, 2000]}
  releaseRange={[0, 5000]}
/>
```
**EnvelopeParams:** { attack: number (ms), decay: number (ms), sustain: number (0-1), release: number (ms) }

## 4. LFO

### LFO
```tsx
<LFO
  value={{ rate: 2, depth: 0.5, shape: 'sine', phase: 0, delay: 0 }}
  onChange={(params) => setLFO(params)}
  label="LFO 1"
  showDelay
  shapes={['sine', 'triangle', 'saw', 'square', 'random']}
/>
```
**LFOParams:** { rate: number (Hz), depth: number (0-1), shape: string, phase: number (0-360), delay: number (ms) }

## 5. OSCILLATOR / WAVEFORM

### WaveformSelector
```tsx
<WaveformSelector
  value="saw"
  onChange={(waveform) => setWave(waveform)}
  waveforms={['sine', 'saw', 'square', 'triangle', 'noise', 'pulse']}
  pulseWidth={0.5}
  onPulseWidthChange={(pw) => setPulseWidth(pw)}
  displaySize={{ width: 120, height: 60 }}
  label="OSC 1"
/>
```
**WaveformType:** 'sine' | 'saw' | 'square' | 'triangle' | 'noise' | 'pulse' | 'wavetable' | 'custom'

### WavetableView
```tsx
<WavetableView
  position={0.5}
  onPositionChange={(pos) => setPosition(pos)}
  frames={wavetableFrames}
  modSources={[{ name: 'LFO1', amount: 0.3, color: colors.accent.purple }]}
  modOffset={0.1}
  rangeStart={0}          // Bottom slider sets range offset (-1 to 1)
  onRangeChange={(range) => setRange(range)}
  width={200}
  height={100}
  label="WAVETABLE"
/>
```
**Note:** Bottom slider sets a range offset, vertical slider controls position within that range. Modulation sources display visually.

## 6. SEQUENCER

### Sequencer (16-step 4x4 grid)
Always displays as a 4x4 grid of 16 steps. Touch-optimized: tap to toggle, drag for velocity, long-press for note editor.
```tsx
<Sequencer
  playingStep={currentStep}
  baseOctave={3}
  noteRange={24}
  compact={false}
  onChange={(pattern) => setPattern(pattern)}
  label="SEQ"
/>
```
**Props:** initialPattern, onChange, playingStep, baseOctave, noteRange, label, compact
**SequencerStep:** { type: 'note' | 'rest' | 'tie' | 'flam', note: number | null, velocity: number }

### DrumPadSequencer (4x4 drum machine)
```tsx
<DrumPadSequencer
  tracks={[
    { id: 'kick', name: 'KICK', color: 'coral', steps: Array(16).fill({ active: false, velocity: 1, probability: 1 }) },
    { id: 'snare', name: 'SNARE', color: 'orange', steps: [...] },
  ]}
  currentStep={playingStep}
  onTrackChange={(trackId, steps) => updateTrack(trackId, steps)}
  onPadTrigger={(trackId) => playSound(trackId)}
/>
```

### DrumPad & DrumPadGrid
```tsx
<DrumPad
  label="KICK"
  color="coral"
  onTrigger={(velocity) => playKick(velocity)}
  active={isPlaying}
/>

<DrumPadGrid
  pads={[...]}
  onPadTrigger={(id, velocity) => play(id, velocity)}
  columns={4}
/>
```

## 7. KEYBOARD / CHORD

### PianoKeyboard
Responsive keyboard with auto-compact mode.
```tsx
<PianoKeyboard
  startOctave={3}
  octaves={2}
  activeNotes={[60, 64, 67]}
  highlightedNotes={[0, 4, 7]}  // Scale degrees
  onNoteOn={(note, velocity) => playNote(note, velocity)}
  onNoteOff={(note) => stopNote(note)}
  enableKeyboard={true}
  height={100}             // Or use compact for auto-height
  showNoteNames
  activeColor={colors.accent.cyan}
  compact={false}          // Manual compact mode
  compactBreakpoint={400}  // Auto-compact below this width
/>
```

### ChordKnob (Nested knob chord selector)
```tsx
<ChordKnob
  onChange={(value) => console.log(value.chordName, value.midiNotes)}
  onTrigger={(midiNotes) => playChord(midiNotes)}
  size={220}
  showKeyboard
  label="CHORD"
/>
```
Rings: Octave → Root → Type → Suspended → Extended → Inversion
**Features:** Unicode typography (Δ7, °, +, ⁷, ⁹), chord name displayed below knob, play button in center, halo shows all options for active ring

## 8. TIME / TEMPO

### TimeKnob (Nested knob time selector)
Three concentric rings for flexible time/rhythm input.
```tsx
<TimeKnob
  value={{
    mode: 'sync',           // 'sync' | 'free'
    numerator: 1,           // 1-256
    denominator: 4,         // 1-256 (snaps to powers of 2)
    modifier: 'straight',   // 'straight' | 'dotted' | 'triplet'
    ms: 500
  }}
  onChange={(value) => setTime(value)}
  bpm={120}
  size={180}
  color="cyan"
  compact={false}
  label="DELAY TIME"
/>
```
**Rings:** Outer=Numerator, Middle=Denominator, Inner=Modifier
**Interaction:** Center click toggles sync/free mode. Double-click resets.

### TimeInput (Sync + Free modes)
```tsx
<TimeInput
  value={{ mode: 'sync', ms: 500, division: { numerator: 1, denominator: 4, label: '1/4' } }}
  onChange={(value) => setTime(value)}
  bpm={120}
  showModeToggle
  showDottedTriplet
  label="DELAY TIME"
/>
```

### FractionPicker
```tsx
<FractionPicker
  value={{ numerator: 3, denominator: 4 }}
  onChange={(value) => setFraction(value)}
  maxValue={256}
  label="TIME SIG"
/>
```

## 9. MODULATION

### ModMatrix
```tsx
<ModMatrix
  sources={[
    { id: 'lfo1', name: 'LFO 1', shortName: 'L1' },
    { id: 'env1', name: 'ENV 1', shortName: 'E1' },
  ]}
  destinations={[
    { id: 'cutoff', name: 'Filter Cutoff', shortName: 'CUT', category: 'Filter' },
    { id: 'pitch', name: 'OSC Pitch', shortName: 'PIT', category: 'Osc' },
  ]}
  routes={[
    { id: 'r1', sourceId: 'lfo1', destId: 'cutoff', amount: 0.5, enabled: true }
  ]}
  onChange={(routes) => setRoutes(routes)}
  bipolar
  maxRoutes={16}
  viewMode="grid"
  label="MOD MATRIX"
/>
```
Click to create route, drag up/down to adjust amount (-100% to +100%), double-click to toggle/remove.

## 10. EFFECTS

### EffectsChain
Full-width responsive effects chain with drag-to-reorder.
```tsx
<EffectsChain
  effects={[
    { id: 'delay', name: 'Delay', enabled: true, wetDry: 0.5,
      parameters: [
        { id: 'time', name: 'Time', value: 0.5 },
        { id: 'feedback', name: 'Feedback', value: 0.3 },
      ]
    },
  ]}
  onChange={(effects) => setEffects(effects)}
  onReorder={(fromIndex, toIndex) => reorderEffects(fromIndex, toIndex)}
  compact={false}
  label="EFFECTS"
/>
```

## 11. TRANSPORT / METERING

### Transport
Responsive transport with flex-wrap for narrow viewports.
```tsx
<Transport
  state={{ playing: false, recording: false, bpm: 120, position: 0, loop: false }}
  onStateChange={(changes) => updateTransport(changes)}
  showBpm
  showPosition
  showTimeSignature
  compact={false}
/>
```

### LevelMeter
```tsx
<LevelMeter
  value={[{ peak: 0.8, rms: 0.5, clip: false }, { peak: 0.75, rms: 0.45, clip: false }]}
  height={100}
  showDb
  peakHold={1000}
  label="OUTPUT"
/>
```

### Oscilloscope
```tsx
<Oscilloscope
  data={waveformData}  // Float32Array
  mode="scope"         // 'scope' | 'spectrum'
  width={200}
  height={100}
  color={colors.accent.cyan}
/>
```

## 12. DEBUG / DEVELOPMENT

### MIDIMonitor
```tsx
<MIDIMonitor
  events={midiEvents}
  maxEvents={100}
  showTimestamps
  showRaw
  filterTypes={['noteOn', 'noteOff']}
  onClear={() => clearEvents()}
  height={200}
  label="MIDI IN"
/>
```
**MIDIEvent:** { timestamp, type: 'noteOn'|'noteOff'|'cc'|'pitchBend'|'aftertouch', channel, data: number[] }

### ParameterInspector
For debugging parameter state.

## 13. THEME SYSTEM

### Colors
```tsx
import { colors } from 'synth-components';

// Backgrounds
colors.bg.void       // #050505 - deepest
colors.bg.base       // #0a0a0a - primary
colors.bg.surface    // #141414 - card/module
colors.bg.elevated   // #1a1a1a - raised
colors.bg.highlight  // #242424 - hover/active
colors.bg.border     // #2a2a2a

// Text
colors.text.primary    // #ffffff
colors.text.secondary  // #a0a0a0
colors.text.muted      // #666666
colors.text.disabled   // #404040

// Accents
colors.accent.coral    // #ff6b6b - gain, amplitude
colors.accent.orange   // #ff9f43 - filter, resonance
colors.accent.yellow   // #feca57 - LFO rate
colors.accent.green    // #1dd1a1 - oscillator, pitch
colors.accent.cyan     // #48dbfb - effects, delay
colors.accent.teal     // #00d2d3 - reverb, spatial
colors.accent.purple   // #5f27cd - modulation depth
colors.accent.pink     // #ee5a9b - envelope, ADSR
colors.accent.blue     // #4a90d9 - sequencer, timing
```

### Component Dimensions
```tsx
import { components } from 'synth-components';

components.sliderHorizontal.trackHeight     // 32 (default), 20 (compact)
components.sliderVertical.trackWidth        // 12 (default), 8 (compact)
components.sliderVertical.height            // 160 (default), 120 (compact)
components.knobCircular.defaultSize         // 180
components.knobCircular.minSize             // 120
components.knobGrid.cellSize                // 52 (default), 40 (compact)
components.keyboard.height                  // 100 (default), 60 (compact)
components.module.padding                   // 16 (default), 8 (compact)
```

### Light Mode
```tsx
import { injectThemeStyles, lightColors } from 'synth-components';

// At app startup
injectThemeStyles(false);  // false = light mode

// Or generate CSS variables
const css = generateCSSVariables(false);
```

## 14. INTERACTION PATTERNS

- **Drag**: Vertical drag adjusts values (up = increase)
- **Click**: Select/toggle
- **Double-click**: Reset to default
- **Shift+Drag**: Fine adjustment (10x precision)
- **Arrow keys**: Increment/decrement when focused
- **Home/End**: Min/max values
- **Delete/Backspace**: Reset to default

## 15. LAYOUT PATTERNS

### Module Container
```tsx
import { moduleStyles, labelStyles } from 'synth-components';

const Module = ({ title, children }) => (
  <div style={moduleStyles.base}>
    {title && <div style={labelStyles.module}>{title}</div>}
    <div>{children}</div>
  </div>
);
```

### Synth Layout Grid
```tsx
<div style={{
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
  gap: 16,
}}>
  <Module title="OSC 1"><NestedSliderCircular .../></Module>
  <Module title="FILTER"><NestedSliderHorizontal .../></Module>
  <Module title="AMP"><ADSR .../></Module>
</div>
```

## 16. COMMON SYNTH PATTERNS

### Oscillator Section
```tsx
const oscillatorParams = [
  { id: 'level', name: 'LEVEL', value: 0.7, defaultValue: 0.7, color: 'coral' },
  { id: 'pitch', name: 'PITCH', value: 0.5, defaultValue: 0.5, bipolar: true, color: 'green' },
  { id: 'fine', name: 'FINE', value: 0.5, defaultValue: 0.5, bipolar: true, color: 'cyan' },
  { id: 'wave', name: 'WAVE', value: 0.5, options: ['Saw', 'Square', 'Tri', 'Sine'], selectedOption: 'Saw', color: 'yellow' },
];
```

### Filter Section
```tsx
const filterParams = [
  { id: 'cutoff', name: 'CUT', value: 0.6, defaultValue: 0.5, color: 'orange' },
  { id: 'resonance', name: 'RES', value: 0.3, defaultValue: 0.0, color: 'coral' },
  { id: 'envAmount', name: 'ENV', value: 0.5, defaultValue: 0.5, bipolar: true, color: 'pink' },
  { id: 'keyTrack', name: 'KEY', value: 0.0, defaultValue: 0.0, color: 'purple' },
];
```

### Complete Mini Synth
```tsx
function MiniSynth() {
  const [oscParams, setOscParams] = useState([...]);
  const [filterParams, setFilterParams] = useState([...]);
  const [ampEnv, setAmpEnv] = useState({ attack: 10, decay: 200, sustain: 0.7, release: 300 });

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, padding: 16, background: colors.bg.base }}>
      <NestedSliderCircular parameters={oscParams} label="OSC" onChange={updateOsc} fillContainer />
      <NestedSliderHorizontal parameters={filterParams} label="FILTER" onChange={updateFilter} />
      <ADSR value={ampEnv} onChange={setAmpEnv} label="AMP" />
      <div style={{ gridColumn: 'span 3' }}>
        <PianoKeyboard octaves={2} onNoteOn={playNote} onNoteOff={stopNote} />
      </div>
    </div>
  );
}
```

## Tips for LLM Usage

1. **Always normalize values** - All parameter values are 0-1, use min/max for display
2. **Use color tokens** - Pick from the accent palette for visual consistency
3. **Combine components** - The power is in composition (e.g., ADSR + LFO + ModMatrix)
4. **Mobile-first** - All components support touch, use `compact` prop for mobile
5. **State management** - Components are controlled; manage state externally (useState/Zustand)
6. **BPM sync** - TimeKnob supports tempo-synced timing with numerator/denominator/modifier
7. **MIDI integration** - PianoKeyboard and MIDIMonitor for MIDI I/O
8. **Responsive layouts** - Components auto-adapt to container width with `fillWidth` or `fillContainer`
9. **Touch-friendly** - Horizontal sliders 32px, vertical sliders 12px default
10. **Theme injection** - Call `injectThemeStyles(isDark)` at app startup for CSS variables
11. **Light mode** - Full light theme support via `lightColors` and `injectThemeStyles(false)`
