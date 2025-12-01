/**
 * Core Types for Synth Components
 */

import React from 'react';
import type { ColorAccent } from '../theme/tokens';

// Base parameter type - the foundation for all controls
export interface Parameter {
  id: string;
  name: string;
  value: number;           // Normalized 0-1
  defaultValue: number;
  min?: number;            // Display range min
  max?: number;            // Display range max
  step?: number;           // Step size for discrete values
  unit?: string;           // Display unit (Hz, dB, ms, %)
  color?: ColorAccent;
  bipolar?: boolean;       // Center at 0.5 (e.g., pan, pitch)
}

// Option with optional icon
export interface OptionConfig {
  label: string;
  icon?: React.ReactNode;  // SVG icon element
}

// Parameter with options (like waveform selection)
export interface ParameterWithOptions extends Parameter {
  options: string[] | OptionConfig[];  // Can be simple strings or objects with icons
  selectedOption: string;
}

// Callback types
export type ParameterChangeHandler = (id: string, value: number) => void;
export type OptionChangeHandler = (id: string, option: string) => void;

// Control orientation
export type Orientation = 'horizontal' | 'vertical';

// Control size variants
export type ControlSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

// Module types - containers for parameters
export interface ModuleConfig {
  id: string;
  name: string;
  parameters: Parameter[];
  enabled?: boolean;
}

// Sequencer step types
export type StepType = 'note' | 'rest' | 'tie' | 'flam';

export interface SequencerStep {
  type: StepType;
  note: number | null;     // MIDI note number
  velocity: number;        // 0-1
  duration?: number;       // Relative to step length
  subSteps?: SequencerStep[];
}

// ADSR envelope
export interface EnvelopeParams {
  attack: number;          // Time in ms
  decay: number;
  sustain: number;         // Level 0-1
  release: number;
}

// LFO configuration
export interface LFOParams {
  rate: number;            // Hz or sync ratio
  depth: number;           // 0-1
  shape: 'sine' | 'triangle' | 'saw' | 'square' | 'noise' | 'custom';
  phase: number;           // 0-360
  delay?: number;          // Fade-in time
  retrigger?: boolean;
}

// Modulation matrix entry
export interface ModMatrixEntry {
  source: string;
  destination: string;
  amount: number;          // -1 to 1
  enabled: boolean;
}

// Filter types
export type FilterType = 'lowpass' | 'highpass' | 'bandpass' | 'notch' | 'allpass' | 'peaking' | 'lowshelf' | 'highshelf';

// Oscillator types
export type OscillatorType = 'sine' | 'saw' | 'square' | 'triangle' | 'noise' | 'wavetable';

// Voice mode
export type VoiceMode = 'mono' | 'poly' | 'unison' | 'legato';

// Transport state
export interface TransportState {
  playing: boolean;
  recording: boolean;
  bpm: number;
  timeSignature: [number, number];
  position: number;        // In beats
  loop: boolean;
  loopStart: number;
  loopEnd: number;
}

// Level/meter data
export interface MeterData {
  peak: number;            // 0-1
  rms: number;             // 0-1
  clip: boolean;
}

// Preset
export interface Preset {
  id: string;
  name: string;
  category?: string;
  author?: string;
  data: Record<string, unknown>;
}

// Plugin types
export type PluginType = 'instrument' | 'audio-effect' | 'midi-effect';

// Common component props
export interface BaseControlProps {
  disabled?: boolean;
  className?: string;
  'aria-label'?: string;
}
