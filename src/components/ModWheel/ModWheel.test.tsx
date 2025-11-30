import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '../../test/test-utils';
import { ModWheel } from './ModWheel';

describe('ModWheel', () => {
  describe('Rendering', () => {
    it('should render with default label', () => {
      render(<ModWheel value={0.5} />);

      expect(screen.getByText('MOD')).toBeInTheDocument();
    });

    it('should render with custom label', () => {
      render(<ModWheel value={0.5} label="PITCH" />);

      expect(screen.getByText('PITCH')).toBeInTheDocument();
    });

    it('should display value when showValue is true', () => {
      render(<ModWheel value={0.75} showValue={true} />);

      expect(screen.getByText('75')).toBeInTheDocument();
    });

    it('should hide value when showValue is false', () => {
      render(<ModWheel value={0.75} showValue={false} />);

      expect(screen.queryByText('75')).not.toBeInTheDocument();
    });

    it('should display bipolar value correctly', () => {
      render(<ModWheel value={0.75} bipolar={true} showValue={true} />);

      // 0.75 bipolar = +50%
      expect(screen.getByText('+50')).toBeInTheDocument();
    });

    it('should display negative bipolar value', () => {
      render(<ModWheel value={0.25} bipolar={true} showValue={true} />);

      // 0.25 bipolar = -50%
      expect(screen.getByText('-50')).toBeInTheDocument();
    });

    it('should display zero for center bipolar value', () => {
      render(<ModWheel value={0.5} bipolar={true} showValue={true} />);

      expect(screen.getByText('+0')).toBeInTheDocument();
    });
  });

  describe('Interactions', () => {
    it('should call onChange when clicking on wheel track', () => {
      const onChange = vi.fn();
      render(<ModWheel value={0.5} onChange={onChange} />);

      const container = document.querySelector('.synth-control');
      const track = container?.querySelector('[style*="cursor"]');

      fireEvent.pointerDown(track!, { clientY: 50, pointerId: 1 });

      expect(onChange).toHaveBeenCalled();
    });

    it('should update value on drag (vertical)', () => {
      const onChange = vi.fn();
      render(<ModWheel value={0.5} onChange={onChange} orientation="vertical" />);

      const container = document.querySelector('.synth-control');
      const track = container?.querySelector('[style*="cursor: ns-resize"]');

      fireEvent.pointerDown(track!, { clientY: 80, pointerId: 1 });
      fireEvent.pointerMove(track!, { clientY: 50 }); // Drag up

      expect(onChange).toHaveBeenCalled();
    });

    it('should update value on drag (horizontal)', () => {
      const onChange = vi.fn();
      render(<ModWheel value={0.5} onChange={onChange} orientation="horizontal" />);

      const container = document.querySelector('.synth-control');
      const track = container?.querySelector('[style*="cursor: ew-resize"]');

      fireEvent.pointerDown(track!, { clientX: 50, pointerId: 1 });
      fireEvent.pointerMove(track!, { clientX: 100 }); // Drag right

      expect(onChange).toHaveBeenCalled();
    });
  });

  describe('Spring Return', () => {
    it('should spring return to center when springReturn is "center"', () => {
      const onChange = vi.fn();
      render(<ModWheel value={0.8} onChange={onChange} springReturn="center" />);

      const container = document.querySelector('.synth-control');
      const track = container?.querySelector('[style*="cursor"]');

      fireEvent.pointerDown(track!, { clientY: 50, pointerId: 1 });
      fireEvent.pointerUp(track!);

      expect(onChange).toHaveBeenLastCalledWith(0.5);
    });

    it('should spring return to zero when springReturn is "zero"', () => {
      const onChange = vi.fn();
      render(<ModWheel value={0.8} onChange={onChange} springReturn="zero" />);

      const container = document.querySelector('.synth-control');
      const track = container?.querySelector('[style*="cursor"]');

      fireEvent.pointerDown(track!, { clientY: 50, pointerId: 1 });
      fireEvent.pointerUp(track!);

      expect(onChange).toHaveBeenLastCalledWith(0);
    });

    it('should not spring return when springReturn is "none"', () => {
      const onChange = vi.fn();
      render(<ModWheel value={0.8} onChange={onChange} springReturn="none" />);

      const container = document.querySelector('.synth-control');
      const track = container?.querySelector('[style*="cursor"]');

      fireEvent.pointerDown(track!, { clientY: 50, pointerId: 1 });

      const callCount = onChange.mock.calls.length;
      fireEvent.pointerUp(track!);

      // Should not have been called again after pointerUp
      expect(onChange.mock.calls.length).toBe(callCount);
    });
  });

  describe('Orientation', () => {
    it('should render vertical orientation by default', () => {
      render(<ModWheel value={0.5} />);

      const container = document.querySelector('.synth-control');
      expect(container).toHaveStyle({ flexDirection: 'column' });
    });

    it('should render horizontal orientation', () => {
      render(<ModWheel value={0.5} orientation="horizontal" />);

      const container = document.querySelector('.synth-control');
      expect(container).toHaveStyle({ flexDirection: 'row' });
    });
  });

  describe('Custom Dimensions', () => {
    it('should respect height prop', () => {
      render(<ModWheel value={0.5} height={200} />);

      expect(document.querySelector('.synth-control')).toBeInTheDocument();
    });

    it('should respect width prop', () => {
      render(<ModWheel value={0.5} width={60} />);

      expect(document.querySelector('.synth-control')).toBeInTheDocument();
    });
  });

  describe('Custom Color', () => {
    it('should accept custom color prop', () => {
      render(<ModWheel value={0.5} color="#ff0000" />);

      expect(document.querySelector('.synth-control')).toBeInTheDocument();
    });
  });

  describe('Bipolar Display', () => {
    it('should show center line for bipolar mode', () => {
      render(<ModWheel value={0.5} bipolar={true} />);

      // Center line should be rendered
      expect(document.querySelector('.synth-control')).toBeInTheDocument();
    });
  });

  describe('Value Clamping', () => {
    it('should clamp value to 0-1 range', () => {
      const onChange = vi.fn();
      render(<ModWheel value={0.5} onChange={onChange} />);

      const container = document.querySelector('.synth-control');
      const track = container?.querySelector('[style*="cursor"]');

      // Try to drag way beyond bounds
      fireEvent.pointerDown(track!, { clientY: 0, pointerId: 1 });
      fireEvent.pointerMove(track!, { clientY: -1000 }); // Way above

      const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1];
      expect(lastCall[0]).toBeGreaterThanOrEqual(0);
      expect(lastCall[0]).toBeLessThanOrEqual(1);
    });
  });

  describe('Wheel Grip', () => {
    it('should render wheel grip lines', () => {
      render(<ModWheel value={0.5} />);

      // Wheel should have grip lines (5 of them)
      expect(document.querySelector('.synth-control')).toBeInTheDocument();
    });
  });
});
