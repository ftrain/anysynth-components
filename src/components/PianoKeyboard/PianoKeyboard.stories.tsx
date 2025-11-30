import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { PianoKeyboard } from './PianoKeyboard';
import { colors } from '../../theme/tokens';

const meta: Meta<typeof PianoKeyboard> = {
  title: 'Input/PianoKeyboard',
  component: PianoKeyboard,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof PianoKeyboard>;

export const Default: Story = {
  render: () => {
    const [activeNotes, setActiveNotes] = useState<number[]>([]);
    return (
      <PianoKeyboard
        startOctave={3}
        octaves={2}
        activeNotes={activeNotes}
        onNoteOn={(note) => setActiveNotes((prev) => [...prev, note])}
        onNoteOff={(note) => setActiveNotes((prev) => prev.filter((n) => n !== note))}
      />
    );
  },
};

export const ThreeOctaves: Story = {
  render: () => {
    const [activeNotes, setActiveNotes] = useState<number[]>([]);
    return (
      <PianoKeyboard
        startOctave={2}
        octaves={3}
        activeNotes={activeNotes}
        onNoteOn={(note) => setActiveNotes((prev) => [...prev, note])}
        onNoteOff={(note) => setActiveNotes((prev) => prev.filter((n) => n !== note))}
        height={140}
        showNoteNames
      />
    );
  },
};

export const WithScale: Story = {
  render: () => {
    const [activeNotes, setActiveNotes] = useState<number[]>([]);
    // C major scale
    const cMajorScale = [0, 2, 4, 5, 7, 9, 11];
    return (
      <PianoKeyboard
        startOctave={3}
        octaves={2}
        activeNotes={activeNotes}
        highlightedNotes={cMajorScale}
        highlightColor={colors.accent.green}
        onNoteOn={(note) => setActiveNotes((prev) => [...prev, note])}
        onNoteOff={(note) => setActiveNotes((prev) => prev.filter((n) => n !== note))}
        label="C MAJOR"
      />
    );
  },
};

export const WithChord: Story = {
  render: () => {
    // C major chord (C3, E3, G3)
    const [activeNotes, setActiveNotes] = useState<number[]>([36, 40, 43]);
    return (
      <PianoKeyboard
        startOctave={3}
        octaves={2}
        activeNotes={activeNotes}
        onNoteOn={(note) => setActiveNotes((prev) => [...prev, note])}
        onNoteOff={(note) => setActiveNotes((prev) => prev.filter((n) => n !== note))}
        label="C MAJ"
      />
    );
  },
};

export const Compact: Story = {
  render: () => {
    const [activeNotes, setActiveNotes] = useState<number[]>([]);
    return (
      <PianoKeyboard
        startOctave={4}
        octaves={1}
        activeNotes={activeNotes}
        onNoteOn={(note) => setActiveNotes((prev) => [...prev, note])}
        onNoteOff={(note) => setActiveNotes((prev) => prev.filter((n) => n !== note))}
        height={80}
      />
    );
  },
};
