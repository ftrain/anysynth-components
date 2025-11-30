/**
 * Synth Components - Main Export
 *
 * A comprehensive synthesizer UI component library.
 */

// Slider variations
export {
  NestedSliderHorizontal,
  NestedSliderVertical,
  NestedSliderCircular,
  NestedSliderGrid,
} from './NestedSlider';

// Sequencer
export { Sequencer } from './Sequencer';

// Core controls
export { ADSR } from './ADSR';
export { Transport } from './Transport';
export { LevelMeter } from './LevelMeter';
export { Oscilloscope } from './Oscilloscope';
export { PianoKeyboard } from './PianoKeyboard';
export { LFO } from './LFO';

// Oscillator
export { WaveformSelector, WavetableView } from './WaveformSelector';
export type { WaveformSelectorProps, WaveformType, WavetableViewProps, WavetableFrame, ModulationSource } from './WaveformSelector';

// Performance controls
export { ModWheel } from './ModWheel';
export { XYPad } from './XYPad';

// Musical input
export { FractionPicker } from './FractionPicker';
export type { FractionValue, FractionPickerProps } from './FractionPicker';
export { ChordEntry, ChordKnob } from './ChordEntry';
export type { ChordEntryProps, ChordValue, ChordKnobProps, ChordKnobValue } from './ChordEntry';
export { TimeInput, TimeKnob } from './TimeInput';
export type { TimeInputProps, TimeValue, TimeMode, SyncDivision, TimeKnobProps, TimeKnobValue } from './TimeInput';

// Drum machine
export { DrumPad, DrumPadGrid, DrumPadSequencer } from './DrumPad';
export type { DrumPadProps, DrumPadGridProps, DrumPadSequencerProps, DrumStep, DrumTrack } from './DrumPad';

// Modulation
export { ModMatrix } from './ModMatrix';
export type { ModMatrixProps, ModSource, ModDestination, ModRoute } from './ModMatrix';

// Effects
export { EffectsChain } from './EffectsChain';
export type { EffectsChainProps, Effect, EffectParameter } from './EffectsChain';

// Development tools
export { ParameterInspector } from './ParameterInspector';
export type { InspectorParameter } from './ParameterInspector';
export { MIDIMonitor } from './MIDIMonitor';
export type { MIDIMonitorProps, MIDIEvent } from './MIDIMonitor';

// Icons
export * from './Icons';

// Primitive building blocks
export { Slider, OptionPicker, WaveformPicker } from './Primitives';
export type { SliderProps, OptionPickerProps, WaveformPickerProps, WaveformShape } from './Primitives';
