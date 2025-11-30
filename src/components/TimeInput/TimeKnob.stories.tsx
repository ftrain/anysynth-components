import type { Meta, StoryObj } from '@storybook/react';
import { TimeKnob, TimeKnobValue } from './TimeKnob';

const meta: Meta<typeof TimeKnob> = {
  title: 'Musical Input/TimeKnob',
  component: TimeKnob,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: 'DELAY',
    bpm: 120,
    onChange: (value: TimeKnobValue) => console.log('Time changed:', value),
  },
};

export const SyncMode: Story = {
  args: {
    label: 'RATE',
    value: { mode: 'sync', numerator: 1, denominator: 8, modifier: 'straight' },
    bpm: 140,
    onChange: (value: TimeKnobValue) => console.log('Time changed:', value),
  },
};

export const DottedNote: Story = {
  args: {
    label: 'DELAY',
    value: { mode: 'sync', numerator: 1, denominator: 4, modifier: 'dotted' },
    bpm: 120,
    onChange: (value: TimeKnobValue) => console.log('Time changed:', value),
  },
};

export const TripletNote: Story = {
  args: {
    label: 'SWING',
    value: { mode: 'sync', numerator: 1, denominator: 8, modifier: 'triplet' },
    bpm: 120,
    color: 'purple',
    onChange: (value: TimeKnobValue) => console.log('Time changed:', value),
  },
};

export const FreeMode: Story = {
  args: {
    label: 'DELAY',
    value: { mode: 'free', ms: 350 },
    bpm: 120,
    onChange: (value: TimeKnobValue) => console.log('Time changed:', value),
  },
};

export const LFORate: Story = {
  args: {
    label: 'LFO RATE',
    bpm: 120,
    minMs: 10,
    maxMs: 5000,
    color: 'purple',
    onChange: (value: TimeKnobValue) => console.log('Rate changed:', value),
  },
};

export const EnvelopeTime: Story = {
  args: {
    label: 'ATTACK',
    value: { mode: 'free', ms: 25 },
    bpm: 120,
    minMs: 1,
    maxMs: 2000,
    color: 'coral',
    onChange: (value: TimeKnobValue) => console.log('Attack changed:', value),
  },
};

export const LargeSize: Story = {
  args: {
    label: 'TIME',
    bpm: 120,
    size: 220,
    onChange: (value: TimeKnobValue) => console.log('Time changed:', value),
  },
};

export const CompactSize: Story = {
  args: {
    label: 'TIME',
    bpm: 120,
    size: 140,
    compact: true,
    onChange: (value: TimeKnobValue) => console.log('Time changed:', value),
  },
};
