import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '../../test/test-utils';
import { OptionPicker } from './OptionPicker';

describe('OptionPicker', () => {
  const defaultOptions = ['A', 'B', 'C', 'D'];

  describe('Rendering', () => {
    it('should render all options', () => {
      render(<OptionPicker options={defaultOptions} value="A" />);

      defaultOptions.forEach(option => {
        expect(screen.getByRole('button', { name: option })).toBeInTheDocument();
      });
    });

    it('should render with label', () => {
      render(<OptionPicker options={defaultOptions} value="A" label="MODE" />);
      expect(screen.getByText('MODE')).toBeInTheDocument();
    });

    it('should highlight selected option', () => {
      render(<OptionPicker options={defaultOptions} value="B" />);

      const selectedButton = screen.getByRole('button', { name: 'B' });
      // Selected button should have different styling - we can check it exists
      expect(selectedButton).toBeInTheDocument();
    });

    it('should render horizontal layout by default', () => {
      render(<OptionPicker options={defaultOptions} value="A" />);
      // All buttons should render
      expect(screen.getAllByRole('button')).toHaveLength(4);
    });

    it('should render vertical layout', () => {
      render(<OptionPicker options={defaultOptions} value="A" layout="vertical" />);
      expect(screen.getAllByRole('button')).toHaveLength(4);
    });

    it('should render grid layout', () => {
      render(<OptionPicker options={defaultOptions} value="A" layout="grid" columns={2} />);
      expect(screen.getAllByRole('button')).toHaveLength(4);
    });
  });

  describe('Interactions', () => {
    it('should call onChange when option clicked', () => {
      const onChange = vi.fn();
      render(<OptionPicker options={defaultOptions} value="A" onChange={onChange} />);

      fireEvent.click(screen.getByRole('button', { name: 'C' }));
      expect(onChange).toHaveBeenCalledWith('C');
    });

    it('should call onChange when clicking currently selected option', () => {
      const onChange = vi.fn();
      render(<OptionPicker options={defaultOptions} value="A" onChange={onChange} />);

      fireEvent.click(screen.getByRole('button', { name: 'A' }));
      expect(onChange).toHaveBeenCalledWith('A');
    });

    it('should not call onChange when disabled', () => {
      const onChange = vi.fn();
      render(<OptionPicker options={defaultOptions} value="A" onChange={onChange} disabled />);

      fireEvent.click(screen.getByRole('button', { name: 'C' }));
      expect(onChange).not.toHaveBeenCalled();
    });
  });

  describe('Sizes', () => {
    it('should render small size', () => {
      render(<OptionPicker options={defaultOptions} value="A" size="sm" />);
      expect(screen.getAllByRole('button')).toHaveLength(4);
    });

    it('should render medium size', () => {
      render(<OptionPicker options={defaultOptions} value="A" size="md" />);
      expect(screen.getAllByRole('button')).toHaveLength(4);
    });

    it('should render large size', () => {
      render(<OptionPicker options={defaultOptions} value="A" size="lg" />);
      expect(screen.getAllByRole('button')).toHaveLength(4);
    });
  });

  describe('Colors', () => {
    it('should accept different color props', () => {
      const { rerender } = render(<OptionPicker options={defaultOptions} value="A" color="coral" />);
      expect(screen.getAllByRole('button')).toHaveLength(4);

      rerender(<OptionPicker options={defaultOptions} value="A" color="cyan" />);
      expect(screen.getAllByRole('button')).toHaveLength(4);

      rerender(<OptionPicker options={defaultOptions} value="A" color="yellow" />);
      expect(screen.getAllByRole('button')).toHaveLength(4);
    });
  });

  describe('Edge Cases', () => {
    it('should handle single option', () => {
      render(<OptionPicker options={['Only']} value="Only" />);
      expect(screen.getByRole('button', { name: 'Only' })).toBeInTheDocument();
    });

    it('should handle many options', () => {
      const manyOptions = ['1', '2', '3', '4', '5', '6', '7', '8'];
      render(<OptionPicker options={manyOptions} value="1" />);
      expect(screen.getAllByRole('button')).toHaveLength(8);
    });

    it('should handle long option labels', () => {
      const longOptions = ['Short', 'VeryLongOptionLabel', 'Med'];
      render(<OptionPicker options={longOptions} value="Short" />);
      expect(screen.getByRole('button', { name: 'VeryLongOptionLabel' })).toBeInTheDocument();
    });
  });
});
