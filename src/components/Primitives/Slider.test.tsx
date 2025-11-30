import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '../../test/test-utils';
import userEvent from '@testing-library/user-event';
import { Slider } from './Slider';

describe('Slider', () => {
  describe('Rendering', () => {
    it('should render with default props', () => {
      render(<Slider value={0.5} />);
      expect(screen.getByRole('slider')).toBeInTheDocument();
    });

    it('should render with label', () => {
      render(<Slider value={0.5} label="VOLUME" />);
      expect(screen.getByText('VOLUME')).toBeInTheDocument();
    });

    it('should render with value display', () => {
      render(<Slider value={0.75} showValue />);
      expect(screen.getByText('75')).toBeInTheDocument();
    });

    it('should render with custom format', () => {
      render(
        <Slider
          value={0.5}
          showValue
          formatValue={(v) => `${Math.round(v * 100)}%`}
        />
      );
      expect(screen.getByText('50%')).toBeInTheDocument();
    });

    it('should have correct ARIA attributes', () => {
      render(<Slider value={0.75} label="Test" />);
      const slider = screen.getByRole('slider');
      expect(slider).toHaveAttribute('aria-valuenow', '75');
      expect(slider).toHaveAttribute('aria-valuemin', '0');
      expect(slider).toHaveAttribute('aria-valuemax', '100');
      expect(slider).toHaveAttribute('aria-label', 'Test');
    });

    it('should use ariaLabel over label for accessibility', () => {
      render(<Slider value={0.5} label="Display" ariaLabel="Accessible Name" />);
      const slider = screen.getByRole('slider');
      expect(slider).toHaveAttribute('aria-label', 'Accessible Name');
      expect(screen.getByText('Display')).toBeInTheDocument();
    });

    it('should render disabled state', () => {
      render(<Slider value={0.5} disabled />);
      const slider = screen.getByRole('slider');
      expect(slider).toHaveAttribute('tabIndex', '-1');
    });
  });

  describe('Interactions', () => {
    it('should call onChange when clicked', () => {
      const onChange = vi.fn();
      render(<Slider value={0.5} onChange={onChange} />);

      const slider = screen.getByRole('slider');
      fireEvent.pointerDown(slider, { clientX: 60, clientY: 4 });

      expect(onChange).toHaveBeenCalled();
    });

    it('should reset to default on double click', () => {
      const onChange = vi.fn();
      render(<Slider value={0.8} onChange={onChange} defaultValue={0.5} />);

      const slider = screen.getByRole('slider');
      fireEvent.doubleClick(slider);

      expect(onChange).toHaveBeenCalledWith(0.5);
    });

    it('should reset to 0 on double click when no default', () => {
      const onChange = vi.fn();
      render(<Slider value={0.8} onChange={onChange} />);

      const slider = screen.getByRole('slider');
      fireEvent.doubleClick(slider);

      expect(onChange).toHaveBeenCalledWith(0);
    });

    it('should reset to 0.5 on double click in bipolar mode', () => {
      const onChange = vi.fn();
      render(<Slider value={0.8} onChange={onChange} bipolar />);

      const slider = screen.getByRole('slider');
      fireEvent.doubleClick(slider);

      expect(onChange).toHaveBeenCalledWith(0.5);
    });

    it('should not call onChange when disabled', () => {
      const onChange = vi.fn();
      render(<Slider value={0.5} onChange={onChange} disabled />);

      const slider = screen.getByRole('slider');
      fireEvent.pointerDown(slider, { clientX: 60, clientY: 4 });

      expect(onChange).not.toHaveBeenCalled();
    });
  });

  describe('Keyboard Navigation', () => {
    it('should increase value with ArrowRight', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(<Slider value={0.5} onChange={onChange} />);

      const slider = screen.getByRole('slider');
      slider.focus();
      await user.keyboard('{ArrowRight}');

      expect(onChange).toHaveBeenCalledWith(0.51);
    });

    it('should decrease value with ArrowLeft', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(<Slider value={0.5} onChange={onChange} />);

      const slider = screen.getByRole('slider');
      slider.focus();
      await user.keyboard('{ArrowLeft}');

      expect(onChange).toHaveBeenCalledWith(0.49);
    });

    it('should increase value with ArrowUp', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(<Slider value={0.5} onChange={onChange} />);

      const slider = screen.getByRole('slider');
      slider.focus();
      await user.keyboard('{ArrowUp}');

      expect(onChange).toHaveBeenCalledWith(0.51);
    });

    it('should use large step with Shift', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(<Slider value={0.5} onChange={onChange} />);

      const slider = screen.getByRole('slider');
      slider.focus();
      await user.keyboard('{Shift>}{ArrowRight}{/Shift}');

      expect(onChange).toHaveBeenCalledWith(0.6);
    });

    it('should go to min with Home', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(<Slider value={0.5} onChange={onChange} />);

      const slider = screen.getByRole('slider');
      slider.focus();
      await user.keyboard('{Home}');

      expect(onChange).toHaveBeenCalledWith(0);
    });

    it('should go to max with End', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(<Slider value={0.5} onChange={onChange} />);

      const slider = screen.getByRole('slider');
      slider.focus();
      await user.keyboard('{End}');

      expect(onChange).toHaveBeenCalledWith(1);
    });

    it('should reset with Delete', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(<Slider value={0.8} onChange={onChange} defaultValue={0.5} />);

      const slider = screen.getByRole('slider');
      slider.focus();
      await user.keyboard('{Delete}');

      expect(onChange).toHaveBeenCalledWith(0.5);
    });

    it('should not respond to keyboard when disabled', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(<Slider value={0.5} onChange={onChange} disabled />);

      const slider = screen.getByRole('slider');
      slider.focus();
      await user.keyboard('{ArrowRight}');

      expect(onChange).not.toHaveBeenCalled();
    });
  });

  describe('Orientations', () => {
    it('should render horizontal by default', () => {
      render(<Slider value={0.5} />);
      const slider = screen.getByRole('slider');
      // Horizontal slider has width style
      expect(slider).toBeInTheDocument();
    });

    it('should render vertical orientation', () => {
      render(<Slider value={0.5} orientation="vertical" />);
      const slider = screen.getByRole('slider');
      expect(slider).toBeInTheDocument();
    });
  });

  describe('Colors', () => {
    it('should accept different color props', () => {
      const { rerender } = render(<Slider value={0.5} color="coral" />);
      expect(screen.getByRole('slider')).toBeInTheDocument();

      rerender(<Slider value={0.5} color="cyan" />);
      expect(screen.getByRole('slider')).toBeInTheDocument();

      rerender(<Slider value={0.5} color="purple" />);
      expect(screen.getByRole('slider')).toBeInTheDocument();
    });
  });
});
