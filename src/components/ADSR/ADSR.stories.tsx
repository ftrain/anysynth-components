import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { ADSR } from './ADSR';
import type { EnvelopeParams } from '../../types';
import { colors } from '../../theme/tokens';

const meta: Meta<typeof ADSR> = {
  title: 'Modules/ADSR',
  component: ADSR,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof ADSR>;

export const Default: Story = {
  render: () => {
    const [value, setValue] = useState<EnvelopeParams>({
      attack: 10,
      decay: 200,
      sustain: 0.7,
      release: 300,
    });
    return <ADSR value={value} onChange={setValue} label="AMP" />;
  },
};

export const FilterEnvelope: Story = {
  render: () => {
    const [value, setValue] = useState<EnvelopeParams>({
      attack: 50,
      decay: 400,
      sustain: 0.3,
      release: 800,
    });
    return <ADSR value={value} onChange={setValue} label="FILTER" color={colors.accent.orange} />;
  },
};

export const SlowAttack: Story = {
  render: () => {
    const [value, setValue] = useState<EnvelopeParams>({
      attack: 1500,
      decay: 500,
      sustain: 0.8,
      release: 1000,
    });
    return <ADSR value={value} onChange={setValue} label="PAD" color={colors.accent.purple} maxAttack={4000} />;
  },
};

export const Plucky: Story = {
  render: () => {
    const [value, setValue] = useState<EnvelopeParams>({
      attack: 0,
      decay: 100,
      sustain: 0,
      release: 50,
    });
    return <ADSR value={value} onChange={setValue} label="PLUCK" color={colors.accent.cyan} />;
  },
};

export const Compact: Story = {
  render: () => {
    const [value, setValue] = useState<EnvelopeParams>({
      attack: 10,
      decay: 200,
      sustain: 0.7,
      release: 300,
    });
    return <ADSR value={value} onChange={setValue} label="ENV" height={80} showValues={false} />;
  },
};
