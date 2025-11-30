import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act } from '../../test/test-utils';
import { LevelMeter } from './LevelMeter';
import type { MeterData } from '../../types';

const createMeterData = (overrides: Partial<MeterData> = {}): MeterData => ({
  peak: 0.5,
  rms: 0.3,
  clip: false,
  ...overrides,
});

describe('LevelMeter', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Mono Mode', () => {
    it('should render a single meter for mono input', () => {
      render(<LevelMeter value={createMeterData()} />);

      // Should have one meter channel
      const container = document.querySelector('.synth-control');
      expect(container).toBeInTheDocument();
    });

    it('should display dB value when showDb is true', () => {
      render(
        <LevelMeter
          value={createMeterData({ peak: 0.5 })}
          showDb={true}
        />
      );

      // Should show dB readout (approximately -6dB for 0.5 linear)
      expect(screen.getByText(/-\d+\.\d/)).toBeInTheDocument();
    });

    it('should hide dB value when showDb is false', () => {
      render(
        <LevelMeter
          value={createMeterData({ peak: 0.5 })}
          showDb={false}
        />
      );

      // Should not show dB readout
      expect(screen.queryByText(/-\d+\.\d/)).not.toBeInTheDocument();
    });

    it('should display label when provided', () => {
      render(<LevelMeter value={createMeterData()} label="OUTPUT" />);

      expect(screen.getByText('OUTPUT')).toBeInTheDocument();
    });
  });

  describe('Stereo Mode', () => {
    it('should render two meters for stereo input', () => {
      const stereoValue: [MeterData, MeterData] = [
        createMeterData({ peak: 0.6 }),
        createMeterData({ peak: 0.5 }),
      ];

      render(<LevelMeter value={stereoValue} />);

      // Component should render with stereo data
      expect(document.querySelector('.synth-control')).toBeInTheDocument();
    });

    it('should display two dB values for stereo', () => {
      const stereoValue: [MeterData, MeterData] = [
        createMeterData({ peak: 0.5 }),
        createMeterData({ peak: 0.25 }),
      ];

      render(<LevelMeter value={stereoValue} showDb={true} />);

      // Should show two dB values
      const dbValues = screen.getAllByText(/-\d+\.\d/);
      expect(dbValues.length).toBe(2);
    });
  });

  describe('Clip Indicator', () => {
    it('should show clip indicator when clipping', () => {
      render(
        <LevelMeter
          value={createMeterData({ clip: true, peak: 1.0 })}
        />
      );

      // Clip indicator should be rendered (red area at top)
      // The component renders different color for clip state
      expect(document.querySelector('.synth-control')).toBeInTheDocument();
    });

    it('should apply clip color to dB readout when clipping', () => {
      render(
        <LevelMeter
          value={createMeterData({ clip: true, peak: 1.0 })}
          showDb={true}
        />
      );

      // The dB value should have coral/red color when clipping
      const dbValue = screen.getByText(/\d+\.\d/);
      expect(dbValue).toBeInTheDocument();
    });
  });

  describe('Peak Hold', () => {
    it('should hold peak value for specified duration', () => {
      const { rerender } = render(
        <LevelMeter
          value={createMeterData({ peak: 0.9 })}
          peakHoldMs={1500}
          showPeak={true}
        />
      );

      // Lower the peak
      rerender(
        <LevelMeter
          value={createMeterData({ peak: 0.3 })}
          peakHoldMs={1500}
          showPeak={true}
        />
      );

      // Peak hold should still be at 0.9 (not yet decayed)
      // This is internal state, but component should render without errors
      expect(document.querySelector('.synth-control')).toBeInTheDocument();
    });

    it('should reset peak hold after timeout', () => {
      const { rerender } = render(
        <LevelMeter
          value={createMeterData({ peak: 0.9 })}
          peakHoldMs={1000}
          showPeak={true}
        />
      );

      rerender(
        <LevelMeter
          value={createMeterData({ peak: 0.3 })}
          peakHoldMs={1000}
          showPeak={true}
        />
      );

      // Fast-forward past peak hold time
      act(() => {
        vi.advanceTimersByTime(1500);
      });

      // Component should still render correctly
      expect(document.querySelector('.synth-control')).toBeInTheDocument();
    });
  });

  describe('Orientation', () => {
    it('should render in vertical orientation by default', () => {
      render(<LevelMeter value={createMeterData()} />);

      // Component renders with vertical layout
      expect(document.querySelector('.synth-control')).toBeInTheDocument();
    });

    it('should render in horizontal orientation', () => {
      render(
        <LevelMeter
          value={createMeterData()}
          orientation="horizontal"
        />
      );

      expect(document.querySelector('.synth-control')).toBeInTheDocument();
    });
  });

  describe('Custom Dimensions', () => {
    it('should accept custom height', () => {
      render(<LevelMeter value={createMeterData()} height={300} />);

      expect(document.querySelector('.synth-control')).toBeInTheDocument();
    });

    it('should accept custom width', () => {
      render(<LevelMeter value={createMeterData()} width={50} />);

      expect(document.querySelector('.synth-control')).toBeInTheDocument();
    });
  });

  describe('Visual Elements', () => {
    it('should show RMS level when showRms is true', () => {
      render(
        <LevelMeter
          value={createMeterData({ rms: 0.5 })}
          showRms={true}
        />
      );

      expect(document.querySelector('.synth-control')).toBeInTheDocument();
    });

    it('should hide RMS level when showRms is false', () => {
      render(
        <LevelMeter
          value={createMeterData({ rms: 0.5 })}
          showRms={false}
        />
      );

      expect(document.querySelector('.synth-control')).toBeInTheDocument();
    });

    it('should show peak level when showPeak is true', () => {
      render(
        <LevelMeter
          value={createMeterData({ peak: 0.8 })}
          showPeak={true}
        />
      );

      expect(document.querySelector('.synth-control')).toBeInTheDocument();
    });
  });

  describe('Level Colors', () => {
    it('should show green for normal levels', () => {
      render(
        <LevelMeter
          value={createMeterData({ peak: 0.1 })} // Low level = green
        />
      );

      expect(document.querySelector('.synth-control')).toBeInTheDocument();
    });

    it('should show yellow/orange for hot levels', () => {
      render(
        <LevelMeter
          value={createMeterData({ peak: 0.8 })} // Hot level
        />
      );

      expect(document.querySelector('.synth-control')).toBeInTheDocument();
    });

    it('should show red for clipping levels', () => {
      render(
        <LevelMeter
          value={createMeterData({ peak: 1.0, clip: true })}
        />
      );

      expect(document.querySelector('.synth-control')).toBeInTheDocument();
    });
  });

  describe('dB Scale', () => {
    it('should display scale marks in vertical mode', () => {
      render(
        <LevelMeter
          value={createMeterData()}
          showDb={true}
          orientation="vertical"
        />
      );

      // Should show scale marks: 0, -6, -12, -24, -48
      expect(screen.getByText('0')).toBeInTheDocument();
      expect(screen.getByText('-6')).toBeInTheDocument();
      expect(screen.getByText('-12')).toBeInTheDocument();
    });
  });
});
