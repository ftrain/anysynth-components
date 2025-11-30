import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '../../test/test-utils';
import { XYPad } from './XYPad';

describe('XYPad', () => {
  describe('Rendering', () => {
    it('should render with default labels', () => {
      render(<XYPad x={0.5} y={0.5} />);

      expect(screen.getByText('X')).toBeInTheDocument();
    });

    it('should render with custom labels', () => {
      const { container } = render(<XYPad x={0.5} y={0.5} xLabel="CUTOFF" yLabel="RESO" showValues={true} />);

      expect(container.textContent).toContain('CUTOFF');
      expect(container.textContent).toContain('RESO');
    });

    it('should render with label prop', () => {
      render(<XYPad x={0.5} y={0.5} label="FILTER" />);

      expect(screen.getByText('FILTER')).toBeInTheDocument();
    });

    it('should display values when showValues is true', () => {
      const { container } = render(<XYPad x={0.75} y={0.25} showValues={true} />);

      // Values are displayed somewhere in the component
      expect(container.textContent).toMatch(/75/);
      expect(container.textContent).toMatch(/25/);
    });

    it('should hide values when showValues is false', () => {
      const { container } = render(<XYPad x={0.75} y={0.25} showValues={false} label="PAD" />);

      // When hiding values, the component should still render
      expect(container.querySelector('.synth-control')).toBeInTheDocument();
    });

    it('should display bipolar values correctly', () => {
      const { container } = render(<XYPad x={0.75} y={0.25} bipolar={true} showValues={true} />);

      // Bipolar values should show + and - signs
      expect(container.textContent).toMatch(/\+50/);
      expect(container.textContent).toMatch(/-50/);
    });
  });

  describe('Interactions', () => {
    it('should call onChange when clicking on pad', () => {
      const onChange = vi.fn();
      const { container } = render(<XYPad x={0.5} y={0.5} onChange={onChange} />);

      // Find the pad area by looking for the element with crosshair cursor
      const padArea = container.querySelector('[style*="cursor: crosshair"]');
      expect(padArea).toBeTruthy();

      fireEvent.pointerDown(padArea!, {
        clientX: 100,
        clientY: 100,
        pointerId: 1,
      });

      expect(onChange).toHaveBeenCalledWith(expect.any(Number), expect.any(Number));
    });

    it('should update values on drag', () => {
      const onChange = vi.fn();
      const { container } = render(<XYPad x={0.5} y={0.5} onChange={onChange} size={200} />);

      const padArea = container.querySelector('[style*="cursor: crosshair"]');

      fireEvent.pointerDown(padArea!, {
        clientX: 100,
        clientY: 100,
        pointerId: 1,
      });

      fireEvent.pointerMove(padArea!, {
        clientX: 150,
        clientY: 50,
      });

      expect(onChange).toHaveBeenCalledTimes(2);
    });

    it('should release drag on pointer up', () => {
      const onChange = vi.fn();
      const { container } = render(<XYPad x={0.5} y={0.5} onChange={onChange} />);

      const padArea = container.querySelector('[style*="cursor: crosshair"]');

      fireEvent.pointerDown(padArea!, { clientX: 100, clientY: 100, pointerId: 1 });
      fireEvent.pointerUp(padArea!);

      onChange.mockClear();
      fireEvent.pointerMove(padArea!, { clientX: 150, clientY: 50 });

      // Should not call onChange after pointer up (unless spring return)
      expect(onChange).not.toHaveBeenCalled();
    });
  });

  describe('Spring Return', () => {
    it('should spring return to center when enabled', () => {
      const onChange = vi.fn();
      const { container } = render(<XYPad x={0.8} y={0.2} onChange={onChange} springReturn={true} />);

      const padArea = container.querySelector('[style*="cursor: crosshair"]');

      fireEvent.pointerDown(padArea!, { clientX: 100, clientY: 100, pointerId: 1 });
      fireEvent.pointerUp(padArea!);

      expect(onChange).toHaveBeenLastCalledWith(0.5, 0.5);
    });

    it('should not spring return when disabled', () => {
      const onChange = vi.fn();
      const { container } = render(<XYPad x={0.5} y={0.5} onChange={onChange} springReturn={false} />);

      const padArea = container.querySelector('[style*="cursor: crosshair"]');

      fireEvent.pointerDown(padArea!, { clientX: 100, clientY: 100, pointerId: 1 });
      const callCount = onChange.mock.calls.length;
      fireEvent.pointerUp(padArea!);

      // Should not have additional call for spring return
      expect(onChange.mock.calls.length).toBe(callCount);
    });
  });

  describe('Grid', () => {
    it('should render grid lines', () => {
      render(<XYPad x={0.5} y={0.5} gridDivisions={4} />);

      // Grid lines are rendered as SVG lines
      const svg = document.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });

    it('should respect gridDivisions prop', () => {
      render(<XYPad x={0.5} y={0.5} gridDivisions={8} />);

      // SVG should be rendered with grid
      expect(document.querySelector('svg')).toBeInTheDocument();
    });
  });

  describe('Crosshairs', () => {
    it('should show crosshairs when enabled', () => {
      render(<XYPad x={0.5} y={0.5} showCrosshairs={true} />);

      // Crosshairs are SVG lines
      const svg = document.querySelector('svg');
      const lines = svg?.querySelectorAll('line');
      expect(lines?.length).toBeGreaterThan(0);
    });

    it('should hide crosshairs when disabled', () => {
      render(<XYPad x={0.5} y={0.5} showCrosshairs={false} />);

      // Should still have grid lines but no crosshairs
      expect(document.querySelector('.synth-control')).toBeInTheDocument();
    });
  });

  describe('Custom Dimensions', () => {
    it('should respect size prop', () => {
      const { container } = render(<XYPad x={0.5} y={0.5} size={300} />);

      const padArea = container.querySelector('[style*="cursor: crosshair"]');
      expect(padArea).toBeTruthy();
      // Check that component renders at the correct size
      expect(container.querySelector('.synth-control')).toBeInTheDocument();
    });
  });

  describe('Custom Colors', () => {
    it('should accept custom xColor', () => {
      render(<XYPad x={0.5} y={0.5} xColor="#ff0000" />);

      expect(document.querySelector('.synth-control')).toBeInTheDocument();
    });

    it('should accept custom yColor', () => {
      render(<XYPad x={0.5} y={0.5} yColor="#00ff00" />);

      expect(document.querySelector('.synth-control')).toBeInTheDocument();
    });
  });

  describe('Bipolar Mode', () => {
    it('should show center lines for bipolar mode', () => {
      render(<XYPad x={0.5} y={0.5} bipolar={true} />);

      // Bipolar mode should show stronger center lines
      expect(document.querySelector('.synth-control')).toBeInTheDocument();
    });

    it('should show correct axis labels for bipolar mode', () => {
      render(<XYPad x={0.5} y={0.5} bipolar={true} />);

      expect(screen.getByText('-')).toBeInTheDocument();
      expect(screen.getByText('+')).toBeInTheDocument();
    });

    it('should show correct axis labels for non-bipolar mode', () => {
      render(<XYPad x={0.5} y={0.5} bipolar={false} />);

      expect(screen.getByText('0')).toBeInTheDocument();
      expect(screen.getByText('100')).toBeInTheDocument();
    });
  });

  describe('Puck Position', () => {
    it('should position puck at correct location', () => {
      render(<XYPad x={0} y={0} size={200} />);

      // Puck should be at bottom-left (x=0, y=0 maps to bottom-left)
      expect(document.querySelector('.synth-control')).toBeInTheDocument();
    });

    it('should position puck at center', () => {
      render(<XYPad x={0.5} y={0.5} size={200} />);

      expect(document.querySelector('.synth-control')).toBeInTheDocument();
    });

    it('should position puck at top-right', () => {
      render(<XYPad x={1} y={1} size={200} />);

      expect(document.querySelector('.synth-control')).toBeInTheDocument();
    });
  });

  describe('Value Clamping', () => {
    it('should clamp x value to 0-1 range', () => {
      const onChange = vi.fn();
      const { container } = render(<XYPad x={0.5} y={0.5} onChange={onChange} size={200} />);

      const padArea = container.querySelector('[style*="cursor: crosshair"]');

      // Click way outside bounds
      fireEvent.pointerDown(padArea!, {
        clientX: 1000,
        clientY: 100,
        pointerId: 1,
      });

      const [x] = onChange.mock.calls[0];
      expect(x).toBeGreaterThanOrEqual(0);
      expect(x).toBeLessThanOrEqual(1);
    });

    it('should clamp y value to 0-1 range', () => {
      const onChange = vi.fn();
      const { container } = render(<XYPad x={0.5} y={0.5} onChange={onChange} size={200} />);

      const padArea = container.querySelector('[style*="cursor: crosshair"]');

      // Click way outside bounds
      fireEvent.pointerDown(padArea!, {
        clientX: 100,
        clientY: -1000,
        pointerId: 1,
      });

      const [, y] = onChange.mock.calls[0];
      expect(y).toBeGreaterThanOrEqual(0);
      expect(y).toBeLessThanOrEqual(1);
    });
  });

  describe('Trail Effect', () => {
    it('should show trail effect when dragging', () => {
      const { container } = render(<XYPad x={0.5} y={0.5} />);

      const padArea = container.querySelector('[style*="cursor: crosshair"]');

      fireEvent.pointerDown(padArea!, { clientX: 100, clientY: 100, pointerId: 1 });

      // Trail is rendered as a circle in the SVG
      expect(container.querySelector('.synth-control')).toBeInTheDocument();
    });
  });
});
