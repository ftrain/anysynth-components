/**
 * Slider - A simple, reusable slider component
 *
 * Works like a normal slider:
 * - Horizontal: drag left/right to change value
 * - Vertical: drag up/down to change value
 */

import React, { useCallback, useRef, useState } from 'react';
import { colors, type ColorAccent } from '../../theme/tokens';

export interface SliderProps {
  /** Current value (0-1) */
  value: number;
  /** Called when value changes */
  onChange?: (value: number) => void;
  /** Orientation */
  orientation?: 'horizontal' | 'vertical';
  /** Track length in pixels or CSS value (e.g., '100%') */
  length?: number | string;
  /** Track thickness in pixels */
  thickness?: number;
  /** Accent color */
  color?: ColorAccent;
  /** Show value label */
  showValue?: boolean;
  /** Format value for display */
  formatValue?: (value: number) => string;
  /** Label text */
  label?: string;
  /** ARIA label for accessibility (defaults to label) */
  ariaLabel?: string;
  /** Default value for reset (double-click, Delete key) */
  defaultValue?: number;
  /** Disabled state */
  disabled?: boolean;
  /** Bipolar mode (center is 0.5) */
  bipolar?: boolean;
}

export const Slider: React.FC<SliderProps> = ({
  value,
  onChange,
  orientation = 'horizontal',
  length = 120,
  thickness = 8,
  color = 'cyan',
  showValue = false,
  formatValue = (v) => Math.round(v * 100).toString(),
  label,
  ariaLabel,
  defaultValue,
  disabled = false,
  bipolar = false,
}) => {
  // Compute the reset value: explicit defaultValue > bipolar center > 0
  const resetValue = defaultValue ?? (bipolar ? 0.5 : 0);
  const trackRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const accentColor = colors.accent[color];
  const isHorizontal = orientation === 'horizontal';

  const getValueFromPosition = useCallback((clientX: number, clientY: number): number => {
    if (!trackRef.current) return value;

    const rect = trackRef.current.getBoundingClientRect();
    let ratio: number;

    if (isHorizontal) {
      ratio = (clientX - rect.left) / rect.width;
    } else {
      // Vertical: top is 1, bottom is 0
      ratio = 1 - (clientY - rect.top) / rect.height;
    }

    return Math.max(0, Math.min(1, ratio));
  }, [isHorizontal, value]);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (disabled) return;
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    setIsDragging(true);

    const newValue = getValueFromPosition(e.clientX, e.clientY);
    onChange?.(newValue);
  }, [disabled, getValueFromPosition, onChange]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging || disabled) return;

    const newValue = getValueFromPosition(e.clientX, e.clientY);
    onChange?.(newValue);
  }, [isDragging, disabled, getValueFromPosition, onChange]);

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    e.currentTarget.releasePointerCapture(e.pointerId);
    setIsDragging(false);
  }, []);

  const handleDoubleClick = useCallback(() => {
    if (disabled) return;
    onChange?.(resetValue);
  }, [disabled, onChange, resetValue]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (disabled) return;

    const step = e.shiftKey ? 0.1 : 0.01;
    let newValue = value;

    switch (e.key) {
      case 'ArrowRight':
      case 'ArrowUp':
        e.preventDefault();
        newValue = Math.min(1, value + step);
        break;
      case 'ArrowLeft':
      case 'ArrowDown':
        e.preventDefault();
        newValue = Math.max(0, value - step);
        break;
      case 'Home':
        e.preventDefault();
        newValue = 0;
        break;
      case 'End':
        e.preventDefault();
        newValue = 1;
        break;
      case 'Delete':
      case 'Backspace':
        e.preventDefault();
        newValue = resetValue;
        break;
      default:
        return;
    }

    onChange?.(newValue);
  }, [disabled, value, onChange, resetValue]);

  // Calculate fill position
  const fillPercent = value * 100;

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: isHorizontal ? 'column' : 'row',
    alignItems: 'center',
    gap: 6,
    opacity: disabled ? 0.5 : 1,
    cursor: disabled ? 'not-allowed' : 'pointer',
  };

  const trackStyle: React.CSSProperties = {
    position: 'relative',
    width: isHorizontal ? length : thickness,
    height: isHorizontal ? thickness : length,
    background: colors.bg.elevated,
    borderRadius: thickness / 2,
    overflow: 'hidden',
  };

  const fillStyle: React.CSSProperties = {
    position: 'absolute',
    background: accentColor,
    borderRadius: thickness / 2,
    transition: isDragging ? 'none' : 'all 50ms',
    opacity: isDragging ? 1 : isHovered ? 0.9 : 0.8,
    ...(isHorizontal
      ? {
          left: bipolar ? `${Math.min(50, fillPercent)}%` : 0,
          top: 0,
          bottom: 0,
          width: bipolar ? `${Math.abs(fillPercent - 50)}%` : `${fillPercent}%`,
        }
      : {
          left: 0,
          right: 0,
          bottom: bipolar ? `${Math.min(50, fillPercent)}%` : 0,
          height: bipolar ? `${Math.abs(fillPercent - 50)}%` : `${fillPercent}%`,
        }),
  };

  const labelStyle: React.CSSProperties = {
    fontSize: 10,
    fontFamily: 'var(--font-mono)',
    color: colors.text.muted,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    whiteSpace: 'nowrap',
  };

  const valueStyle: React.CSSProperties = {
    fontSize: 11,
    fontFamily: 'var(--font-mono)',
    color: isDragging ? accentColor : colors.text.secondary,
    fontWeight: isDragging ? 600 : 400,
    minWidth: 28,
    textAlign: 'center',
  };

  return (
    <div style={containerStyle}>
      {label && <div style={labelStyle}>{label}</div>}
      <div
        ref={trackRef}
        style={{ ...trackStyle, touchAction: 'none' }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onDoubleClick={handleDoubleClick}
        onKeyDown={handleKeyDown}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        tabIndex={disabled ? -1 : 0}
        role="slider"
        aria-label={ariaLabel || label}
        aria-valuenow={Math.round(value * 100)}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div style={fillStyle} />
      </div>
      {showValue && <div style={valueStyle}>{formatValue(value)}</div>}
    </div>
  );
};

export default Slider;
