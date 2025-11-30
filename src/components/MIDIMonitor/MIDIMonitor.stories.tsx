import type { Meta, StoryObj } from '@storybook/react';
import { useState, useEffect } from 'react';
import { MIDIMonitor, MIDIEvent } from './MIDIMonitor';

const meta: Meta<typeof MIDIMonitor> = {
  title: 'Debug/MIDIMonitor',
  component: MIDIMonitor,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

// Generate random MIDI events for demo
const generateRandomEvent = (): MIDIEvent => {
  const types: MIDIEvent['type'][] = ['noteOn', 'noteOff', 'cc', 'pitchBend', 'aftertouch'];
  const type = types[Math.floor(Math.random() * types.length)];
  const channel = Math.floor(Math.random() * 16) + 1;

  let data: number[] = [];
  switch (type) {
    case 'noteOn':
    case 'noteOff':
      data = [36 + Math.floor(Math.random() * 48), Math.floor(Math.random() * 127)];
      break;
    case 'cc':
      data = [Math.floor(Math.random() * 120), Math.floor(Math.random() * 127)];
      break;
    case 'pitchBend':
      data = [Math.floor(Math.random() * 128), Math.floor(Math.random() * 128)];
      break;
    case 'aftertouch':
      data = [Math.floor(Math.random() * 127)];
      break;
  }

  return {
    timestamp: Date.now(),
    type,
    channel,
    data,
  };
};

export const Default: Story = {
  args: {
    label: 'MIDI MONITOR',
    events: [],
    height: 200,
  },
};

export const WithEvents: Story = {
  render: () => {
    const [events, setEvents] = useState<MIDIEvent[]>([]);

    useEffect(() => {
      // Generate initial events
      const initial: MIDIEvent[] = [];
      for (let i = 0; i < 10; i++) {
        initial.push({ ...generateRandomEvent(), timestamp: Date.now() - (10 - i) * 500 });
      }
      setEvents(initial);

      // Add new events periodically
      const interval = setInterval(() => {
        setEvents((prev) => [...prev.slice(-99), generateRandomEvent()]);
      }, 1000);

      return () => clearInterval(interval);
    }, []);

    return (
      <MIDIMonitor
        events={events}
        label="MIDI INPUT"
        height={250}
        onClear={() => setEvents([])}
      />
    );
  },
};

export const WithRawBytes: Story = {
  render: () => {
    const events: MIDIEvent[] = [
      { timestamp: Date.now(), type: 'noteOn', channel: 1, data: [60, 100], raw: new Uint8Array([0x90, 0x3C, 0x64]) },
      { timestamp: Date.now() + 100, type: 'noteOff', channel: 1, data: [60, 0], raw: new Uint8Array([0x80, 0x3C, 0x00]) },
      { timestamp: Date.now() + 200, type: 'cc', channel: 1, data: [1, 64], raw: new Uint8Array([0xB0, 0x01, 0x40]) },
    ];

    return (
      <MIDIMonitor
        events={events}
        label="RAW MIDI"
        showRaw
        height={150}
      />
    );
  },
};

export const NotesOnly: Story = {
  render: () => {
    const events: MIDIEvent[] = [
      { timestamp: Date.now(), type: 'noteOn', channel: 1, data: [60, 100] },
      { timestamp: Date.now() + 50, type: 'noteOn', channel: 1, data: [64, 90] },
      { timestamp: Date.now() + 100, type: 'noteOn', channel: 1, data: [67, 80] },
      { timestamp: Date.now() + 500, type: 'noteOff', channel: 1, data: [60, 0] },
      { timestamp: Date.now() + 550, type: 'noteOff', channel: 1, data: [64, 0] },
      { timestamp: Date.now() + 600, type: 'noteOff', channel: 1, data: [67, 0] },
    ];

    return (
      <MIDIMonitor
        events={events}
        label="NOTES ONLY"
        filterTypes={['noteOn', 'noteOff']}
        height={150}
      />
    );
  },
};
