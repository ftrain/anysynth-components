/**
 * Transport Controls
 *
 * Play, stop, record with tempo and position display.
 * Clean, minimal interface for DAW-style control.
 */

import React, { useState, useCallback } from 'react';
import type { TransportState } from '../../types';
import { colors } from '../../theme/tokens';

interface TransportProps {
  state: TransportState;
  onStateChange?: (state: Partial<TransportState>) => void;
  showPosition?: boolean;
  showBpm?: boolean;
  showTimeSignature?: boolean;
  compact?: boolean;
}

export const Transport: React.FC<TransportProps> = ({
  state,
  onStateChange,
  showPosition = true,
  showBpm = true,
  showTimeSignature = false,
  compact = false,
}) => {
  const [editingBpm, setEditingBpm] = useState(false);
  const [bpmInput, setBpmInput] = useState(state.bpm.toString());

  const handlePlay = useCallback(() => {
    onStateChange?.({ playing: !state.playing, recording: false });
  }, [state.playing, onStateChange]);

  const handleStop = useCallback(() => {
    onStateChange?.({ playing: false, recording: false, position: 0 });
  }, [onStateChange]);

  const handleRecord = useCallback(() => {
    onStateChange?.({ recording: !state.recording, playing: true });
  }, [state.recording, onStateChange]);

  const handleLoop = useCallback(() => {
    onStateChange?.({ loop: !state.loop });
  }, [state.loop, onStateChange]);

  const handleBpmSubmit = useCallback(() => {
    const newBpm = parseInt(bpmInput);
    if (newBpm >= 20 && newBpm <= 999) {
      onStateChange?.({ bpm: newBpm });
    } else {
      setBpmInput(state.bpm.toString());
    }
    setEditingBpm(false);
  }, [bpmInput, state.bpm, onStateChange]);

  const formatPosition = (beats: number): string => {
    const bars = Math.floor(beats / state.timeSignature[0]) + 1;
    const beat = Math.floor(beats % state.timeSignature[0]) + 1;
    const tick = Math.round((beats % 1) * 100);
    return `${bars}.${beat}.${tick.toString().padStart(2, '0')}`;
  };

  const buttonSize = compact ? 36 : 44;
  const iconSize = compact ? 16 : 20;

  return (
    <div
      className="synth-control"
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'center',
        gap: compact ? 8 : 16,
        padding: compact ? 8 : 16,
        background: colors.bg.surface,
        borderRadius: 8,
      }}
    >
      {/* Transport buttons */}
      <div style={{ display: 'flex', gap: 4 }}>
        {/* Stop */}
        <button
          onClick={handleStop}
          aria-label="Stop"
          style={{
            width: buttonSize,
            height: buttonSize,
            background: colors.bg.elevated,
            border: 'none',
            borderRadius: 4,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill={colors.text.secondary}>
            <rect x="6" y="6" width="12" height="12" rx="1" />
          </svg>
        </button>

        {/* Play/Pause */}
        <button
          onClick={handlePlay}
          aria-label={state.playing ? 'Pause' : 'Play'}
          style={{
            width: buttonSize,
            height: buttonSize,
            background: state.playing ? colors.semantic.playing : colors.bg.elevated,
            border: 'none',
            borderRadius: 4,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'background 100ms',
          }}
        >
          {state.playing ? (
            <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill={state.playing ? colors.bg.base : colors.text.secondary}>
              <rect x="6" y="5" width="4" height="14" rx="1" />
              <rect x="14" y="5" width="4" height="14" rx="1" />
            </svg>
          ) : (
            <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill={colors.text.secondary}>
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </button>

        {/* Record */}
        <button
          onClick={handleRecord}
          aria-label="Record"
          style={{
            width: buttonSize,
            height: buttonSize,
            background: state.recording ? colors.semantic.recording : colors.bg.elevated,
            border: 'none',
            borderRadius: 4,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'background 100ms',
          }}
        >
          <svg width={iconSize} height={iconSize} viewBox="0 0 24 24">
            <circle
              cx="12"
              cy="12"
              r="6"
              fill={state.recording ? colors.bg.base : colors.semantic.recording}
            />
          </svg>
        </button>

        {/* Loop */}
        <button
          onClick={handleLoop}
          aria-label="Loop"
          style={{
            width: buttonSize,
            height: buttonSize,
            background: state.loop ? colors.accent.purple : colors.bg.elevated,
            border: 'none',
            borderRadius: 4,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'background 100ms',
          }}
        >
          <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill={state.loop ? colors.bg.base : colors.text.secondary}>
            <path d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8l1.46 1.46C19.54 15.03 20 13.57 20 12c0-4.42-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6 0-1.01.25-1.97.7-2.8L5.24 7.74C4.46 8.97 4 10.43 4 12c0 4.42 3.58 8 8 8v3l4-4-4-4v3z" />
          </svg>
        </button>
      </div>

      {/* Position display */}
      {showPosition && (
        <div style={{
          fontFamily: 'var(--font-mono)',
          fontSize: compact ? 'var(--text-md)' : 'var(--text-lg)',
          color: state.playing ? colors.text.primary : colors.text.secondary,
          letterSpacing: '0.05em',
          minWidth: compact ? 60 : 80,
          textAlign: 'center',
        }}>
          {formatPosition(state.position)}
        </div>
      )}

      {/* BPM */}
      {showBpm && (
        <div style={{
          display: 'flex',
          alignItems: 'baseline',
          gap: 4,
        }}>
          {editingBpm ? (
            <input
              type="number"
              value={bpmInput}
              onChange={(e) => setBpmInput(e.target.value)}
              onBlur={handleBpmSubmit}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleBpmSubmit();
                if (e.key === 'Escape') {
                  setBpmInput(state.bpm.toString());
                  setEditingBpm(false);
                }
              }}
              autoFocus
              style={{
                width: 48,
                background: colors.bg.elevated,
                border: `1px solid ${colors.accent.cyan}`,
                borderRadius: 4,
                color: colors.text.primary,
                fontFamily: 'var(--font-numeric)',
                fontSize: compact ? 'var(--text-md)' : 'var(--text-lg)',
                textAlign: 'center',
                padding: '2px 4px',
              }}
            />
          ) : (
            <button
              onClick={() => setEditingBpm(true)}
              style={{
                background: 'none',
                border: 'none',
                fontFamily: 'var(--font-numeric)',
                fontSize: compact ? 'var(--text-md)' : 'var(--text-lg)',
                color: colors.text.primary,
                cursor: 'pointer',
                padding: '2px 4px',
              }}
            >
              {state.bpm}
            </button>
          )}
          <span style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 'var(--text-xs)',
            color: colors.text.muted,
          }}>
            BPM
          </span>
        </div>
      )}

      {/* Time signature */}
      {showTimeSignature && (
        <div style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 'var(--text-sm)',
          color: colors.text.muted,
        }}>
          {state.timeSignature[0]}/{state.timeSignature[1]}
        </div>
      )}
    </div>
  );
};

export default Transport;
