/**
 * ModWheel
 *
 * Modulation wheel with spring-return option.
 * Essential performance control for expressive playing.
 */

import React, { useState, useCallback, useRef } from 'react';
import { colors } from '../../theme/tokens';

interface ModWheelProps {
  /** Current value (0-1) */
  value: number;
  /** Called when value changes */
  onChange?: (value: number) => void;
  /** Spring return to center or zero */
  springReturn?: 'none' | 'center' | 'zero';
  /** Label text */
  label?: string;
  /** Wheel color */
  color?: string;
  /** Height in pixels */
  height?: number;
  /** Width in pixels */
  width?: number;
  /** Horizontal or vertical orientation */
  orientation?: 'vertical' | 'horizontal';
  /** Show value display */
  showValue?: boolean;
  /** Bipolar display (-1 to 1) */
  bipolar?: boolean;
}

export const ModWheel: React.FC<ModWheelProps> = ({
  value,
  onChange,
  springReturn = 'none',
  label = 'MOD',
  color = colors.accent.cyan,
  height = 160,
  width = 48,
  orientation = 'vertical',
  showValue = true,
  bipolar = false,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragStartRef = useRef<{ pos: number; value: number } | null>(null);

  const isVertical = orientation === 'vertical';
  const trackLength = isVertical ? height : width;
  const trackThickness = isVertical ? width : height;

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    setIsDragging(true);

    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const pos = isVertical
      ? e.clientY - rect.top
      : e.clientX - rect.left;

    // Click to position
    const normalizedPos = isVertical
      ? 1 - pos / trackLength
      : pos / trackLength;
    const newValue = Math.max(0, Math.min(1, normalizedPos));
    onChange?.(newValue);

    dragStartRef.current = { pos: isVertical ? e.clientY : e.clientX, value: newValue };
  }, [isVertical, trackLength, onChange]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging || !dragStartRef.current) return;

    const delta = isVertical
      ? dragStartRef.current.pos - e.clientY
      : e.clientX - dragStartRef.current.pos;

    const sensitivity = 1 / trackLength;
    const newValue = Math.max(0, Math.min(1, dragStartRef.current.value + delta * sensitivity));

    dragStartRef.current = {
      pos: isVertical ? e.clientY : e.clientX,
      value: newValue,
    };

    onChange?.(newValue);
  }, [isDragging, isVertical, trackLength, onChange]);

  const handlePointerUp = useCallback(() => {
    setIsDragging(false);
    dragStartRef.current = null;

    // Spring return behavior
    if (springReturn === 'center') {
      onChange?.(0.5);
    } else if (springReturn === 'zero') {
      onChange?.(0);
    }
  }, [springReturn, onChange]);

  const formatValue = (): string => {
    if (bipolar) {
      const bipolarValue = (value - 0.5) * 2;
      return bipolarValue >= 0 ? `+${(bipolarValue * 100).toFixed(0)}` : `${(bipolarValue * 100).toFixed(0)}`;
    }
    return `${Math.round(value * 100)}`;
  };

  // Calculate wheel position
  const wheelPosition = isVertical
    ? (1 - value) * (trackLength - 40) // 40 = wheel height
    : value * (trackLength - 40);

  return (
    <div
      ref={containerRef}
      className="synth-control"
      style={{
        display: 'flex',
        flexDirection: isVertical ? 'column' : 'row',
        alignItems: 'center',
        gap: 8,
        padding: 12,
        background: colors.bg.surface,
        borderRadius: 8,
      }}
    >
      {/* Label */}
      <span style={{
        fontFamily: 'var(--font-mono)',
        fontSize: 'var(--text-xs)',
        color: colors.text.muted,
        textTransform: 'uppercase',
        letterSpacing: '0.1em',
        writingMode: isVertical ? 'horizontal-tb' : 'vertical-rl',
      }}>
        {label}
      </span>

      {/* Wheel track */}
      <div
        style={{
          position: 'relative',
          width: isVertical ? trackThickness : trackLength,
          height: isVertical ? trackLength : trackThickness,
          background: colors.bg.elevated,
          borderRadius: 4,
          cursor: isVertical ? 'ns-resize' : 'ew-resize',
          overflow: 'hidden',
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        {/* Value fill */}
        <div style={{
          position: 'absolute',
          ...(isVertical ? {
            left: 4,
            right: 4,
            bottom: 0,
            height: `${value * 100}%`,
          } : {
            top: 4,
            bottom: 4,
            left: 0,
            width: `${value * 100}%`,
          }),
          background: `linear-gradient(${isVertical ? '0deg' : '90deg'}, ${color}40 0%, ${color}80 100%)`,
          borderRadius: 2,
          transition: isDragging ? 'none' : 'all 100ms',
        }} />

        {/* Center line for bipolar */}
        {bipolar && (
          <div style={{
            position: 'absolute',
            ...(isVertical ? {
              left: 0,
              right: 0,
              top: '50%',
              height: 1,
            } : {
              top: 0,
              bottom: 0,
              left: '50%',
              width: 1,
            }),
            background: colors.bg.border,
          }} />
        )}

        {/* Wheel/thumb */}
        <div style={{
          position: 'absolute',
          ...(isVertical ? {
            left: 2,
            right: 2,
            top: wheelPosition,
            height: 40,
          } : {
            top: 2,
            bottom: 2,
            left: wheelPosition,
            width: 40,
          }),
          background: `linear-gradient(${isVertical ? '180deg' : '90deg'},
            ${colors.bg.highlight} 0%,
            ${colors.bg.surface} 20%,
            ${colors.bg.elevated} 50%,
            ${colors.bg.surface} 80%,
            ${colors.bg.highlight} 100%)`,
          borderRadius: 4,
          border: `1px solid ${isDragging ? color : colors.bg.border}`,
          boxShadow: isDragging ? `0 0 8px ${color}40` : 'none',
          transition: isDragging ? 'none' : 'border-color 100ms, box-shadow 100ms',
        }}>
          {/* Wheel grip lines */}
          <div style={{
            position: 'absolute',
            inset: isVertical ? '8px 6px' : '6px 8px',
            display: 'flex',
            flexDirection: isVertical ? 'column' : 'row',
            justifyContent: 'space-between',
          }}>
            {[0, 1, 2, 3, 4].map(i => (
              <div
                key={i}
                style={{
                  ...(isVertical ? {
                    height: 1,
                    width: '100%',
                  } : {
                    width: 1,
                    height: '100%',
                  }),
                  background: colors.bg.border,
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Value display */}
      {showValue && (
        <span style={{
          fontFamily: 'var(--font-numeric)',
          fontSize: 'var(--text-sm)',
          color: isDragging ? colors.text.primary : colors.text.secondary,
          minWidth: 40,
          textAlign: 'center',
        }}>
          {formatValue()}
        </span>
      )}
    </div>
  );
};

export default ModWheel;
