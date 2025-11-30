import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { WaveformSelector, WaveformType } from './WaveformSelector';
import { WavetableView } from './WavetableView';
import { colors } from '../../theme/tokens';

const meta: Meta<typeof WaveformSelector> = {
  title: 'Oscillator/WaveformSelector',
  component: WaveformSelector,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    value: 'sine',
    label: 'WAVEFORM',
    waveforms: ['sine', 'saw', 'square', 'triangle'],
  },
};

export const WithAllWaveforms: Story = {
  args: {
    value: 'saw',
    label: 'OSC 1',
    waveforms: ['sine', 'saw', 'square', 'triangle', 'pulse', 'noise'],
    showPulseWidth: true,
    pulseWidth: 0.5,
  },
};

export const PulseWithWidth: Story = {
  render: () => {
    const [waveform, setWaveform] = useState<WaveformType>('pulse');
    const [pulseWidth, setPulseWidth] = useState(0.5);

    return (
      <WaveformSelector
        value={waveform}
        onChange={setWaveform}
        pulseWidth={pulseWidth}
        onPulseWidthChange={setPulseWidth}
        label="PULSE OSC"
        waveforms={['sine', 'saw', 'square', 'pulse', 'triangle']}
        showPulseWidth={true}
      />
    );
  },
};

export const Compact: Story = {
  args: {
    value: 'sine',
    label: 'OSC',
    waveforms: ['sine', 'saw', 'square', 'triangle'],
    compact: true,
    displaySize: { width: 80, height: 40 },
    showLabels: false,
  },
};

export const LargeDisplay: Story = {
  args: {
    value: 'saw',
    label: 'OSCILLATOR',
    waveforms: ['sine', 'saw', 'square', 'triangle'],
    displaySize: { width: 200, height: 100 },
  },
};

// Wavetable View stories
const _wavetableMeta: Meta<typeof WavetableView> = {
  title: 'Oscillator/WavetableView',
  component: WavetableView,
};
void _wavetableMeta; // Exported stories use this component directly

export const WavetableDefault: StoryObj<typeof WavetableView> = {
  render: () => {
    const [position, setPosition] = useState(0.5);

    return (
      <WavetableView
        position={position}
        onPositionChange={setPosition}
        label="WAVETABLE"
        width={240}
        height={150}
      />
    );
  },
};

export const WavetableLarge: StoryObj<typeof WavetableView> = {
  render: () => {
    const [position, setPosition] = useState(0);

    return (
      <WavetableView
        position={position}
        onPositionChange={setPosition}
        label="SPECTRAL"
        width={300}
        height={180}
        color={colors.accent.purple}
        visibleFrames={12}
        depthEffect={0.7}
      />
    );
  },
};

export const WavetableCompact: StoryObj<typeof WavetableView> = {
  render: () => {
    const [position, setPosition] = useState(0.3);

    return (
      <WavetableView
        position={position}
        onPositionChange={setPosition}
        label="WT"
        width={160}
        height={100}
        color={colors.accent.orange}
        visibleFrames={6}
        depthEffect={0.4}
      />
    );
  },
};

export const WavetableNonInteractive: StoryObj<typeof WavetableView> = {
  args: {
    position: 0.75,
    label: 'DISPLAY ONLY',
    width: 200,
    height: 120,
    interactive: false,
    showPosition: true,
  },
};

// Combined oscillator story
export const FullOscillator: StoryObj = {
  render: () => {
    const [waveform, setWaveform] = useState<WaveformType>('wavetable');
    const [pulseWidth, setPulseWidth] = useState(0.5);
    const [wtPosition, setWtPosition] = useState(0.25);

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <WaveformSelector
          value={waveform}
          onChange={setWaveform}
          pulseWidth={pulseWidth}
          onPulseWidthChange={setPulseWidth}
          wavetablePosition={wtPosition}
          onWavetablePositionChange={setWtPosition}
          label="OSCILLATOR 1"
          waveforms={['sine', 'saw', 'square', 'triangle', 'pulse', 'wavetable']}
          showPulseWidth={true}
        />

        {waveform === 'wavetable' && (
          <WavetableView
            position={wtPosition}
            onPositionChange={setWtPosition}
            label="WAVETABLE POSITION"
            width={200}
            height={120}
            color={colors.accent.green}
          />
        )}
      </div>
    );
  },
};
