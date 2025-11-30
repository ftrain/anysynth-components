/**
 * FractionPicker
 *
 * Circular fraction selector with nested knobs.
 * Two concentric rings: inner for denominator, outer for numerator.
 * Perfect for beat divisions, time signatures, and musical ratios.
 *
 * Values range from 1 to 256.
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { colors } from '../../theme/tokens';

export interface FractionValue {
  numerator: number;
  denominator: number;
  value: number; // numerator/denominator
}

export interface FractionPickerProps {
  /** Initial numerator value (1-256) */
  numerator?: number;
  /** Initial denominator value (1-256) */
  denominator?: number;
  /** Callback when fraction changes */
  onChange?: (fraction: FractionValue) => void;
  /** Component label */
  label?: string;
  /** Minimum size in pixels */
  minSize?: number;
  /** Fixed size (overrides responsive sizing) */
  size?: number;
  /** Minimum allowed value */
  min?: number;
  /** Maximum allowed value */
  max?: number;
  /** Common fraction presets to show */
  presets?: Array<{ numerator: number; denominator: number; label?: string }>;
}

type KnobId = 'numerator' | 'denominator';

interface KnobConfig {
  id: KnobId;
  color: string;
  defaultValue: number;
  radius?: number;
}

const KNOB_CONFIG: KnobConfig[] = [
  { id: 'denominator', color: colors.accent.coral, defaultValue: 4 },
  { id: 'numerator', color: colors.accent.cyan, defaultValue: 1 },
];

export const FractionPicker: React.FC<FractionPickerProps> = ({
  numerator: initialNumerator = 1,
  denominator: initialDenominator = 4,
  onChange,
  label,
  minSize = 200,
  size: fixedSize,
  min = 1,
  max = 256,
  presets,
}) => {
  const [numerator, setNumerator] = useState(initialNumerator);
  const [denominator, setDenominator] = useState(initialDenominator);
  const [selectedKnob, setSelectedKnob] = useState<KnobId | null>(null);
  const [activeKnob, setActiveKnob] = useState<KnobId | null>(null);
  const [hoveredKnob, setHoveredKnob] = useState<KnobId | null>(null);
  const [focusedKnob, setFocusedKnob] = useState<KnobId | null>(null);
  const [size, setSize] = useState(fixedSize || 200);

  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const dragStartRef = useRef<{ y: number; startValue: number }>({ y: 0, startValue: 0 });
  const lastClickTimeRef = useRef<Record<string, number>>({});

  // Responsive sizing - use fixed size or minSize, no auto-grow
  useEffect(() => {
    if (fixedSize) {
      setSize(fixedSize);
    } else {
      // Use minSize as default, only check parent once on mount
      setSize(minSize);
    }
  }, [minSize, fixedSize]);

  // Notify onChange
  useEffect(() => {
    onChange?.({
      numerator,
      denominator,
      value: numerator / denominator,
    });
  }, [numerator, denominator, onChange]);

  const scale = size / 400;
  const bandWidth = 24 * scale;
  const startRadius = 36 * scale;
  const cx = size / 2;
  const cy = size / 2;

  const knobs = KNOB_CONFIG.map((knob, index) => ({
    ...knob,
    radius: startRadius + index * (bandWidth + 2),
  }));

  const outerRadius = knobs[knobs.length - 1].radius + bandWidth / 2;

  const valueToAngle = (value: number): number => {
    const normalized = (value - min) / (max - min);
    return -135 + normalized * 270;
  };

  const getPositionFromEvent = (e: React.MouseEvent | React.TouchEvent | MouseEvent | TouchEvent) => {
    if ('touches' in e && e.touches.length > 0) {
      return { clientX: e.touches[0].clientX, clientY: e.touches[0].clientY };
    }
    return { clientX: (e as MouseEvent).clientX, clientY: (e as MouseEvent).clientY };
  };

  const getKnobFromPosition = useCallback(
    (e: React.MouseEvent | React.TouchEvent): KnobId | null => {
      if (!svgRef.current) return null;

      const { clientX, clientY } = getPositionFromEvent(e);
      const rect = svgRef.current.getBoundingClientRect();
      const x = clientX - rect.left - cx;
      const y = clientY - rect.top - cy;
      const distance = Math.sqrt(x * x + y * y);
      const angle = (Math.atan2(y, x) * 180) / Math.PI + 90;
      const normalizedAngle = angle < -180 ? angle + 360 : angle;

      // Dead zone at bottom
      if (normalizedAngle > 135 && normalizedAngle < 225) return null;

      for (const knob of knobs) {
        const innerR = knob.radius! - bandWidth / 2;
        const outerR = knob.radius! + bandWidth / 2;
        if (distance >= innerR && distance <= outerR) return knob.id;
      }

      return null;
    },
    [cx, cy, knobs, bandWidth]
  );

  const getValue = useCallback(
    (knobId: KnobId): number => (knobId === 'numerator' ? numerator : denominator),
    [numerator, denominator]
  );

  const setValue = useCallback(
    (knobId: KnobId, value: number) => {
      const clamped = Math.max(min, Math.min(max, Math.round(value)));
      if (knobId === 'numerator') setNumerator(clamped);
      else setDenominator(clamped);
    },
    [min, max]
  );

  const resetToDefault = useCallback(
    (knobId: KnobId) => {
      const knob = KNOB_CONFIG.find((k) => k.id === knobId);
      if (knob) setValue(knobId, knob.defaultValue);
    },
    [setValue]
  );

  const handleStart = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      const knobId = getKnobFromPosition(e);
      if (!knobId) return;
      e.preventDefault();

      // Double-click detection
      const now = Date.now();
      const lastClick = lastClickTimeRef.current[knobId] || 0;
      if (now - lastClick < 300) {
        resetToDefault(knobId);
        lastClickTimeRef.current[knobId] = 0;
        return;
      }
      lastClickTimeRef.current[knobId] = now;

      setSelectedKnob(knobId);
      setActiveKnob(knobId);

      const { clientY } = getPositionFromEvent(e);
      const currentValue = getValue(knobId);
      dragStartRef.current = { y: clientY, startValue: currentValue };

      const handleMove = (moveEvent: MouseEvent | TouchEvent) => {
        moveEvent.preventDefault();
        const { clientY: moveY } = getPositionFromEvent(moveEvent);
        const deltaY = dragStartRef.current.y - moveY;
        const sensitivity = 0.5;
        const newValue = dragStartRef.current.startValue + deltaY * sensitivity;
        setValue(knobId, newValue);
      };

      const handleEnd = () => {
        setActiveKnob(null);
        window.removeEventListener('mousemove', handleMove);
        window.removeEventListener('mouseup', handleEnd);
        window.removeEventListener('touchmove', handleMove);
        window.removeEventListener('touchend', handleEnd);
        window.removeEventListener('touchcancel', handleEnd);
      };

      window.addEventListener('mousemove', handleMove, { passive: false });
      window.addEventListener('mouseup', handleEnd);
      window.addEventListener('touchmove', handleMove, { passive: false });
      window.addEventListener('touchend', handleEnd);
      window.addEventListener('touchcancel', handleEnd);
    },
    [getKnobFromPosition, getValue, setValue, resetToDefault]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      setHoveredKnob(getKnobFromPosition(e));
    },
    [getKnobFromPosition]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent, knobId: KnobId) => {
      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        resetToDefault(knobId);
        return;
      }

      const currentValue = getValue(knobId);
      let newValue = currentValue;
      const step = e.shiftKey ? 10 : 1;

      switch (e.key) {
        case 'ArrowUp':
        case 'ArrowRight':
          e.preventDefault();
          newValue = currentValue + step;
          break;
        case 'ArrowDown':
        case 'ArrowLeft':
          e.preventDefault();
          newValue = currentValue - step;
          break;
        case 'Home':
          e.preventDefault();
          newValue = min;
          break;
        case 'End':
          e.preventDefault();
          newValue = max;
          break;
        default:
          return;
      }
      setValue(knobId, newValue);
    },
    [getValue, setValue, resetToDefault, min, max]
  );

  const createArcPath = (radius: number, startAngle: number, endAngle: number): string => {
    const startRad = ((startAngle - 90) * Math.PI) / 180;
    const endRad = ((endAngle - 90) * Math.PI) / 180;
    const x1 = cx + radius * Math.cos(startRad);
    const y1 = cy + radius * Math.sin(startRad);
    const x2 = cx + radius * Math.cos(endRad);
    const y2 = cy + radius * Math.sin(endRad);
    const largeArc = Math.abs(endAngle - startAngle) > 180 ? 1 : 0;
    return `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`;
  };

  const highlightedKnob = activeKnob || selectedKnob || hoveredKnob || focusedKnob;

  const getHighlightColor = (): string => {
    if (highlightedKnob === 'numerator') return colors.accent.cyan;
    if (highlightedKnob === 'denominator') return colors.accent.coral;
    return colors.text.muted;
  };

  // Calculate GCD for display
  const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
  const simplifiedGcd = gcd(numerator, denominator);
  const simpleNum = numerator / simplifiedGcd;
  const simpleDen = denominator / simplifiedGcd;
  const isSimplified = simplifiedGcd > 1;

  return (
    <div
      className="synth-control"
      ref={containerRef}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 8,
        padding: 16,
        background: colors.bg.surface,
        borderRadius: 8,
      }}
    >
      {label && (
        <div
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 10,
            color: colors.text.muted,
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
          }}
        >
          {label}
        </div>
      )}

      <div style={{ position: 'relative' }}>
        <svg
          ref={svgRef}
          width={size}
          height={size}
          onMouseDown={handleStart}
          onTouchStart={handleStart}
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setHoveredKnob(null)}
          style={{
            display: 'block',
            touchAction: 'none',
            cursor: hoveredKnob ? 'ns-resize' : 'default',
            WebkitTapHighlightColor: 'transparent',
            userSelect: 'none',
            overflow: 'visible',
          }}
        >
          {/* Background bands */}
          {knobs.map((knob) => (
            <circle
              key={`bg-${knob.id}`}
              cx={cx}
              cy={cy}
              r={knob.radius!}
              fill="none"
              stroke={highlightedKnob === knob.id ? colors.bg.highlight : colors.bg.elevated}
              strokeWidth={bandWidth}
            />
          ))}

          {/* Track arcs */}
          {knobs.map((knob) => (
            <path
              key={`track-${knob.id}`}
              d={createArcPath(knob.radius!, -135, 135)}
              fill="none"
              stroke={knob.color}
              strokeWidth={bandWidth - 2 * scale}
              strokeLinecap="butt"
              opacity={highlightedKnob === knob.id ? 0.35 : 0.2}
            />
          ))}

          {/* Value arcs */}
          {knobs.map((knob) => {
            const value = getValue(knob.id);
            const endAngle = valueToAngle(value);
            if (endAngle <= -135) return null;
            return (
              <path
                key={`value-${knob.id}`}
                d={createArcPath(knob.radius!, -135, endAngle)}
                fill="none"
                stroke={knob.color}
                strokeWidth={bandWidth - 2 * scale}
                strokeLinecap="butt"
                opacity={highlightedKnob === knob.id ? 1 : 0.8}
              />
            );
          })}

          {/* Focus indicator */}
          {focusedKnob &&
            (() => {
              const fk = knobs.find((k) => k.id === focusedKnob);
              return fk ? (
                <circle
                  cx={cx}
                  cy={cy}
                  r={fk.radius!}
                  fill="none"
                  stroke="white"
                  strokeWidth={1 * scale}
                  strokeDasharray={`${4 * scale} ${2 * scale}`}
                  opacity={0.6}
                />
              ) : null;
            })()}

          {/* Fraction display - positioned lower in the knob */}
          <g>
            {/* Numerator */}
            <text
              x={cx}
              y={cy + 45 * scale}
              textAnchor="middle"
              dominantBaseline="middle"
              fill={colors.accent.cyan}
              fontSize={24 * scale}
              fontFamily="var(--font-numeric)"
              fontWeight={700}
              opacity={highlightedKnob === 'numerator' ? 1 : 0.8}
            >
              {numerator}
            </text>

            {/* Fraction bar */}
            <line
              x1={cx - 24 * scale}
              y1={cy + 58 * scale}
              x2={cx + 24 * scale}
              y2={cy + 58 * scale}
              stroke={getHighlightColor()}
              strokeWidth={3 * scale}
              strokeLinecap="round"
              opacity={0.8}
            />

            {/* Denominator */}
            <text
              x={cx}
              y={cy + 74 * scale}
              textAnchor="middle"
              dominantBaseline="middle"
              fill={colors.accent.coral}
              fontSize={24 * scale}
              fontFamily="var(--font-numeric)"
              fontWeight={700}
              opacity={highlightedKnob === 'denominator' ? 1 : 0.8}
            >
              {denominator}
            </text>

            {/* Simplified fraction (if different) */}
            {isSimplified && (
              <text
                x={cx}
                y={cy + 92 * scale}
                textAnchor="middle"
                dominantBaseline="middle"
                fill={colors.text.muted}
                fontSize={11 * scale}
                fontFamily="var(--font-mono)"
                fontWeight={500}
              >
                = {simpleNum}/{simpleDen}
              </text>
            )}
          </g>

          {/* Tick marks */}
          {[-135, 0, 135].map((angle, i) => {
            const rad = ((angle - 90) * Math.PI) / 180;
            const outerR = outerRadius + 3 * scale;
            const tickLen = 5 * scale;
            return (
              <line
                key={`tick-${i}`}
                x1={cx + outerR * Math.cos(rad)}
                y1={cy + outerR * Math.sin(rad)}
                x2={cx + (outerR + tickLen) * Math.cos(rad)}
                y2={cy + (outerR + tickLen) * Math.sin(rad)}
                stroke={colors.text.disabled}
                strokeWidth={1.5 * scale}
                strokeLinecap="round"
              />
            );
          })}

          {/* Value labels at ticks */}
          <text
            x={cx - (outerRadius + 16 * scale) * Math.cos((45 * Math.PI) / 180)}
            y={cy + (outerRadius + 16 * scale) * Math.sin((45 * Math.PI) / 180)}
            textAnchor="middle"
            dominantBaseline="middle"
            fill={colors.text.disabled}
            fontSize={8 * scale}
            fontFamily="var(--font-mono)"
          >
            {min}
          </text>
          <text
            x={cx}
            y={cy - outerRadius - 14 * scale}
            textAnchor="middle"
            dominantBaseline="middle"
            fill={colors.text.disabled}
            fontSize={8 * scale}
            fontFamily="var(--font-mono)"
          >
            {Math.round((min + max) / 2)}
          </text>
          <text
            x={cx + (outerRadius + 16 * scale) * Math.cos((45 * Math.PI) / 180)}
            y={cy + (outerRadius + 16 * scale) * Math.sin((45 * Math.PI) / 180)}
            textAnchor="middle"
            dominantBaseline="middle"
            fill={colors.text.disabled}
            fontSize={8 * scale}
            fontFamily="var(--font-mono)"
          >
            {max}
          </text>
        </svg>

        {/* Accessible hidden controls */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none',
          }}
        >
          {knobs.map((knob, index) => (
            <input
              key={knob.id}
              type="range"
              min={min}
              max={max}
              value={getValue(knob.id)}
              onChange={(e) => setValue(knob.id, parseInt(e.target.value))}
              onKeyDown={(e) => handleKeyDown(e, knob.id)}
              onFocus={() => {
                setFocusedKnob(knob.id);
                setSelectedKnob(knob.id);
              }}
              onBlur={() => setFocusedKnob(null)}
              aria-label={knob.id === 'numerator' ? 'Numerator' : 'Denominator'}
              style={{
                position: 'absolute',
                width: 1,
                height: 1,
                opacity: 0,
                pointerEvents: 'auto',
                top: `${50 - (index + 1) * 5}%`,
                left: '50%',
              }}
            />
          ))}
        </div>
      </div>

      {/* Preset buttons */}
      {presets && presets.length > 0 && (
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', justifyContent: 'center' }}>
          {presets.map((preset, i) => {
            const isActive =
              preset.numerator === numerator && preset.denominator === denominator;
            return (
              <button
                key={i}
                onClick={() => {
                  setNumerator(preset.numerator);
                  setDenominator(preset.denominator);
                }}
                style={{
                  padding: '4px 8px',
                  background: isActive ? colors.accent.cyan : colors.bg.elevated,
                  color: isActive ? colors.bg.base : colors.text.secondary,
                  border: 'none',
                  borderRadius: 4,
                  cursor: 'pointer',
                  fontFamily: 'var(--font-mono)',
                  fontSize: 10,
                }}
              >
                {preset.label || `${preset.numerator}/${preset.denominator}`}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default FractionPicker;
