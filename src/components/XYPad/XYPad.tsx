/**
 * XYPad
 *
 * 2D performance controller for mapping two parameters.
 * Great for filter cutoff/resonance, pan/volume, or any X/Y control.
 */

import React, { useState, useCallback, useRef } from 'react';
import { colors } from '../../theme/tokens';

interface XYPadProps {
  /** X value (0-1) */
  x: number;
  /** Y value (0-1) */
  y: number;
  /** Called when values change */
  onChange?: (x: number, y: number) => void;
  /** X axis label */
  xLabel?: string;
  /** Y axis label */
  yLabel?: string;
  /** X axis color */
  xColor?: string;
  /** Y axis color */
  yColor?: string;
  /** Size in pixels (square) */
  size?: number;
  /** Show crosshairs */
  showCrosshairs?: boolean;
  /** Show value readout */
  showValues?: boolean;
  /** Spring return to center */
  springReturn?: boolean;
  /** Grid divisions */
  gridDivisions?: number;
  /** Bipolar mode (center = 0) */
  bipolar?: boolean;
  label?: string;
}

export const XYPad: React.FC<XYPadProps> = ({
  x,
  y,
  onChange,
  xLabel = 'X',
  yLabel = 'Y',
  xColor = colors.accent.cyan,
  yColor = colors.accent.orange,
  size = 200,
  showCrosshairs = true,
  showValues = true,
  springReturn = false,
  gridDivisions = 4,
  bipolar = false,
  label,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    setIsDragging(true);

    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const newX = Math.max(0, Math.min(1, (e.clientX - rect.left) / size));
    const newY = Math.max(0, Math.min(1, 1 - (e.clientY - rect.top) / size));
    onChange?.(newX, newY);
  }, [size, onChange]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging) return;

    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const newX = Math.max(0, Math.min(1, (e.clientX - rect.left) / size));
    const newY = Math.max(0, Math.min(1, 1 - (e.clientY - rect.top) / size));
    onChange?.(newX, newY);
  }, [isDragging, size, onChange]);

  const handlePointerUp = useCallback(() => {
    setIsDragging(false);

    if (springReturn) {
      onChange?.(0.5, 0.5);
    }
  }, [springReturn, onChange]);

  const formatValue = (val: number): string => {
    if (bipolar) {
      const bipolarVal = (val - 0.5) * 2;
      return bipolarVal >= 0 ? `+${(bipolarVal * 100).toFixed(0)}` : `${(bipolarVal * 100).toFixed(0)}`;
    }
    return `${Math.round(val * 100)}`;
  };

  // Calculate puck position
  const puckX = x * size;
  const puckY = (1 - y) * size;

  return (
    <div
      className="synth-control"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        padding: 12,
        background: colors.bg.surface,
        borderRadius: 8,
      }}
    >
      {/* Header */}
      {(label || showValues) && (
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          {label && (
            <span style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 'var(--text-xs)',
              color: colors.text.muted,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
            }}>
              {label}
            </span>
          )}
          {showValues && (
            <div style={{ display: 'flex', gap: 12 }}>
              <span style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 'var(--text-xs)',
                color: xColor,
              }}>
                {xLabel}: <span style={{ fontFamily: 'var(--font-numeric)' }}>{formatValue(x)}</span>
              </span>
              <span style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 'var(--text-xs)',
                color: yColor,
              }}>
                {yLabel}: <span style={{ fontFamily: 'var(--font-numeric)' }}>{formatValue(y)}</span>
              </span>
            </div>
          )}
        </div>
      )}

      {/* Pad area */}
      <div
        ref={containerRef}
        style={{
          position: 'relative',
          width: size,
          height: size,
          background: colors.bg.elevated,
          borderRadius: 4,
          cursor: 'crosshair',
          overflow: 'hidden',
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        {/* Grid */}
        <svg
          width={size}
          height={size}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            pointerEvents: 'none',
          }}
        >
          {/* Grid lines */}
          {Array.from({ length: gridDivisions - 1 }, (_, i) => {
            const pos = ((i + 1) / gridDivisions) * size;
            const isCenter = i + 1 === gridDivisions / 2;
            return (
              <g key={i}>
                <line
                  x1={pos}
                  y1={0}
                  x2={pos}
                  y2={size}
                  stroke={isCenter && bipolar ? colors.bg.border : `${colors.bg.border}60`}
                  strokeWidth={isCenter && bipolar ? 1 : 0.5}
                />
                <line
                  x1={0}
                  y1={pos}
                  x2={size}
                  y2={pos}
                  stroke={isCenter && bipolar ? colors.bg.border : `${colors.bg.border}60`}
                  strokeWidth={isCenter && bipolar ? 1 : 0.5}
                />
              </g>
            );
          })}

          {/* Crosshairs */}
          {showCrosshairs && (
            <g>
              {/* X crosshair */}
              <line
                x1={puckX}
                y1={0}
                x2={puckX}
                y2={size}
                stroke={xColor}
                strokeWidth={1}
                opacity={isDragging ? 0.6 : 0.3}
                strokeDasharray={isDragging ? 'none' : '4,4'}
              />
              {/* Y crosshair */}
              <line
                x1={0}
                y1={puckY}
                x2={size}
                y2={puckY}
                stroke={yColor}
                strokeWidth={1}
                opacity={isDragging ? 0.6 : 0.3}
                strokeDasharray={isDragging ? 'none' : '4,4'}
              />
            </g>
          )}

          {/* Trail effect when dragging */}
          {isDragging && (
            <circle
              cx={puckX}
              cy={puckY}
              r={20}
              fill={`url(#gradient-${label || 'xy'})`}
              opacity={0.2}
            />
          )}

          {/* Gradient definition */}
          <defs>
            <radialGradient id={`gradient-${label || 'xy'}`}>
              <stop offset="0%" stopColor={xColor} />
              <stop offset="100%" stopColor="transparent" />
            </radialGradient>
          </defs>
        </svg>

        {/* Puck */}
        <div
          style={{
            position: 'absolute',
            left: puckX - 12,
            top: puckY - 12,
            width: 24,
            height: 24,
            borderRadius: '50%',
            background: `radial-gradient(circle at 30% 30%, ${colors.bg.highlight}, ${colors.bg.elevated})`,
            border: `2px solid ${isDragging ? xColor : colors.bg.border}`,
            boxShadow: isDragging
              ? `0 0 12px ${xColor}60, 0 0 12px ${yColor}60`
              : '0 2px 4px rgba(0,0,0,0.3)',
            transition: isDragging ? 'none' : 'border-color 100ms, box-shadow 100ms',
            pointerEvents: 'none',
          }}
        >
          {/* Puck center dot */}
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 6,
            height: 6,
            borderRadius: '50%',
            background: isDragging ? xColor : colors.text.muted,
          }} />
        </div>
      </div>

      {/* Axis labels */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
      }}>
        <span style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 8,
          color: colors.text.disabled,
        }}>
          {bipolar ? '-' : '0'}
        </span>
        <span style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 'var(--text-xs)',
          color: xColor,
        }}>
          {xLabel}
        </span>
        <span style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 8,
          color: colors.text.disabled,
        }}>
          {bipolar ? '+' : '100'}
        </span>
      </div>
    </div>
  );
};

export default XYPad;
