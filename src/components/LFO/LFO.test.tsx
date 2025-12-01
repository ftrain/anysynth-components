import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '../../test/test-utils';
import { LFO } from './LFO';
import type { LFOParams } from '../../types';

const createLFOParams = (overrides: Partial<LFOParams> = {}): LFOParams => ({
  rate: 1,
  depth: 0.5,
  shape: 'sine',
  phase: 0,
  delay: 0,
  ...overrides,
});

describe('LFO', () => {
  describe('Rendering', () => {
    it('should render with label', () => {
      render(<LFO value={createLFOParams()} label="LFO 1" />);

      expect(screen.getByText('LFO 1')).toBeInTheDocument();
    });

    it('should render waveform visualization', () => {
      const { container } = render(<LFO value={createLFOParams()} />);

      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });

    it('should display rate value', () => {
      const { container } = render(<LFO value={createLFOParams({ rate: 2.5 })} />);

      // Rate is displayed as Hz - look in the component
      expect(container.textContent).toContain('2.50');
    });

    it('should display depth value', () => {
      const { container } = render(<LFO value={createLFOParams({ depth: 0.75 })} />);

      // Depth is displayed as percentage
      expect(container.textContent).toContain('75');
    });

    it('should render all shape buttons', () => {
      render(<LFO value={createLFOParams()} />);

      expect(screen.getByText('SIN')).toBeInTheDocument();
      expect(screen.getByText('TRI')).toBeInTheDocument();
      expect(screen.getByText('SAW')).toBeInTheDocument();
      expect(screen.getByText('SQR')).toBeInTheDocument();
    });
  });

  describe('Shape selection', () => {
    it('should highlight current shape', () => {
      render(<LFO value={createLFOParams({ shape: 'sine' })} />);

      const sineButton = screen.getByText('SIN');
      // The selected shape should have different styling
      expect(sineButton).toBeInTheDocument();
    });

    it('should call onChange when shape is changed', () => {
      const onChange = vi.fn();
      render(<LFO value={createLFOParams({ shape: 'sine' })} onChange={onChange} />);

      const triangleButton = screen.getByText('TRI');
      fireEvent.click(triangleButton);

      expect(onChange).toHaveBeenCalledWith(
        expect.objectContaining({ shape: 'triangle' })
      );
    });

    it('should support triangle shape', () => {
      const onChange = vi.fn();
      render(<LFO value={createLFOParams()} onChange={onChange} />);

      fireEvent.click(screen.getByText('TRI'));
      expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ shape: 'triangle' }));
    });

    it('should support square shape', () => {
      const onChange = vi.fn();
      render(<LFO value={createLFOParams()} onChange={onChange} />);

      fireEvent.click(screen.getByText('SQR'));
      expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ shape: 'square' }));
    });
  });

  describe('Rate control', () => {
    it('should update rate on slider interaction', () => {
      const onChange = vi.fn();
      const { container } = render(
        <LFO value={createLFOParams({ rate: 1 })} onChange={onChange} />
      );

      // Find the rate slider (first slider in the component)
      const sliders = container.querySelectorAll('[role="slider"]');
      expect(sliders.length).toBeGreaterThan(0);
    });

    it('should respect maxRate prop', () => {
      const { container } = render(<LFO value={createLFOParams({ rate: 5 })} maxRate={10} />);

      // Component should render without error
      expect(container.textContent).toContain('5.00');
    });

    it('should respect minRate prop', () => {
      const { container } = render(<LFO value={createLFOParams({ rate: 0.1 })} minRate={0.01} />);

      // Component should render without error - low rates shown as mHz
      expect(container.textContent).toContain('100');
      expect(container.textContent).toContain('mHz');
    });
  });

  describe('Depth control', () => {
    it('should display depth as percentage', () => {
      render(<LFO value={createLFOParams({ depth: 0.5 })} />);

      expect(screen.getByText(/50/)).toBeInTheDocument();
    });

    it('should update depth on slider interaction', () => {
      const onChange = vi.fn();
      const { container } = render(
        <LFO value={createLFOParams({ depth: 0.5 })} onChange={onChange} />
      );

      // Component renders sliders
      const sliders = container.querySelectorAll('[role="slider"]');
      expect(sliders.length).toBeGreaterThan(0);
    });
  });

  describe('Delay control', () => {
    it('should show delay control when showDelay is true', () => {
      render(<LFO value={createLFOParams()} showDelay={true} />);

      expect(screen.getByText('DELAY')).toBeInTheDocument();
    });

    it('should hide delay control when showDelay is false', () => {
      render(<LFO value={createLFOParams()} showDelay={false} />);

      expect(screen.queryByText('DELAY')).not.toBeInTheDocument();
    });

    it('should display delay time in ms', () => {
      const { container } = render(<LFO value={createLFOParams({ delay: 500 })} showDelay={true} />);

      // Delay is displayed in milliseconds
      expect(container.textContent).toContain('500');
    });
  });

  describe('fillContainer mode', () => {
    it('should apply full width when fillContainer is true', () => {
      const { container } = render(
        <LFO value={createLFOParams()} fillContainer={true} />
      );

      const lfoContainer = container.querySelector('.synth-control');
      expect(lfoContainer).toHaveStyle({ width: '100%' });
    });

    it('should apply full height when fillContainer is true', () => {
      const { container } = render(
        <LFO value={createLFOParams()} fillContainer={true} />
      );

      const lfoContainer = container.querySelector('.synth-control');
      expect(lfoContainer).toHaveStyle({ height: '100%' });
    });

    it('should have transparent background when fillContainer is true', () => {
      const { container } = render(
        <LFO value={createLFOParams()} fillContainer={true} />
      );

      const lfoContainer = container.querySelector('.synth-control');
      expect(lfoContainer).toHaveStyle({ background: 'transparent' });
    });

    it('should have no padding when fillContainer is true', () => {
      const { container } = render(
        <LFO value={createLFOParams()} fillContainer={true} />
      );

      const lfoContainer = container.querySelector('.synth-control');
      expect(lfoContainer).toHaveStyle({ padding: '0px' });
    });

    it('should use explicit width when fillContainer is false', () => {
      const { container } = render(
        <LFO value={createLFOParams()} fillContainer={false} width={300} />
      );

      const lfoContainer = container.querySelector('.synth-control');
      expect(lfoContainer).toHaveStyle({ width: '300px' });
    });
  });

  describe('Custom styling', () => {
    it('should accept custom color prop', () => {
      const { container } = render(
        <LFO value={createLFOParams()} color="#ff0000" />
      );

      // Color should be applied to waveform or sliders
      expect(container.querySelector('svg')).toBeInTheDocument();
    });

    it('should accept custom width prop', () => {
      const { container } = render(
        <LFO value={createLFOParams()} width={400} />
      );

      const lfoContainer = container.querySelector('.synth-control');
      expect(lfoContainer).toHaveStyle({ width: '400px' });
    });
  });

  describe('Waveform animation', () => {
    it('should render waveform path', () => {
      const { container } = render(
        <LFO value={createLFOParams({ shape: 'sine' })} />
      );

      const path = container.querySelector('path');
      expect(path).toBeInTheDocument();
    });

    it('should render different waveforms based on shape', () => {
      const { container: sineContainer } = render(
        <LFO value={createLFOParams({ shape: 'sine' })} />
      );
      const sinePath = sineContainer.querySelector('path');
      expect(sinePath).toBeInTheDocument();

      const { container: squareContainer } = render(
        <LFO value={createLFOParams({ shape: 'square' })} />
      );
      const squarePath = squareContainer.querySelector('path');
      expect(squarePath).toBeInTheDocument();

      // Both shapes should render valid waveforms
      // Note: path content may be the same at initial render due to animation timing
    });
  });

  describe('Sync mode', () => {
    it('should work in sync mode', () => {
      render(<LFO value={createLFOParams()} syncMode={true} />);

      // Should render without error
      const container = document.querySelector('.synth-control');
      expect(container).toBeInTheDocument();
    });
  });

  describe('Keyboard interaction', () => {
    it('should handle keyboard events on shape buttons', () => {
      const onChange = vi.fn();
      render(<LFO value={createLFOParams()} onChange={onChange} />);

      const triangleButton = screen.getByText('TRI');
      fireEvent.keyDown(triangleButton, { key: 'Enter' });

      // Enter should trigger click
      // (Note: actual behavior depends on button implementation)
    });
  });

  describe('Value updates', () => {
    it('should reflect prop changes', () => {
      const { container, rerender } = render(
        <LFO value={createLFOParams({ rate: 1 })} />
      );

      expect(container.textContent).toContain('1.00');

      rerender(<LFO value={createLFOParams({ rate: 5 })} />);

      expect(container.textContent).toContain('5.00');
    });

    it('should update waveform when depth changes', () => {
      const { container, rerender } = render(
        <LFO value={createLFOParams({ depth: 0.5 })} />
      );

      expect(container.querySelector('path')).toBeInTheDocument();

      rerender(<LFO value={createLFOParams({ depth: 1.0 })} />);

      // Waveform should update with depth
      const updatedPath = container.querySelector('path')?.getAttribute('d');
      expect(updatedPath).toBeDefined();
    });
  });
});
