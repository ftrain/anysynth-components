import type { Meta, StoryObj } from '@storybook/react';
import { ChordKnob, ChordKnobValue } from './ChordKnob';

const meta: Meta<typeof ChordKnob> = {
  title: 'Musical Input/ChordKnob',
  component: ChordKnob,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: 'CHORD',
    value: { octave: 4, rootNote: 0, basicType: 'maj', suspended: '', extended: '', inversion: 0 },
    onChange: (chord: ChordKnobValue) => console.log('Chord changed:', chord),
    onChordTrigger: (notes: number[]) => console.log('Play notes:', notes),
  },
};

export const MinorChord: Story = {
  args: {
    label: 'CHORD',
    value: { octave: 4, rootNote: 9, basicType: 'min', suspended: '', extended: '', inversion: 0 },
    onChange: (chord: ChordKnobValue) => console.log('Chord changed:', chord),
  },
};

export const SeventhChord: Story = {
  args: {
    label: 'CHORD',
    value: { octave: 3, rootNote: 7, basicType: 'maj', suspended: '', extended: '7', inversion: 0 },
    onChange: (chord: ChordKnobValue) => console.log('Chord changed:', chord),
  },
};

export const Suspended: Story = {
  args: {
    label: 'CHORD',
    value: { octave: 4, rootNote: 0, basicType: 'maj', suspended: 'sus4', extended: '', inversion: 0 },
    onChange: (chord: ChordKnobValue) => console.log('Chord changed:', chord),
  },
};

export const ExtendedChord: Story = {
  args: {
    label: 'CHORD',
    value: { octave: 3, rootNote: 5, basicType: 'maj', suspended: '', extended: '9', inversion: 1 },
    onChange: (chord: ChordKnobValue) => console.log('Chord changed:', chord),
  },
};

export const LargeSize: Story = {
  args: {
    label: 'CHORD',
    value: { octave: 4, rootNote: 0, basicType: 'maj', suspended: '', extended: '', inversion: 0 },
    size: 280,
    onChange: (chord: ChordKnobValue) => console.log('Chord changed:', chord),
  },
};
