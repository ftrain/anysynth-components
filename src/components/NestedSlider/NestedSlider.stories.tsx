import type { Meta, StoryObj } from '@storybook/react';
import { NestedSliderHorizontal } from './NestedSliderHorizontal';
import { NestedSliderVertical } from './NestedSliderVertical';
import { NestedSliderCircular } from './NestedSliderCircular';
import { NestedSliderGrid } from './NestedSliderGrid';
import type { Parameter, ParameterWithOptions } from '../../types';

// Sample parameter sets for different use cases
const oscillatorParams: (Parameter | ParameterWithOptions)[] = [
  { id: 'level', name: 'LEVEL', color: 'coral', value: 0.7, defaultValue: 0.7, min: 0, max: 100, unit: '%' },
  { id: 'pitch', name: 'PITCH', color: 'green', value: 0.5, defaultValue: 0.5, min: -24, max: 24, unit: 'st', bipolar: true },
  { id: 'fine', name: 'FINE', color: 'cyan', value: 0.5, defaultValue: 0.5, min: -100, max: 100, unit: 'ct', bipolar: true },
  {
    id: 'wave',
    name: 'WAVE',
    color: 'yellow',
    value: 0.6,
    defaultValue: 0.5,
    options: ['Saw', 'Square', 'Tri', 'Sine'],
    selectedOption: 'Saw',
  } as ParameterWithOptions,
];

const filterParams: Parameter[] = [
  { id: 'cutoff', name: 'CUTOFF', color: 'orange', value: 0.6, defaultValue: 0.5, min: 20, max: 20000, unit: 'Hz' },
  { id: 'res', name: 'RES', color: 'coral', value: 0.3, defaultValue: 0.0, min: 0, max: 100, unit: '%' },
  { id: 'env', name: 'ENV', color: 'pink', value: 0.5, defaultValue: 0.5, min: -100, max: 100, bipolar: true },
  { id: 'key', name: 'KEY', color: 'purple', value: 0.0, defaultValue: 0.0, min: 0, max: 100, unit: '%' },
];

const lfoParams: (Parameter | ParameterWithOptions)[] = [
  { id: 'rate', name: 'RATE', color: 'yellow', value: 0.4, defaultValue: 0.3, min: 0.01, max: 20, unit: 'Hz' },
  { id: 'depth', name: 'DEPTH', color: 'cyan', value: 0.5, defaultValue: 0.5, min: 0, max: 100, unit: '%' },
  { id: 'delay', name: 'DELAY', color: 'teal', value: 0.0, defaultValue: 0.0, min: 0, max: 2000, unit: 'ms' },
  {
    id: 'shape',
    name: 'SHAPE',
    color: 'purple',
    value: 0.5,
    defaultValue: 0.5,
    options: ['Sine', 'Tri', 'Saw', 'Square', 'S&H'],
    selectedOption: 'Sine',
  } as ParameterWithOptions,
];

const macroParams: Parameter[] = [
  { id: 'macro1', name: 'M1', color: 'coral', value: 0.0, defaultValue: 0.0 },
  { id: 'macro2', name: 'M2', color: 'orange', value: 0.0, defaultValue: 0.0 },
  { id: 'macro3', name: 'M3', color: 'yellow', value: 0.0, defaultValue: 0.0 },
  { id: 'macro4', name: 'M4', color: 'green', value: 0.0, defaultValue: 0.0 },
  { id: 'macro5', name: 'M5', color: 'cyan', value: 0.0, defaultValue: 0.0 },
  { id: 'macro6', name: 'M6', color: 'teal', value: 0.0, defaultValue: 0.0 },
  { id: 'macro7', name: 'M7', color: 'purple', value: 0.0, defaultValue: 0.0 },
  { id: 'macro8', name: 'M8', color: 'pink', value: 0.0, defaultValue: 0.0 },
];

// === HORIZONTAL STORIES ===
const metaHorizontal: Meta<typeof NestedSliderHorizontal> = {
  title: 'Controls/NestedSlider/Horizontal',
  component: NestedSliderHorizontal,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default metaHorizontal;
type StoryHorizontal = StoryObj<typeof NestedSliderHorizontal>;

export const Oscillator: StoryHorizontal = {
  args: {
    parameters: oscillatorParams,
    label: 'OSC 1',
    showValues: true,
    trackHeight: 8,
    gap: 3,
  },
};

export const Filter: StoryHorizontal = {
  args: {
    parameters: filterParams,
    label: 'FILTER',
    trackHeight: 10,
  },
};

export const LFO: StoryHorizontal = {
  args: {
    parameters: lfoParams,
    label: 'LFO 1',
  },
};

export const Compact: StoryHorizontal = {
  args: {
    parameters: filterParams.slice(0, 2),
    label: 'MINI',
    trackHeight: 6,
    gap: 2,
    showValues: false,
  },
};

// === VERTICAL STORIES ===
export const VerticalMixer: StoryObj<typeof NestedSliderVertical> = {
  render: () => (
    <NestedSliderVertical
      parameters={[
        { id: 'osc1', name: 'OSC1', color: 'coral', value: 0.8, defaultValue: 0.7 },
        { id: 'osc2', name: 'OSC2', color: 'orange', value: 0.6, defaultValue: 0.7 },
        { id: 'sub', name: 'SUB', color: 'yellow', value: 0.4, defaultValue: 0.5 },
        { id: 'noise', name: 'NOISE', color: 'cyan', value: 0.1, defaultValue: 0.0 },
      ]}
      label="MIXER"
      height={180}
    />
  ),
};

export const VerticalADSR: StoryObj<typeof NestedSliderVertical> = {
  render: () => (
    <NestedSliderVertical
      parameters={[
        { id: 'attack', name: 'A', color: 'green', value: 0.1, defaultValue: 0.1, min: 0, max: 2000, unit: 'ms' },
        { id: 'decay', name: 'D', color: 'yellow', value: 0.3, defaultValue: 0.3, min: 0, max: 2000, unit: 'ms' },
        { id: 'sustain', name: 'S', color: 'orange', value: 0.7, defaultValue: 0.7, min: 0, max: 100, unit: '%' },
        { id: 'release', name: 'R', color: 'coral', value: 0.4, defaultValue: 0.5, min: 0, max: 4000, unit: 'ms' },
      ]}
      label="AMP ENV"
      height={140}
      trackWidth={8}
    />
  ),
};

// === CIRCULAR STORIES ===
export const CircularOscillator: StoryObj<typeof NestedSliderCircular> = {
  render: () => (
    <NestedSliderCircular
      parameters={oscillatorParams}
      label="OSC 1"
      size={240}
    />
  ),
};

export const CircularLFO: StoryObj<typeof NestedSliderCircular> = {
  render: () => (
    <NestedSliderCircular
      parameters={lfoParams}
      label="LFO"
      size={200}
    />
  ),
};

export const CircularCompact: StoryObj<typeof NestedSliderCircular> = {
  render: () => (
    <NestedSliderCircular
      parameters={filterParams.slice(0, 2)}
      label="FILTER"
      size={120}
    />
  ),
};

// === GRID STORIES ===
export const GridMacros: StoryObj<typeof NestedSliderGrid> = {
  render: () => (
    <NestedSliderGrid
      parameters={macroParams}
      label="MACROS"
      columns={4}
      cellSize={64}
    />
  ),
};

export const GridModMatrix: StoryObj<typeof NestedSliderGrid> = {
  render: () => (
    <NestedSliderGrid
      parameters={[
        { id: 'm1', name: 'LFO>CUT', color: 'yellow', value: 0.5, defaultValue: 0.5, bipolar: true },
        { id: 'm2', name: 'ENV>CUT', color: 'pink', value: 0.3, defaultValue: 0.5, bipolar: true },
        { id: 'm3', name: 'VEL>CUT', color: 'cyan', value: 0.6, defaultValue: 0.5, bipolar: true },
        { id: 'm4', name: 'LFO>PIT', color: 'yellow', value: 0.5, defaultValue: 0.5, bipolar: true },
        { id: 'm5', name: 'ENV>PIT', color: 'pink', value: 0.5, defaultValue: 0.5, bipolar: true },
        { id: 'm6', name: 'VEL>AMP', color: 'cyan', value: 0.8, defaultValue: 0.5, bipolar: true },
      ]}
      label="MOD MATRIX"
      columns={3}
      cellSize={56}
      bipolarVisualization={true}
    />
  ),
};

export const GridCompact: StoryObj<typeof NestedSliderGrid> = {
  render: () => (
    <NestedSliderGrid
      parameters={filterParams}
      label="FILTER"
      columns={2}
      cellSize={48}
      showLabels={false}
    />
  ),
};

// === COMPARISON STORY ===
export const AllVariations: StoryObj = {
  render: () => (
    <div style={{
      display: 'flex',
      flexWrap: 'wrap',
      gap: 32,
      padding: 32,
      alignItems: 'flex-start',
      justifyContent: 'center',
    }}>
      <div>
        <h3 style={{ color: '#666', marginBottom: 16, fontFamily: 'monospace', fontSize: 12 }}>HORIZONTAL</h3>
        <NestedSliderHorizontal parameters={oscillatorParams} label="OSC 1" />
      </div>

      <div>
        <h3 style={{ color: '#666', marginBottom: 16, fontFamily: 'monospace', fontSize: 12 }}>VERTICAL</h3>
        <NestedSliderVertical
          parameters={[
            { id: 'a', name: 'A', color: 'green', value: 0.1, defaultValue: 0.1 },
            { id: 'd', name: 'D', color: 'yellow', value: 0.3, defaultValue: 0.3 },
            { id: 's', name: 'S', color: 'orange', value: 0.7, defaultValue: 0.7 },
            { id: 'r', name: 'R', color: 'coral', value: 0.4, defaultValue: 0.5 },
          ]}
          label="ADSR"
          height={160}
        />
      </div>

      <div>
        <h3 style={{ color: '#666', marginBottom: 16, fontFamily: 'monospace', fontSize: 12 }}>CIRCULAR</h3>
        <NestedSliderCircular parameters={lfoParams} label="LFO" size={200} />
      </div>

      <div>
        <h3 style={{ color: '#666', marginBottom: 16, fontFamily: 'monospace', fontSize: 12 }}>GRID</h3>
        <NestedSliderGrid parameters={macroParams} label="MACROS" columns={4} cellSize={48} />
      </div>
    </div>
  ),
  parameters: {
    layout: 'fullscreen',
  },
};
