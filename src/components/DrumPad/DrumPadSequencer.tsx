/**
 * DrumPadSequencer
 *
 * A 4x4 drum machine style grid sequencer.
 * Each row represents a sound/sample, each column is a beat division.
 * Supports velocity, probability, and multiple patterns.
 *
 * Inspired by TR-808, MPC, and modern drum machines.
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { colors } from '../../theme/tokens';

export interface DrumStep {
  active: boolean;
  velocity: number;
  probability: number;
  accent: boolean;
  flam?: boolean;
}

export interface DrumTrack {
  id: string;
  name: string;
  color?: string;
  steps: DrumStep[];
  muted?: boolean;
  solo?: boolean;
}

export interface DrumPadSequencerProps {
  /** Tracks (rows) - typically 4, 8, or 16 */
  tracks: DrumTrack[];
  /** Steps per track (columns) - typically 16 or 32 */
  stepsPerTrack?: number;
  /** Current playback step (-1 if stopped) */
  currentStep?: number;
  /** Called when a step is toggled */
  onStepToggle?: (trackId: string, stepIndex: number, active: boolean) => void;
  /** Called when a step's velocity changes */
  onVelocityChange?: (trackId: string, stepIndex: number, velocity: number) => void;
  /** Called when track pad is hit (for live triggering) */
  onPadTrigger?: (trackId: string, velocity: number) => void;
  /** Called when mute/solo changes */
  onMuteChange?: (trackId: string, muted: boolean) => void;
  onSoloChange?: (trackId: string, solo: boolean) => void;
  /** Layout mode */
  layout?: '4x4' | '4x8' | '4x16' | '8x16';
  /** Show velocity row per track */
  showVelocity?: boolean;
  /** BPM for display */
  bpm?: number;
  /** Component label */
  label?: string;
  /** Step width in pixels */
  stepSize?: number;
  /** Show pad buttons on left side */
  showPads?: boolean;
  /** Show mute/solo buttons */
  showMuteSolo?: boolean;
}

const DEFAULT_STEP: DrumStep = {
  active: false,
  velocity: 0.8,
  probability: 1,
  accent: false,
};

const TRACK_COLORS = [
  colors.accent.coral,
  colors.accent.orange,
  colors.accent.yellow,
  colors.accent.green,
  colors.accent.cyan,
  colors.accent.purple,
  colors.accent.pink,
  colors.accent.coral,
];

export const DrumPadSequencer: React.FC<DrumPadSequencerProps> = ({
  tracks,
  stepsPerTrack = 16,
  currentStep = -1,
  onStepToggle,
  onVelocityChange,
  onPadTrigger,
  onMuteChange,
  onSoloChange,
  layout = '4x16',
  showVelocity = false,
  bpm = 120,
  label,
  stepSize = 32,
  showPads = true,
  showMuteSolo = true,
}) => {
  const [selectedStep, setSelectedStep] = useState<{ trackId: string; stepIndex: number } | null>(
    null
  );
  const [dragStart, setDragStart] = useState<{
    trackId: string;
    stepIndex: number;
    initialActive: boolean;
  } | null>(null);
  const [lastTouchedPad, setLastTouchedPad] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  // Calculate steps based on layout
  const getLayoutDimensions = () => {
    const [rows, cols] = layout.split('x').map(Number);
    return { rows, cols };
  };

  const { cols } = getLayoutDimensions();
  const visibleSteps = Math.min(stepsPerTrack, cols);

  // Handle step click/toggle
  const handleStepClick = useCallback(
    (trackId: string, stepIndex: number, e: React.MouseEvent | React.TouchEvent) => {
      e.preventDefault();
      const track = tracks.find((t) => t.id === trackId);
      if (!track) return;

      const step = track.steps[stepIndex] || DEFAULT_STEP;
      const newActive = !step.active;

      onStepToggle?.(trackId, stepIndex, newActive);

      // For shift+click, toggle accent
      if ('shiftKey' in e && e.shiftKey && step.active) {
        // Would toggle accent instead
        return;
      }
    },
    [tracks, onStepToggle]
  );

  // Handle drag to paint steps
  const handleStepDragStart = useCallback(
    (trackId: string, stepIndex: number, e: React.MouseEvent) => {
      if (e.button !== 0) return;

      const track = tracks.find((t) => t.id === trackId);
      if (!track) return;

      const step = track.steps[stepIndex] || DEFAULT_STEP;
      setDragStart({ trackId, stepIndex, initialActive: step.active });
    },
    [tracks]
  );

  const handleStepDragEnter = useCallback(
    (trackId: string, stepIndex: number) => {
      if (!dragStart || dragStart.trackId !== trackId) return;

      const track = tracks.find((t) => t.id === trackId);
      if (!track) return;

      const step = track.steps[stepIndex] || DEFAULT_STEP;
      const shouldActivate = !dragStart.initialActive;

      if (step.active !== shouldActivate) {
        onStepToggle?.(trackId, stepIndex, shouldActivate);
      }
    },
    [dragStart, tracks, onStepToggle]
  );

  const handleDragEnd = useCallback(() => {
    setDragStart(null);
  }, []);

  // Global mouse up listener
  useEffect(() => {
    window.addEventListener('mouseup', handleDragEnd);
    return () => window.removeEventListener('mouseup', handleDragEnd);
  }, [handleDragEnd]);

  // Handle pad trigger (for live play)
  const handlePadClick = useCallback(
    (trackId: string, e: React.MouseEvent | React.TouchEvent) => {
      e.preventDefault();
      setLastTouchedPad(trackId);

      // Calculate velocity from click position (lower = harder hit)
      const target = e.currentTarget as HTMLElement;
      const rect = target.getBoundingClientRect();
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      const relY = (clientY - rect.top) / rect.height;
      const velocity = Math.max(0.3, Math.min(1, 1 - relY * 0.5));

      onPadTrigger?.(trackId, velocity);
    },
    [onPadTrigger]
  );

  // Handle velocity editing via vertical drag on step
  const handleVelocityDrag = useCallback(
    (trackId: string, stepIndex: number, e: React.MouseEvent) => {
      if (!e.altKey) return;
      e.preventDefault();

      const startY = e.clientY;
      const track = tracks.find((t) => t.id === trackId);
      if (!track) return;

      const startVelocity = track.steps[stepIndex]?.velocity ?? 0.8;

      const handleMove = (moveE: MouseEvent) => {
        const deltaY = startY - moveE.clientY;
        const newVelocity = Math.max(0, Math.min(1, startVelocity + deltaY * 0.01));
        onVelocityChange?.(trackId, stepIndex, newVelocity);
      };

      const handleUp = () => {
        window.removeEventListener('mousemove', handleMove);
        window.removeEventListener('mouseup', handleUp);
      };

      window.addEventListener('mousemove', handleMove);
      window.addEventListener('mouseup', handleUp);
    },
    [tracks, onVelocityChange]
  );

  // Get step color based on track and state
  const getStepColor = (track: DrumTrack, step: DrumStep, _index: number): string => {
    const baseColor = track.color || TRACK_COLORS[tracks.indexOf(track) % TRACK_COLORS.length];

    if (!step.active) {
      return colors.bg.elevated;
    }

    if (step.accent) {
      return colors.text.primary;
    }

    return baseColor;
  };

  // Render beat markers
  const beatMarkers = [];
  for (let i = 0; i < visibleSteps; i++) {
    if (i % 4 === 0) {
      beatMarkers.push(
        <div
          key={`beat-${i}`}
          style={{
            position: 'absolute',
            left: showPads ? 64 + i * stepSize + stepSize / 2 : i * stepSize + stepSize / 2,
            top: -16,
            transform: 'translateX(-50%)',
            fontSize: 10,
            color: colors.text.muted,
            fontFamily: 'var(--font-mono)',
          }}
        >
          {i / 4 + 1}
        </div>
      );
    }
  }

  return (
    <div
      ref={containerRef}
      className="synth-control"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        padding: 16,
        background: colors.bg.surface,
        borderRadius: 8,
        userSelect: 'none',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 8,
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
            fontFamily: 'var(--font-numeric)',
            fontSize: 12,
            color: colors.text.muted,
          }}
        >
          {bpm} BPM
        </div>
      </div>

      {/* Beat markers */}
      <div style={{ position: 'relative', height: 16 }}>{beatMarkers}</div>

      {/* Grid */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {tracks.map((track, trackIndex) => {
          const trackColor =
            track.color || TRACK_COLORS[trackIndex % TRACK_COLORS.length];

          return (
            <div
              key={track.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                opacity: track.muted ? 0.4 : 1,
              }}
            >
              {/* Pad button (for live triggering) */}
              {showPads && (
                <button
                  onMouseDown={(e) => handlePadClick(track.id, e)}
                  onTouchStart={(e) => handlePadClick(track.id, e)}
                  style={{
                    width: 56,
                    height: stepSize,
                    background:
                      lastTouchedPad === track.id
                        ? trackColor
                        : colors.bg.elevated,
                    border: `1px solid ${trackColor}`,
                    borderRadius: 4,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'background 0.1s',
                    flexShrink: 0,
                  }}
                  title={`Trigger ${track.name}`}
                >
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: 9,
                      color:
                        lastTouchedPad === track.id
                          ? colors.bg.base
                          : trackColor,
                      textTransform: 'uppercase',
                    }}
                  >
                    {track.name.slice(0, 4)}
                  </span>
                </button>
              )}

              {/* Steps */}
              <div style={{ display: 'flex', gap: 2 }}>
                {Array.from({ length: visibleSteps }).map((_, stepIndex) => {
                  const step = track.steps[stepIndex] || DEFAULT_STEP;
                  const isCurrentStep = stepIndex === currentStep;
                  const isSelected =
                    selectedStep?.trackId === track.id &&
                    selectedStep?.stepIndex === stepIndex;
                  const isBeatStart = stepIndex % 4 === 0;

                  return (
                    <div
                      key={stepIndex}
                      onMouseDown={(e) => {
                        handleStepClick(track.id, stepIndex, e);
                        handleStepDragStart(track.id, stepIndex, e);
                        if (e.altKey) handleVelocityDrag(track.id, stepIndex, e);
                      }}
                      onMouseEnter={() => handleStepDragEnter(track.id, stepIndex)}
                      onClick={() =>
                        setSelectedStep({ trackId: track.id, stepIndex })
                      }
                      style={{
                        width: stepSize - 2,
                        height: stepSize - 2,
                        background: getStepColor(track, step, stepIndex),
                        borderRadius: 3,
                        cursor: 'pointer',
                        position: 'relative',
                        border: isCurrentStep
                          ? `2px solid ${colors.text.primary}`
                          : isSelected
                          ? `2px solid ${colors.accent.cyan}`
                          : isBeatStart
                          ? `1px solid ${colors.bg.highlight}`
                          : '1px solid transparent',
                        opacity: step.active ? step.velocity * 0.5 + 0.5 : 0.3,
                        transition: 'background 0.05s, border-color 0.05s',
                      }}
                      title={
                        step.active
                          ? `Vel: ${Math.round(step.velocity * 100)}%`
                          : undefined
                      }
                    >
                      {/* Velocity bar */}
                      {showVelocity && step.active && (
                        <div
                          style={{
                            position: 'absolute',
                            bottom: 0,
                            left: 0,
                            right: 0,
                            height: `${step.velocity * 100}%`,
                            background: trackColor,
                            opacity: 0.5,
                            borderRadius: '0 0 2px 2px',
                            pointerEvents: 'none',
                          }}
                        />
                      )}

                      {/* Accent indicator */}
                      {step.accent && (
                        <div
                          style={{
                            position: 'absolute',
                            top: 2,
                            right: 2,
                            width: 4,
                            height: 4,
                            background: colors.text.primary,
                            borderRadius: '50%',
                          }}
                        />
                      )}

                      {/* Probability indicator */}
                      {step.probability < 1 && step.active && (
                        <div
                          style={{
                            position: 'absolute',
                            bottom: 2,
                            left: '50%',
                            transform: 'translateX(-50%)',
                            fontSize: 6,
                            color: colors.text.muted,
                            fontFamily: 'var(--font-mono)',
                          }}
                        >
                          {Math.round(step.probability * 100)}%
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Mute/Solo */}
              {showMuteSolo && (
                <div style={{ display: 'flex', gap: 2, marginLeft: 4 }}>
                  <button
                    onClick={() => onMuteChange?.(track.id, !track.muted)}
                    style={{
                      width: 20,
                      height: 20,
                      background: track.muted
                        ? colors.semantic.warning
                        : colors.bg.elevated,
                      border: 'none',
                      borderRadius: 2,
                      cursor: 'pointer',
                      fontSize: 8,
                      color: track.muted ? colors.bg.base : colors.text.muted,
                      fontFamily: 'var(--font-mono)',
                    }}
                    title="Mute"
                  >
                    M
                  </button>
                  <button
                    onClick={() => onSoloChange?.(track.id, !track.solo)}
                    style={{
                      width: 20,
                      height: 20,
                      background: track.solo
                        ? colors.accent.yellow
                        : colors.bg.elevated,
                      border: 'none',
                      borderRadius: 2,
                      cursor: 'pointer',
                      fontSize: 8,
                      color: track.solo ? colors.bg.base : colors.text.muted,
                      fontFamily: 'var(--font-mono)',
                    }}
                    title="Solo"
                  >
                    S
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Step info / velocity editor */}
      {selectedStep && (
        <div
          style={{
            marginTop: 8,
            padding: 8,
            background: colors.bg.elevated,
            borderRadius: 4,
            display: 'flex',
            gap: 16,
            alignItems: 'center',
          }}
        >
          <span
            style={{
              fontSize: 10,
              color: colors.text.muted,
              fontFamily: 'var(--font-mono)',
            }}
          >
            Step {selectedStep.stepIndex + 1}
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span
              style={{
                fontSize: 9,
                color: colors.text.disabled,
                fontFamily: 'var(--font-mono)',
              }}
            >
              VEL
            </span>
            <input
              type="range"
              min={0}
              max={100}
              value={
                (tracks
                  .find((t) => t.id === selectedStep.trackId)
                  ?.steps[selectedStep.stepIndex]?.velocity ?? 0.8) * 100
              }
              onChange={(e) =>
                onVelocityChange?.(
                  selectedStep.trackId,
                  selectedStep.stepIndex,
                  parseInt(e.target.value) / 100
                )
              }
              style={{ width: 80 }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default DrumPadSequencer;
