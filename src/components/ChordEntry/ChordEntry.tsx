/**
 * ChordEntry
 *
 * A chord selection and creation interface for synthesizers.
 * Supports chord type selection, root note, inversions, and custom voicings.
 *
 * Features:
 * - Visual chord diagram
 * - Common chord type presets
 * - Custom note addition
 * - Inversion controls
 * - MIDI note output
 */

import React, { useState, useCallback, useMemo } from 'react';
import { colors } from '../../theme/tokens';

// Note names
const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const NOTE_NAMES_FLAT = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];

// Chord interval definitions (semitones from root)
const CHORD_TYPES: Record<string, { intervals: number[]; symbol: string; name: string }> = {
  major: { intervals: [0, 4, 7], symbol: '', name: 'Major' },
  minor: { intervals: [0, 3, 7], symbol: 'm', name: 'Minor' },
  dim: { intervals: [0, 3, 6], symbol: 'dim', name: 'Diminished' },
  aug: { intervals: [0, 4, 8], symbol: 'aug', name: 'Augmented' },
  sus2: { intervals: [0, 2, 7], symbol: 'sus2', name: 'Suspended 2nd' },
  sus4: { intervals: [0, 5, 7], symbol: 'sus4', name: 'Suspended 4th' },
  maj7: { intervals: [0, 4, 7, 11], symbol: 'maj7', name: 'Major 7th' },
  min7: { intervals: [0, 3, 7, 10], symbol: 'm7', name: 'Minor 7th' },
  dom7: { intervals: [0, 4, 7, 10], symbol: '7', name: 'Dominant 7th' },
  dim7: { intervals: [0, 3, 6, 9], symbol: 'dim7', name: 'Diminished 7th' },
  hdim7: { intervals: [0, 3, 6, 10], symbol: 'm7b5', name: 'Half-dim 7th' },
  minMaj7: { intervals: [0, 3, 7, 11], symbol: 'mMaj7', name: 'Minor Major 7th' },
  add9: { intervals: [0, 4, 7, 14], symbol: 'add9', name: 'Add 9' },
  madd9: { intervals: [0, 3, 7, 14], symbol: 'madd9', name: 'Minor Add 9' },
  maj9: { intervals: [0, 4, 7, 11, 14], symbol: 'maj9', name: 'Major 9th' },
  min9: { intervals: [0, 3, 7, 10, 14], symbol: 'm9', name: 'Minor 9th' },
  dom9: { intervals: [0, 4, 7, 10, 14], symbol: '9', name: 'Dominant 9th' },
  '6': { intervals: [0, 4, 7, 9], symbol: '6', name: 'Major 6th' },
  'm6': { intervals: [0, 3, 7, 9], symbol: 'm6', name: 'Minor 6th' },
  power: { intervals: [0, 7], symbol: '5', name: 'Power Chord' },
};

export interface ChordValue {
  root: number; // 0-11 (C=0, C#=1, etc.)
  type: string; // Key from CHORD_TYPES
  inversion: number; // 0 = root position, 1 = first inversion, etc.
  octave: number; // Base octave (default 4)
  customNotes?: number[]; // Additional notes (semitones from root)
  midiNotes: number[]; // Computed MIDI note numbers
  name: string; // Display name like "Cmaj7"
}

export interface ChordEntryProps {
  /** Current chord value */
  value?: Partial<ChordValue>;
  /** Called when chord changes */
  onChange?: (chord: ChordValue) => void;
  /** Called when chord is triggered (for sound preview) */
  onTrigger?: (midiNotes: number[]) => void;
  /** Component label */
  label?: string;
  /** Show flat note names instead of sharps */
  useFlats?: boolean;
  /** Base octave range */
  octaveRange?: [number, number];
  /** Show advanced options (inversions, custom notes) */
  showAdvanced?: boolean;
  /** Compact mode */
  compact?: boolean;
}

// Helper to compute MIDI notes from chord definition
const computeMidiNotes = (
  root: number,
  intervals: number[],
  octave: number,
  inversion: number,
  customNotes: number[] = []
): number[] => {
  const baseNote = root + octave * 12;
  let notes = intervals.map((i) => baseNote + i);

  // Add custom notes
  customNotes.forEach((n) => {
    const note = baseNote + n;
    if (!notes.includes(note)) notes.push(note);
  });

  // Apply inversion
  for (let i = 0; i < inversion && i < notes.length; i++) {
    notes[i] += 12;
  }

  return notes.sort((a, b) => a - b);
};

export const ChordEntry: React.FC<ChordEntryProps> = ({
  value = {},
  onChange,
  onTrigger,
  label,
  useFlats = false,
  octaveRange = [2, 6],
  showAdvanced = true,
  compact = false,
}) => {
  const noteNames = useFlats ? NOTE_NAMES_FLAT : NOTE_NAMES;

  const [root, setRoot] = useState(value.root ?? 0);
  const [chordType, setChordType] = useState(value.type ?? 'major');
  const [inversion, setInversion] = useState(value.inversion ?? 0);
  const [octave, setOctave] = useState(value.octave ?? 4);
  const [customNotes, setCustomNotes] = useState<number[]>(value.customNotes ?? []);

  const chordDef = CHORD_TYPES[chordType] || CHORD_TYPES.major;

  // Compute current chord
  const currentChord = useMemo((): ChordValue => {
    const midiNotes = computeMidiNotes(root, chordDef.intervals, octave, inversion, customNotes);
    const name = `${noteNames[root]}${chordDef.symbol}`;
    return {
      root,
      type: chordType,
      inversion,
      octave,
      customNotes,
      midiNotes,
      name,
    };
  }, [root, chordType, inversion, octave, customNotes, chordDef, noteNames]);

  // Update parent
  const updateChord = useCallback(
    (updates: Partial<{ root: number; type: string; inversion: number; octave: number; customNotes: number[] }>) => {
      const newRoot = updates.root ?? root;
      const newType = updates.type ?? chordType;
      const newInversion = updates.inversion ?? inversion;
      const newOctave = updates.octave ?? octave;
      const newCustomNotes = updates.customNotes ?? customNotes;

      if (updates.root !== undefined) setRoot(updates.root);
      if (updates.type !== undefined) setChordType(updates.type);
      if (updates.inversion !== undefined) setInversion(updates.inversion);
      if (updates.octave !== undefined) setOctave(updates.octave);
      if (updates.customNotes !== undefined) setCustomNotes(updates.customNotes);

      const def = CHORD_TYPES[newType] || CHORD_TYPES.major;
      const midiNotes = computeMidiNotes(newRoot, def.intervals, newOctave, newInversion, newCustomNotes);
      const name = `${noteNames[newRoot]}${def.symbol}`;

      onChange?.({
        root: newRoot,
        type: newType,
        inversion: newInversion,
        octave: newOctave,
        customNotes: newCustomNotes,
        midiNotes,
        name,
      });
    },
    [root, chordType, inversion, octave, customNotes, noteNames, onChange]
  );

  // Trigger chord playback
  const handleTrigger = useCallback(() => {
    onTrigger?.(currentChord.midiNotes);
  }, [currentChord, onTrigger]);

  // Group chord types for organized selection
  const chordTypeGroups = {
    Basic: ['major', 'minor', 'dim', 'aug', 'power'],
    Suspended: ['sus2', 'sus4'],
    '7th': ['maj7', 'min7', 'dom7', 'dim7', 'hdim7', 'minMaj7'],
    Extended: ['add9', 'madd9', 'maj9', 'min9', 'dom9', '6', 'm6'],
  };

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

        {/* Chord name display */}
        <button
          onClick={handleTrigger}
          style={{
            padding: '6px 12px',
            background: colors.bg.elevated,
            border: `1px solid ${colors.accent.cyan}`,
            borderRadius: 4,
            cursor: 'pointer',
            fontFamily: 'var(--font-numeric)',
            fontSize: compact ? 16 : 20,
            fontWeight: 600,
            color: colors.accent.cyan,
          }}
          title="Click to preview chord"
        >
          {currentChord.name}
          {inversion > 0 && (
            <span style={{ fontSize: '0.7em', opacity: 0.7 }}>/{noteNames[(root + chordDef.intervals[inversion % chordDef.intervals.length]) % 12]}</span>
          )}
        </button>
      </div>

      {/* Root note selection */}
      <div>
        <div
          style={{
            fontSize: 9,
            color: colors.text.muted,
            fontFamily: 'var(--font-mono)',
            marginBottom: 4,
          }}
        >
          ROOT NOTE
        </div>
        <div style={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          {noteNames.map((note, i) => {
            const isSelected = i === root;
            const isBlackKey = note.includes('#') || note.includes('b');
            return (
              <button
                key={note}
                onClick={() => updateChord({ root: i })}
                style={{
                  width: compact ? 28 : 32,
                  height: compact ? 28 : 32,
                  background: isSelected
                    ? colors.accent.cyan
                    : isBlackKey
                    ? colors.bg.base
                    : colors.bg.elevated,
                  border: isSelected ? 'none' : `1px solid ${colors.bg.highlight}`,
                  borderRadius: 4,
                  cursor: 'pointer',
                  fontSize: 11,
                  fontWeight: isSelected ? 600 : 400,
                  color: isSelected ? colors.bg.base : isBlackKey ? colors.text.secondary : colors.text.primary,
                  fontFamily: 'var(--font-mono)',
                }}
              >
                {note}
              </button>
            );
          })}
        </div>
      </div>

      {/* Chord type selection */}
      <div>
        <div
          style={{
            fontSize: 9,
            color: colors.text.muted,
            fontFamily: 'var(--font-mono)',
            marginBottom: 4,
          }}
        >
          CHORD TYPE
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {Object.entries(chordTypeGroups).map(([group, types]) => (
            <div key={group} style={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
              <span
                style={{
                  fontSize: 8,
                  color: colors.text.disabled,
                  fontFamily: 'var(--font-mono)',
                  width: 55,
                }}
              >
                {group}
              </span>
              {types.map((type) => {
                const def = CHORD_TYPES[type];
                const isSelected = type === chordType;
                return (
                  <button
                    key={type}
                    onClick={() => updateChord({ type, inversion: 0 })}
                    style={{
                      padding: compact ? '3px 6px' : '4px 8px',
                      background: isSelected ? colors.accent.cyan : colors.bg.elevated,
                      border: isSelected ? 'none' : `1px solid ${colors.bg.highlight}`,
                      borderRadius: 3,
                      cursor: 'pointer',
                      fontSize: 10,
                      fontWeight: isSelected ? 600 : 400,
                      color: isSelected ? colors.bg.base : colors.text.secondary,
                      fontFamily: 'var(--font-mono)',
                    }}
                    title={def.name}
                  >
                    {def.symbol || 'Maj'}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Advanced controls */}
      {showAdvanced && (
        <>
          {/* Octave and Inversion */}
          <div style={{ display: 'flex', gap: 16 }}>
            {/* Octave */}
            <div style={{ flex: 1 }}>
              <div
                style={{
                  fontSize: 9,
                  color: colors.text.muted,
                  fontFamily: 'var(--font-mono)',
                  marginBottom: 4,
                }}
              >
                OCTAVE
              </div>
              <div style={{ display: 'flex', gap: 2 }}>
                {Array.from({ length: octaveRange[1] - octaveRange[0] + 1 }, (_, i) => i + octaveRange[0]).map((oct) => (
                  <button
                    key={oct}
                    onClick={() => updateChord({ octave: oct })}
                    style={{
                      width: 28,
                      height: 24,
                      background: oct === octave ? colors.accent.orange : colors.bg.elevated,
                      border: oct === octave ? 'none' : `1px solid ${colors.bg.highlight}`,
                      borderRadius: 3,
                      cursor: 'pointer',
                      fontSize: 11,
                      fontWeight: oct === octave ? 600 : 400,
                      color: oct === octave ? colors.bg.base : colors.text.secondary,
                      fontFamily: 'var(--font-numeric)',
                    }}
                  >
                    {oct}
                  </button>
                ))}
              </div>
            </div>

            {/* Inversion */}
            <div style={{ flex: 1 }}>
              <div
                style={{
                  fontSize: 9,
                  color: colors.text.muted,
                  fontFamily: 'var(--font-mono)',
                  marginBottom: 4,
                }}
              >
                INVERSION
              </div>
              <div style={{ display: 'flex', gap: 2 }}>
                {Array.from({ length: chordDef.intervals.length }, (_, i) => (
                  <button
                    key={i}
                    onClick={() => updateChord({ inversion: i })}
                    style={{
                      width: 28,
                      height: 24,
                      background: i === inversion ? colors.accent.purple : colors.bg.elevated,
                      border: i === inversion ? 'none' : `1px solid ${colors.bg.highlight}`,
                      borderRadius: 3,
                      cursor: 'pointer',
                      fontSize: 10,
                      fontWeight: i === inversion ? 600 : 400,
                      color: i === inversion ? colors.bg.base : colors.text.secondary,
                      fontFamily: 'var(--font-mono)',
                    }}
                  >
                    {i === 0 ? 'Root' : i}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* MIDI notes display */}
          <div
            style={{
              padding: 8,
              background: colors.bg.base,
              borderRadius: 4,
            }}
          >
            <div
              style={{
                fontSize: 9,
                color: colors.text.disabled,
                fontFamily: 'var(--font-mono)',
                marginBottom: 4,
              }}
            >
              MIDI NOTES
            </div>
            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
              {currentChord.midiNotes.map((note, i) => {
                const noteName = noteNames[note % 12];
                const noteOctave = Math.floor(note / 12) - 1;
                return (
                  <span
                    key={i}
                    style={{
                      padding: '2px 6px',
                      background: colors.bg.elevated,
                      borderRadius: 2,
                      fontSize: 10,
                      fontFamily: 'var(--font-mono)',
                      color: colors.text.secondary,
                    }}
                  >
                    {noteName}
                    <sub>{noteOctave}</sub>
                    <span style={{ marginLeft: 4, opacity: 0.5 }}>{note}</span>
                  </span>
                );
              })}
            </div>
          </div>
        </>
      )}

      {/* Visual chord diagram (mini keyboard) */}
      <div style={{ marginTop: compact ? 4 : 8 }}>
        <div style={{ display: 'flex', height: compact ? 32 : 40, position: 'relative' }}>
          {/* White keys */}
          {['C', 'D', 'E', 'F', 'G', 'A', 'B'].map((note, i) => {
            const whiteKeyIndices = [0, 2, 4, 5, 7, 9, 11];
            const noteIndex = whiteKeyIndices[i];
            const isInChord = chordDef.intervals.map((int) => (root + int) % 12).includes(noteIndex);
            return (
              <div
                key={note}
                style={{
                  flex: 1,
                  background: isInChord ? colors.accent.cyan : colors.text.primary,
                  border: `1px solid ${colors.bg.base}`,
                  borderRadius: '0 0 3px 3px',
                  opacity: isInChord ? 1 : 0.3,
                }}
              />
            );
          })}
          {/* Black keys */}
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '60%', display: 'flex', pointerEvents: 'none' }}>
            {[1, 3, null, 6, 8, 10, null].map((noteIndex, i) => {
              if (noteIndex === null) return <div key={i} style={{ flex: 1 }} />;
              const isInChord = chordDef.intervals.map((int) => (root + int) % 12).includes(noteIndex);
              const offset = [0.6, 1.6, 0, 3.6, 4.6, 5.6, 0][i];
              return (
                <div
                  key={i}
                  style={{
                    position: 'absolute',
                    left: `${(offset / 7) * 100}%`,
                    width: '10%',
                    height: '100%',
                    background: isInChord ? colors.accent.coral : colors.bg.base,
                    borderRadius: '0 0 2px 2px',
                    opacity: isInChord ? 1 : 0.8,
                  }}
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChordEntry;
