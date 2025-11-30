import type { Meta, StoryObj } from '@storybook/react';
import { useState, useEffect } from 'react';
import { Transport } from './Transport';
import type { TransportState } from '../../types';
import { expect, userEvent, within } from '@storybook/test';

const meta: Meta<typeof Transport> = {
  title: 'Controls/Transport',
  component: Transport,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Transport>;

const defaultState: TransportState = {
  playing: false,
  recording: false,
  loop: false,
  position: 0,
  bpm: 120,
  timeSignature: [4, 4] as [number, number],
  loopStart: 0,
  loopEnd: 16,
};

// Interactive wrapper
const TransportWrapper = (props: Partial<React.ComponentProps<typeof Transport>>) => {
  const [state, setState] = useState<TransportState>({
    ...defaultState,
    ...props.state,
  });

  // Simulate position advancing when playing
  useEffect(() => {
    if (!state.playing) return;
    const interval = setInterval(() => {
      setState(s => ({ ...s, position: s.position + 0.1 }));
    }, 100);
    return () => clearInterval(interval);
  }, [state.playing]);

  return (
    <Transport
      {...props}
      state={state}
      onStateChange={(partial) => setState(s => ({ ...s, ...partial }))}
    />
  );
};

export const Default: Story = {
  render: () => <TransportWrapper />,
};

export const Playing: Story = {
  render: () => <TransportWrapper state={{ ...defaultState, playing: true }} />,
};

export const Recording: Story = {
  render: () => <TransportWrapper state={{ ...defaultState, playing: true, recording: true }} />,
};

export const WithLoop: Story = {
  render: () => <TransportWrapper state={{ ...defaultState, loop: true }} />,
};

export const WithTimeSignature: Story = {
  render: () => <TransportWrapper showTimeSignature />,
};

export const DifferentTempo: Story = {
  render: () => <TransportWrapper state={{ ...defaultState, bpm: 140 }} />,
};

export const Compact: Story = {
  render: () => <TransportWrapper compact />,
};

export const WaltzTime: Story = {
  render: () => (
    <TransportWrapper
      state={{ ...defaultState, timeSignature: [3, 4] as [number, number], bpm: 96 }}
      showTimeSignature
    />
  ),
};

// Interactive test
export const InteractionTest: Story = {
  render: () => <TransportWrapper />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Find and click play button
    const playButton = canvas.getByRole('button', { name: /play/i });
    await userEvent.click(playButton);

    // Should now show pause
    const pauseButton = canvas.getByRole('button', { name: /pause/i });
    expect(pauseButton).toBeInTheDocument();

    // Click stop
    const stopButton = canvas.getByRole('button', { name: /stop/i });
    await userEvent.click(stopButton);

    // Should be back to play
    expect(canvas.getByRole('button', { name: /play/i })).toBeInTheDocument();
  },
};
