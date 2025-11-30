/**
 * WaveformSelector
 *
 * A visual waveform selection interface for oscillators.
 * Supports classic waveforms, wavetables, and custom waveform editing.
 *
 * Features:
 * - Visual waveform preview
 * - Classic wave shapes (sine, saw, square, triangle, noise)
 * - Pulse width control for square waves
 * - Wavetable position for wavetable oscillators
 */

import React, { useState, useCallback, useMemo, useRef } from 'react';
import { colors } from '../../theme/tokens';

export type WaveformType = 'sine' | 'saw' | 'square' | 'triangle' | 'noise' | 'pulse' | 'wavetable' | 'custom';

export interface WaveformSelectorProps {
  /** Current waveform type */
  value?: WaveformType;
  /** Called when waveform changes */
  onChange?: (waveform: WaveformType) => void;
  /** Pulse width (0-1, for pulse/square wave) */
  pulseWidth?: number;
  /** Called when pulse width changes */
  onPulseWidthChange?: (pw: number) => void;
  /** Wavetable position (0-1) */
  wavetablePosition?: number;
  /** Called when wavetable position changes */
  onWavetablePositionChange?: (pos: number) => void;
  /** Available waveforms */
  waveforms?: WaveformType[];
  /** Component label */
  label?: string;
  /** Size of waveform display */
  displaySize?: { width: number; height: number };
  /** Show waveform names */
  showLabels?: boolean;
  /** Show pulse width control */
  showPulseWidth?: boolean;
  /** Compact mode */
  compact?: boolean;
}

// Generate waveform points for display
const generateWaveformPoints = (
  type: WaveformType,
  width: number,
  height: number,
  pulseWidth: number = 0.5
): string => {
  const points: [number, number][] = [];
  const samples = 128;
  const amplitude = height * 0.4;
  const centerY = height / 2;

  for (let i = 0; i < samples; i++) {
    const x = (i / (samples - 1)) * width;
    const phase = i / samples;
    let y = 0;

    switch (type) {
      case 'sine':
        y = Math.sin(phase * Math.PI * 2) * amplitude;
        break;
      case 'saw':
        y = (2 * phase - 1) * amplitude;
        break;
      case 'square':
        y = (phase < 0.5 ? 1 : -1) * amplitude;
        break;
      case 'pulse':
        y = (phase < pulseWidth ? 1 : -1) * amplitude;
        break;
      case 'triangle':
        y = (2 * Math.abs(2 * phase - 1) - 1) * amplitude;
        break;
      case 'noise':
        y = (Math.random() * 2 - 1) * amplitude;
        break;
      case 'wavetable':
        // Blend between sine and saw as example
        const sineVal = Math.sin(phase * Math.PI * 2);
        const sawVal = 2 * phase - 1;
        y = (sineVal * 0.5 + sawVal * 0.5) * amplitude;
        break;
      case 'custom':
        // Placeholder - could be replaced with custom data
        y = Math.sin(phase * Math.PI * 4) * Math.sin(phase * Math.PI) * amplitude;
        break;
    }

    points.push([x, centerY - y]);
  }

  return points.map((p, i) => (i === 0 ? `M ${p[0]} ${p[1]}` : `L ${p[0]} ${p[1]}`)).join(' ');
};

const WAVEFORM_INFO: Record<WaveformType, { label: string; shortLabel: string; color: string }> = {
  sine: { label: 'Sine', shortLabel: 'SIN', color: colors.accent.cyan },
  saw: { label: 'Sawtooth', shortLabel: 'SAW', color: colors.accent.orange },
  square: { label: 'Square', shortLabel: 'SQR', color: colors.accent.coral },
  triangle: { label: 'Triangle', shortLabel: 'TRI', color: colors.accent.yellow },
  noise: { label: 'Noise', shortLabel: 'NSE', color: colors.accent.pink },
  pulse: { label: 'Pulse', shortLabel: 'PLS', color: colors.accent.purple },
  wavetable: { label: 'Wavetable', shortLabel: 'WTB', color: colors.accent.green },
  custom: { label: 'Custom', shortLabel: 'CST', color: colors.text.secondary },
};

const DEFAULT_WAVEFORMS: WaveformType[] = ['sine', 'saw', 'square', 'triangle'];

export const WaveformSelector: React.FC<WaveformSelectorProps> = ({
  value = 'sine',
  onChange,
  pulseWidth = 0.5,
  onPulseWidthChange,
  wavetablePosition = 0,
  onWavetablePositionChange,
  waveforms = DEFAULT_WAVEFORMS,
  label,
  displaySize = { width: 120, height: 60 },
  showLabels = true,
  showPulseWidth = true,
  compact = false,
}) => {
  const [hoveredWaveform, setHoveredWaveform] = useState<WaveformType | null>(null);

  const displayedWaveform = hoveredWaveform || value;
  const waveformPath = useMemo(
    () =>
      generateWaveformPoints(
        displayedWaveform,
        displaySize.width,
        displaySize.height,
        pulseWidth
      ),
    [displayedWaveform, displaySize.width, displaySize.height, pulseWidth]
  );

  const info = WAVEFORM_INFO[displayedWaveform];

  // Pulse width drag handling
  const pwDragRef = useRef<{ startX: number; startPW: number } | null>(null);

  const handlePWDragStart = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      pwDragRef.current = { startX: e.clientX, startPW: pulseWidth };

      const handleMove = (moveE: MouseEvent) => {
        if (!pwDragRef.current) return;
        const deltaX = moveE.clientX - pwDragRef.current.startX;
        const newPW = Math.max(0.1, Math.min(0.9, pwDragRef.current.startPW + deltaX * 0.005));
        onPulseWidthChange?.(newPW);
      };

      const handleUp = () => {
        pwDragRef.current = null;
        window.removeEventListener('mousemove', handleMove);
        window.removeEventListener('mouseup', handleUp);
      };

      window.addEventListener('mousemove', handleMove);
      window.addEventListener('mouseup', handleUp);
    },
    [pulseWidth, onPulseWidthChange]
  );

  return (
    <div
      className="synth-control"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: compact ? 8 : 12,
        padding: compact ? 12 : 16,
        background: colors.bg.surface,
        borderRadius: 8,
      }}
    >
      {/* Header with label */}
      {label && (
        <div
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 11,
            color: colors.text.secondary,
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
          }}
        >
          {label}
        </div>
      )}

      {/* Waveform display - fills container */}
      <div
        style={{
          background: colors.bg.base,
          borderRadius: 6,
          overflow: 'hidden',
        }}
      >
        <svg
          width="100%"
          height={displaySize.height}
          viewBox={`0 0 ${displaySize.width} ${displaySize.height}`}
          preserveAspectRatio="none"
          style={{ display: 'block' }}
        >
          {/* Subtle center line */}
          <line
            x1={0}
            y1={displaySize.height / 2}
            x2={displaySize.width}
            y2={displaySize.height / 2}
            stroke={colors.bg.highlight}
            strokeWidth={1}
            opacity={0.5}
          />

          {/* Waveform path - fills display */}
          <path
            d={waveformPath}
            fill="none"
            stroke={info.color}
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {/* Waveform buttons */}
      <div
        style={{
          display: 'flex',
          gap: 4,
          flexWrap: 'wrap',
        }}
      >
        {waveforms.map((wf) => {
          const wfInfo = WAVEFORM_INFO[wf];
          const isSelected = wf === value;
          return (
            <button
              key={wf}
              onClick={() => onChange?.(wf)}
              onMouseEnter={() => setHoveredWaveform(wf)}
              onMouseLeave={() => setHoveredWaveform(null)}
              style={{
                flex: compact ? 1 : 'none',
                minWidth: compact ? 0 : 50,
                padding: compact ? '6px 8px' : '8px 12px',
                background: isSelected ? wfInfo.color : colors.bg.elevated,
                border: isSelected ? 'none' : `1px solid ${colors.bg.highlight}`,
                borderRadius: 4,
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 2,
              }}
              title={wfInfo.label}
            >
              {/* Mini waveform icon */}
              <svg width={20} height={12} style={{ display: 'block' }}>
                <path
                  d={generateWaveformPoints(wf, 20, 12, pulseWidth)}
                  fill="none"
                  stroke={isSelected ? colors.bg.base : wfInfo.color}
                  strokeWidth={1.5}
                />
              </svg>
              {showLabels && (
                <span
                  style={{
                    fontSize: 8,
                    fontFamily: 'var(--font-mono)',
                    color: isSelected ? colors.bg.base : colors.text.muted,
                    fontWeight: isSelected ? 600 : 400,
                  }}
                >
                  {wfInfo.shortLabel}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Pulse width control (for pulse/square waves) */}
      {showPulseWidth && (value === 'pulse' || value === 'square') && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span
            style={{
              fontSize: 9,
              fontFamily: 'var(--font-mono)',
              color: colors.text.muted,
              width: 32,
            }}
          >
            PW
          </span>
          <div
            style={{
              flex: 1,
              height: 20,
              background: colors.bg.base,
              borderRadius: 4,
              position: 'relative',
              cursor: 'ew-resize',
            }}
            onMouseDown={handlePWDragStart}
          >
            <div
              style={{
                position: 'absolute',
                left: 0,
                top: 0,
                bottom: 0,
                width: `${pulseWidth * 100}%`,
                background: colors.accent.purple,
                borderRadius: 4,
                opacity: 0.7,
              }}
            />
            <div
              style={{
                position: 'absolute',
                left: `${pulseWidth * 100}%`,
                top: '50%',
                transform: 'translate(-50%, -50%)',
                width: 12,
                height: 12,
                background: colors.text.primary,
                borderRadius: '50%',
                border: `2px solid ${colors.bg.base}`,
              }}
            />
          </div>
          <span
            style={{
              fontSize: 10,
              fontFamily: 'var(--font-numeric)',
              color: colors.text.secondary,
              width: 36,
              textAlign: 'right',
            }}
          >
            {Math.round(pulseWidth * 100)}%
          </span>
        </div>
      )}

      {/* Wavetable position (for wavetable type) */}
      {value === 'wavetable' && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span
            style={{
              fontSize: 9,
              fontFamily: 'var(--font-mono)',
              color: colors.text.muted,
              width: 32,
            }}
          >
            POS
          </span>
          <input
            type="range"
            min={0}
            max={100}
            value={wavetablePosition * 100}
            onChange={(e) => onWavetablePositionChange?.(parseInt(e.target.value) / 100)}
            style={{ flex: 1 }}
          />
          <span
            style={{
              fontSize: 10,
              fontFamily: 'var(--font-numeric)',
              color: colors.text.secondary,
              width: 36,
              textAlign: 'right',
            }}
          >
            {Math.round(wavetablePosition * 100)}%
          </span>
        </div>
      )}
    </div>
  );
};

export default WaveformSelector;
