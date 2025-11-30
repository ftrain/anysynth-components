/**
 * MIDIMonitor
 *
 * Real-time MIDI event logger and visualizer.
 * Shows incoming MIDI messages with timestamps.
 *
 * Features:
 * - Note on/off visualization
 * - CC value display
 * - Pitch bend, aftertouch
 * - Scrolling log view
 */

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { colors } from '../../theme/tokens';

export interface MIDIEvent {
  timestamp: number;
  type: 'noteOn' | 'noteOff' | 'cc' | 'pitchBend' | 'aftertouch' | 'programChange' | 'clock' | 'other';
  channel: number;
  data: number[];
  raw?: Uint8Array;
}

export interface MIDIMonitorProps {
  /** Incoming MIDI events (push new events to display) */
  events?: MIDIEvent[];
  /** Maximum events to display */
  maxEvents?: number;
  /** Show timestamps */
  showTimestamps?: boolean;
  /** Show raw MIDI bytes */
  showRaw?: boolean;
  /** Filter by event type */
  filterTypes?: MIDIEvent['type'][];
  /** Called when clear is clicked */
  onClear?: () => void;
  /** Component label */
  label?: string;
  /** Height in pixels */
  height?: number;
  /** Enable auto-scroll */
  autoScroll?: boolean;
}

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

const getNoteName = (note: number): string => {
  const octave = Math.floor(note / 12) - 1;
  return `${NOTE_NAMES[note % 12]}${octave}`;
};

const getEventColor = (type: MIDIEvent['type']): string => {
  switch (type) {
    case 'noteOn':
      return colors.accent.green;
    case 'noteOff':
      return colors.accent.coral;
    case 'cc':
      return colors.accent.cyan;
    case 'pitchBend':
      return colors.accent.purple;
    case 'aftertouch':
      return colors.accent.orange;
    case 'programChange':
      return colors.accent.yellow;
    case 'clock':
      return colors.text.disabled;
    default:
      return colors.text.muted;
  }
};

const formatEvent = (event: MIDIEvent): string => {
  switch (event.type) {
    case 'noteOn':
      return `Note On  ${getNoteName(event.data[0]).padEnd(4)} vel:${event.data[1]}`;
    case 'noteOff':
      return `Note Off ${getNoteName(event.data[0]).padEnd(4)} vel:${event.data[1]}`;
    case 'cc':
      return `CC ${String(event.data[0]).padStart(3)} = ${event.data[1]}`;
    case 'pitchBend':
      const bendValue = (event.data[1] << 7) + event.data[0] - 8192;
      return `Pitch Bend: ${bendValue}`;
    case 'aftertouch':
      return event.data.length === 1
        ? `Aftertouch: ${event.data[0]}`
        : `Poly AT ${getNoteName(event.data[0])}: ${event.data[1]}`;
    case 'programChange':
      return `Program: ${event.data[0]}`;
    case 'clock':
      return `Clock`;
    default:
      return `[${event.data.join(', ')}]`;
  }
};

export const MIDIMonitor: React.FC<MIDIMonitorProps> = ({
  events: propEvents,
  maxEvents = 100,
  showTimestamps = true,
  showRaw = false,
  filterTypes,
  onClear,
  label = 'MIDI MONITOR',
  height = 200,
  autoScroll = true,
}) => {
  const [events, setEvents] = useState<MIDIEvent[]>(propEvents || []);
  const scrollRef = useRef<HTMLDivElement>(null);
  const startTime = useRef(Date.now());

  // Sync with prop events
  useEffect(() => {
    if (propEvents) {
      setEvents(propEvents.slice(-maxEvents));
    }
  }, [propEvents, maxEvents]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (autoScroll && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [events, autoScroll]);

  const handleClear = useCallback(() => {
    setEvents([]);
    startTime.current = Date.now();
    onClear?.();
  }, [onClear]);

  // Filter events if needed
  const filteredEvents = filterTypes
    ? events.filter((e) => filterTypes.includes(e.type))
    : events;

  // Count by type
  const typeCounts: Record<string, number> = {};
  events.forEach((e) => {
    typeCounts[e.type] = (typeCounts[e.type] || 0) + 1;
  });

  return (
    <div
      className="synth-control"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        padding: 12,
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
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span
            style={{
              fontSize: 9,
              fontFamily: 'var(--font-mono)',
              color: colors.text.disabled,
            }}
          >
            {events.length} events
          </span>
          <button
            onClick={handleClear}
            style={{
              padding: '4px 8px',
              background: colors.bg.elevated,
              border: 'none',
              borderRadius: 3,
              cursor: 'pointer',
              fontSize: 9,
              fontFamily: 'var(--font-mono)',
              color: colors.text.muted,
            }}
          >
            CLEAR
          </button>
        </div>
      </div>

      {/* Event type badges */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
        {Object.entries(typeCounts).map(([type, count]) => (
          <div
            key={type}
            style={{
              padding: '2px 6px',
              background: `${getEventColor(type as MIDIEvent['type'])}30`,
              borderRadius: 3,
              fontSize: 8,
              fontFamily: 'var(--font-mono)',
              color: getEventColor(type as MIDIEvent['type']),
            }}
          >
            {type}: {count}
          </div>
        ))}
      </div>

      {/* Event log */}
      <div
        ref={scrollRef}
        style={{
          height,
          overflowY: 'auto',
          background: colors.bg.base,
          borderRadius: 4,
          padding: 8,
          fontFamily: 'var(--font-mono)',
          fontSize: 10,
        }}
      >
        {filteredEvents.length === 0 ? (
          <div
            style={{
              color: colors.text.disabled,
              textAlign: 'center',
              padding: 24,
            }}
          >
            Waiting for MIDI input...
          </div>
        ) : (
          filteredEvents.map((event, i) => {
            const relTime = event.timestamp - startTime.current;
            return (
              <div
                key={i}
                style={{
                  display: 'flex',
                  gap: 8,
                  padding: '2px 0',
                  borderBottom: `1px solid ${colors.bg.highlight}`,
                }}
              >
                {showTimestamps && (
                  <span
                    style={{
                      color: colors.text.disabled,
                      width: 60,
                      flexShrink: 0,
                    }}
                  >
                    {(relTime / 1000).toFixed(2)}s
                  </span>
                )}
                <span
                  style={{
                    color: colors.text.disabled,
                    width: 16,
                    flexShrink: 0,
                  }}
                >
                  {event.channel}
                </span>
                <span
                  style={{
                    color: getEventColor(event.type),
                    flex: 1,
                  }}
                >
                  {formatEvent(event)}
                </span>
                {showRaw && event.raw && (
                  <span style={{ color: colors.text.disabled }}>
                    [{Array.from(event.raw)
                      .map((b) => b.toString(16).padStart(2, '0'))
                      .join(' ')}]
                  </span>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default MIDIMonitor;
