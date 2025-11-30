import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { DrumPad, DrumPadGrid } from './DrumPad';
import { DrumPadSequencer, DrumTrack } from './DrumPadSequencer';
import { colors } from '../../theme/tokens';

const meta: Meta<typeof DrumPad> = {
  title: 'Drum Machine/DrumPad',
  component: DrumPad,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    id: 'kick',
    label: 'KICK',
    color: colors.accent.coral,
    size: 80,
  },
};

export const WithMidiNote: Story = {
  args: {
    id: 'snare',
    label: 'SNARE',
    color: colors.accent.orange,
    size: 80,
    midiNote: 38,
    keyboardShortcut: 'S',
  },
};

export const LargePad: Story = {
  args: {
    id: 'sample',
    label: 'SAMPLE',
    color: colors.accent.cyan,
    size: 120,
  },
};

export const MutedPad: Story = {
  args: {
    id: 'muted',
    label: 'MUTE',
    color: colors.accent.purple,
    size: 80,
    muted: true,
  },
};

// DrumPadGrid stories
const _gridMeta: Meta<typeof DrumPadGrid> = {
  title: 'Drum Machine/DrumPadGrid',
  component: DrumPadGrid,
  parameters: {
    layout: 'centered',
  },
};
void _gridMeta; // Prevent unused warning

export const Grid4x4: StoryObj<typeof DrumPadGrid> = {
  render: () => {
    const pads = [
      { id: 'pad1', label: 'KICK', color: colors.accent.coral, midiNote: 36 },
      { id: 'pad2', label: 'SNARE', color: colors.accent.orange, midiNote: 38 },
      { id: 'pad3', label: 'CLAP', color: colors.accent.yellow, midiNote: 39 },
      { id: 'pad4', label: 'HAT', color: colors.accent.green, midiNote: 42 },
      { id: 'pad5', label: 'TOM1', color: colors.accent.cyan, midiNote: 45 },
      { id: 'pad6', label: 'TOM2', color: colors.accent.purple, midiNote: 47 },
      { id: 'pad7', label: 'RIDE', color: colors.accent.pink, midiNote: 51 },
      { id: 'pad8', label: 'CRASH', color: colors.accent.coral, midiNote: 49 },
      { id: 'pad9', label: 'PERC1', color: colors.accent.orange, midiNote: 60 },
      { id: 'pad10', label: 'PERC2', color: colors.accent.yellow, midiNote: 61 },
      { id: 'pad11', label: 'FX1', color: colors.accent.green, midiNote: 62 },
      { id: 'pad12', label: 'FX2', color: colors.accent.cyan, midiNote: 63 },
      { id: 'pad13', label: 'BASS', color: colors.accent.purple, midiNote: 64 },
      { id: 'pad14', label: 'LEAD', color: colors.accent.pink, midiNote: 65 },
      { id: 'pad15', label: 'PAD', color: colors.accent.coral, midiNote: 66 },
      { id: 'pad16', label: 'VOX', color: colors.accent.orange, midiNote: 67 },
    ];

    return (
      <DrumPadGrid
        pads={pads}
        columns={4}
        padSize={80}
        label="DRUM PADS"
        onTrigger={(id, vel) => console.log(`Triggered ${id} with velocity ${vel}`)}
      />
    );
  },
};

export const Grid2x4: StoryObj<typeof DrumPadGrid> = {
  render: () => {
    const pads = [
      { id: 'kick', label: 'KICK', color: colors.accent.coral },
      { id: 'snare', label: 'SNARE', color: colors.accent.orange },
      { id: 'hat', label: 'HAT', color: colors.accent.yellow },
      { id: 'clap', label: 'CLAP', color: colors.accent.green },
      { id: 'tom', label: 'TOM', color: colors.accent.cyan },
      { id: 'perc', label: 'PERC', color: colors.accent.purple },
      { id: 'fx', label: 'FX', color: colors.accent.pink },
      { id: 'fill', label: 'FILL', color: colors.accent.coral },
    ];

    return (
      <DrumPadGrid
        pads={pads}
        columns={4}
        padSize={70}
        gap={6}
        label="QUICK PADS"
      />
    );
  },
};

// DrumPadSequencer stories
const _sequencerMeta: Meta<typeof DrumPadSequencer> = {
  title: 'Drum Machine/DrumPadSequencer',
  component: DrumPadSequencer,
};
void _sequencerMeta; // Prevent unused warning

export const Sequencer16Step: StoryObj<typeof DrumPadSequencer> = {
  render: () => {
    const [tracks, setTracks] = useState<DrumTrack[]>([
      {
        id: 'kick',
        name: 'Kick',
        color: colors.accent.coral,
        steps: Array(16).fill(null).map((_, i) => ({
          active: i % 4 === 0,
          velocity: 0.9,
          probability: 1,
          accent: i === 0,
        })),
      },
      {
        id: 'snare',
        name: 'Snare',
        color: colors.accent.orange,
        steps: Array(16).fill(null).map((_, i) => ({
          active: i === 4 || i === 12,
          velocity: 0.85,
          probability: 1,
          accent: false,
        })),
      },
      {
        id: 'hihat',
        name: 'HiHat',
        color: colors.accent.yellow,
        steps: Array(16).fill(null).map((_, i) => ({
          active: i % 2 === 0,
          velocity: i % 4 === 0 ? 0.8 : 0.5,
          probability: 1,
          accent: false,
        })),
      },
      {
        id: 'clap',
        name: 'Clap',
        color: colors.accent.cyan,
        steps: Array(16).fill(null).map(() => ({
          active: false,
          velocity: 0.7,
          probability: 1,
          accent: false,
        })),
      },
    ]);

    const [currentStep, setCurrentStep] = useState(-1);
    const [isPlaying, setIsPlaying] = useState(false);

    const handleStepToggle = (trackId: string, stepIndex: number, active: boolean) => {
      setTracks(prev => prev.map(track =>
        track.id === trackId
          ? {
              ...track,
              steps: track.steps.map((step, i) =>
                i === stepIndex ? { ...step, active } : step
              ),
            }
          : track
      ));
    };

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <DrumPadSequencer
          tracks={tracks}
          stepsPerTrack={16}
          currentStep={currentStep}
          onStepToggle={handleStepToggle}
          onPadTrigger={(id, vel) => console.log(`Triggered ${id} at ${vel}`)}
          label="DRUM PATTERN"
          bpm={120}
          layout="4x4"
          stepSize={60}
          showMuteSolo={false}
        />
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={() => {
              if (!isPlaying) {
                setIsPlaying(true);
                let step = 0;
                const interval = setInterval(() => {
                  setCurrentStep(step);
                  step = (step + 1) % 16;
                }, 125); // 120 BPM = 500ms per beat = 125ms per 1/16
                (window as any).__drumInterval = interval;
              } else {
                setIsPlaying(false);
                setCurrentStep(-1);
                clearInterval((window as any).__drumInterval);
              }
            }}
            style={{
              padding: '8px 16px',
              background: isPlaying ? colors.accent.coral : colors.accent.green,
              color: colors.bg.base,
              border: 'none',
              borderRadius: 4,
              cursor: 'pointer',
            }}
          >
            {isPlaying ? 'STOP' : 'PLAY'}
          </button>
        </div>
      </div>
    );
  },
};

export const Sequencer8Track: StoryObj<typeof DrumPadSequencer> = {
  render: () => {
    const tracks: DrumTrack[] = [
      { id: 'kick', name: 'Kick', steps: Array(16).fill({ active: false, velocity: 0.8, probability: 1, accent: false }) },
      { id: 'snare', name: 'Snare', steps: Array(16).fill({ active: false, velocity: 0.8, probability: 1, accent: false }) },
      { id: 'hat-c', name: 'HH-C', steps: Array(16).fill({ active: false, velocity: 0.8, probability: 1, accent: false }) },
      { id: 'hat-o', name: 'HH-O', steps: Array(16).fill({ active: false, velocity: 0.8, probability: 1, accent: false }) },
      { id: 'tom-h', name: 'Tom-H', steps: Array(16).fill({ active: false, velocity: 0.8, probability: 1, accent: false }) },
      { id: 'tom-l', name: 'Tom-L', steps: Array(16).fill({ active: false, velocity: 0.8, probability: 1, accent: false }) },
      { id: 'clap', name: 'Clap', steps: Array(16).fill({ active: false, velocity: 0.8, probability: 1, accent: false }) },
      { id: 'perc', name: 'Perc', steps: Array(16).fill({ active: false, velocity: 0.8, probability: 1, accent: false }) },
    ];

    return (
      <DrumPadSequencer
        tracks={tracks}
        stepsPerTrack={16}
        label="TR-808 STYLE"
        bpm={110}
        stepSize={28}
      />
    );
  },
};
