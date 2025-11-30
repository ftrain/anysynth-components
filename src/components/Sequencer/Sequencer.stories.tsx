import type { Meta, StoryObj } from '@storybook/react';
import { useState, useEffect } from 'react';
import { Sequencer } from './Sequencer';

const meta: Meta<typeof Sequencer> = {
  title: 'Modules/Sequencer',
  component: Sequencer,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Sequencer>;

export const Default: Story = {
  args: {
    label: 'SEQ 1',
  },
};

export const Compact: Story = {
  args: {
    label: 'MINI',
    compact: true,
  },
};

// Interactive demo with playback
export const WithPlayback: Story = {
  render: () => {
    const [playing, setPlaying] = useState(false);
    const [currentStep, setCurrentStep] = useState<number | null>(null);
    const [bpm, setBpm] = useState(120);

    useEffect(() => {
      if (!playing) {
        setCurrentStep(null);
        return;
      }

      const intervalMs = (60 / bpm / 4) * 1000; // 16th notes
      let step = 0;

      const interval = setInterval(() => {
        setCurrentStep(step);
        step = (step + 1) % 16;
      }, intervalMs);

      return () => clearInterval(interval);
    }, [playing, bpm]);

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'center' }}>
        <Sequencer
          label="SEQUENCE"
          playingStep={currentStep}
        />

        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <button
            onClick={() => setPlaying(!playing)}
            style={{
              padding: '8px 24px',
              background: playing ? '#ff6b6b' : '#1dd1a1',
              color: '#0a0a0a',
              border: 'none',
              borderRadius: 4,
              fontFamily: 'monospace',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            {playing ? 'STOP' : 'PLAY'}
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontFamily: 'monospace', color: '#666', fontSize: 12 }}>BPM</span>
            <input
              type="range"
              min={60}
              max={200}
              value={bpm}
              onChange={(e) => setBpm(parseInt(e.target.value))}
              style={{ width: 100 }}
            />
            <span style={{ fontFamily: 'system-ui', color: '#fff', fontSize: 14 }}>{bpm}</span>
          </div>
        </div>
      </div>
    );
  },
};

// Pre-filled pattern
export const WithPattern: Story = {
  args: {
    label: 'BASS',
    initialPattern: [
      { type: 'note', note: 36, velocity: 1.0 },    // C2
      { type: 'rest', note: null, velocity: 0.8 },
      { type: 'rest', note: null, velocity: 0.8 },
      { type: 'note', note: 36, velocity: 0.6 },    // C2
      { type: 'note', note: 38, velocity: 0.9 },    // D2
      { type: 'rest', note: null, velocity: 0.8 },
      { type: 'note', note: 41, velocity: 0.8 },    // F2
      { type: 'rest', note: null, velocity: 0.8 },
      { type: 'note', note: 36, velocity: 1.0 },    // C2
      { type: 'rest', note: null, velocity: 0.8 },
      { type: 'note', note: 43, velocity: 0.7 },    // G2
      { type: 'rest', note: null, velocity: 0.8 },
      { type: 'note', note: 41, velocity: 0.9 },    // F2
      { type: 'rest', note: null, velocity: 0.8 },
      { type: 'note', note: 38, velocity: 0.8 },    // D2
      { type: 'note', note: 36, velocity: 0.6 },    // C2
    ],
  },
};
