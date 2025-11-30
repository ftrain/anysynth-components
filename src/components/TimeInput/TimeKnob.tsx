/**
 * TimeKnob
 *
 * A nested knob for time/rhythm input with three concentric rings:
 * - Outer ring: Numerator (1-256)
 * - Middle ring: Denominator (1-256)
 * - Inner ring: Modifier (straight/dotted/triplet)
 *
 * Supports both tempo-synced (beat divisions) and free-running (ms) modes.
 */

import React, { useState, useCallback, useRef, useMemo } from 'react';
import { colors, components } from '../../theme/tokens';
import { moduleStyles, labelStyles, getAccentColor } from '../../theme/styles';

// Theme constants
const KNOB = components.knobCircular;

export type TimeMode = 'sync' | 'free';
export type TimeModifier = 'straight' | 'dotted' | 'triplet';

export interface TimeKnobValue {
  mode: TimeMode;
  ms: number;
  numerator: number;
  denominator: number;
  modifier: TimeModifier;
}

export interface TimeKnobProps {
  /** Current time value */
  value?: Partial<TimeKnobValue>;
  /** Called when time changes */
  onChange?: (value: TimeKnobValue) => void;
  /** Current BPM (for sync calculations) */
  bpm?: number;
  /** Component label */
  label?: string;
  /** Minimum time in ms (for free mode) */
  minMs?: number;
  /** Maximum time in ms (for free mode) */
  maxMs?: number;
  /** Size of the knob */
  size?: number;
  /** Accent color */
  color?: string;
  /** Compact mode */
  compact?: boolean;
}

const MODIFIERS: { value: TimeModifier; label: string; symbol: string }[] = [
  { value: 'straight', label: 'Straight', symbol: '♩' },
  { value: 'dotted', label: 'Dotted', symbol: '♩.' },
  { value: 'triplet', label: 'Triplet', symbol: '³' },
];

// Common denominators (powers of 2 up to 256)
const COMMON_DENOMINATORS = [1, 2, 4, 8, 16, 32, 64, 128, 256];

const divisionToMs = (
  numerator: number,
  denominator: number,
  modifier: TimeModifier,
  bpm: number
): number => {
  const quarterNoteMs = 60000 / bpm;
  const measureMs = quarterNoteMs * 4;
  let baseMs = measureMs * (numerator / denominator);

  // Apply modifier
  if (modifier === 'dotted') {
    baseMs *= 1.5;
  } else if (modifier === 'triplet') {
    baseMs *= 2 / 3;
  }

  return baseMs;
};

const formatMs = (ms: number): string => {
  if (ms >= 1000) {
    return `${(ms / 1000).toFixed(2)}s`;
  }
  return `${Math.round(ms)}ms`;
};

const formatFraction = (num: number, denom: number, modifier: TimeModifier): string => {
  const modSuffix = modifier === 'dotted' ? '.' : modifier === 'triplet' ? 'T' : '';
  return `${num}/${denom}${modSuffix}`;
};

const createArcPath = (
  cx: number,
  cy: number,
  radius: number,
  startAngle: number,
  endAngle: number
): string => {
  const startRad = (startAngle - 90) * (Math.PI / 180);
  const endRad = (endAngle - 90) * (Math.PI / 180);

  const x1 = cx + radius * Math.cos(startRad);
  const y1 = cy + radius * Math.sin(startRad);
  const x2 = cx + radius * Math.cos(endRad);
  const y2 = cy + radius * Math.sin(endRad);

  const largeArc = Math.abs(endAngle - startAngle) > 180 ? 1 : 0;

  return `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`;
};

// Convert linear value 1-256 to normalized 0-1 using log scale
const valueToNormalized = (val: number, max: number = 256): number => {
  const logVal = Math.log2(val);
  const logMax = Math.log2(max);
  return logVal / logMax;
};

// Snap to common denominators if close
const snapToDenominator = (val: number): number => {
  for (const d of COMMON_DENOMINATORS) {
    if (Math.abs(val - d) <= d * 0.15) return d;
  }
  return val;
};

export const TimeKnob: React.FC<TimeKnobProps> = ({
  value = {},
  onChange,
  bpm = 120,
  label,
  minMs = 1,
  maxMs = 10000,
  size = KNOB.defaultSize,
  color = 'cyan',
  compact = false,
}) => {
  const [mode, setMode] = useState<TimeMode>(value.mode ?? 'sync');
  const [numerator, setNumerator] = useState(value.numerator ?? 1);
  const [denominator, setDenominator] = useState(value.denominator ?? 4);
  const [modifier, setModifier] = useState<TimeModifier>(value.modifier ?? 'straight');
  const [freeMs, setFreeMs] = useState(value.ms ?? 500);
  const [activeRing, setActiveRing] = useState<'num' | 'denom' | 'mod' | null>(null);
  const [hoveredRing, setHoveredRing] = useState<'num' | 'denom' | 'mod' | null>(null);

  const svgRef = useRef<SVGSVGElement>(null);
  const dragRef = useRef<{
    startY: number;
    startValue: number;
    ring: 'num' | 'denom' | 'mod' | 'free';
  } | null>(null);

  const accentColor = getAccentColor(color);
  const cx = size / 2;
  const cy = size / 2;

  const trackWidth = compact ? KNOB.trackWidthCompact : KNOB.trackWidth;
  const gap = KNOB.gap;

  // Ring radii (outer to inner: numerator, denominator, modifier)
  const outerRadius = size / 2 - 8;
  const numRadius = outerRadius - trackWidth / 2;
  const denomRadius = numRadius - trackWidth - gap;
  const modRadius = denomRadius - trackWidth - gap;
  const centerRadius = modRadius - trackWidth / 2 - 8;

  const startAngle = KNOB.arcStart;
  const sweepAngle = KNOB.arcRange;
  const endAngle = startAngle + sweepAngle;

  // Calculate ms from current values
  const calculatedMs = useMemo(() => {
    if (mode === 'free') return freeMs;
    return divisionToMs(numerator, denominator, modifier, bpm);
  }, [mode, numerator, denominator, modifier, bpm, freeMs]);

  // Normalized values for arc display
  const numNormalized = valueToNormalized(numerator);
  const denomNormalized = valueToNormalized(denominator);
  const modNormalized = MODIFIERS.findIndex((m) => m.value === modifier) / (MODIFIERS.length - 1);

  const valueToAngle = (normalized: number): number => {
    return startAngle + normalized * sweepAngle;
  };

  const emitChange = useCallback(
    (updates: Partial<{ num: number; denom: number; mod: TimeModifier; ms: number }>) => {
      const newNum = updates.num ?? numerator;
      const newDenom = updates.denom ?? denominator;
      const newMod = updates.mod ?? modifier;
      const newMs =
        mode === 'free'
          ? updates.ms ?? freeMs
          : divisionToMs(newNum, newDenom, newMod, bpm);

      onChange?.({
        mode,
        ms: newMs,
        numerator: newNum,
        denominator: newDenom,
        modifier: newMod,
      });
    },
    [mode, numerator, denominator, modifier, freeMs, bpm, onChange]
  );

  const getRingFromPosition = useCallback(
    (clientX: number, clientY: number): 'num' | 'denom' | 'mod' | 'center' | null => {
      if (!svgRef.current) return null;

      const rect = svgRef.current.getBoundingClientRect();
      const x = clientX - rect.left - cx;
      const y = clientY - rect.top - cy;
      const distance = Math.sqrt(x * x + y * y);

      // Check which ring (with tolerance)
      const tolerance = trackWidth / 2 + 4;
      if (Math.abs(distance - numRadius) < tolerance) return 'num';
      if (Math.abs(distance - denomRadius) < tolerance) return 'denom';
      if (Math.abs(distance - modRadius) < tolerance) return 'mod';
      if (distance < centerRadius) return 'center';

      return null;
    },
    [cx, cy, numRadius, denomRadius, modRadius, centerRadius, trackWidth]
  );

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault();
      const target = e.currentTarget as HTMLElement;
      target.setPointerCapture(e.pointerId);

      const ring = getRingFromPosition(e.clientX, e.clientY);

      if (ring === 'center') {
        // Toggle mode
        const newMode = mode === 'sync' ? 'free' : 'sync';
        setMode(newMode);
        onChange?.({
          mode: newMode,
          ms: calculatedMs,
          numerator,
          denominator,
          modifier,
        });
        return;
      }

      if (!ring) return;

      setActiveRing(ring);
      const startValue =
        ring === 'num'
          ? numerator
          : ring === 'denom'
          ? denominator
          : MODIFIERS.findIndex((m) => m.value === modifier);

      dragRef.current = {
        startY: e.clientY,
        startValue,
        ring: mode === 'free' && ring !== 'mod' ? 'free' : ring,
      };
    },
    [mode, numerator, denominator, modifier, calculatedMs, getRingFromPosition, onChange]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      // Update hovered ring
      const ring = getRingFromPosition(e.clientX, e.clientY);
      setHoveredRing(ring === 'center' ? null : ring);

      if (!dragRef.current) return;

      const deltaY = dragRef.current.startY - e.clientY;
      const { ring: dragRing, startValue } = dragRef.current;

      if (dragRing === 'free') {
        // Logarithmic adjustment for free mode
        const logMin = Math.log(minMs);
        const logMax = Math.log(maxMs);
        const logStart = Math.log(freeMs);
        const logDelta = (deltaY / 200) * (logMax - logMin);
        const newMs = Math.exp(Math.max(logMin, Math.min(logMax, logStart + logDelta)));
        setFreeMs(newMs);
        emitChange({ ms: newMs });
        return;
      }

      if (dragRing === 'num' || dragRing === 'denom') {
        // Log-scaled integer adjustment
        const sensitivity = 3; // pixels per doubling
        const doublings = deltaY / (sensitivity * 20);
        const newVal = Math.max(
          1,
          Math.min(256, Math.round(startValue * Math.pow(2, doublings)))
        );

        if (dragRing === 'num' && newVal !== numerator) {
          setNumerator(newVal);
          emitChange({ num: newVal });
        } else if (dragRing === 'denom') {
          const snapped = snapToDenominator(newVal);
          if (snapped !== denominator) {
            setDenominator(snapped);
            emitChange({ denom: snapped });
          }
        }
      } else if (dragRing === 'mod') {
        // Step through modifiers
        const stepSize = 30;
        const steps = Math.round(deltaY / stepSize);
        const newIndex = Math.max(
          0,
          Math.min(MODIFIERS.length - 1, startValue + steps)
        );
        const newMod = MODIFIERS[newIndex].value;
        if (newMod !== modifier) {
          setModifier(newMod);
          emitChange({ mod: newMod });
        }
      }
    },
    [
      getRingFromPosition,
      numerator,
      denominator,
      modifier,
      freeMs,
      minMs,
      maxMs,
      emitChange,
    ]
  );

  const handlePointerUp = useCallback(() => {
    dragRef.current = null;
    setActiveRing(null);
  }, []);

  const handleDoubleClick = useCallback(
    (e: React.MouseEvent) => {
      const ring = getRingFromPosition(e.clientX, e.clientY);

      if (ring === 'num') {
        setNumerator(1);
        emitChange({ num: 1 });
      } else if (ring === 'denom') {
        setDenominator(4);
        emitChange({ denom: 4 });
      } else if (ring === 'mod') {
        setModifier('straight');
        emitChange({ mod: 'straight' });
      } else if (ring === 'center' || !ring) {
        // Reset all
        setNumerator(1);
        setDenominator(4);
        setModifier('straight');
        emitChange({ num: 1, denom: 4, mod: 'straight' });
      }
    },
    [getRingFromPosition, emitChange]
  );

  const displayRing = activeRing || hoveredRing;

  return (
    <div
      className="synth-control"
      style={{
        ...moduleStyles.base,
        ...(compact ? moduleStyles.compact : {}),
        alignItems: 'center',
      }}
    >
      {/* Label */}
      {label && <div style={labelStyles.module}>{label}</div>}

      {/* Knob */}
      <svg
        ref={svgRef}
        width={size}
        height={size}
        style={{ touchAction: 'none', cursor: 'ns-resize', overflow: 'visible' }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onDoubleClick={handleDoubleClick}
        onMouseLeave={() => setHoveredRing(null)}
      >
        {/* Background */}
        <circle cx={cx} cy={cy} r={outerRadius} fill={colors.bg.base} />

        {/* Numerator ring (outer) */}
        <circle
          cx={cx}
          cy={cy}
          r={numRadius}
          fill="none"
          stroke={displayRing === 'num' ? colors.bg.highlight : colors.bg.elevated}
          strokeWidth={trackWidth}
        />
        <path
          d={createArcPath(cx, cy, numRadius, startAngle, endAngle)}
          fill="none"
          stroke={accentColor}
          strokeWidth={trackWidth - 2}
          strokeLinecap="butt"
          opacity={displayRing === 'num' ? 0.35 : 0.2}
        />
        {mode === 'sync' && numNormalized > 0.01 && (
          <path
            d={createArcPath(cx, cy, numRadius, startAngle, valueToAngle(numNormalized))}
            fill="none"
            stroke={accentColor}
            strokeWidth={trackWidth - 2}
            strokeLinecap="butt"
            opacity={displayRing === 'num' ? 1 : 0.8}
          />
        )}

        {/* Denominator ring (middle) */}
        <circle
          cx={cx}
          cy={cy}
          r={denomRadius}
          fill="none"
          stroke={displayRing === 'denom' ? colors.bg.highlight : colors.bg.elevated}
          strokeWidth={trackWidth}
        />
        <path
          d={createArcPath(cx, cy, denomRadius, startAngle, endAngle)}
          fill="none"
          stroke={colors.accent.orange}
          strokeWidth={trackWidth - 2}
          strokeLinecap="butt"
          opacity={displayRing === 'denom' ? 0.35 : 0.2}
        />
        {mode === 'sync' && denomNormalized > 0.01 && (
          <path
            d={createArcPath(cx, cy, denomRadius, startAngle, valueToAngle(denomNormalized))}
            fill="none"
            stroke={colors.accent.orange}
            strokeWidth={trackWidth - 2}
            strokeLinecap="butt"
            opacity={displayRing === 'denom' ? 1 : 0.8}
          />
        )}

        {/* Modifier ring (inner) */}
        <circle
          cx={cx}
          cy={cy}
          r={modRadius}
          fill="none"
          stroke={displayRing === 'mod' ? colors.bg.highlight : colors.bg.elevated}
          strokeWidth={trackWidth}
        />
        <path
          d={createArcPath(cx, cy, modRadius, startAngle, endAngle)}
          fill="none"
          stroke={colors.accent.purple}
          strokeWidth={trackWidth - 2}
          strokeLinecap="butt"
          opacity={displayRing === 'mod' ? 0.35 : 0.2}
        />
        {modNormalized > 0.01 && (
          <path
            d={createArcPath(cx, cy, modRadius, startAngle, valueToAngle(modNormalized))}
            fill="none"
            stroke={colors.accent.purple}
            strokeWidth={trackWidth - 2}
            strokeLinecap="butt"
            opacity={displayRing === 'mod' ? 1 : 0.8}
          />
        )}

        {/* Center mode indicator */}
        <circle
          cx={cx}
          cy={cy}
          r={centerRadius}
          fill={mode === 'sync' ? colors.semantic.active : colors.accent.orange}
          opacity={0.3}
          style={{ cursor: 'pointer' }}
        />
        <circle cx={cx} cy={cy} r={4} fill={colors.bg.base} />

        {/* Tick marks */}
        {[startAngle, startAngle + sweepAngle / 2, endAngle].map((angle, i) => {
          const rad = (angle - 90) * (Math.PI / 180);
          const tickStart = outerRadius + 2;
          const tickLen = 4;
          return (
            <line
              key={i}
              x1={cx + tickStart * Math.cos(rad)}
              y1={cy + tickStart * Math.sin(rad)}
              x2={cx + (tickStart + tickLen) * Math.cos(rad)}
              y2={cy + (tickStart + tickLen) * Math.sin(rad)}
              stroke={colors.text.disabled}
              strokeWidth={1.5}
              strokeLinecap="round"
            />
          );
        })}

        {/* Value display */}
        <text
          x={cx}
          y={cy + outerRadius * 0.3}
          textAnchor="middle"
          dominantBaseline="middle"
          fill={colors.text.primary}
          fontSize={size * 0.09}
          fontFamily="var(--font-numeric)"
          fontWeight={600}
          style={{ pointerEvents: 'none' }}
        >
          {mode === 'sync' ? formatFraction(numerator, denominator, modifier) : formatMs(freeMs)}
        </text>

        {/* Mode label */}
        <text
          x={cx}
          y={cy + outerRadius * 0.5}
          textAnchor="middle"
          dominantBaseline="middle"
          fill={mode === 'sync' ? colors.semantic.active : colors.accent.orange}
          fontSize={size * 0.04}
          fontFamily="var(--font-mono)"
          style={{ pointerEvents: 'none' }}
        >
          {mode === 'sync' ? 'SYNC' : 'FREE'}
        </text>

        {/* Ms equivalent */}
        <text
          x={cx}
          y={cy + outerRadius * 0.65}
          textAnchor="middle"
          dominantBaseline="middle"
          fill={colors.text.muted}
          fontSize={size * 0.035}
          fontFamily="var(--font-mono)"
          style={{ pointerEvents: 'none' }}
        >
          {formatMs(calculatedMs)}
        </text>

        {/* Ring info (shown when interacting) */}
        {displayRing && (
          <text
            x={cx}
            y={cy - outerRadius * 0.45}
            textAnchor="middle"
            dominantBaseline="middle"
            fill={
              displayRing === 'num'
                ? accentColor
                : displayRing === 'denom'
                ? colors.accent.orange
                : colors.accent.purple
            }
            fontSize={size * 0.04}
            fontFamily="var(--font-mono)"
            style={{ pointerEvents: 'none' }}
          >
            {displayRing === 'num'
              ? `NUM: ${numerator}`
              : displayRing === 'denom'
              ? `DEN: ${denominator}`
              : `MOD: ${MODIFIERS.find((m) => m.value === modifier)?.label}`}
          </text>
        )}
      </svg>

      {/* BPM display */}
      <div
        style={{
          ...labelStyles.parameter,
          color: colors.text.disabled,
        }}
      >
        {bpm} BPM
      </div>
    </div>
  );
};

export default TimeKnob;
