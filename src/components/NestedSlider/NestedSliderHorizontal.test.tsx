import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '../../test/test-utils';
import userEvent from '@testing-library/user-event';
import { NestedSliderHorizontal } from './NestedSliderHorizontal';
import type { Parameter, ParameterWithOptions } from '../../types';

const createParameter = (overrides: Partial<Parameter> = {}): Parameter => ({
  id: 'test-param',
  name: 'Test',
  value: 0.5,
  defaultValue: 0.5,
  min: 0,
  max: 100,
  ...overrides,
});

describe('NestedSliderHorizontal', () => {
  describe('Rendering', () => {
    it('should render with label', () => {
      render(
        <NestedSliderHorizontal
          parameters={[createParameter()]}
          label="Test Label"
        />
      );

      expect(screen.getByText('Test Label')).toBeInTheDocument();
    });

    it('should render multiple parameters', () => {
      const params = [
        createParameter({ id: 'p1', name: 'Param 1' }),
        createParameter({ id: 'p2', name: 'Param 2' }),
        createParameter({ id: 'p3', name: 'Param 3' }),
      ];

      render(<NestedSliderHorizontal parameters={params} />);

      const sliders = screen.getAllByRole('slider');
      expect(sliders).toHaveLength(3);
    });

    it('should render with correct ARIA attributes', () => {
      render(
        <NestedSliderHorizontal
          parameters={[createParameter({ name: 'Volume', value: 0.75 })]}
        />
      );

      const slider = screen.getByRole('slider');
      expect(slider).toHaveAttribute('aria-label', 'Volume');
      expect(slider).toHaveAttribute('aria-valuenow', '75');
      expect(slider).toHaveAttribute('aria-valuemin', '0');
      expect(slider).toHaveAttribute('aria-valuemax', '100');
    });

    it('should show value when showValues is true', () => {
      render(
        <NestedSliderHorizontal
          parameters={[createParameter({ value: 0.5, min: 0, max: 100, unit: 'Hz' })]}
          showValues={true}
        />
      );

      // Hover to show value
      const slider = screen.getByRole('slider');
      fireEvent.mouseEnter(slider);

      expect(screen.getByText('50.0Hz')).toBeInTheDocument();
    });

    it('should not show value when showValues is false', () => {
      render(
        <NestedSliderHorizontal
          parameters={[createParameter({ value: 0.5, min: 0, max: 100, unit: 'Hz' })]}
          showValues={false}
        />
      );

      const slider = screen.getByRole('slider');
      fireEvent.mouseEnter(slider);

      expect(screen.queryByText('50.0Hz')).not.toBeInTheDocument();
    });
  });

  describe('Interactions', () => {
    it('should call onChange when clicking on slider', () => {
      const onChange = vi.fn();
      render(
        <NestedSliderHorizontal
          parameters={[createParameter({ id: 'volume' })]}
          onChange={onChange}
        />
      );

      const slider = screen.getByRole('slider');
      fireEvent.pointerDown(slider, { clientX: 100, pointerId: 1 });

      expect(onChange).toHaveBeenCalledWith('volume', expect.any(Number));
    });

    it('should reset to default value on double click', () => {
      const onChange = vi.fn();
      render(
        <NestedSliderHorizontal
          parameters={[createParameter({ id: 'volume', value: 0.8, defaultValue: 0.5 })]}
          onChange={onChange}
        />
      );

      const slider = screen.getByRole('slider');
      fireEvent.doubleClick(slider);

      expect(onChange).toHaveBeenCalledWith('volume', 0.5);
    });

    it('should handle keyboard navigation - arrow keys', () => {
      const onChange = vi.fn();

      render(
        <NestedSliderHorizontal
          parameters={[createParameter({ id: 'volume', value: 0.5 })]}
          onChange={onChange}
        />
      );

      const slider = screen.getByRole('slider');
      slider.focus();

      // ArrowRight should increase value from 0.5 to 0.51
      fireEvent.keyDown(slider, { key: 'ArrowRight' });
      expect(onChange).toHaveBeenCalledWith('volume', 0.51);

      // ArrowLeft from initial 0.5 goes to 0.49 (internal state starts fresh)
      fireEvent.keyDown(slider, { key: 'ArrowLeft' });
      // The second call should be with the internally tracked value
      expect(onChange).toHaveBeenCalledTimes(2);
    });

    it('should handle keyboard navigation - shift for larger steps', async () => {
      const onChange = vi.fn();
      const user = userEvent.setup();

      render(
        <NestedSliderHorizontal
          parameters={[createParameter({ id: 'volume', value: 0.5 })]}
          onChange={onChange}
        />
      );

      const slider = screen.getByRole('slider');
      slider.focus();

      await user.keyboard('{Shift>}{ArrowRight}{/Shift}');
      expect(onChange).toHaveBeenCalledWith('volume', 0.6);
    });

    it('should handle Home key to set minimum', async () => {
      const onChange = vi.fn();
      const user = userEvent.setup();

      render(
        <NestedSliderHorizontal
          parameters={[createParameter({ id: 'volume', value: 0.5 })]}
          onChange={onChange}
        />
      );

      const slider = screen.getByRole('slider');
      slider.focus();

      await user.keyboard('{Home}');
      expect(onChange).toHaveBeenCalledWith('volume', 0);
    });

    it('should handle End key to set maximum', async () => {
      const onChange = vi.fn();
      const user = userEvent.setup();

      render(
        <NestedSliderHorizontal
          parameters={[createParameter({ id: 'volume', value: 0.5 })]}
          onChange={onChange}
        />
      );

      const slider = screen.getByRole('slider');
      slider.focus();

      await user.keyboard('{End}');
      expect(onChange).toHaveBeenCalledWith('volume', 1);
    });

    it('should handle Delete key to reset to default', async () => {
      const onChange = vi.fn();
      const user = userEvent.setup();

      render(
        <NestedSliderHorizontal
          parameters={[createParameter({ id: 'volume', value: 0.8, defaultValue: 0.5 })]}
          onChange={onChange}
        />
      );

      const slider = screen.getByRole('slider');
      slider.focus();

      await user.keyboard('{Delete}');
      expect(onChange).toHaveBeenCalledWith('volume', 0.5);
    });
  });

  describe('Options', () => {
    it('should render option buttons for parameters with options', () => {
      const paramWithOptions: ParameterWithOptions = {
        id: 'waveform',
        name: 'Waveform',
        value: 0.5,
        defaultValue: 0.5,
        options: ['sine', 'saw', 'square'],
        selectedOption: 'sine',
      };

      render(
        <NestedSliderHorizontal
          parameters={[paramWithOptions]}
        />
      );

      expect(screen.getByText('sine')).toBeInTheDocument();
      expect(screen.getByText('saw')).toBeInTheDocument();
      expect(screen.getByText('square')).toBeInTheDocument();
    });

    it('should call onOptionChange when option is selected', async () => {
      const onOptionChange = vi.fn();
      const user = userEvent.setup();

      const paramWithOptions: ParameterWithOptions = {
        id: 'waveform',
        name: 'Waveform',
        value: 0.5,
        defaultValue: 0.5,
        options: ['sine', 'saw', 'square'],
        selectedOption: 'sine',
      };

      render(
        <NestedSliderHorizontal
          parameters={[paramWithOptions]}
          onOptionChange={onOptionChange}
        />
      );

      await user.click(screen.getByText('saw'));
      expect(onOptionChange).toHaveBeenCalledWith('waveform', 'saw');
    });
  });

  describe('Value formatting', () => {
    it('should format integer values without decimals', () => {
      render(
        <NestedSliderHorizontal
          parameters={[createParameter({ value: 0.5, min: 0, max: 100, step: 1 })]}
          showValues={true}
        />
      );

      const slider = screen.getByRole('slider');
      fireEvent.mouseEnter(slider);

      expect(screen.getByText('50')).toBeInTheDocument();
    });

    it('should include unit in display', () => {
      render(
        <NestedSliderHorizontal
          parameters={[createParameter({ value: 0.5, min: 20, max: 20000, unit: 'Hz' })]}
          showValues={true}
        />
      );

      const slider = screen.getByRole('slider');
      fireEvent.mouseEnter(slider);

      expect(screen.getByText(/Hz/)).toBeInTheDocument();
    });
  });
});
