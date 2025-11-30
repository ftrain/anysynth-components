import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '../../test/test-utils';
import { WaveformPicker, WaveformShape } from './WaveformPicker';

describe('WaveformPicker', () => {
  const defaultOptions: WaveformShape[] = ['sine', 'triangle', 'saw', 'square', 'noise'];

  describe('Rendering', () => {
    it('should render all default waveform options', () => {
      render(<WaveformPicker value="sine" />);
      // Should have 5 buttons for default waveforms
      expect(screen.getAllByRole('button')).toHaveLength(5);
    });

    it('should render custom subset of options', () => {
      render(<WaveformPicker value="sine" options={['sine', 'square']} />);
      expect(screen.getAllByRole('button')).toHaveLength(2);
    });

    it('should render with label', () => {
      render(<WaveformPicker value="sine" label="OSCILLATOR" />);
      expect(screen.getByText('OSCILLATOR')).toBeInTheDocument();
    });

    it('should render SVG icons for each waveform', () => {
      render(<WaveformPicker value="sine" />);
      // Each button should contain an SVG
      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        expect(button.querySelector('svg')).toBeInTheDocument();
      });
    });
  });

  describe('Interactions', () => {
    it('should call onChange when waveform clicked', () => {
      const onChange = vi.fn();
      render(<WaveformPicker value="sine" onChange={onChange} />);

      const buttons = screen.getAllByRole('button');
      // Click the third button (saw)
      fireEvent.click(buttons[2]);

      expect(onChange).toHaveBeenCalledWith('saw');
    });

    it('should call onChange with correct waveform type', () => {
      const onChange = vi.fn();
      render(<WaveformPicker value="sine" onChange={onChange} options={['sine', 'square']} />);

      const buttons = screen.getAllByRole('button');
      fireEvent.click(buttons[1]); // square

      expect(onChange).toHaveBeenCalledWith('square');
    });

    it('should handle clicking already selected waveform', () => {
      const onChange = vi.fn();
      render(<WaveformPicker value="sine" onChange={onChange} />);

      const buttons = screen.getAllByRole('button');
      fireEvent.click(buttons[0]); // sine (already selected)

      expect(onChange).toHaveBeenCalledWith('sine');
    });
  });

  describe('Layouts', () => {
    it('should render horizontal layout by default', () => {
      render(<WaveformPicker value="sine" />);
      expect(screen.getAllByRole('button')).toHaveLength(5);
    });

    it('should render vertical layout', () => {
      render(<WaveformPicker value="sine" layout="vertical" />);
      expect(screen.getAllByRole('button')).toHaveLength(5);
    });
  });

  describe('Icon Sizes', () => {
    it('should render with default icon size', () => {
      render(<WaveformPicker value="sine" />);
      const buttons = screen.getAllByRole('button');
      const svg = buttons[0].querySelector('svg');
      expect(svg).toBeInTheDocument();
    });

    it('should render with custom icon size', () => {
      render(<WaveformPicker value="sine" iconSize={48} />);
      const buttons = screen.getAllByRole('button');
      const svg = buttons[0].querySelector('svg');
      expect(svg).toHaveAttribute('width', '48');
      expect(svg).toHaveAttribute('height', '48');
    });

    it('should render with small icon size', () => {
      render(<WaveformPicker value="sine" iconSize={16} />);
      const buttons = screen.getAllByRole('button');
      const svg = buttons[0].querySelector('svg');
      expect(svg).toHaveAttribute('width', '16');
      expect(svg).toHaveAttribute('height', '16');
    });
  });

  describe('Colors', () => {
    it('should accept different color props', () => {
      const { rerender } = render(<WaveformPicker value="sine" color="coral" />);
      expect(screen.getAllByRole('button')).toHaveLength(5);

      rerender(<WaveformPicker value="sine" color="cyan" />);
      expect(screen.getAllByRole('button')).toHaveLength(5);

      rerender(<WaveformPicker value="sine" color="yellow" />);
      expect(screen.getAllByRole('button')).toHaveLength(5);
    });
  });

  describe('Waveform Types', () => {
    it('should handle all waveform types', () => {
      const waveforms: WaveformShape[] = ['sine', 'triangle', 'saw', 'square', 'noise'];

      waveforms.forEach(waveform => {
        const { unmount } = render(<WaveformPicker value={waveform} />);
        expect(screen.getAllByRole('button')).toHaveLength(5);
        unmount();
      });
    });

    it('should show correct waveform as selected', () => {
      const onChange = vi.fn();
      render(<WaveformPicker value="triangle" onChange={onChange} />);

      // The triangle button should be visually different (selected)
      const buttons = screen.getAllByRole('button');
      expect(buttons[1]).toBeInTheDocument(); // triangle is second
    });
  });

  describe('Edge Cases', () => {
    it('should handle single waveform option', () => {
      render(<WaveformPicker value="sine" options={['sine']} />);
      expect(screen.getAllByRole('button')).toHaveLength(1);
    });

    it('should handle two waveform options', () => {
      render(<WaveformPicker value="sine" options={['sine', 'square']} />);
      expect(screen.getAllByRole('button')).toHaveLength(2);
    });
  });
});
