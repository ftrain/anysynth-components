/**
 * DrumPad
 *
 * A single drum pad for live triggering.
 * Supports velocity sensitivity, LED feedback, and MIDI mapping.
 *
 * Can be arranged in 4x4, 4x2, or custom grid layouts.
 */

import React, { useState, useCallback, useRef } from 'react';
import { colors } from '../../theme/tokens';

export interface DrumPadProps {
  /** Pad identifier */
  id: string;
  /** Display label */
  label?: string;
  /** Pad color */
  color?: string;
  /** Size in pixels */
  size?: number;
  /** Called when pad is triggered */
  onTrigger?: (id: string, velocity: number) => void;
  /** Called when pad is released */
  onRelease?: (id: string) => void;
  /** Whether pad is currently active (being held) */
  active?: boolean;
  /** MIDI note number for display */
  midiNote?: number;
  /** Whether to show velocity-sensitive feedback */
  velocitySensitive?: boolean;
  /** Whether pad is muted */
  muted?: boolean;
  /** Keyboard shortcut */
  keyboardShortcut?: string;
}

export const DrumPad: React.FC<DrumPadProps> = ({
  id,
  label,
  color = colors.accent.coral,
  size = 80,
  onTrigger,
  onRelease,
  active = false,
  midiNote,
  velocitySensitive = true,
  muted = false,
  keyboardShortcut,
}) => {
  const [isPressed, setIsPressed] = useState(false);
  const [velocity, setVelocity] = useState(0);
  const padRef = useRef<HTMLButtonElement>(null);
  const pressStartRef = useRef<{ y: number; time: number } | null>(null);

  // Calculate velocity from click/touch position and speed
  const calculateVelocity = useCallback(
    (e: React.MouseEvent | React.TouchEvent): number => {
      if (!velocitySensitive) return 1;

      const target = e.currentTarget as HTMLElement;
      const rect = target.getBoundingClientRect();

      // Get position
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      const relY = (clientY - rect.top) / rect.height;

      // Lower position = harder hit (more natural for drum pads)
      // Also factor in click speed for touch devices
      const positionVelocity = Math.max(0.3, Math.min(1, 0.7 + (1 - relY) * 0.6));

      return positionVelocity;
    },
    [velocitySensitive]
  );

  const handlePress = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      e.preventDefault();
      if (muted) return;

      const vel = calculateVelocity(e);
      setIsPressed(true);
      setVelocity(vel);

      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      pressStartRef.current = { y: clientY, time: Date.now() };

      onTrigger?.(id, vel);
    },
    [id, muted, calculateVelocity, onTrigger]
  );

  const handleRelease = useCallback(() => {
    setIsPressed(false);
    setVelocity(0);
    pressStartRef.current = null;
    onRelease?.(id);
  }, [id, onRelease]);

  // Handle keyboard shortcuts
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        setIsPressed(true);
        setVelocity(0.8);
        onTrigger?.(id, 0.8);
      }
    },
    [id, onTrigger]
  );

  const handleKeyUp = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'Enter') {
        handleRelease();
      }
    },
    [handleRelease]
  );

  const isActive = active || isPressed;
  const currentVelocity = isActive ? velocity || 0.8 : 0;

  // Calculate glow intensity based on velocity
  const glowIntensity = isActive ? currentVelocity * 20 : 0;

  return (
    <button
      ref={padRef}
      onMouseDown={handlePress}
      onMouseUp={handleRelease}
      onMouseLeave={handleRelease}
      onTouchStart={handlePress}
      onTouchEnd={handleRelease}
      onTouchCancel={handleRelease}
      onKeyDown={handleKeyDown}
      onKeyUp={handleKeyUp}
      style={{
        width: size,
        height: size,
        background: isActive
          ? `linear-gradient(135deg, ${color} 0%, ${color}cc 100%)`
          : colors.bg.elevated,
        border: `2px solid ${isActive ? color : colors.bg.highlight}`,
        borderRadius: 8,
        cursor: muted ? 'not-allowed' : 'pointer',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
        opacity: muted ? 0.4 : 1,
        transition: 'background 0.05s, border-color 0.1s, box-shadow 0.05s',
        boxShadow: isActive ? `0 0 ${glowIntensity}px ${color}80` : 'none',
        outline: 'none',
        WebkitTapHighlightColor: 'transparent',
        touchAction: 'none',
      }}
      aria-label={label || id}
      aria-pressed={isActive}
    >
      {/* Label */}
      {label && (
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: Math.max(9, size * 0.12),
            color: isActive ? colors.bg.base : color,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            fontWeight: 600,
          }}
        >
          {label}
        </span>
      )}

      {/* MIDI note indicator */}
      {midiNote !== undefined && (
        <span
          style={{
            fontFamily: 'var(--font-numeric)',
            fontSize: Math.max(8, size * 0.1),
            color: isActive ? colors.bg.base : colors.text.disabled,
            opacity: 0.7,
          }}
        >
          {midiNote}
        </span>
      )}

      {/* Keyboard shortcut hint */}
      {keyboardShortcut && (
        <span
          style={{
            position: 'absolute',
            bottom: 4,
            right: 4,
            fontFamily: 'var(--font-mono)',
            fontSize: 8,
            color: isActive ? colors.bg.base : colors.text.disabled,
            background: isActive ? 'transparent' : colors.bg.highlight,
            padding: '1px 3px',
            borderRadius: 2,
          }}
        >
          {keyboardShortcut}
        </span>
      )}

      {/* Velocity indicator (when active) */}
      {isActive && velocitySensitive && (
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: 3,
            background: colors.bg.base,
            borderRadius: '0 0 6px 6px',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              height: '100%',
              width: `${currentVelocity * 100}%`,
              background: colors.text.primary,
              transition: 'width 0.05s',
            }}
          />
        </div>
      )}

      {/* LED indicator */}
      <div
        style={{
          position: 'absolute',
          top: 4,
          right: 4,
          width: 6,
          height: 6,
          borderRadius: '50%',
          background: isActive ? colors.text.primary : colors.bg.highlight,
          boxShadow: isActive ? `0 0 4px ${colors.text.primary}` : 'none',
        }}
      />
    </button>
  );
};

/**
 * DrumPadGrid
 *
 * A grid of drum pads for live performance.
 */
export interface DrumPadGridProps {
  /** Pad configurations */
  pads: Array<{
    id: string;
    label?: string;
    color?: string;
    midiNote?: number;
    muted?: boolean;
  }>;
  /** Grid columns (default: 4 for 4x4 grid) */
  columns?: number;
  /** Pad size */
  padSize?: number;
  /** Gap between pads */
  gap?: number;
  /** Called when any pad is triggered */
  onTrigger?: (padId: string, velocity: number) => void;
  /** Called when any pad is released */
  onRelease?: (padId: string) => void;
  /** Label for the grid */
  label?: string;
  /** Currently active pads */
  activePads?: string[];
}

export const DrumPadGrid: React.FC<DrumPadGridProps> = ({
  pads,
  columns = 4,
  padSize = 80,
  gap = 8,
  onTrigger,
  onRelease,
  label,
  activePads = [],
}) => {
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

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${columns}, ${padSize}px)`,
          gap,
        }}
      >
        {pads.map((pad) => (
          <DrumPad
            key={pad.id}
            id={pad.id}
            label={pad.label}
            color={pad.color}
            size={padSize}
            midiNote={pad.midiNote}
            muted={pad.muted}
            active={activePads.includes(pad.id)}
            onTrigger={onTrigger}
            onRelease={onRelease}
          />
        ))}
      </div>
    </div>
  );
};

export default DrumPad;
