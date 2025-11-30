/**
 * TimeInput
 *
 * A dual-mode time input supporting both tempo-synced (beat divisions)
 * and free-running (milliseconds/seconds) time values.
 *
 * Essential for delay times, LFO rates, envelope times, etc.
 * where users may want either musical timing or precise ms values.
 */

import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { colors } from '../../theme/tokens';

export type TimeMode = 'sync' | 'free';

export interface SyncDivision {
  numerator: number;
  denominator: number;
  label: string;
  dotted?: boolean;
  triplet?: boolean;
}

export interface TimeValue {
  mode: TimeMode;
  /** Time in milliseconds (always available) */
  ms: number;
  /** Sync division (when in sync mode) */
  division?: SyncDivision;
}

export interface TimeInputProps {
  /** Current time value */
  value?: Partial<TimeValue>;
  /** Called when time changes */
  onChange?: (value: TimeValue) => void;
  /** Current BPM (for sync calculations) */
  bpm?: number;
  /** Component label */
  label?: string;
  /** Minimum time in ms */
  minMs?: number;
  /** Maximum time in ms */
  maxMs?: number;
  /** Show mode toggle */
  showModeToggle?: boolean;
  /** Default mode */
  defaultMode?: TimeMode;
  /** Available sync divisions */
  divisions?: SyncDivision[];
  /** Show dotted/triplet variants */
  showDottedTriplet?: boolean;
  /** Compact mode */
  compact?: boolean;
}

// Common beat divisions
const DEFAULT_DIVISIONS: SyncDivision[] = [
  { numerator: 4, denominator: 1, label: '4' },
  { numerator: 2, denominator: 1, label: '2' },
  { numerator: 1, denominator: 1, label: '1' },
  { numerator: 1, denominator: 2, label: '1/2' },
  { numerator: 1, denominator: 4, label: '1/4' },
  { numerator: 1, denominator: 8, label: '1/8' },
  { numerator: 1, denominator: 16, label: '1/16' },
  { numerator: 1, denominator: 32, label: '1/32' },
];

const DOTTED_DIVISIONS: SyncDivision[] = [
  { numerator: 3, denominator: 4, label: '1/2.', dotted: true },
  { numerator: 3, denominator: 8, label: '1/4.', dotted: true },
  { numerator: 3, denominator: 16, label: '1/8.', dotted: true },
];

const TRIPLET_DIVISIONS: SyncDivision[] = [
  { numerator: 1, denominator: 3, label: '1/2T', triplet: true },
  { numerator: 1, denominator: 6, label: '1/4T', triplet: true },
  { numerator: 1, denominator: 12, label: '1/8T', triplet: true },
];

// Convert sync division to milliseconds at given BPM
const divisionToMs = (division: SyncDivision, bpm: number): number => {
  // Quarter note duration at BPM
  const quarterNoteMs = 60000 / bpm;
  // Full measure duration (4 quarter notes)
  const measureMs = quarterNoteMs * 4;
  // Calculate division duration
  return measureMs * (division.numerator / division.denominator);
};

// Find closest division to a ms value
const findClosestDivision = (
  ms: number,
  bpm: number,
  divisions: SyncDivision[]
): SyncDivision | null => {
  let closest: SyncDivision | null = null;
  let minDiff = Infinity;

  for (const div of divisions) {
    const divMs = divisionToMs(div, bpm);
    const diff = Math.abs(divMs - ms);
    if (diff < minDiff) {
      minDiff = diff;
      closest = div;
    }
  }

  return closest;
};

// Format milliseconds for display
const formatMs = (ms: number): string => {
  if (ms >= 1000) {
    return `${(ms / 1000).toFixed(2)}s`;
  }
  return `${Math.round(ms)}ms`;
};

export const TimeInput: React.FC<TimeInputProps> = ({
  value = {},
  onChange,
  bpm = 120,
  label,
  minMs = 1,
  maxMs = 10000,
  showModeToggle = true,
  defaultMode = 'sync',
  divisions = DEFAULT_DIVISIONS,
  showDottedTriplet = true,
  compact = false,
}) => {
  const [mode, setMode] = useState<TimeMode>(value.mode ?? defaultMode);
  const [ms, setMs] = useState(value.ms ?? 500);
  const [selectedDivision, setSelectedDivision] = useState<SyncDivision | null>(
    value.division ?? divisions[4] // Default to 1/4
  );

  const sliderRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ startX: number; startMs: number } | null>(null);

  // All available divisions
  const allDivisions = useMemo(() => {
    if (!showDottedTriplet) return divisions;
    return [...divisions, ...DOTTED_DIVISIONS, ...TRIPLET_DIVISIONS].sort(
      (a, b) => b.numerator / b.denominator - a.numerator / a.denominator
    );
  }, [divisions, showDottedTriplet]);

  // Update ms when division changes in sync mode
  useEffect(() => {
    if (mode === 'sync' && selectedDivision) {
      const newMs = divisionToMs(selectedDivision, bpm);
      if (Math.abs(newMs - ms) > 1) {
        setMs(newMs);
        onChange?.({
          mode,
          ms: newMs,
          division: selectedDivision,
        });
      }
    }
  }, [selectedDivision, bpm, mode]);

  // Update when BPM changes
  useEffect(() => {
    if (mode === 'sync' && selectedDivision) {
      const newMs = divisionToMs(selectedDivision, bpm);
      setMs(newMs);
      onChange?.({
        mode,
        ms: newMs,
        division: selectedDivision,
      });
    }
  }, [bpm]);

  const handleModeChange = useCallback(
    (newMode: TimeMode) => {
      setMode(newMode);

      if (newMode === 'sync') {
        // Find closest division to current ms
        const closest = findClosestDivision(ms, bpm, allDivisions);
        if (closest) {
          setSelectedDivision(closest);
          const newMs = divisionToMs(closest, bpm);
          setMs(newMs);
          onChange?.({ mode: newMode, ms: newMs, division: closest });
        }
      } else {
        onChange?.({ mode: newMode, ms, division: undefined });
      }
    },
    [ms, bpm, allDivisions, onChange]
  );

  const handleDivisionSelect = useCallback(
    (division: SyncDivision) => {
      setSelectedDivision(division);
      const newMs = divisionToMs(division, bpm);
      setMs(newMs);
      onChange?.({ mode, ms: newMs, division });
    },
    [bpm, mode, onChange]
  );

  const handleMsChange = useCallback(
    (newMs: number) => {
      const clamped = Math.max(minMs, Math.min(maxMs, newMs));
      setMs(clamped);
      onChange?.({ mode, ms: clamped, division: undefined });
    },
    [mode, minMs, maxMs, onChange]
  );

  // Drag handling for free mode slider
  const handleSliderDrag = useCallback(
    (e: React.MouseEvent) => {
      if (mode !== 'free') return;
      e.preventDefault();

      dragRef.current = { startX: e.clientX, startMs: ms };

      const handleMove = (moveE: MouseEvent) => {
        if (!dragRef.current || !sliderRef.current) return;
        const rect = sliderRef.current.getBoundingClientRect();
        const deltaX = moveE.clientX - dragRef.current.startX;
        
        // Logarithmic scaling for better UX
        const logMin = Math.log(minMs);
        const logMax = Math.log(maxMs);
        const currentLog = Math.log(dragRef.current.startMs);
        const newLog = currentLog + (deltaX / rect.width) * (logMax - logMin);
        const newMs = Math.exp(newLog);
        handleMsChange(newMs);
      };

      const handleUp = () => {
        dragRef.current = null;
        window.removeEventListener('mousemove', handleMove);
        window.removeEventListener('mouseup', handleUp);
      };

      window.addEventListener('mousemove', handleMove);
      window.addEventListener('mouseup', handleUp);
    },
    [mode, ms, minMs, maxMs, handleMsChange]
  );

  // Calculate slider position (logarithmic)
  const sliderPosition = useMemo(() => {
    const logMin = Math.log(minMs);
    const logMax = Math.log(maxMs);
    const logValue = Math.log(ms);
    return ((logValue - logMin) / (logMax - logMin)) * 100;
  }, [ms, minMs, maxMs]);

  const displayMs = mode === 'sync' && selectedDivision
    ? divisionToMs(selectedDivision, bpm)
    : ms;

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

        {/* Time display */}
        <div
          style={{
            fontFamily: 'var(--font-numeric)',
            fontSize: compact ? 14 : 18,
            fontWeight: 600,
            color: mode === 'sync' ? colors.accent.cyan : colors.accent.orange,
          }}
        >
          {mode === 'sync' && selectedDivision
            ? selectedDivision.label
            : formatMs(displayMs)}
        </div>
      </div>

      {/* Mode toggle */}
      {showModeToggle && (
        <div
          style={{
            display: 'flex',
            background: colors.bg.base,
            borderRadius: 4,
            padding: 2,
          }}
        >
          <button
            onClick={() => handleModeChange('sync')}
            style={{
              flex: 1,
              padding: '6px 12px',
              background: mode === 'sync' ? colors.accent.cyan : 'transparent',
              border: 'none',
              borderRadius: 3,
              cursor: 'pointer',
              fontSize: 10,
              fontFamily: 'var(--font-mono)',
              fontWeight: mode === 'sync' ? 600 : 400,
              color: mode === 'sync' ? colors.bg.base : colors.text.muted,
              transition: 'background 0.1s',
            }}
          >
            SYNC
          </button>
          <button
            onClick={() => handleModeChange('free')}
            style={{
              flex: 1,
              padding: '6px 12px',
              background: mode === 'free' ? colors.accent.orange : 'transparent',
              border: 'none',
              borderRadius: 3,
              cursor: 'pointer',
              fontSize: 10,
              fontFamily: 'var(--font-mono)',
              fontWeight: mode === 'free' ? 600 : 400,
              color: mode === 'free' ? colors.bg.base : colors.text.muted,
              transition: 'background 0.1s',
            }}
          >
            FREE
          </button>
        </div>
      )}

      {/* Sync mode - division buttons */}
      {mode === 'sync' && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 4,
          }}
        >
          {/* Main divisions */}
          <div style={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            {divisions.map((div) => {
              const isSelected =
                selectedDivision?.label === div.label;
              return (
                <button
                  key={div.label}
                  onClick={() => handleDivisionSelect(div)}
                  style={{
                    padding: compact ? '4px 6px' : '6px 10px',
                    background: isSelected
                      ? colors.accent.cyan
                      : colors.bg.elevated,
                    border: isSelected ? 'none' : `1px solid ${colors.bg.highlight}`,
                    borderRadius: 3,
                    cursor: 'pointer',
                    fontSize: 10,
                    fontFamily: 'var(--font-mono)',
                    fontWeight: isSelected ? 600 : 400,
                    color: isSelected ? colors.bg.base : colors.text.secondary,
                  }}
                >
                  {div.label}
                </button>
              );
            })}
          </div>

          {/* Dotted/triplet variants */}
          {showDottedTriplet && (
            <div style={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <span
                style={{
                  fontSize: 8,
                  color: colors.text.disabled,
                  fontFamily: 'var(--font-mono)',
                  alignSelf: 'center',
                  marginRight: 4,
                }}
              >
                DOT/TRIP
              </span>
              {[...DOTTED_DIVISIONS, ...TRIPLET_DIVISIONS].map((div) => {
                const isSelected =
                  selectedDivision?.label === div.label;
                return (
                  <button
                    key={div.label}
                    onClick={() => handleDivisionSelect(div)}
                    style={{
                      padding: '3px 6px',
                      background: isSelected
                        ? colors.accent.cyan
                        : colors.bg.elevated,
                      border: isSelected ? 'none' : `1px solid ${colors.bg.highlight}`,
                      borderRadius: 3,
                      cursor: 'pointer',
                      fontSize: 9,
                      fontFamily: 'var(--font-mono)',
                      fontWeight: isSelected ? 600 : 400,
                      color: isSelected ? colors.bg.base : colors.text.muted,
                    }}
                  >
                    {div.label}
                  </button>
                );
              })}
            </div>
          )}

          {/* Ms equivalent display */}
          <div
            style={{
              fontSize: 9,
              color: colors.text.disabled,
              fontFamily: 'var(--font-mono)',
              textAlign: 'right',
            }}
          >
            = {formatMs(displayMs)} @ {bpm} BPM
          </div>
        </div>
      )}

      {/* Free mode - ms slider */}
      {mode === 'free' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {/* Slider */}
          <div
            ref={sliderRef}
            onMouseDown={handleSliderDrag}
            style={{
              height: 28,
              background: colors.bg.base,
              borderRadius: 4,
              position: 'relative',
              cursor: 'ew-resize',
            }}
          >
            {/* Track fill */}
            <div
              style={{
                position: 'absolute',
                left: 0,
                top: 0,
                bottom: 0,
                width: `${sliderPosition}%`,
                background: colors.accent.orange,
                borderRadius: 4,
                opacity: 0.5,
              }}
            />

            {/* Thumb */}
            <div
              style={{
                position: 'absolute',
                left: `${sliderPosition}%`,
                top: '50%',
                transform: 'translate(-50%, -50%)',
                width: 16,
                height: 16,
                background: colors.text.primary,
                borderRadius: '50%',
                border: `2px solid ${colors.bg.base}`,
              }}
            />

            {/* Scale labels */}
            <div
              style={{
                position: 'absolute',
                bottom: -16,
                left: 0,
                right: 0,
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: 8,
                color: colors.text.disabled,
                fontFamily: 'var(--font-mono)',
              }}
            >
              <span>{formatMs(minMs)}</span>
              <span>{formatMs(maxMs)}</span>
            </div>
          </div>

          {/* Direct input */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              marginTop: 8,
            }}
          >
            <input
              type="number"
              value={Math.round(ms)}
              onChange={(e) => handleMsChange(parseInt(e.target.value) || 0)}
              style={{
                width: 80,
                padding: '4px 8px',
                background: colors.bg.elevated,
                border: `1px solid ${colors.bg.highlight}`,
                borderRadius: 3,
                color: colors.text.primary,
                fontSize: 12,
                fontFamily: 'var(--font-numeric)',
                textAlign: 'right',
              }}
              min={minMs}
              max={maxMs}
            />
            <span
              style={{
                fontSize: 10,
                color: colors.text.muted,
                fontFamily: 'var(--font-mono)',
              }}
            >
              ms
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default TimeInput;
