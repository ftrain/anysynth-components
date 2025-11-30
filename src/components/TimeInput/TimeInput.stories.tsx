import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { TimeInput, TimeValue } from './TimeInput';

const meta: Meta<typeof TimeInput> = {
  title: 'Time Controls/TimeInput',
  component: TimeInput,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: 'DELAY TIME',
    bpm: 120,
    value: { mode: 'sync', ms: 500 },
  },
};

export const FreeMode: Story = {
  args: {
    label: 'DECAY',
    bpm: 120,
    defaultMode: 'free',
    value: { mode: 'free', ms: 250 },
    minMs: 10,
    maxMs: 5000,
  },
};

export const SyncWithDottedTriplet: Story = {
  render: () => {
    const [value, setValue] = useState<Partial<TimeValue>>({
      mode: 'sync',
      ms: 500,
    });

    return (
      <TimeInput
        label="LFO RATE"
        value={value}
        onChange={setValue}
        bpm={128}
        showDottedTriplet={true}
      />
    );
  },
};

export const VariableBPM: Story = {
  render: () => {
    const [bpm, setBpm] = useState(120);
    const [value, setValue] = useState<Partial<TimeValue>>({
      mode: 'sync',
      ms: 500,
    });

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: '#888' }}>
            BPM:
          </span>
          <input
            type="number"
            value={bpm}
            onChange={(e) => setBpm(parseInt(e.target.value) || 120)}
            style={{
              width: 60,
              padding: '4px 8px',
              background: '#1a1a1a',
              border: '1px solid #333',
              borderRadius: 4,
              color: '#fff',
            }}
          />
        </div>
        <TimeInput
          label="SYNCED DELAY"
          value={value}
          onChange={setValue}
          bpm={bpm}
        />
      </div>
    );
  },
};

export const Compact: Story = {
  args: {
    label: 'TIME',
    bpm: 120,
    compact: true,
    showDottedTriplet: false,
    value: { mode: 'sync', ms: 250 },
  },
};

export const LongRange: Story = {
  args: {
    label: 'REVERB DECAY',
    bpm: 120,
    defaultMode: 'free',
    minMs: 100,
    maxMs: 30000,
    value: { mode: 'free', ms: 2500 },
  },
};

export const ShortRange: Story = {
  args: {
    label: 'ATTACK',
    bpm: 120,
    defaultMode: 'free',
    minMs: 0.1,
    maxMs: 100,
    showModeToggle: false,
    value: { mode: 'free', ms: 10 },
  },
};

export const MultipleTimeInputs: Story = {
  render: () => {
    const [delay, setDelay] = useState<Partial<TimeValue>>({ mode: 'sync', ms: 500 });
    const [lfo, setLfo] = useState<Partial<TimeValue>>({ mode: 'sync', ms: 250 });
    const [attack, setAttack] = useState<Partial<TimeValue>>({ mode: 'free', ms: 10 });
    const bpm = 120;

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <TimeInput label="DELAY" value={delay} onChange={setDelay} bpm={bpm} />
        <TimeInput label="LFO RATE" value={lfo} onChange={setLfo} bpm={bpm} compact />
        <TimeInput
          label="ATTACK"
          value={attack}
          onChange={setAttack}
          bpm={bpm}
          defaultMode="free"
          minMs={0.1}
          maxMs={500}
          showModeToggle={false}
        />
      </div>
    );
  },
};
