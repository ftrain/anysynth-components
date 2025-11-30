/**
 * LFO Module
 *
 * Low Frequency Oscillator with shape visualization,
 * rate/depth controls, and delay/fade settings.
 */

import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import type { LFOParams } from '../../types';
import { colors } from '../../theme/tokens';
import { Slider } from '../Primitives';

type LFOShape = LFOParams['shape'];

interface LFOProps {
  value: LFOParams;
  onChange?: (value: LFOParams) => void;
  label?: string;
  color?: string;
  /** Max rate in Hz */
  maxRate?: number;
  minRate?: number;
  /** Show delay control */
  showDelay?: boolean;
  /** Sync to tempo (rate becomes ratio) */
  syncMode?: boolean;
  width?: number;
}

const SHAPES: { id: LFOShape; label: string }[] = [
  { id: 'sine', label: 'SIN' },
  { id: 'triangle', label: 'TRI' },
  { id: 'saw', label: 'SAW' },
  { id: 'square', label: 'SQR' },
  { id: 'noise', label: 'S&H' },
];

// Generate waveform points for visualization
const generateWaveform = (shape: LFOShape, points: number, phase: number = 0): number[] => {
  const result: number[] = [];
  const phaseOffset = (phase / 360) * Math.PI * 2;

  for (let i = 0; i < points; i++) {
    const t = (i / points) * Math.PI * 2 + phaseOffset;
    let value: number;

    switch (shape) {
      case 'sine':
        value = Math.sin(t);
        break;
      case 'triangle':
        value = 2 * Math.abs(2 * ((t / (Math.PI * 2)) % 1) - 1) - 1;
        break;
      case 'saw':
        value = 2 * ((t / (Math.PI * 2)) % 1) - 1;
        break;
      case 'square':
        value = Math.sin(t) >= 0 ? 1 : -1;
        break;
      case 'noise':
        const segment = Math.floor((i / points) * 8);
        value = Math.sin(segment * 13.37) * 2 - 1;
        break;
      default:
        value = Math.sin(t);
    }

    result.push(value);
  }

  return result;
};

export const LFO: React.FC<LFOProps> = ({
  value,
  onChange,
  label = 'LFO',
  color = colors.accent.yellow,
  maxRate = 20,
  minRate = 0.001,
  showDelay = true,
  syncMode = false,
  width = 280,
}) => {
  const [hoveredShape, setHoveredShape] = useState<LFOShape | null>(null);
  const [animationPhase, setAnimationPhase] = useState(0);
  const animationRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);

  const waveformHeight = 60;
  const waveformPoints = 100;
  const sliderLength = width - 32;

  // Animate the waveform based on rate
  useEffect(() => {
    const animate = (timestamp: number) => {
      if (lastTimeRef.current === 0) {
        lastTimeRef.current = timestamp;
      }

      const deltaTime = (timestamp - lastTimeRef.current) / 1000; // Convert to seconds
      lastTimeRef.current = timestamp;

      // Increment phase based on rate (Hz = cycles per second)
      // Phase goes from 0 to 360 degrees
      setAnimationPhase(prev => (prev + deltaTime * value.rate * 360) % 360);

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      lastTimeRef.current = 0;
    };
  }, [value.rate]);

  // Generate waveform path - uses animationPhase for smooth animation
  const waveformPath = useMemo(() => {
    // Combine static phase offset with animation phase
    const totalPhase = (value.phase || 0) + animationPhase;
    const points = generateWaveform(value.shape, waveformPoints, totalPhase);
    const padding = 4;
    const w = width - 32;
    const h = waveformHeight - padding * 2;

    const pathPoints = points.map((v, i) => {
      const x = (i / points.length) * w + 16;
      const y = (waveformHeight / 2) - (v * h / 2 * value.depth);
      return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
    });

    return pathPoints.join(' ');
  }, [value.shape, value.phase, value.depth, width, animationPhase]);

  // Delay envelope path
  const delayPath = useMemo(() => {
    if (!value.delay || value.delay <= 0) return null;

    const w = width - 32;
    const delayWidth = Math.min(0.5, value.delay / 5000) * w;

    return `M 16 ${waveformHeight} L ${16 + delayWidth} 0 L ${w + 16} 0`;
  }, [value.delay, width]);

  // Convert rate to/from normalized (0-1) with logarithmic scaling
  const rateToNormalized = (rate: number): number => {
    return Math.log(rate / minRate) / Math.log(maxRate / minRate);
  };

  const normalizedToRate = (normalized: number): number => {
    return minRate * Math.pow(maxRate / minRate, normalized);
  };

  const formatRate = (rate: number): string => {
    if (syncMode) {
      const ratios = ['1/64', '1/32', '1/16', '1/8', '1/4', '1/2', '1', '2', '4', '8'];
      const index = Math.round(rateToNormalized(rate) * (ratios.length - 1));
      return ratios[Math.max(0, Math.min(ratios.length - 1, index))];
    }

    if (rate < 0.01) return `${(rate * 1000).toFixed(0)}mHz`;
    if (rate < 1) return `${(rate * 1000).toFixed(0)}mHz`;
    return `${rate.toFixed(2)}Hz`;
  };

  const formatTime = (ms: number): string => {
    if (ms === 0) return '0';
    if (ms < 1000) return `${Math.round(ms)}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${(ms / 60000).toFixed(1)}m`;
  };

  const handleShapeSelect = useCallback((shape: LFOShape) => {
    onChange?.({ ...value, shape });
  }, [value, onChange]);

  const handleRateChange = useCallback((normalized: number) => {
    onChange?.({ ...value, rate: normalizedToRate(normalized) });
  }, [value, onChange, normalizedToRate]);

  const handleDepthChange = useCallback((depth: number) => {
    onChange?.({ ...value, depth });
  }, [value, onChange]);

  const handleDelayChange = useCallback((normalized: number) => {
    onChange?.({ ...value, delay: normalized * 10000 });
  }, [value, onChange]);

  return (
    <div
      className="synth-control"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        padding: 16,
        background: colors.bg.surface,
        borderRadius: 8,
        width,
      }}
    >
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <span style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 11,
          color: colors.text.muted,
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
        }}>
          {label}
        </span>
        <span style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 11,
          color,
        }}>
          {formatRate(value.rate)}
        </span>
      </div>

      {/* Waveform visualization */}
      <svg
        width={width - 32}
        height={waveformHeight}
        style={{
          background: colors.bg.elevated,
          borderRadius: 4,
        }}
      >
        {/* Grid */}
        <line
          x1={0}
          y1={waveformHeight / 2}
          x2={width - 32}
          y2={waveformHeight / 2}
          stroke={colors.bg.border}
          strokeDasharray="4,4"
        />

        {/* Delay envelope */}
        {delayPath && (
          <path
            d={delayPath}
            fill="none"
            stroke={colors.accent.teal}
            strokeWidth={1}
            strokeDasharray="2,2"
            opacity={0.5}
          />
        )}

        {/* Waveform */}
        <path
          d={waveformPath}
          fill="none"
          stroke={color}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      {/* Shape selector */}
      <div style={{
        display: 'flex',
        gap: 4,
      }}>
        {SHAPES.map(({ id, label: shapeLabel }) => {
          const isSelected = value.shape === id;
          const isHovered = hoveredShape === id;

          return (
            <button
              key={id}
              onClick={() => handleShapeSelect(id)}
              onMouseEnter={() => setHoveredShape(id)}
              onMouseLeave={() => setHoveredShape(null)}
              style={{
                flex: 1,
                padding: '8px 4px',
                background: isSelected ? color : isHovered ? colors.bg.highlight : colors.bg.elevated,
                border: 'none',
                borderRadius: 4,
                fontFamily: 'var(--font-mono)',
                fontSize: 10,
                color: isSelected ? colors.bg.base : colors.text.muted,
                cursor: 'pointer',
                transition: 'background 100ms',
              }}
            >
              {shapeLabel}
            </button>
          );
        })}
      </div>

      {/* Rate slider */}
      <div>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: 6,
        }}>
          <span style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 10,
            color: colors.text.muted,
          }}>
            RATE
          </span>
          <span style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 11,
            color: colors.text.secondary,
          }}>
            {formatRate(value.rate)}
          </span>
        </div>
        <Slider
          value={rateToNormalized(value.rate)}
          onChange={handleRateChange}
          length={sliderLength}
          thickness={8}
          color="orange"
        />
      </div>

      {/* Depth slider */}
      <div>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: 6,
        }}>
          <span style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 10,
            color: colors.text.muted,
          }}>
            DEPTH
          </span>
          <span style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 11,
            color: colors.text.secondary,
          }}>
            {Math.round(value.depth * 100)}%
          </span>
        </div>
        <Slider
          value={value.depth}
          onChange={handleDepthChange}
          length={sliderLength}
          thickness={8}
          color="coral"
        />
      </div>

      {/* Delay slider */}
      {showDelay && (
        <div>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: 6,
          }}>
            <span style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 10,
              color: colors.text.muted,
            }}>
              DELAY
            </span>
            <span style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 11,
              color: colors.text.secondary,
            }}>
              {formatTime(value.delay || 0)}
            </span>
          </div>
          <Slider
            value={(value.delay || 0) / 10000}
            onChange={handleDelayChange}
            length={sliderLength}
            thickness={8}
            color="teal"
          />
        </div>
      )}
    </div>
  );
};

export default LFO;
