import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { LFO } from './LFO';
import type { LFOParams } from '../../types';
import { colors } from '../../theme/tokens';

const meta: Meta<typeof LFO> = {
  title: 'Modules/LFO',
  component: LFO,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof LFO>;

export const Default: Story = {
  render: () => {
    const [value, setValue] = useState<LFOParams>({
      rate: 2,
      depth: 0.5,
      shape: 'sine',
      phase: 0,
      delay: 0,
    });
    return <LFO value={value} onChange={setValue} label="LFO 1" />;
  },
};

export const SlowModulation: Story = {
  render: () => {
    const [value, setValue] = useState<LFOParams>({
      rate: 0.1,
      depth: 0.8,
      shape: 'triangle',
      phase: 0,
      delay: 2000,
    });
    return <LFO value={value} onChange={setValue} label="SLOW LFO" minRate={0.01} maxRate={1} showDelay />;
  },
};

export const VerySlowLFO: Story = {
  render: () => {
    const [value, setValue] = useState<LFOParams>({
      rate: 0.001, // ~16 minute cycle
      depth: 1.0,
      shape: 'sine',
      phase: 0,
      delay: 5000,
    });
    return (
      <LFO
        value={value}
        onChange={setValue}
        label="EVOLVE"
        minRate={0.0001}
        maxRate={0.1}
        showDelay
        color={colors.accent.purple}
      />
    );
  },
};

export const FastVibrato: Story = {
  render: () => {
    const [value, setValue] = useState<LFOParams>({
      rate: 6,
      depth: 0.3,
      shape: 'sine',
      phase: 0,
      delay: 500,
    });
    return <LFO value={value} onChange={setValue} label="VIBRATO" color={colors.accent.green} />;
  },
};

export const SampleAndHold: Story = {
  render: () => {
    const [value, setValue] = useState<LFOParams>({
      rate: 4,
      depth: 0.7,
      shape: 'noise',
      phase: 0,
      delay: 0,
    });
    return <LFO value={value} onChange={setValue} label="S&H" color={colors.accent.cyan} />;
  },
};
