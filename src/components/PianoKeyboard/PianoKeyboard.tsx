/**
 * PianoKeyboard
 *
 * Interactive piano keyboard for note input.
 * Supports touch, mouse, and computer keyboard input.
 * Configurable range and highlighting.
 */

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { colors, components } from '../../theme/tokens';
import { moduleStyles, labelStyles } from '../../theme/styles';

// Theme constants
const KEYBOARD = components.keyboard;

interface PianoKeyboardProps {
  /** Starting octave */
  startOctave?: number;
  /** Number of octaves to display */
  octaves?: number;
  /** Currently active notes (MIDI numbers) */
  activeNotes?: number[];
  /** Highlighted notes (for scale/chord display) */
  highlightedNotes?: number[];
  /** Called when a note is pressed */
  onNoteOn?: (note: number, velocity: number) => void;
  /** Called when a note is released */
  onNoteOff?: (note: number) => void;
  /** Enable computer keyboard input */
  enableKeyboard?: boolean;
  /** Height in pixels */
  height?: number;
  /** Show note names on keys */
  showNoteNames?: boolean;
  /** Color for active notes */
  activeColor?: string;
  /** Color for highlighted notes */
  highlightColor?: string;
  label?: string;
  /** Compact mode for mobile */
  compact?: boolean;
  /** Auto-switch to compact below this width (0 to disable) */
  compactBreakpoint?: number;
}

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const WHITE_KEYS = [0, 2, 4, 5, 7, 9, 11]; // C, D, E, F, G, A, B
const BLACK_KEYS = [1, 3, 6, 8, 10]; // C#, D#, F#, G#, A#

// Computer keyboard mapping (two rows)
const KEY_MAP: Record<string, number> = {
  // Lower row: C3 - B3
  'a': 0, 'w': 1, 's': 2, 'e': 3, 'd': 4,
  'f': 5, 't': 6, 'g': 7, 'y': 8, 'h': 9, 'u': 10, 'j': 11,
  // Upper row: C4 - B4
  'k': 12, 'o': 13, 'l': 14, 'p': 15, ';': 16,
  "'": 17,
};

export const PianoKeyboard: React.FC<PianoKeyboardProps> = ({
  startOctave = 3,
  octaves = 2,
  activeNotes = [],
  highlightedNotes = [],
  onNoteOn,
  onNoteOff,
  enableKeyboard = true,
  height,
  showNoteNames = false,
  activeColor = colors.accent.cyan,
  highlightColor = colors.accent.purple,
  label,
  compact = false,
  compactBreakpoint = 400,
}) => {
  const [pressedKeys, setPressedKeys] = useState<Set<number>>(new Set());
  const [containerWidth, setContainerWidth] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Responsive compact detection
  const isCompact = compact || (compactBreakpoint > 0 && containerWidth > 0 && containerWidth < compactBreakpoint);

  // Use theme heights
  const effectiveHeight = height ?? (isCompact ? KEYBOARD.heightCompact : KEYBOARD.height);

  const startNote = startOctave * 12;
  const endNote = (startOctave + octaves) * 12;
  const totalWhiteKeys = octaves * 7;

  // Calculate white key width based on container
  const whiteKeyWidth = 100 / totalWhiteKeys;
  const blackKeyWidth = whiteKeyWidth * KEYBOARD.blackKeyRatio;
  const blackKeyHeight = effectiveHeight * KEYBOARD.blackKeyHeight;

  // Observe container width for responsive behavior
  useEffect(() => {
    if (!containerRef.current || compactBreakpoint === 0) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerWidth(entry.contentRect.width);
      }
    });

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [compactBreakpoint]);

  const isBlackKey = (note: number): boolean => {
    return BLACK_KEYS.includes(note % 12);
  };

  const isActive = (note: number): boolean => {
    return activeNotes.includes(note) || pressedKeys.has(note);
  };

  const isHighlighted = (note: number): boolean => {
    return highlightedNotes.includes(note % 12) || highlightedNotes.includes(note);
  };

  const getNoteName = (note: number): string => {
    return NOTE_NAMES[note % 12] + Math.floor(note / 12);
  };

  const handleNoteOn = useCallback((note: number) => {
    if (!pressedKeys.has(note)) {
      setPressedKeys(prev => new Set(prev).add(note));
      onNoteOn?.(note, 0.8);
    }
  }, [pressedKeys, onNoteOn]);

  const handleNoteOff = useCallback((note: number) => {
    if (pressedKeys.has(note)) {
      setPressedKeys(prev => {
        const next = new Set(prev);
        next.delete(note);
        return next;
      });
      onNoteOff?.(note);
    }
  }, [pressedKeys, onNoteOff]);

  // Computer keyboard handling
  useEffect(() => {
    if (!enableKeyboard) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return;
      const key = e.key.toLowerCase();
      if (KEY_MAP[key] !== undefined) {
        const note = startNote + KEY_MAP[key];
        if (note < endNote) {
          handleNoteOn(note);
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (KEY_MAP[key] !== undefined) {
        const note = startNote + KEY_MAP[key];
        handleNoteOff(note);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [enableKeyboard, startNote, endNote, handleNoteOn, handleNoteOff]);

  // Generate keys
  const whiteKeys: { note: number; index: number }[] = [];
  const blackKeys: { note: number; position: number }[] = [];

  let whiteIndex = 0;
  for (let note = startNote; note < endNote; note++) {
    const noteInOctave = note % 12;
    if (WHITE_KEYS.includes(noteInOctave)) {
      whiteKeys.push({ note, index: whiteIndex });
      whiteIndex++;
    }
  }

  for (let note = startNote; note < endNote; note++) {
    const noteInOctave = note % 12;
    if (BLACK_KEYS.includes(noteInOctave)) {
      // Find position between white keys
      const whiteKeysBefore = whiteKeys.filter(k => k.note < note && !isBlackKey(k.note)).length;
      const position = whiteKeysBefore - 0.35;
      blackKeys.push({ note, position });
    }
  }

  return (
    <div
      ref={containerRef}
      className="synth-control"
      style={{
        ...moduleStyles.base,
        ...(isCompact ? moduleStyles.compact : {}),
        width: '100%',
      }}
    >
      {/* Label */}
      {label && (
        <span style={labelStyles.module}>
          {label}
        </span>
      )}

      {/* Keyboard */}
      <div
        style={{
          position: 'relative',
          height: effectiveHeight,
          minWidth: totalWhiteKeys * (isCompact ? 16 : 24), // Minimum per white key
          userSelect: 'none',
          touchAction: 'none',
        }}
      >
        {/* White keys */}
        <div style={{
          display: 'flex',
          height: '100%',
          gap: 1,
        }}>
          {whiteKeys.map(({ note }) => {
            const active = isActive(note);
            const highlighted = isHighlighted(note);

            return (
              <button
                key={note}
                onPointerDown={() => handleNoteOn(note)}
                onPointerUp={() => handleNoteOff(note)}
                onPointerLeave={() => handleNoteOff(note)}
                onPointerCancel={() => handleNoteOff(note)}
                aria-label={getNoteName(note)}
                style={{
                  flex: 1,
                  height: '100%',
                  background: active
                    ? activeColor
                    : highlighted
                      ? `${highlightColor}40`
                      : '#ffffff',
                  border: 'none',
                  borderRadius: '0 0 4px 4px',
                  cursor: 'pointer',
                  position: 'relative',
                  transition: 'background 50ms',
                  boxShadow: active
                    ? `inset 0 2px 4px rgba(0,0,0,0.3)`
                    : `inset 0 -2px 4px rgba(0,0,0,0.1)`,
                }}
              >
                {showNoteNames && note % 12 === 0 && (
                  <span style={{
                    position: 'absolute',
                    bottom: 4,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: 9,
                    color: active ? colors.bg.base : colors.text.muted,
                  }}>
                    {getNoteName(note)}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Black keys */}
        {blackKeys.map(({ note, position }) => {
          const active = isActive(note);
          const highlighted = isHighlighted(note);

          return (
            <button
              key={note}
              onPointerDown={(e) => { e.stopPropagation(); handleNoteOn(note); }}
              onPointerUp={() => handleNoteOff(note)}
              onPointerLeave={() => handleNoteOff(note)}
              onPointerCancel={() => handleNoteOff(note)}
              aria-label={getNoteName(note)}
              style={{
                position: 'absolute',
                top: 0,
                left: `${(position / totalWhiteKeys) * 100}%`,
                width: `${blackKeyWidth}%`,
                height: blackKeyHeight,
                background: active
                  ? activeColor
                  : highlighted
                    ? highlightColor
                    : colors.bg.void,
                border: 'none',
                borderRadius: '0 0 3px 3px',
                cursor: 'pointer',
                zIndex: 1,
                transition: 'background 50ms',
                boxShadow: active
                  ? `inset 0 2px 4px rgba(0,0,0,0.5)`
                  : `0 2px 4px rgba(0,0,0,0.5)`,
              }}
            />
          );
        })}
      </div>
    </div>
  );
};

export default PianoKeyboard;
