/**
 * ChordKnob
 *
 * A nested knob-based chord selector with live keyboard visualization.
 * Rings from inside to out:
 * 1. Octave (2-6)
 * 2. Root note (C, C#, D, etc.)
 * 3. Basic chord type (major, minor, dim, aug, power)
 * 4. Suspended (none, sus2, sus4)
 * 5. 7th/Extended (none, maj7, min7, dom7, 9, etc.)
 * 6. Inversion (root, 1st, 2nd, 3rd)
 *
 * The keyboard lights up showing chord notes as you adjust.
 */

import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { colors } from '../../theme/tokens';
import { moduleStyles, labelStyles } from '../../theme/styles';

// Note names
const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

// Ring configurations
interface RingConfig {
  id: string;
  name: string;
  values: string[];
  color: string;
}

const RINGS: RingConfig[] = [
  { id: 'octave', name: 'OCT', values: ['2', '3', '4', '5', '6'], color: colors.accent.purple },
  { id: 'root', name: 'ROOT', values: NOTE_NAMES, color: colors.accent.cyan },
  { id: 'basic', name: 'TYPE', values: ['maj', 'min', 'dim', 'aug', '5'], color: colors.accent.coral },
  { id: 'sus', name: 'SUS', values: ['-', 'sus2', 'sus4'], color: colors.accent.orange },
  { id: 'ext', name: 'EXT', values: ['-', '6', '7', 'maj7', '9', 'add9'], color: colors.accent.yellow },
  { id: 'inv', name: 'INV', values: ['root', '1st', '2nd', '3rd'], color: colors.accent.green },
];

// Chord interval definitions
const CHORD_INTERVALS: Record<string, number[]> = {
  maj: [0, 4, 7],
  min: [0, 3, 7],
  dim: [0, 3, 6],
  aug: [0, 4, 8],
  '5': [0, 7],
};

const SUS_INTERVALS: Record<string, number[]> = {
  '-': [],
  sus2: [-2],  // Replace 3rd with 2nd
  sus4: [1],   // Replace 3rd with 4th
};

const EXT_INTERVALS: Record<string, number[]> = {
  '-': [],
  '6': [9],
  '7': [10],
  maj7: [11],
  '9': [10, 14],
  add9: [14],
};

export interface ChordKnobValue {
  octave: number;
  root: number;
  basic: string;
  sus: string;
  ext: string;
  inversion: number;
  midiNotes: number[];
  chordName: string;
}

export interface ChordKnobProps {
  /** Callback when chord changes */
  onChange?: (value: ChordKnobValue) => void;
  /** Callback when chord is triggered */
  onTrigger?: (midiNotes: number[]) => void;
  /** Component size */
  size?: number;
  /** Component label */
  label?: string;
  /** Show keyboard visualization */
  showKeyboard?: boolean;
  /** Number of keyboard octaves to show */
  keyboardOctaves?: number;
}

// Calculate MIDI notes for the chord
const calculateChordNotes = (
  root: number,
  octave: number,
  basic: string,
  sus: string,
  ext: string,
  inversion: number
): number[] => {
  const baseNote = root + (octave + 1) * 12; // MIDI octave offset
  let intervals = [...CHORD_INTERVALS[basic] || CHORD_INTERVALS.maj];

  // Apply sus modification (replace 3rd)
  if (sus !== '-' && intervals.length >= 2) {
    const susInt = SUS_INTERVALS[sus] || [];
    if (susInt.length > 0) {
      // Replace the 3rd (index 1) with sus interval
      if (basic !== '5') {
        const third = intervals[1];
        intervals[1] = third + susInt[0];
      }
    }
  }

  // Add extensions
  const extInt = EXT_INTERVALS[ext] || [];
  intervals = [...intervals, ...extInt];

  // Calculate MIDI notes
  let notes = intervals.map((i) => baseNote + i);

  // Apply inversion
  for (let i = 0; i < inversion && i < notes.length; i++) {
    notes[i] += 12;
  }

  return notes.sort((a, b) => a - b);
};

// Unicode musical typography map
const UNICODE_CHORD_SYMBOLS: Record<string, string> = {
  'dim': '°',
  'aug': '+',
  'maj7': 'Δ7',
  'min7': '-7',
  'dom7': '7',
  'half-dim': 'ø7',
  'sus2': 'sus²',
  'sus4': 'sus⁴',
  '6': '⁶',
  '7': '⁷',
  '9': '⁹',
  'add9': 'add⁹',
};

// Generate chord name with unicode typography
const getChordName = (
  root: number,
  basic: string,
  sus: string,
  ext: string,
  inversion: number
): string => {
  let name = NOTE_NAMES[root];

  // Basic type with unicode
  if (basic === 'min') name += 'm';
  else if (basic === 'dim') name += UNICODE_CHORD_SYMBOLS.dim;
  else if (basic === 'aug') name += UNICODE_CHORD_SYMBOLS.aug;
  else if (basic === '5') name += '⁵';

  // Sus with unicode
  if (sus !== '-') {
    name += UNICODE_CHORD_SYMBOLS[sus] || sus;
  }

  // Extension with unicode
  if (ext !== '-') {
    if (ext === 'maj7') name += UNICODE_CHORD_SYMBOLS.maj7;
    else if (ext === '6') name += UNICODE_CHORD_SYMBOLS['6'];
    else if (ext === '7') name += UNICODE_CHORD_SYMBOLS['7'];
    else if (ext === '9') name += UNICODE_CHORD_SYMBOLS['9'];
    else if (ext === 'add9') name += UNICODE_CHORD_SYMBOLS.add9;
    else name += ext;
  }

  // Inversion - show bass note
  if (inversion > 0) {
    const invNote = NOTE_NAMES[(root + (inversion === 1 ? 4 : inversion === 2 ? 7 : 11)) % 12];
    name += `/${invNote}`;
  }

  return name;
};

export const ChordKnob: React.FC<ChordKnobProps> = ({
  onChange,
  onTrigger,
  size: sizeProp = 280,
  label,
  showKeyboard = true,
  keyboardOctaves = 2,
}) => {
  // State for each ring
  const [values, setValues] = useState<Record<string, number>>({
    octave: 2, // Index into values array (4 = octave 4)
    root: 0,   // C
    basic: 0,  // major
    sus: 0,    // none
    ext: 0,    // none
    inv: 0,    // root position
  });

  const [activeRing, setActiveRing] = useState<string | null>(null);
  const [hoveredRing, setHoveredRing] = useState<string | null>(null);
  const [containerSize, setContainerSize] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const dragRef = useRef<{ ringId: string; startY: number; startValue: number } | null>(null);

  // Responsive sizing
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerSize(entry.contentRect.width);
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const size = containerSize > 0 ? Math.min(containerSize - 32, sizeProp) : sizeProp;
  const cx = size / 2;
  const cy = size / 2;
  const bandWidth = Math.max(12, size / 20);
  const startRadius = bandWidth * 2;
  const gap = 3;

  // Calculate ring radii
  const rings = RINGS.map((ring, index) => ({
    ...ring,
    index,
    radius: startRadius + index * (bandWidth + gap),
    value: values[ring.id] || 0,
  }));

  const outerRadius = rings[rings.length - 1].radius + bandWidth / 2;

  // Get current chord data
  const currentChord = useMemo((): ChordKnobValue => {
    const octave = parseInt(RINGS[0].values[values.octave] || '4');
    const root = values.root;
    const basic = RINGS[2].values[values.basic] || 'maj';
    const sus = RINGS[3].values[values.sus] || '-';
    const ext = RINGS[4].values[values.ext] || '-';
    const inversion = values.inv;

    const midiNotes = calculateChordNotes(root, octave, basic, sus, ext, inversion);
    const chordName = getChordName(root, basic, sus, ext, inversion);

    return { octave, root, basic, sus, ext, inversion, midiNotes, chordName };
  }, [values]);

  // Notify onChange
  const notifyChange = useCallback(
    (newValues: Record<string, number>) => {
      const octave = parseInt(RINGS[0].values[newValues.octave] || '4');
      const root = newValues.root;
      const basic = RINGS[2].values[newValues.basic] || 'maj';
      const sus = RINGS[3].values[newValues.sus] || '-';
      const ext = RINGS[4].values[newValues.ext] || '-';
      const inversion = newValues.inv;

      const midiNotes = calculateChordNotes(root, octave, basic, sus, ext, inversion);
      const chordName = getChordName(root, basic, sus, ext, inversion);

      onChange?.({ octave, root, basic, sus, ext, inversion, midiNotes, chordName });
    },
    [onChange]
  );

  // Get ring from click position
  const getRingFromPosition = useCallback(
    (e: React.MouseEvent | React.TouchEvent): string | null => {
      if (!svgRef.current) return null;

      const rect = svgRef.current.getBoundingClientRect();
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      const x = clientX - rect.left - cx;
      const y = clientY - rect.top - cy;
      const distance = Math.sqrt(x * x + y * y);

      for (const ring of rings) {
        const innerR = ring.radius - bandWidth / 2;
        const outerR = ring.radius + bandWidth / 2;
        if (distance >= innerR && distance <= outerR) {
          return ring.id;
        }
      }

      return null;
    },
    [cx, cy, rings, bandWidth]
  );

  // Handle drag
  const handleStart = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      e.preventDefault();
      const ringId = getRingFromPosition(e);
      if (!ringId) return;

      setActiveRing(ringId);
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      dragRef.current = { ringId, startY: clientY, startValue: values[ringId] || 0 };

      const ring = RINGS.find((r) => r.id === ringId);
      if (!ring) return;

      const maxValue = ring.values.length - 1;

      const handleMove = (moveEvent: MouseEvent | TouchEvent) => {
        if (!dragRef.current) return;
        moveEvent.preventDefault();

        const moveY =
          'touches' in moveEvent
            ? (moveEvent as TouchEvent).touches[0].clientY
            : (moveEvent as MouseEvent).clientY;
        const deltaY = dragRef.current.startY - moveY;
        // Sensitivity based on number of options - more options = more sensitive
        const stepSize = 200 / Math.max(1, maxValue); // pixels per step
        const newValue = Math.round(
          Math.max(0, Math.min(maxValue, dragRef.current.startValue + deltaY / stepSize))
        );

        if (newValue !== values[dragRef.current.ringId]) {
          const newValues = { ...values, [dragRef.current.ringId]: newValue };
          setValues(newValues);
          notifyChange(newValues);
        }
      };

      const handleEnd = () => {
        dragRef.current = null;
        setActiveRing(null);
        window.removeEventListener('mousemove', handleMove);
        window.removeEventListener('mouseup', handleEnd);
        window.removeEventListener('touchmove', handleMove);
        window.removeEventListener('touchend', handleEnd);
      };

      window.addEventListener('mousemove', handleMove, { passive: false });
      window.addEventListener('mouseup', handleEnd);
      window.addEventListener('touchmove', handleMove, { passive: false });
      window.addEventListener('touchend', handleEnd);
    },
    [getRingFromPosition, values, notifyChange]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      setHoveredRing(getRingFromPosition(e));
    },
    [getRingFromPosition]
  );

  // Double-click to reset ring to default
  const handleDoubleClick = useCallback(
    (e: React.MouseEvent) => {
      const ringId = getRingFromPosition(e);
      if (!ringId) return;

      // Default values for each ring
      const defaults: Record<string, number> = {
        octave: 2, // Octave 4
        root: 0,   // C
        basic: 0,  // Major
        sus: 0,    // None
        ext: 0,    // None
        inv: 0,    // Root position
      };

      const newValues = { ...values, [ringId]: defaults[ringId] ?? 0 };
      setValues(newValues);
      notifyChange(newValues);
    },
    [getRingFromPosition, values, notifyChange]
  );

  // Arc path generator
  const createArcPath = (radius: number, startAngle: number, endAngle: number): string => {
    const startRad = ((startAngle - 90) * Math.PI) / 180;
    const endRad = ((endAngle - 90) * Math.PI) / 180;
    const x1 = cx + radius * Math.cos(startRad);
    const y1 = cy + radius * Math.sin(startRad);
    const x2 = cx + radius * Math.cos(endRad);
    const y2 = cy + radius * Math.sin(endRad);
    const largeArc = Math.abs(endAngle - startAngle) > 180 ? 1 : 0;
    return `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`;
  };

  const valueToAngle = (value: number, maxValue: number): number => {
    const normalized = value / Math.max(1, maxValue);
    return -135 + normalized * 270;
  };

  const highlightedRing = activeRing || hoveredRing;
  const displayRing = highlightedRing ? rings.find((r) => r.id === highlightedRing) : null;

  // Trigger chord
  const handleTrigger = useCallback(() => {
    onTrigger?.(currentChord.midiNotes);
  }, [currentChord, onTrigger]);

  // Keyboard rendering
  const keyboardWidth = Math.min(size, 280);
  const whiteKeyWidth = keyboardWidth / (7 * keyboardOctaves);
  const blackKeyWidth = whiteKeyWidth * 0.6;
  const keyboardHeight = 48;

  const renderKeyboardHTML = () => {
    const keys: JSX.Element[] = [];
    const whiteNotes = [0, 2, 4, 5, 7, 9, 11]; // C, D, E, F, G, A, B
    const blackNotes = [1, 3, -1, 6, 8, 10, -1]; // C#, D#, -, F#, G#, A#, -

    // Check which notes are in the chord
    const activeNotes = new Set(currentChord.midiNotes.map((n) => n % 12));

    for (let oct = 0; oct < keyboardOctaves; oct++) {
      const octaveOffset = oct * 7 * whiteKeyWidth;

      // White keys
      whiteNotes.forEach((noteInOctave, i) => {
        const isActive = activeNotes.has(noteInOctave);
        const isRoot = noteInOctave === currentChord.root;
        keys.push(
          <rect
            key={`white-${oct}-${i}`}
            x={2 + octaveOffset + i * whiteKeyWidth}
            y={2}
            width={whiteKeyWidth - 1}
            height={keyboardHeight}
            fill={isActive ? (isRoot ? colors.accent.cyan : colors.accent.coral) : '#f0f0f0'}
            stroke={colors.bg.base}
            strokeWidth={1}
            rx={2}
          />
        );
      });

      // Black keys
      blackNotes.forEach((noteInOctave, i) => {
        if (noteInOctave === -1) return;
        const isActive = activeNotes.has(noteInOctave);
        const isRoot = noteInOctave === currentChord.root;
        const blackKeyOffsets = [0.7, 1.7, 0, 3.7, 4.7, 5.7, 0];
        keys.push(
          <rect
            key={`black-${oct}-${i}`}
            x={2 + octaveOffset + blackKeyOffsets[i] * whiteKeyWidth - blackKeyWidth / 2}
            y={2}
            width={blackKeyWidth}
            height={keyboardHeight * 0.6}
            fill={isActive ? (isRoot ? colors.accent.cyan : colors.accent.orange) : '#333'}
            stroke={colors.bg.base}
            strokeWidth={1}
            rx={1}
          />
        );
      });
    }

    return keys;
  };

  return (
    <div
      ref={containerRef}
      className="synth-control"
      style={{
        ...moduleStyles.base,
        alignItems: 'center',
        width: '100%',
      }}
    >
      {label && (
        <div style={labelStyles.module}>
          {label}
        </div>
      )}

      <svg
        ref={svgRef}
        width={size}
        height={size}
        onMouseDown={handleStart}
        onTouchStart={handleStart}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setHoveredRing(null)}
        onDoubleClick={handleDoubleClick}
        style={{
          display: 'block',
          touchAction: 'none',
          cursor: hoveredRing ? 'ns-resize' : 'default',
          userSelect: 'none',
          overflow: 'visible',
        }}
      >
        {/* Background rings */}
        {rings.map((ring) => (
          <circle
            key={`bg-${ring.id}`}
            cx={cx}
            cy={cy}
            r={ring.radius}
            fill="none"
            stroke={highlightedRing === ring.id ? colors.bg.highlight : colors.bg.elevated}
            strokeWidth={bandWidth}
          />
        ))}

        {/* Track arcs */}
        {rings.map((ring) => (
          <path
            key={`track-${ring.id}`}
            d={createArcPath(ring.radius, -135, 135)}
            fill="none"
            stroke={ring.color}
            strokeWidth={bandWidth - 2}
            strokeLinecap="butt"
            opacity={highlightedRing === ring.id ? 0.4 : 0.2}
          />
        ))}

        {/* Value arcs */}
        {rings.map((ring) => {
          const maxValue = ring.values.length - 1;
          const endAngle = valueToAngle(ring.value, maxValue);
          if (endAngle <= -135) return null;
          return (
            <path
              key={`value-${ring.id}`}
              d={createArcPath(ring.radius, -135, endAngle)}
              fill="none"
              stroke={ring.color}
              strokeWidth={bandWidth - 2}
              strokeLinecap="butt"
              opacity={highlightedRing === ring.id ? 1 : 0.8}
            />
          );
        })}

        {/* Center - play button (clickable to trigger) */}
        <circle
          cx={cx}
          cy={cy}
          r={startRadius - bandWidth / 2 - 4}
          fill={colors.bg.elevated}
          stroke={colors.accent.cyan}
          strokeWidth={2}
          style={{ cursor: 'pointer' }}
          onClick={handleTrigger}
        />
        {/* Play icon in center */}
        <polygon
          points={`${cx - 6},${cy - 8} ${cx - 6},${cy + 8} ${cx + 8},${cy}`}
          fill={colors.accent.cyan}
          style={{ pointerEvents: 'none' }}
        />

        {/* Ring labels */}
        {displayRing && (
          <g>
            <text
              x={cx}
              y={cy + outerRadius * 0.4}
              textAnchor="middle"
              dominantBaseline="middle"
              fill={displayRing.color}
              fontSize={size * 0.035}
              fontFamily="var(--font-mono)"
            >
              {displayRing.name}
            </text>
            <text
              x={cx}
              y={cy + outerRadius * 0.55}
              textAnchor="middle"
              dominantBaseline="middle"
              fill={colors.text.primary}
              fontSize={size * 0.055}
              fontFamily="var(--font-numeric)"
              fontWeight={500}
            >
              {displayRing.values[displayRing.value]}
            </text>
          </g>
        )}

        {/* Options halo - shows all options for active ring */}
        {displayRing && displayRing.values.length <= 12 && (
          <g>
            {displayRing.values.map((opt, optIndex) => {
              const totalOptions = displayRing.values.length;
              const angleSpan = 270; // Same as knob range
              const anglePerOption = angleSpan / Math.max(1, totalOptions - 1);
              const angle = -135 + optIndex * anglePerOption;
              const rad = ((angle - 90) * Math.PI) / 180;
              const haloRadius = outerRadius + 20;
              const isSelected = optIndex === displayRing.value;

              return (
                <g key={`opt-${optIndex}`}>
                  {/* Option dot */}
                  <circle
                    cx={cx + haloRadius * Math.cos(rad)}
                    cy={cy + haloRadius * Math.sin(rad)}
                    r={isSelected ? 8 : 5}
                    fill={isSelected ? displayRing.color : colors.bg.elevated}
                    stroke={displayRing.color}
                    strokeWidth={isSelected ? 0 : 1}
                    opacity={isSelected ? 1 : 0.6}
                  />
                  {/* Option label */}
                  <text
                    x={cx + (haloRadius + 14) * Math.cos(rad)}
                    y={cy + (haloRadius + 14) * Math.sin(rad)}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill={isSelected ? displayRing.color : colors.text.muted}
                    fontSize={isSelected ? 10 : 8}
                    fontFamily="var(--font-mono)"
                    fontWeight={isSelected ? 600 : 400}
                    style={{ pointerEvents: 'none' }}
                  >
                    {opt}
                  </text>
                </g>
              );
            })}
          </g>
        )}

        {/* Tick marks */}
        {[-135, 0, 135].map((angle, i) => {
          const rad = ((angle - 90) * Math.PI) / 180;
          const tickStart = outerRadius + 3;
          const tickLen = 5;
          return (
            <line
              key={`tick-${i}`}
              x1={cx + tickStart * Math.cos(rad)}
              y1={cy + tickStart * Math.sin(rad)}
              x2={cx + (tickStart + tickLen) * Math.cos(rad)}
              y2={cy + (tickStart + tickLen) * Math.sin(rad)}
              stroke={colors.text.disabled}
              strokeWidth={1.5}
              strokeLinecap="round"
            />
          );
        })}

      </svg>

      {/* Keyboard visualization - as HTML for proper layout */}
      {showKeyboard && (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          width: '100%',
          marginTop: 8,
        }}>
          <svg width={keyboardWidth + 4} height={keyboardHeight + 4}>
            {renderKeyboardHTML()}
          </svg>
        </div>
      )}

      {/* Chord name display - below knob with unicode typography */}
      <div
        style={{
          fontSize: 24,
          fontFamily: 'var(--font-numeric)',
          fontWeight: 700,
          color: colors.accent.cyan,
          textAlign: 'center',
          letterSpacing: '0.02em',
        }}
      >
        {currentChord.chordName}
      </div>

      {/* MIDI notes display */}
      <div
        style={{
          display: 'flex',
          gap: 4,
          flexWrap: 'wrap',
          justifyContent: 'center',
        }}
      >
        {currentChord.midiNotes.map((note, i) => {
          const noteName = NOTE_NAMES[note % 12];
          const noteOctave = Math.floor(note / 12) - 1;
          return (
            <span
              key={i}
              style={{
                padding: '2px 6px',
                background: i === 0 ? colors.accent.cyan : colors.bg.elevated,
                color: i === 0 ? colors.bg.base : colors.text.secondary,
                borderRadius: 3,
                fontSize: 10,
                fontFamily: 'var(--font-mono)',
              }}
            >
              {noteName}
              {noteOctave}
            </span>
          );
        })}
      </div>
    </div>
  );
};

export default ChordKnob;
