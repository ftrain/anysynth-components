/**
 * WavetableView
 *
 * A 3D wavetable visualization and position selector.
 * Shows multiple waveforms in a wavetable and allows position selection.
 *
 * Features:
 * - 3D-style stacked waveform display
 * - Interactive position selection
 * - Waveform morphing preview
 * - Modulation source indicators (LFO/Env)
 */

import React, { useState, useCallback, useMemo, useRef } from 'react';
import { colors } from '../../theme/tokens';

export interface WavetableFrame {
  /** Waveform samples (normalized -1 to 1) */
  samples: number[];
  /** Optional frame label */
  label?: string;
}

export interface ModulationSource {
  name: string;
  amount: number; // -1 to 1
  color?: string;
}

export interface WavetableViewProps {
  /** Wavetable frames (array of waveforms) */
  frames?: WavetableFrame[];
  /** Number of frames to display (default: all) */
  visibleFrames?: number;
  /** Current position in wavetable (0-1) */
  position?: number;
  /** Called when position changes */
  onPositionChange?: (position: number) => void;
  /** Component label */
  label?: string;
  /** Display dimensions */
  width?: number;
  height?: number;
  /** Primary color */
  color?: string;
  /** Show position indicator */
  showPosition?: boolean;
  /** Enable interactive position dragging */
  interactive?: boolean;
  /** 3D depth effect intensity (0-1) */
  depthEffect?: number;
  /** Modulation sources connected to position */
  modSources?: ModulationSource[];
  /** Current modulation offset (-1 to 1, for live visualization) */
  modOffset?: number;
  /** Range start (0-1) - sets the base offset for position range */
  rangeStart?: number;
  /** Called when range start changes */
  onRangeChange?: (rangeStart: number) => void;
}

// Generate default wavetable (morphing from sine to saw)
const generateDefaultWavetable = (numFrames: number = 16): WavetableFrame[] => {
  const samplesPerFrame = 64;
  const frames: WavetableFrame[] = [];

  for (let f = 0; f < numFrames; f++) {
    const blend = f / (numFrames - 1);
    const samples: number[] = [];

    for (let i = 0; i < samplesPerFrame; i++) {
      const phase = i / samplesPerFrame;
      const sine = Math.sin(phase * Math.PI * 2);
      const saw = 2 * phase - 1;
      samples.push(sine * (1 - blend) + saw * blend);
    }

    frames.push({ samples, label: `Frame ${f + 1}` });
  }

  return frames;
};

// Generate waveform path from samples
const generatePath = (
  samples: number[],
  width: number,
  height: number,
  offsetY: number = 0
): string => {
  const points: string[] = [];
  const amplitude = height * 0.35;
  const centerY = height / 2 + offsetY;

  samples.forEach((sample, i) => {
    const x = (i / (samples.length - 1)) * width;
    const y = centerY - sample * amplitude;
    points.push(i === 0 ? `M ${x} ${y}` : `L ${x} ${y}`);
  });

  return points.join(' ');
};

export const WavetableView: React.FC<WavetableViewProps> = ({
  frames: propFrames,
  visibleFrames = 6,
  position = 0,
  onPositionChange,
  label,
  width = 200,
  height = 100,
  color = colors.accent.cyan,
  showPosition = true,
  interactive = true,
  depthEffect = 0.4,
  modSources = [],
  modOffset = 0,
  rangeStart = 0,
  onRangeChange,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Use default or provided frames
  const frames = useMemo(
    () => propFrames || generateDefaultWavetable(16),
    [propFrames]
  );

  const totalFrames = frames.length;

  // Calculate effective position with range and modulation
  // Bottom slider sets rangeStart, vertical slider sets position within range
  // Effective position = rangeStart + position (clamped to 0-1)
  const effectivePosition = Math.max(0, Math.min(1, rangeStart + position + modOffset));

  // Current frame based on position
  const currentFrameIndex = Math.floor(effectivePosition * (totalFrames - 1));
  const frameBlend = (effectivePosition * (totalFrames - 1)) % 1;

  // Handle drag for position
  const handleDragStart = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      if (!interactive) return;
      e.preventDefault();
      setIsDragging(true);

      const updatePosition = (clientY: number) => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const relY = (clientY - rect.top) / rect.height;
        const newPosition = Math.max(0, Math.min(1, 1 - relY));
        onPositionChange?.(newPosition);
      };

      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      updatePosition(clientY);

      const handleMove = (moveE: MouseEvent | TouchEvent) => {
        const moveY = 'touches' in moveE
          ? (moveE as TouchEvent).touches[0].clientY
          : (moveE as MouseEvent).clientY;
        updatePosition(moveY);
      };

      const handleEnd = () => {
        setIsDragging(false);
        window.removeEventListener('mousemove', handleMove);
        window.removeEventListener('mouseup', handleEnd);
        window.removeEventListener('touchmove', handleMove);
        window.removeEventListener('touchend', handleEnd);
      };

      window.addEventListener('mousemove', handleMove);
      window.addEventListener('mouseup', handleEnd);
      window.addEventListener('touchmove', handleMove);
      window.addEventListener('touchend', handleEnd);
    },
    [interactive, onPositionChange]
  );

  // Interpolate between current frame and next
  const interpolatedSamples = useMemo(() => {
    const current = frames[currentFrameIndex]?.samples || [];
    const next = frames[Math.min(currentFrameIndex + 1, totalFrames - 1)]?.samples || current;

    return current.map((sample, i) => {
      return sample * (1 - frameBlend) + (next[i] || sample) * frameBlend;
    });
  }, [frames, currentFrameIndex, frameBlend, totalFrames]);

  // Calculate which frames to show in background
  const backgroundFrames = useMemo(() => {
    const step = Math.max(1, Math.floor(totalFrames / visibleFrames));
    const result: number[] = [];
    for (let i = 0; i < totalFrames; i += step) {
      if (i !== currentFrameIndex) {
        result.push(i);
      }
    }
    return result;
  }, [totalFrames, visibleFrames, currentFrameIndex]);

  const svgPadding = 10;
  const drawWidth = width - svgPadding * 2;
  const drawHeight = height - svgPadding * 2;

  return (
    <div
      className="synth-control"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        padding: 16,
        background: colors.bg.surface,
        borderRadius: 8,
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
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
        {showPosition && (
          <div
            style={{
              fontFamily: 'var(--font-numeric)',
              fontSize: 14,
              fontWeight: 600,
              color: color,
            }}
          >
            {Math.round(effectivePosition * 100)}%
          </div>
        )}
      </div>

      {/* Wavetable visualization */}
      <div
        ref={containerRef}
        onMouseDown={handleDragStart}
        onTouchStart={handleDragStart}
        style={{
          width,
          height,
          background: colors.bg.base,
          borderRadius: 6,
          position: 'relative',
          overflow: 'hidden',
          cursor: interactive ? (isDragging ? 'grabbing' : 'grab') : 'default',
          touchAction: 'none',
        }}
      >
        <svg
          width={width}
          height={height}
          viewBox={`0 0 ${width} ${height}`}
          style={{ display: 'block' }}
        >
          {/* Background frames (ghost waveforms) */}
          {backgroundFrames.map((frameIndex, _i) => {
            const frame = frames[frameIndex];
            if (!frame) return null;

            const yOffset = ((frameIndex / totalFrames) - 0.5) * depthEffect * drawHeight * 0.5;
            const opacity = 0.15 + (1 - Math.abs(frameIndex - currentFrameIndex) / totalFrames) * 0.1;

            return (
              <path
                key={frameIndex}
                d={generatePath(frame.samples, drawWidth, drawHeight, yOffset)}
                fill="none"
                stroke={colors.text.disabled}
                strokeWidth={1}
                opacity={opacity}
                transform={`translate(${svgPadding}, ${svgPadding})`}
              />
            );
          })}

          {/* Current interpolated waveform (main) */}
          <path
            d={generatePath(interpolatedSamples, drawWidth, drawHeight, 0)}
            fill="none"
            stroke={color}
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            transform={`translate(${svgPadding}, ${svgPadding})`}
            style={{ filter: `drop-shadow(0 0 4px ${color}60)` }}
          />
        </svg>

        {/* Position slider track (vertical on right side) */}
        <div
          style={{
            position: 'absolute',
            right: 6,
            top: 8,
            bottom: 8,
            width: 6,
            background: colors.bg.elevated,
            borderRadius: 3,
          }}
        >
          {/* Modulation range indicator */}
          {modSources.length > 0 && (
            <div
              style={{
                position: 'absolute',
                left: 0,
                right: 0,
                top: `${(1 - Math.min(1, position + Math.max(...modSources.map(m => Math.abs(m.amount))))) * 100}%`,
                bottom: `${Math.min(1, position - Math.max(...modSources.map(m => Math.abs(m.amount)))) * 100}%`,
                background: `${color}30`,
                borderRadius: 3,
              }}
            />
          )}

          {/* Position thumb */}
          <div
            style={{
              position: 'absolute',
              left: -2,
              right: -2,
              top: `${(1 - effectivePosition) * 100}%`,
              height: 8,
              background: color,
              borderRadius: 4,
              transform: 'translateY(-50%)',
              boxShadow: `0 0 6px ${color}80`,
              transition: isDragging ? 'none' : 'top 0.05s',
            }}
          />
        </div>

        {/* Frame counter */}
        <div
          style={{
            position: 'absolute',
            bottom: 4,
            left: 6,
            fontSize: 9,
            fontFamily: 'var(--font-mono)',
            color: colors.text.disabled,
          }}
        >
          {currentFrameIndex + 1}/{totalFrames}
        </div>
      </div>

      {/* Modulation sources display */}
      {modSources.length > 0 && (
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 8,
            padding: 8,
            background: colors.bg.elevated,
            borderRadius: 4,
          }}
        >
          <span
            style={{
              fontSize: 8,
              fontFamily: 'var(--font-mono)',
              color: colors.text.disabled,
              textTransform: 'uppercase',
              alignSelf: 'center',
            }}
          >
            MOD:
          </span>
          {modSources.map((mod, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                padding: '2px 6px',
                background: colors.bg.base,
                borderRadius: 3,
                borderLeft: `3px solid ${mod.color || colors.accent.purple}`,
              }}
            >
              <span
                style={{
                  fontSize: 9,
                  fontFamily: 'var(--font-mono)',
                  color: mod.color || colors.accent.purple,
                  fontWeight: 600,
                }}
              >
                {mod.name}
              </span>
              <span
                style={{
                  fontSize: 9,
                  fontFamily: 'var(--font-numeric)',
                  color: colors.text.muted,
                }}
              >
                {mod.amount >= 0 ? '+' : ''}{Math.round(mod.amount * 100)}%
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Horizontal RANGE slider - sets the base offset for position */}
      {interactive && (
        <div
          style={{
            height: 24,
            background: colors.bg.base,
            borderRadius: 4,
            position: 'relative',
            cursor: 'ew-resize',
          }}
          onMouseDown={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const updateRange = (clientX: number) => {
              const rel = (clientX - rect.left) / rect.width;
              // Range goes from -1 to +1 (offset from center)
              const rangeVal = Math.max(-1, Math.min(1, (rel - 0.5) * 2));
              onRangeChange?.(rangeVal);
            };
            updateRange(e.clientX);
            const handleMove = (moveE: MouseEvent) => updateRange(moveE.clientX);
            const handleUp = () => {
              window.removeEventListener('mousemove', handleMove);
              window.removeEventListener('mouseup', handleUp);
            };
            window.addEventListener('mousemove', handleMove);
            window.addEventListener('mouseup', handleUp);
          }}
        >
          {/* Center line */}
          <div
            style={{
              position: 'absolute',
              left: '50%',
              top: 4,
              bottom: 4,
              width: 1,
              background: colors.bg.highlight,
            }}
          />

          {/* Range indicator bar */}
          <div
            style={{
              position: 'absolute',
              left: rangeStart >= 0 ? '50%' : `${50 + rangeStart * 50}%`,
              top: 4,
              bottom: 4,
              width: `${Math.abs(rangeStart) * 50}%`,
              background: rangeStart >= 0 ? color : colors.accent.orange,
              borderRadius: 2,
              opacity: 0.6,
            }}
          />

          {/* Thumb */}
          <div
            style={{
              position: 'absolute',
              left: `${50 + rangeStart * 50}%`,
              top: '50%',
              transform: 'translate(-50%, -50%)',
              width: 14,
              height: 14,
              background: colors.text.primary,
              borderRadius: '50%',
              border: `2px solid ${rangeStart >= 0 ? color : colors.accent.orange}`,
              boxShadow: `0 0 4px ${color}80`,
            }}
          />

          {/* Range label */}
          <div
            style={{
              position: 'absolute',
              right: 4,
              top: '50%',
              transform: 'translateY(-50%)',
              fontSize: 9,
              fontFamily: 'var(--font-mono)',
              color: colors.text.muted,
            }}
          >
            {rangeStart >= 0 ? '+' : ''}{Math.round(rangeStart * 100)}%
          </div>
        </div>
      )}
    </div>
  );
};

export default WavetableView;
