import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '../../test/test-utils';
import userEvent from '@testing-library/user-event';
import { Transport } from './Transport';
import type { TransportState } from '../../types';

const createTransportState = (overrides: Partial<TransportState> = {}): TransportState => ({
  playing: false,
  recording: false,
  bpm: 120,
  timeSignature: [4, 4],
  position: 0,
  loop: false,
  loopStart: 0,
  loopEnd: 16,
  ...overrides,
});

describe('Transport', () => {
  describe('Rendering', () => {
    it('should render all transport buttons', () => {
      render(<Transport state={createTransportState()} />);

      expect(screen.getByLabelText('Stop')).toBeInTheDocument();
      expect(screen.getByLabelText('Play')).toBeInTheDocument();
      expect(screen.getByLabelText('Record')).toBeInTheDocument();
      expect(screen.getByLabelText('Loop')).toBeInTheDocument();
    });

    it('should show Pause label when playing', () => {
      render(<Transport state={createTransportState({ playing: true })} />);

      expect(screen.getByLabelText('Pause')).toBeInTheDocument();
    });

    it('should display position when showPosition is true', () => {
      render(
        <Transport
          state={createTransportState({ position: 4.5 })}
          showPosition={true}
        />
      );

      expect(screen.getByText('2.1.50')).toBeInTheDocument();
    });

    it('should hide position when showPosition is false', () => {
      render(
        <Transport
          state={createTransportState({ position: 4.5 })}
          showPosition={false}
        />
      );

      expect(screen.queryByText('2.1.50')).not.toBeInTheDocument();
    });

    it('should display BPM when showBpm is true', () => {
      render(
        <Transport
          state={createTransportState({ bpm: 140 })}
          showBpm={true}
        />
      );

      expect(screen.getByText('140')).toBeInTheDocument();
      expect(screen.getByText('BPM')).toBeInTheDocument();
    });

    it('should hide BPM when showBpm is false', () => {
      render(
        <Transport
          state={createTransportState({ bpm: 140 })}
          showBpm={false}
        />
      );

      expect(screen.queryByText('140')).not.toBeInTheDocument();
    });

    it('should display time signature when showTimeSignature is true', () => {
      render(
        <Transport
          state={createTransportState({ timeSignature: [3, 4] })}
          showTimeSignature={true}
        />
      );

      expect(screen.getByText('3/4')).toBeInTheDocument();
    });
  });

  describe('Transport Controls', () => {
    it('should toggle play/pause on play button click', async () => {
      const onStateChange = vi.fn();
      const user = userEvent.setup();

      render(
        <Transport
          state={createTransportState({ playing: false })}
          onStateChange={onStateChange}
        />
      );

      await user.click(screen.getByLabelText('Play'));

      expect(onStateChange).toHaveBeenCalledWith({
        playing: true,
        recording: false,
      });
    });

    it('should pause when clicking pause button', async () => {
      const onStateChange = vi.fn();
      const user = userEvent.setup();

      render(
        <Transport
          state={createTransportState({ playing: true })}
          onStateChange={onStateChange}
        />
      );

      await user.click(screen.getByLabelText('Pause'));

      expect(onStateChange).toHaveBeenCalledWith({
        playing: false,
        recording: false,
      });
    });

    it('should stop and reset position on stop button click', async () => {
      const onStateChange = vi.fn();
      const user = userEvent.setup();

      render(
        <Transport
          state={createTransportState({ playing: true, position: 8 })}
          onStateChange={onStateChange}
        />
      );

      await user.click(screen.getByLabelText('Stop'));

      expect(onStateChange).toHaveBeenCalledWith({
        playing: false,
        recording: false,
        position: 0,
      });
    });

    it('should toggle recording on record button click', async () => {
      const onStateChange = vi.fn();
      const user = userEvent.setup();

      render(
        <Transport
          state={createTransportState({ recording: false })}
          onStateChange={onStateChange}
        />
      );

      await user.click(screen.getByLabelText('Record'));

      expect(onStateChange).toHaveBeenCalledWith({
        recording: true,
        playing: true,
      });
    });

    it('should toggle loop on loop button click', async () => {
      const onStateChange = vi.fn();
      const user = userEvent.setup();

      render(
        <Transport
          state={createTransportState({ loop: false })}
          onStateChange={onStateChange}
        />
      );

      await user.click(screen.getByLabelText('Loop'));

      expect(onStateChange).toHaveBeenCalledWith({ loop: true });
    });
  });

  describe('BPM Editing', () => {
    it('should show input when clicking BPM value', async () => {
      const user = userEvent.setup();

      render(
        <Transport
          state={createTransportState({ bpm: 120 })}
          showBpm={true}
        />
      );

      await user.click(screen.getByText('120'));

      expect(screen.getByRole('spinbutton')).toBeInTheDocument();
    });

    it('should update BPM on valid input and blur', async () => {
      const onStateChange = vi.fn();
      const user = userEvent.setup();

      render(
        <Transport
          state={createTransportState({ bpm: 120 })}
          onStateChange={onStateChange}
          showBpm={true}
        />
      );

      await user.click(screen.getByText('120'));
      const input = screen.getByRole('spinbutton');
      await user.clear(input);
      await user.type(input, '140');
      fireEvent.blur(input);

      expect(onStateChange).toHaveBeenCalledWith({ bpm: 140 });
    });

    it('should update BPM on Enter key', async () => {
      const onStateChange = vi.fn();
      const user = userEvent.setup();

      render(
        <Transport
          state={createTransportState({ bpm: 120 })}
          onStateChange={onStateChange}
          showBpm={true}
        />
      );

      await user.click(screen.getByText('120'));
      const input = screen.getByRole('spinbutton');
      await user.clear(input);
      await user.type(input, '150{Enter}');

      expect(onStateChange).toHaveBeenCalledWith({ bpm: 150 });
    });

    it('should cancel editing on Escape key', async () => {
      const onStateChange = vi.fn();
      const user = userEvent.setup();

      render(
        <Transport
          state={createTransportState({ bpm: 120 })}
          onStateChange={onStateChange}
          showBpm={true}
        />
      );

      await user.click(screen.getByText('120'));
      const input = screen.getByRole('spinbutton');
      await user.clear(input);
      await user.type(input, '999{Escape}');

      // Should not call onStateChange with invalid BPM
      expect(onStateChange).not.toHaveBeenCalled();
      // Should show original BPM button
      expect(screen.getByText('120')).toBeInTheDocument();
    });

    it('should reject invalid BPM values', async () => {
      const onStateChange = vi.fn();
      const user = userEvent.setup();

      render(
        <Transport
          state={createTransportState({ bpm: 120 })}
          onStateChange={onStateChange}
          showBpm={true}
        />
      );

      await user.click(screen.getByText('120'));
      const input = screen.getByRole('spinbutton');
      await user.clear(input);
      await user.type(input, '10'); // Below minimum of 20
      fireEvent.blur(input);

      // Should not update with invalid value
      expect(onStateChange).not.toHaveBeenCalled();
    });
  });

  describe('Position Formatting', () => {
    it('should format position correctly for 4/4 time', () => {
      render(
        <Transport
          state={createTransportState({
            position: 0,
            timeSignature: [4, 4],
          })}
          showPosition={true}
        />
      );

      expect(screen.getByText('1.1.00')).toBeInTheDocument();
    });

    it('should format position with fractional beats', () => {
      render(
        <Transport
          state={createTransportState({
            position: 4.75,
            timeSignature: [4, 4],
          })}
          showPosition={true}
        />
      );

      expect(screen.getByText('2.1.75')).toBeInTheDocument();
    });
  });

  describe('Compact Mode', () => {
    it('should render in compact mode', () => {
      render(
        <Transport
          state={createTransportState()}
          compact={true}
        />
      );

      // Component should render without errors in compact mode
      expect(screen.getByLabelText('Play')).toBeInTheDocument();
    });
  });
});
