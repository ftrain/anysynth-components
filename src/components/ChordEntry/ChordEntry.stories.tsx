import type { Meta, StoryObj } from '@storybook/react';
import { ChordEntry, ChordValue } from './ChordEntry';

const meta: Meta<typeof ChordEntry> = {
  title: 'Musical Input/ChordEntry',
  component: ChordEntry,
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
    value: { root: 0, type: 'major', octave: 4 },
    onChange: (chord: ChordValue) => console.log('Chord changed:', chord),
    onTrigger: (notes: number[]) => console.log('Play notes:', notes),
  },
};

export const MinorChord: Story = {
  args: {
    label: 'CHORD',
    value: { root: 9, type: 'minor', octave: 4 }, // A minor
    onChange: (chord: ChordValue) => console.log('Chord changed:', chord),
  },
};

export const SeventhChord: Story = {
  args: {
    label: 'CHORD',
    value: { root: 7, type: 'dom7', octave: 3 }, // G7
    showAdvanced: true,
    onChange: (chord: ChordValue) => console.log('Chord changed:', chord),
  },
};

export const WithFlats: Story = {
  args: {
    label: 'CHORD',
    value: { root: 3, type: 'minor', octave: 4 }, // Eb minor
    useFlats: true,
    onChange: (chord: ChordValue) => console.log('Chord changed:', chord),
  },
};

export const Compact: Story = {
  args: {
    label: 'CHORD',
    value: { root: 0, type: 'maj7', octave: 4 },
    compact: true,
    showAdvanced: false,
    onChange: (chord: ChordValue) => console.log('Chord changed:', chord),
  },
};

export const FullFeatured: Story = {
  args: {
    label: 'CHORD BUILDER',
    value: { root: 5, type: 'maj9', octave: 3, inversion: 1 }, // F maj9 first inversion
    showAdvanced: true,
    octaveRange: [2, 6],
    onChange: (chord: ChordValue) => console.log('Chord changed:', chord),
    onTrigger: (notes: number[]) => console.log('Preview notes:', notes),
  },
};
