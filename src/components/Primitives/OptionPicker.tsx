/**
 * OptionPicker - A clickable option selector
 *
 * Displays options as buttons that can be clicked to select.
 * Supports horizontal row, vertical stack, or grid layouts.
 */

import React from 'react';
import { colors, type ColorAccent } from '../../theme/tokens';

export interface OptionPickerProps {
  /** Available options */
  options: string[];
  /** Currently selected option */
  value: string;
  /** Called when selection changes */
  onChange?: (value: string) => void;
  /** Layout mode */
  layout?: 'horizontal' | 'vertical' | 'grid';
  /** Number of columns for grid layout */
  columns?: number;
  /** Accent color for selected option */
  color?: ColorAccent;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Label text */
  label?: string;
  /** Disabled state */
  disabled?: boolean;
}

export const OptionPicker: React.FC<OptionPickerProps> = ({
  options,
  value,
  onChange,
  layout = 'horizontal',
  columns = 2,
  color = 'yellow',
  size = 'md',
  label,
  disabled = false,
}) => {
  const accentColor = colors.accent[color];

  const sizes = {
    sm: { padding: '4px 8px', fontSize: 9, gap: 4 },
    md: { padding: '6px 12px', fontSize: 10, gap: 6 },
    lg: { padding: '8px 16px', fontSize: 11, gap: 8 },
  };

  const sizeConfig = sizes[size];

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
    opacity: disabled ? 0.5 : 1,
  };

  const optionsContainerStyle: React.CSSProperties = {
    display: layout === 'grid' ? 'grid' : 'flex',
    flexDirection: layout === 'vertical' ? 'column' : 'row',
    flexWrap: layout === 'horizontal' ? 'wrap' : undefined,
    gridTemplateColumns: layout === 'grid' ? `repeat(${columns}, 1fr)` : undefined,
    gap: sizeConfig.gap,
  };

  const labelStyle: React.CSSProperties = {
    fontSize: 10,
    fontFamily: 'var(--font-mono)',
    color: colors.text.muted,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  };

  const getOptionStyle = (opt: string): React.CSSProperties => {
    const isSelected = opt === value;
    return {
      padding: sizeConfig.padding,
      fontSize: sizeConfig.fontSize,
      fontFamily: 'var(--font-mono)',
      fontWeight: isSelected ? 600 : 400,
      color: isSelected ? colors.bg.base : colors.text.secondary,
      background: isSelected ? accentColor : colors.bg.elevated,
      border: `1px solid ${isSelected ? accentColor : colors.bg.border}`,
      borderRadius: 4,
      cursor: disabled ? 'not-allowed' : 'pointer',
      textTransform: 'capitalize' as const,
      textAlign: 'center' as const,
      transition: 'all 100ms',
      whiteSpace: 'nowrap' as const,
    };
  };

  return (
    <div style={containerStyle}>
      {label && <div style={labelStyle}>{label}</div>}
      <div style={optionsContainerStyle}>
        {options.map((opt) => (
          <button
            key={opt}
            style={getOptionStyle(opt)}
            onClick={() => !disabled && onChange?.(opt)}
            disabled={disabled}
            type="button"
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
};

export default OptionPicker;
