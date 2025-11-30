# Synth Components Index

Quick reference for all available components. For full documentation, run Storybook.

## Controls

### NestedSliderHorizontal
Stacked horizontal sliders for multiple parameters. Space-efficient, mobile-friendly.
```tsx
<NestedSliderHorizontal
  parameters={[{ id: 'cutoff', name: 'CUT', color: 'orange', value: 0.5, defaultValue: 0.5 }]}
  label="FILTER"
  onChange={(id, value) => {}}
/>
```
Props: `parameters`, `onChange`, `onOptionChange`, `label`, `showValues`, `trackHeight`, `gap`

### NestedSliderVertical
Side-by-side vertical faders. Classic mixer aesthetic.
```tsx
<NestedSliderVertical
  parameters={[{ id: 'osc1', name: 'OSC1', color: 'coral', value: 0.8, defaultValue: 0.7 }]}
  label="MIXER"
  height={160}
/>
```
Props: `parameters`, `onChange`, `label`, `height`, `trackWidth`, `showLabels`, `showValues`

### NestedSliderCircular
Concentric ring knobs with halo option selectors.
```tsx
<NestedSliderCircular
  parameters={oscillatorParams}
  label="OSC 1"
  size={200}
/>
```
Props: `parameters`, `onChange`, `onOptionChange`, `label`, `size`, `startAngle`, `sweepAngle`

### NestedSliderGrid
Grid of mini-sliders. Great for macros or mod matrices.
```tsx
<NestedSliderGrid
  parameters={macroParams}
  label="MACROS"
  columns={4}
  cellSize={56}
/>
```
Props: `parameters`, `onChange`, `label`, `columns`, `cellSize`, `gap`, `showLabels`, `bipolarVisualization`

## Modules

### Sequencer
16/32/64-step sequencer with visual pitch bars and velocity.
```tsx
<Sequencer
  steps={16}
  playingStep={currentStep}
  onChange={(pattern) => {}}
/>
```
Props: `steps`, `initialPattern`, `onChange`, `playingStep`, `baseOctave`, `noteRange`, `label`, `compact`

### ADSR
Visual envelope editor with draggable control points.
```tsx
<ADSR
  value={{ attack: 10, decay: 200, sustain: 0.7, release: 300 }}
  onChange={setEnvelope}
  color="#ee5a9b"
/>
```
Props: `value`, `onChange`, `label`, `color`, `maxAttack`, `maxDecay`, `maxRelease`, `height`, `showValues`

### LFO
LFO with shape visualization, rate/depth, and delay.
```tsx
<LFO
  value={{ rate: 2, depth: 0.5, shape: 'sine', phase: 0, delay: 0 }}
  onChange={setLfo}
  showDelay
/>
```
Props: `value`, `onChange`, `label`, `color`, `maxRate`, `minRate`, `showDelay`, `syncMode`, `width`, `height`

### Transport
Play/stop/record with tempo and position display.
```tsx
<Transport
  state={transportState}
  onStateChange={(changes) => {}}
  showBpm
  showPosition
/>
```
Props: `state`, `onStateChange`, `showPosition`, `showBpm`, `showTimeSignature`, `compact`

## Visualization

### LevelMeter
VU/PPM-style meter with peak hold.
```tsx
<LevelMeter
  value={{ peak: 0.6, rms: 0.4, clip: false }}
  height={200}
/>
// Stereo:
<LevelMeter value={[leftChannel, rightChannel]} />
```
Props: `value`, `orientation`, `height`, `width`, `showPeak`, `showRms`, `showDb`, `peakHoldMs`, `label`

### Oscilloscope
Real-time waveform and spectrum visualization.
```tsx
<Oscilloscope
  data={waveformData}
  mode="scope" // or "spectrum" or "both"
  width={320}
  height={160}
/>
```
Props: `data`, `frequencyData`, `mode`, `width`, `height`, `color`, `showGrid`, `showLabels`, `triggerLevel`

### PianoKeyboard
Interactive piano keyboard with computer keyboard support.
```tsx
<PianoKeyboard
  startOctave={3}
  octaves={2}
  activeNotes={[60, 64, 67]}
  onNoteOn={(note, velocity) => {}}
  onNoteOff={(note) => {}}
/>
```
Props: `startOctave`, `octaves`, `activeNotes`, `highlightedNotes`, `onNoteOn`, `onNoteOff`, `enableKeyboard`, `height`, `showNoteNames`

## Types

### Parameter
```tsx
interface Parameter {
  id: string;
  name: string;
  value: number;         // 0-1 normalized
  defaultValue: number;
  min?: number;          // Display range
  max?: number;
  step?: number;
  unit?: string;
  color?: ColorAccent;   // 'coral' | 'orange' | 'yellow' | 'green' | 'cyan' | 'teal' | 'purple' | 'pink' | 'blue'
  bipolar?: boolean;
}
```

### ParameterWithOptions
Extends Parameter with `options: string[]` and `selectedOption: string`.

### EnvelopeParams
```tsx
interface EnvelopeParams {
  attack: number;   // ms
  decay: number;    // ms
  sustain: number;  // 0-1
  release: number;  // ms
}
```

### LFOParams
```tsx
interface LFOParams {
  rate: number;     // Hz
  depth: number;    // 0-1
  shape: 'sine' | 'triangle' | 'saw' | 'square' | 'noise' | 'custom';
  phase: number;    // 0-360
  delay?: number;   // ms
  retrigger?: boolean;
}
```

### TransportState
```tsx
interface TransportState {
  playing: boolean;
  recording: boolean;
  bpm: number;
  timeSignature: [number, number];
  position: number;  // beats
  loop: boolean;
  loopStart: number;
  loopEnd: number;
}
```

### SequencerStep
```tsx
interface SequencerStep {
  type: 'note' | 'rest' | 'tie' | 'flam';
  note: number | null;  // MIDI note
  velocity: number;     // 0-1
  duration?: number;
  subSteps?: SequencerStep[];
}
```

## Theme

### Colors (Accent)
- `coral` - Gain, amplitude, volume
- `orange` - Filter, resonance
- `yellow` - LFO rate, modulation
- `green` - Oscillator, pitch
- `cyan` - Effects, delay
- `teal` - Reverb, spatial
- `purple` - Modulation depth
- `pink` - Envelope, ADSR
- `blue` - Sequencer, timing

### Usage
```tsx
import { ThemeProvider, useTheme, colors } from 'synth-components';

// Wrap app
<ThemeProvider defaultMode="dark">
  <App />
</ThemeProvider>

// Use theme
const { theme, mode, setMode } = useTheme();
```

## Interaction Patterns

- **Tap**: Toggle on/off or select
- **Drag vertically**: Adjust continuous values
- **Double-tap**: Reset to default
- **Long-press**: Open detailed editor (sequencer steps)
- **Arrow keys**: Fine adjustment (Shift for larger steps)
- **Delete/Backspace**: Reset to default
- **Computer keyboard**: Piano input (A-L keys)

## Responsive Design

Components use flexbox and grid for responsive layouts:
- Mobile (< 768px): Single column, stacked modules
- Tablet (768-1024px): 2-column grid
- Desktop (> 1024px): Auto-fit grid, modules fill available space

Use CSS grid with `minmax()` for organic module flow:
```css
.synth-module-grid {
  display: grid;
  gap: 16px;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
}
```
