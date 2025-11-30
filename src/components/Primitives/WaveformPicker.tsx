/**
 * WaveformPicker - Visual waveform shape selector
 *
 * Displays waveform shapes as clickable SVG icons.
 */

import React from 'react';
import { colors, type ColorAccent } from '../../theme/tokens';

export type WaveformShape = 'sine' | 'triangle' | 'saw' | 'square' | 'noise';

export interface WaveformPickerProps {
  /** Currently selected waveform */
  value: WaveformShape;
  /** Called when selection changes */
  onChange?: (value: WaveformShape) => void;
  /** Available waveforms (defaults to all) */
  options?: WaveformShape[];
  /** Accent color for selected waveform */
  color?: ColorAccent;
  /** Size of each waveform icon */
  iconSize?: number;
  /** Layout mode */
  layout?: 'horizontal' | 'vertical' | 'grid';
  /** Label text */
  label?: string;
  /** Disabled state */
  disabled?: boolean;
}

const WaveformIcon: React.FC<{
  shape: WaveformShape;
  size: number;
  color: string;
  selected: boolean;
}> = ({ shape, size, color, selected }) => {
  const strokeWidth = selected ? 2.5 : 2;
  const strokeColor = selected ? color : colors.text.muted;
  const padding = 4;
  const w = size - padding * 2;
  const h = size - padding * 2;
  const midY = size / 2;

  const paths: Record<WaveformShape, string> = {
    sine: `M ${padding} ${midY} Q ${padding + w * 0.25} ${padding} ${padding + w * 0.5} ${midY} Q ${padding + w * 0.75} ${size - padding} ${size - padding} ${midY}`,
    triangle: `M ${padding} ${midY} L ${padding + w * 0.25} ${padding} L ${padding + w * 0.75} ${size - padding} L ${size - padding} ${midY}`,
    saw: `M ${padding} ${size - padding} L ${padding + w * 0.5} ${padding} L ${padding + w * 0.5} ${size - padding} L ${size - padding} ${padding}`,
    square: `M ${padding} ${size - padding} L ${padding} ${padding} L ${padding + w * 0.5} ${padding} L ${padding + w * 0.5} ${size - padding} L ${size - padding} ${size - padding} L ${size - padding} ${padding}`,
    noise: `M ${padding} ${midY} L ${padding + w * 0.1} ${padding + h * 0.3} L ${padding + w * 0.2} ${padding + h * 0.7} L ${padding + w * 0.3} ${padding + h * 0.2} L ${padding + w * 0.4} ${padding + h * 0.8} L ${padding + w * 0.5} ${padding + h * 0.4} L ${padding + w * 0.6} ${padding + h * 0.6} L ${padding + w * 0.7} ${padding + h * 0.25} L ${padding + w * 0.8} ${padding + h * 0.75} L ${padding + w * 0.9} ${padding + h * 0.35} L ${size - padding} ${midY}`,
  };

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <path
        d={paths[shape]}
        fill="none"
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export const WaveformPicker: React.FC<WaveformPickerProps> = ({
  value,
  onChange,
  options = ['sine', 'triangle', 'saw', 'square', 'noise'],
  color = 'yellow',
  iconSize = 32,
  layout = 'horizontal',
  label,
  disabled = false,
}) => {
  const accentColor = colors.accent[color];

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
    opacity: disabled ? 0.5 : 1,
  };

  const optionsStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: layout === 'vertical' ? 'column' : 'row',
    flexWrap: layout === 'grid' ? 'wrap' : undefined,
    gap: 4,
  };

  const labelStyle: React.CSSProperties = {
    fontSize: 10,
    fontFamily: 'var(--font-mono)',
    color: colors.text.muted,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  };

  const getButtonStyle = (shape: WaveformShape): React.CSSProperties => {
    const isSelected = shape === value;
    return {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: iconSize + 8,
      height: iconSize + 8,
      padding: 4,
      background: isSelected ? `${accentColor}20` : colors.bg.elevated,
      border: `1px solid ${isSelected ? accentColor : colors.bg.border}`,
      borderRadius: 4,
      cursor: disabled ? 'not-allowed' : 'pointer',
      transition: 'all 100ms',
    };
  };

  return (
    <div style={containerStyle}>
      {label && <div style={labelStyle}>{label}</div>}
      <div style={optionsStyle}>
        {options.map((shape) => (
          <button
            key={shape}
            style={getButtonStyle(shape)}
            onClick={() => !disabled && onChange?.(shape)}
            disabled={disabled}
            type="button"
            title={shape.charAt(0).toUpperCase() + shape.slice(1)}
          >
            <WaveformIcon
              shape={shape}
              size={iconSize}
              color={accentColor}
              selected={shape === value}
            />
          </button>
        ))}
      </div>
    </div>
  );
};

export default WaveformPicker;
