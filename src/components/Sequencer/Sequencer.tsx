/**
 * Sequencer
 *
 * A 16-step sequencer in a 4x4 grid layout.
 * Touch-optimized: tap to toggle, drag for velocity, long-press for detail.
 * Piano-roll visualization with playhead.
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import type { SequencerStep, StepType } from '../../types';
import { colors, components } from '../../theme/tokens';
import { moduleStyles, labelStyles } from '../../theme/styles';

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const SEQUENCER = components.sequencer;

interface SequencerProps {
  /** Initial pattern (16 steps) */
  initialPattern?: SequencerStep[];
  /** Called when pattern changes */
  onChange?: (pattern: SequencerStep[]) => void;
  /** Currently playing step (0-15) */
  playingStep?: number | null;
  /** Base octave for notes */
  baseOctave?: number;
  /** How many semitones to display in editor */
  noteRange?: number;
  /** Label text */
  label?: string;
  /** Compact mode for smaller displays */
  compact?: boolean;
}

const createEmptyStep = (): SequencerStep => ({
  type: 'rest' as StepType,
  note: null,
  velocity: 0.8,
});

const getNoteColor = (note: number | null): string => {
  if (note === null) return colors.bg.elevated;
  const noteInOctave = note % 12;
  const noteColors: Record<number, string> = {
    0: colors.accent.coral,    // C
    1: colors.accent.coral,    // C#
    2: colors.accent.orange,   // D
    3: colors.accent.orange,   // D#
    4: colors.accent.yellow,   // E
    5: colors.accent.green,    // F
    6: colors.accent.green,    // F#
    7: colors.accent.cyan,     // G
    8: colors.accent.cyan,     // G#
    9: colors.accent.teal,     // A
    10: colors.accent.teal,    // A#
    11: colors.accent.purple,  // B
  };
  return noteColors[noteInOctave] || colors.accent.cyan;
};

const getNoteName = (note: number | null): string => {
  if (note === null) return '';
  const octave = Math.floor(note / 12);
  return `${NOTE_NAMES[note % 12]}${octave}`;
};

export const Sequencer: React.FC<SequencerProps> = ({
  initialPattern,
  onChange,
  playingStep = null,
  baseOctave = 3,
  noteRange = 24,
  label = 'SEQ',
  compact = false,
}) => {
  // Always 16 steps in 4x4 grid
  const STEPS = 16;

  const [pattern, setPattern] = useState<SequencerStep[]>(() =>
    initialPattern?.slice(0, STEPS) || Array(STEPS).fill(null).map(createEmptyStep)
  );
  const [selectedStep, setSelectedStep] = useState<number | null>(null);
  const [showEditor, setShowEditor] = useState(false);
  const [hoveredStep, setHoveredStep] = useState<number | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ index: number; startY: number; startVelocity: number } | null>(null);
  const longPressRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const baseNote = baseOctave * 12;
  const cellSize = compact ? SEQUENCER.cellSizeCompact : SEQUENCER.cellSize;

  // Ensure pattern is always 16 steps
  useEffect(() => {
    if (pattern.length !== STEPS) {
      const newPattern = [...pattern];
      while (newPattern.length < STEPS) {
        newPattern.push(createEmptyStep());
      }
      newPattern.length = STEPS;
      setPattern(newPattern);
    }
  }, [pattern.length]);

  const updateStep = useCallback((index: number, updates: Partial<SequencerStep>) => {
    setPattern(prev => {
      const newPattern = [...prev];
      newPattern[index] = { ...newPattern[index], ...updates };
      onChange?.(newPattern);
      return newPattern;
    });
  }, [onChange]);

  const toggleStep = useCallback((index: number) => {
    const step = pattern[index];
    if (step.type === 'rest') {
      // Turn on with default note
      updateStep(index, {
        type: 'note',
        note: baseNote + 12, // Middle of range
        velocity: 0.8,
      });
    } else {
      // Turn off
      updateStep(index, {
        type: 'rest',
        note: null,
      });
    }
  }, [pattern, baseNote, updateStep]);

  const handlePointerDown = useCallback((e: React.PointerEvent, index: number) => {
    e.preventDefault();
    const target = e.currentTarget as HTMLElement;
    target.setPointerCapture(e.pointerId);

    setSelectedStep(index);

    // Start long-press timer for editor
    longPressRef.current = setTimeout(() => {
      setShowEditor(true);
      longPressRef.current = null;
    }, 500);

    // Set up drag for velocity adjustment
    dragRef.current = {
      index,
      startY: e.clientY,
      startVelocity: pattern[index].velocity,
    };
  }, [pattern]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragRef.current) return;

    // Cancel long-press if dragging
    if (longPressRef.current) {
      const deltaY = Math.abs(e.clientY - dragRef.current.startY);
      if (deltaY > 10) {
        clearTimeout(longPressRef.current);
        longPressRef.current = null;
      }
    }

    // Adjust velocity with vertical drag
    const deltaY = dragRef.current.startY - e.clientY;
    const sensitivity = 0.008;
    const newVelocity = Math.max(0.1, Math.min(1, dragRef.current.startVelocity + deltaY * sensitivity));

    updateStep(dragRef.current.index, { velocity: newVelocity });
  }, [updateStep]);

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    // Clear long-press timer
    if (longPressRef.current) {
      clearTimeout(longPressRef.current);
      longPressRef.current = null;

      // Short tap - toggle step
      if (dragRef.current) {
        const deltaY = Math.abs(e.clientY - dragRef.current.startY);
        if (deltaY < 10) {
          toggleStep(dragRef.current.index);
        }
      }
    }

    dragRef.current = null;
  }, [toggleStep]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent, index: number) => {
    const step = pattern[index];

    switch (e.key) {
      case ' ':
      case 'Enter':
        e.preventDefault();
        toggleStep(index);
        break;
      case 'ArrowUp':
        e.preventDefault();
        if (step.note !== null) {
          updateStep(index, { note: Math.min(baseNote + noteRange - 1, step.note + (e.shiftKey ? 12 : 1)) });
        }
        break;
      case 'ArrowDown':
        e.preventDefault();
        if (step.note !== null) {
          updateStep(index, { note: Math.max(baseNote, step.note - (e.shiftKey ? 12 : 1)) });
        }
        break;
      case 'ArrowLeft':
        e.preventDefault();
        if (index > 0) {
          setSelectedStep(index - 1);
        }
        break;
      case 'ArrowRight':
        e.preventDefault();
        if (index < STEPS - 1) {
          setSelectedStep(index + 1);
        }
        break;
      case 'Delete':
      case 'Backspace':
        e.preventDefault();
        updateStep(index, { type: 'rest', note: null });
        break;
      case 'e':
      case 'E':
        e.preventDefault();
        setShowEditor(true);
        break;
    }
  }, [pattern, toggleStep, updateStep, baseNote, noteRange]);

  return (
    <div
      ref={containerRef}
      className="synth-control"
      style={{
        ...moduleStyles.base,
        ...(compact ? moduleStyles.compact : {}),
        width: '100%',
      }}
    >
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: compact ? 8 : 12,
      }}>
        {label && (
          <span style={labelStyles.module}>
            {label}
          </span>
        )}
        {selectedStep !== null && pattern[selectedStep].type !== 'rest' && (
          <span style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 'var(--text-sm)',
            color: getNoteColor(pattern[selectedStep].note),
          }}>
            {getNoteName(pattern[selectedStep].note)} • {Math.round(pattern[selectedStep].velocity * 100)}%
          </span>
        )}
      </div>

      {/* 4x4 Step grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: compact ? 6 : 8,
      }}>
        {pattern.map((step, index) => {
          const isPlaying = playingStep === index;
          const isSelected = selectedStep === index;
          const isHovered = hoveredStep === index;
          const isActive = step.type !== 'rest';
          const color = getNoteColor(step.note);

          return (
            <div
              key={index}
              onPointerDown={(e) => handlePointerDown(e, index)}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
              onMouseEnter={() => setHoveredStep(index)}
              onMouseLeave={() => setHoveredStep(null)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              tabIndex={0}
              role="button"
              aria-label={`Step ${index + 1}: ${isActive ? getNoteName(step.note) : 'rest'}`}
              aria-pressed={isActive}
              style={{
                position: 'relative',
                aspectRatio: '1',
                minHeight: cellSize,
                background: colors.bg.elevated,
                borderRadius: 6,
                overflow: 'hidden',
                cursor: 'pointer',
                outline: isSelected
                  ? `2px solid ${colors.accent.cyan}`
                  : isPlaying
                    ? `2px solid ${color}`
                    : 'none',
                outlineOffset: -2,
                transition: 'outline-color 50ms',
              }}
            >
              {/* Beat marker (every 4 steps) */}
              {index % 4 === 0 && (
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: 2,
                  background: colors.text.disabled,
                  opacity: 0.5,
                }} />
              )}

              {/* Note bar visualization - fills cell based on pitch and velocity */}
              {isActive && (
                <div style={{
                  position: 'absolute',
                  inset: 4,
                  background: `linear-gradient(0deg, ${color} 0%, ${color}80 100%)`,
                  borderRadius: 4,
                  opacity: 0.3 + step.velocity * 0.7,
                  transition: 'opacity 100ms',
                }} />
              )}

              {/* Velocity indicator (brightness bar from bottom) */}
              {isActive && (
                <div style={{
                  position: 'absolute',
                  left: 4,
                  right: 4,
                  bottom: 4,
                  height: `calc((100% - 8px) * ${step.velocity})`,
                  background: color,
                  borderRadius: 4,
                  opacity: 0.9,
                  transition: 'height 50ms',
                }} />
              )}

              {/* Step number */}
              <div style={{
                position: 'absolute',
                top: 4,
                right: 4,
                fontFamily: 'var(--font-mono)',
                fontSize: compact ? 8 : 10,
                color: colors.text.disabled,
                opacity: isHovered || isSelected ? 0.8 : 0.4,
              }}>
                {index + 1}
              </div>

              {/* Note name */}
              {isActive && !compact && (
                <div style={{
                  position: 'absolute',
                  bottom: 4,
                  left: 0,
                  right: 0,
                  textAlign: 'center',
                  fontFamily: 'var(--font-mono)',
                  fontSize: 9,
                  color: colors.text.primary,
                  textShadow: '0 1px 2px rgba(0,0,0,0.8)',
                  opacity: 0.9,
                }}>
                  {getNoteName(step.note)}
                </div>
              )}

              {/* Playhead glow */}
              {isPlaying && (
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  background: `radial-gradient(circle at center, ${color}40 0%, transparent 70%)`,
                  pointerEvents: 'none',
                }} />
              )}

              {/* Tie indicator */}
              {step.type === 'tie' && (
                <div style={{
                  position: 'absolute',
                  top: '50%',
                  left: -2,
                  width: 'calc(100% + 4px)',
                  height: 2,
                  background: colors.text.muted,
                  transform: 'translateY(-50%)',
                }} />
              )}

              {/* Sub-sequence indicator */}
              {step.subSteps && step.subSteps.some(s => s.type !== 'rest') && (
                <div style={{
                  position: 'absolute',
                  top: 4,
                  left: 4,
                  width: 6,
                  height: 6,
                  borderRadius: 3,
                  background: colors.accent.cyan,
                  opacity: 0.8,
                }} />
              )}
            </div>
          );
        })}
      </div>

      {/* Step editor modal */}
      {showEditor && selectedStep !== null && (
        <StepEditor
          step={pattern[selectedStep]}
          stepIndex={selectedStep}
          baseNote={baseNote}
          noteRange={noteRange}
          onUpdate={(updates) => updateStep(selectedStep, updates)}
          onClose={() => setShowEditor(false)}
        />
      )}
    </div>
  );
};

// Step Editor Modal
interface StepEditorProps {
  step: SequencerStep;
  stepIndex: number;
  baseNote: number;
  noteRange: number;
  onUpdate: (updates: Partial<SequencerStep>) => void;
  onClose: () => void;
}

const StepEditor: React.FC<StepEditorProps> = ({
  step,
  stepIndex,
  baseNote,
  onUpdate,
  onClose,
}) => {
  const [localNote, setLocalNote] = useState(step.note ?? baseNote + 12);
  const [localVelocity, setLocalVelocity] = useState(step.velocity);
  const [localType, setLocalType] = useState(step.type);

  const handleNoteClick = (note: number) => {
    setLocalNote(note);
    onUpdate({
      note,
      type: localType === 'rest' ? 'note' : localType,
    });
  };

  const handleVelocityChange = (velocity: number) => {
    setLocalVelocity(velocity);
    onUpdate({ velocity });
  };

  const handleTypeChange = (type: StepType) => {
    setLocalType(type);
    if (type === 'rest') {
      onUpdate({ type, note: null });
    } else {
      onUpdate({ type, note: localNote });
    }
  };

  // Piano keyboard - 2 octaves
  const octaveStart = Math.floor(localNote / 12);
  const whiteKeys = [0, 2, 4, 5, 7, 9, 11];
  const blackKeys = [1, 3, -1, 6, 8, 10, -1]; // -1 = no black key

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.9)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: colors.bg.surface,
          borderRadius: 12,
          padding: 24,
          maxWidth: 400,
          width: '90%',
          maxHeight: '90vh',
          overflow: 'auto',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 20,
        }}>
          <span style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 'var(--text-sm)',
            color: colors.text.muted,
          }}>
            STEP {stepIndex + 1}
          </span>
          <span style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 'var(--text-lg)',
            color: getNoteColor(localNote),
          }}>
            {getNoteName(localNote)}
          </span>
        </div>

        {/* Type selector */}
        <div style={{
          display: 'flex',
          gap: 8,
          marginBottom: 20,
        }}>
          {(['note', 'rest', 'tie', 'flam'] as StepType[]).map((type) => (
            <button
              key={type}
              onClick={() => handleTypeChange(type)}
              style={{
                flex: 1,
                padding: '10px 8px',
                background: localType === type ? colors.accent.cyan : colors.bg.elevated,
                color: localType === type ? colors.bg.base : colors.text.muted,
                border: 'none',
                borderRadius: 6,
                fontFamily: 'var(--font-mono)',
                fontSize: 'var(--text-xs)',
                fontWeight: localType === type ? 600 : 400,
                cursor: 'pointer',
                textTransform: 'uppercase',
              }}
            >
              {type}
            </button>
          ))}
        </div>

        {/* Piano keyboard */}
        {localType !== 'rest' && (
          <>
            {/* Octave selector */}
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: 6,
              marginBottom: 16,
            }}>
              {[0, 1, 2, 3, 4, 5, 6].map((oct) => (
                <button
                  key={oct}
                  onClick={() => {
                    const newNote = oct * 12 + (localNote % 12);
                    setLocalNote(newNote);
                    onUpdate({ note: newNote });
                  }}
                  style={{
                    width: 36,
                    height: 36,
                    background: octaveStart === oct ? colors.accent.cyan : colors.bg.elevated,
                    color: octaveStart === oct ? colors.bg.base : colors.text.muted,
                    border: 'none',
                    borderRadius: 6,
                    fontFamily: 'var(--font-mono)',
                    fontSize: 'var(--text-sm)',
                    fontWeight: octaveStart === oct ? 600 : 400,
                    cursor: 'pointer',
                  }}
                >
                  {oct}
                </button>
              ))}
            </div>

            {/* Compact Keys */}
            <div style={{
              position: 'relative',
              height: 60,
              marginBottom: 20,
            }}>
              {/* White keys */}
              <div style={{
                display: 'flex',
                gap: 1,
                justifyContent: 'center',
                height: '100%',
              }}>
                {whiteKeys.map((noteInOctave) => {
                  const note = octaveStart * 12 + noteInOctave;
                  const isSelected = localNote === note;
                  return (
                    <button
                      key={noteInOctave}
                      onClick={() => handleNoteClick(note)}
                      style={{
                        flex: 1,
                        maxWidth: 36,
                        height: '100%',
                        background: isSelected ? getNoteColor(note) : '#fff',
                        border: 'none',
                        borderRadius: '0 0 3px 3px',
                        cursor: 'pointer',
                      }}
                    />
                  );
                })}
              </div>

              {/* Black keys */}
              <div style={{
                position: 'absolute',
                top: 0,
                left: '50%',
                transform: 'translateX(-50%)',
                display: 'flex',
                gap: 1,
                pointerEvents: 'none',
                width: `calc(100% - 8px)`,
                justifyContent: 'center',
              }}>
                {blackKeys.map((noteInOctave, i) => {
                  if (noteInOctave === -1) {
                    return <div key={i} style={{ flex: 1, maxWidth: 37 }} />;
                  }
                  const note = octaveStart * 12 + noteInOctave;
                  const isSelected = localNote === note;
                  return (
                    <button
                      key={i}
                      onClick={() => handleNoteClick(note)}
                      style={{
                        flex: 0.7,
                        maxWidth: 24,
                        height: 36,
                        background: isSelected ? getNoteColor(note) : colors.bg.void,
                        border: 'none',
                        borderRadius: '0 0 2px 2px',
                        cursor: 'pointer',
                        pointerEvents: 'auto',
                      }}
                    />
                  );
                })}
              </div>
            </div>

            {/* Velocity - thick slider like horizontal sliders */}
            <div style={{ marginBottom: 16 }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: 8,
              }}>
                <span style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 'var(--text-xs)',
                  color: colors.text.muted,
                }}>
                  VELOCITY
                </span>
                <span style={{
                  fontFamily: 'var(--font-numeric)',
                  fontSize: 'var(--text-md)',
                  color: colors.text.primary,
                }}>
                  {Math.round(localVelocity * 100)}%
                </span>
              </div>
              {/* Custom thick slider */}
              <div
                style={{
                  position: 'relative',
                  height: 32,
                  background: colors.bg.elevated,
                  borderRadius: 16,
                  cursor: 'ew-resize',
                  touchAction: 'none',
                  overflow: 'hidden',
                }}
                onPointerDown={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const updateVel = (clientX: number) => {
                    const x = clientX - rect.left;
                    const newVel = Math.max(0.1, Math.min(1, x / rect.width));
                    handleVelocityChange(newVel);
                  };
                  updateVel(e.clientX);

                  const handleMove = (moveEvent: PointerEvent) => {
                    updateVel(moveEvent.clientX);
                  };
                  const handleUp = () => {
                    window.removeEventListener('pointermove', handleMove);
                    window.removeEventListener('pointerup', handleUp);
                  };
                  window.addEventListener('pointermove', handleMove);
                  window.addEventListener('pointerup', handleUp);
                }}
              >
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  bottom: 0,
                  width: `${localVelocity * 100}%`,
                  background: colors.accent.cyan,
                  borderRadius: 16,
                }} />
              </div>
            </div>
          </>
        )}

        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            width: '100%',
            padding: 12,
            background: colors.bg.elevated,
            color: colors.text.secondary,
            border: 'none',
            borderRadius: 6,
            fontFamily: 'var(--font-mono)',
            fontSize: 'var(--text-sm)',
            cursor: 'pointer',
          }}
        >
          DONE
        </button>
      </div>
    </div>
  );
};

export default Sequencer;
