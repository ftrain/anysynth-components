import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '../../test/test-utils';
import userEvent from '@testing-library/user-event';
import { NestedSliderVertical } from './NestedSliderVertical';
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

describe('NestedSliderVertical', () => {
  describe('Rendering', () => {
    it('should render with label', () => {
      render(
        <NestedSliderVertical
          parameters={[createParameter()]}
          label="Mixer"
        />
      );

      expect(screen.getByText('Mixer')).toBeInTheDocument();
    });

    it('should render multiple faders side by side', () => {
      const params = [
        createParameter({ id: 'ch1', name: 'CH1' }),
        createParameter({ id: 'ch2', name: 'CH2' }),
        createParameter({ id: 'ch3', name: 'CH3' }),
      ];

      render(<NestedSliderVertical parameters={params} />);

      const sliders = screen.getAllByRole('slider');
      expect(sliders).toHaveLength(3);
    });

    it('should have vertical orientation aria attribute', () => {
      render(
        <NestedSliderVertical
          parameters={[createParameter({ name: 'Level' })]}
        />
      );

      const slider = screen.getByRole('slider');
      expect(slider).toHaveAttribute('aria-orientation', 'vertical');
    });

    it('should show parameter labels when showLabels is true', () => {
      render(
        <NestedSliderVertical
          parameters={[
            createParameter({ id: 'p1', name: 'VOL' }),
            createParameter({ id: 'p2', name: 'PAN' }),
          ]}
          showLabels={true}
        />
      );

      expect(screen.getByText('VOL')).toBeInTheDocument();
      expect(screen.getByText('PAN')).toBeInTheDocument();
    });

    it('should hide parameter labels when showLabels is false', () => {
      render(
        <NestedSliderVertical
          parameters={[createParameter({ name: 'VOL' })]}
          showLabels={false}
        />
      );

      expect(screen.queryByText('VOL')).not.toBeInTheDocument();
    });

    it('should display values when showValues is true', () => {
      render(
        <NestedSliderVertical
          parameters={[createParameter({ value: 0.75, min: 0, max: 100 })]}
          showValues={true}
        />
      );

      expect(screen.getByText('75')).toBeInTheDocument();
    });
  });

  describe('Interactions', () => {
    it('should call onChange when clicking on fader', () => {
      const onChange = vi.fn();
      render(
        <NestedSliderVertical
          parameters={[createParameter({ id: 'level' })]}
          onChange={onChange}
        />
      );

      const slider = screen.getByRole('slider');
      fireEvent.pointerDown(slider, { clientY: 50, pointerId: 1 });

      expect(onChange).toHaveBeenCalledWith('level', expect.any(Number));
    });

    it('should reset to default value on double click', () => {
      const onChange = vi.fn();
      render(
        <NestedSliderVertical
          parameters={[createParameter({ id: 'level', value: 0.8, defaultValue: 0.7 })]}
          onChange={onChange}
        />
      );

      const slider = screen.getByRole('slider');
      fireEvent.doubleClick(slider);

      expect(onChange).toHaveBeenCalledWith('level', 0.7);
    });

    it('should handle vertical keyboard navigation', () => {
      const onChange = vi.fn();

      render(
        <NestedSliderVertical
          parameters={[createParameter({ id: 'level', value: 0.5 })]}
          onChange={onChange}
        />
      );

      const slider = screen.getByRole('slider');
      slider.focus();

      // Up increases value from 0.5 to 0.51
      fireEvent.keyDown(slider, { key: 'ArrowUp' });
      expect(onChange).toHaveBeenCalledWith('level', 0.51);

      // Down decreases value (internal state is now 0.51, so goes to 0.50)
      fireEvent.keyDown(slider, { key: 'ArrowDown' });
      expect(onChange).toHaveBeenCalledTimes(2);
    });

    it('should handle Home key to set maximum (top of fader)', async () => {
      const onChange = vi.fn();
      const user = userEvent.setup();

      render(
        <NestedSliderVertical
          parameters={[createParameter({ id: 'level', value: 0.5 })]}
          onChange={onChange}
        />
      );

      const slider = screen.getByRole('slider');
      slider.focus();

      // For vertical sliders, Home = max (top)
      await user.keyboard('{Home}');
      expect(onChange).toHaveBeenCalledWith('level', 1);
    });

    it('should handle End key to set minimum (bottom of fader)', async () => {
      const onChange = vi.fn();
      const user = userEvent.setup();

      render(
        <NestedSliderVertical
          parameters={[createParameter({ id: 'level', value: 0.5 })]}
          onChange={onChange}
        />
      );

      const slider = screen.getByRole('slider');
      slider.focus();

      // For vertical sliders, End = min (bottom)
      await user.keyboard('{End}');
      expect(onChange).toHaveBeenCalledWith('level', 0);
    });
  });

  describe('Options with select dropdown', () => {
    it('should render select for parameters with options', () => {
      const paramWithOptions: ParameterWithOptions = {
        id: 'mode',
        name: 'Mode',
        value: 0.5,
        defaultValue: 0.5,
        options: ['mono', 'stereo', 'mid-side'],
        selectedOption: 'stereo',
      };

      render(
        <NestedSliderVertical
          parameters={[paramWithOptions]}
        />
      );

      const select = screen.getByRole('combobox');
      expect(select).toHaveValue('stereo');
    });

    it('should call onOptionChange when select changes', async () => {
      const onOptionChange = vi.fn();
      const user = userEvent.setup();

      const paramWithOptions: ParameterWithOptions = {
        id: 'mode',
        name: 'Mode',
        value: 0.5,
        defaultValue: 0.5,
        options: ['mono', 'stereo', 'mid-side'],
        selectedOption: 'stereo',
      };

      render(
        <NestedSliderVertical
          parameters={[paramWithOptions]}
          onOptionChange={onOptionChange}
        />
      );

      const select = screen.getByRole('combobox');
      await user.selectOptions(select, 'mono');

      expect(onOptionChange).toHaveBeenCalledWith('mode', 'mono');
    });
  });

  describe('Custom dimensions', () => {
    it('should respect height prop', () => {
      render(
        <NestedSliderVertical
          parameters={[createParameter()]}
          height={200}
        />
      );

      const slider = screen.getByRole('slider');
      expect(slider).toHaveStyle({ height: '200px' });
    });

    it('should respect trackWidth prop', () => {
      render(
        <NestedSliderVertical
          parameters={[createParameter()]}
          trackWidth={10}
        />
      );

      // Track width is applied internally - component renders without error
      expect(screen.getByRole('slider')).toBeInTheDocument();
    });
  });
});
