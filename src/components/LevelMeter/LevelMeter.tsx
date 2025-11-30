/**
 * Level Meter
 *
 * VU/PPM-style meter for audio levels.
 * Shows peak, RMS, and clip indicator.
 * Supports mono and stereo modes.
 */

import React, { useEffect, useRef, useState } from 'react';
import type { MeterData } from '../../types';
import { colors } from '../../theme/tokens';

interface LevelMeterProps {
  value: MeterData | [MeterData, MeterData]; // Mono or stereo
  orientation?: 'vertical' | 'horizontal';
  height?: number;
  width?: number;
  showPeak?: boolean;
  showRms?: boolean;
  showDb?: boolean;
  peakHoldMs?: number;
  label?: string;
}

const linearToDb = (linear: number): number => 20 * Math.log10(Math.max(0.00001, linear));

const METER_SEGMENTS = [
  { db: 0, color: colors.accent.coral },    // Clip
  { db: -3, color: colors.accent.orange },   // Hot
  { db: -6, color: colors.accent.yellow },   // Loud
  { db: -12, color: colors.accent.green },   // Good
  { db: -24, color: colors.accent.green },   // Normal
  { db: -48, color: colors.accent.green },   // Quiet
  { db: -60, color: colors.accent.green },   // Very quiet
];

export const LevelMeter: React.FC<LevelMeterProps> = ({
  value,
  orientation = 'vertical',
  height = 200,
  width,
  showPeak = true,
  showRms = true,
  showDb = true,
  peakHoldMs = 1500,
  label,
}) => {
  const isStereo = Array.isArray(value);
  const channels = isStereo ? value : [value];
  const meterWidth = width ?? (isStereo ? 40 : 24);

  const [peakHolds, setPeakHolds] = useState<number[]>(channels.map(() => 0));
  const peakTimersRef = useRef<(ReturnType<typeof setTimeout> | null)[]>([]);

  // Peak hold logic
  useEffect(() => {
    channels.forEach((ch, i) => {
      if (ch.peak > peakHolds[i]) {
        setPeakHolds(prev => {
          const next = [...prev];
          next[i] = ch.peak;
          return next;
        });

        // Clear existing timer
        if (peakTimersRef.current[i]) {
          clearTimeout(peakTimersRef.current[i]!);
        }

        // Set decay timer
        peakTimersRef.current[i] = setTimeout(() => {
          setPeakHolds(prev => {
            const next = [...prev];
            next[i] = 0;
            return next;
          });
        }, peakHoldMs);
      }
    });
  }, [channels, peakHoldMs]);

  // Cleanup timers
  useEffect(() => {
    return () => {
      peakTimersRef.current.forEach(timer => {
        if (timer) clearTimeout(timer);
      });
    };
  }, []);

  const getSegmentColor = (level: number): string => {
    const db = linearToDb(level);
    for (const seg of METER_SEGMENTS) {
      if (db >= seg.db) return seg.color;
    }
    return colors.accent.green;
  };

  const isVertical = orientation === 'vertical';

  const renderChannel = (channel: MeterData, index: number, total: number) => {
    const channelWidth = total === 1 ? meterWidth : (meterWidth - 4) / 2;
    const peakDb = linearToDb(channel.peak);
    const rmsDb = linearToDb(channel.rms);
    const peakHoldDb = linearToDb(peakHolds[index]);

    // Map dB to percentage (range: -60dB to 0dB)
    const dbToPercent = (db: number): number => {
      return Math.max(0, Math.min(100, ((db + 60) / 60) * 100));
    };

    const peakPercent = dbToPercent(peakDb);
    const rmsPercent = dbToPercent(rmsDb);
    const peakHoldPercent = dbToPercent(peakHoldDb);

    return (
      <div
        key={index}
        style={{
          position: 'relative',
          width: isVertical ? channelWidth : height,
          height: isVertical ? height : channelWidth,
          background: colors.bg.elevated,
          borderRadius: 2,
          overflow: 'hidden',
        }}
      >
        {/* Gradient background showing level zones */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: isVertical
            ? `linear-gradient(0deg, ${colors.accent.green}20 0%, ${colors.accent.green}20 60%, ${colors.accent.yellow}20 75%, ${colors.accent.orange}20 90%, ${colors.accent.coral}20 100%)`
            : `linear-gradient(90deg, ${colors.accent.green}20 0%, ${colors.accent.green}20 60%, ${colors.accent.yellow}20 75%, ${colors.accent.orange}20 90%, ${colors.accent.coral}20 100%)`,
          opacity: 0.3,
        }} />

        {/* RMS level */}
        {showRms && (
          <div style={{
            position: 'absolute',
            ...(isVertical ? {
              left: 2,
              right: 2,
              bottom: 0,
              height: `${rmsPercent}%`,
            } : {
              top: 2,
              bottom: 2,
              left: 0,
              width: `${rmsPercent}%`,
            }),
            background: getSegmentColor(channel.rms),
            opacity: 0.4,
            transition: 'height 50ms, width 50ms',
          }} />
        )}

        {/* Peak level */}
        {showPeak && (
          <div style={{
            position: 'absolute',
            ...(isVertical ? {
              left: 2,
              right: 2,
              bottom: 0,
              height: `${peakPercent}%`,
            } : {
              top: 2,
              bottom: 2,
              left: 0,
              width: `${peakPercent}%`,
            }),
            background: `linear-gradient(${isVertical ? '0deg' : '90deg'}, ${colors.accent.green} 0%, ${getSegmentColor(channel.peak)} 100%)`,
            opacity: 0.9,
            transition: 'height 30ms, width 30ms',
          }} />
        )}

        {/* Peak hold marker */}
        {showPeak && peakHolds[index] > 0 && (
          <div style={{
            position: 'absolute',
            ...(isVertical ? {
              left: 0,
              right: 0,
              bottom: `${peakHoldPercent}%`,
              height: 2,
            } : {
              top: 0,
              bottom: 0,
              left: `${peakHoldPercent}%`,
              width: 2,
            }),
            background: getSegmentColor(peakHolds[index]),
            transition: 'bottom 30ms, left 30ms',
          }} />
        )}

        {/* Clip indicator */}
        {channel.clip && (
          <div style={{
            position: 'absolute',
            ...(isVertical ? {
              top: 2,
              left: 2,
              right: 2,
              height: 4,
            } : {
              right: 2,
              top: 2,
              bottom: 2,
              width: 4,
            }),
            background: colors.accent.coral,
            borderRadius: 1,
          }} />
        )}

        {/* Scale marks */}
        {isVertical && (
          <>
            {[-48, -24, -12, -6, 0].map((db) => (
              <div
                key={db}
                style={{
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  bottom: `${dbToPercent(db)}%`,
                  height: 1,
                  background: colors.bg.border,
                  opacity: 0.5,
                }}
              />
            ))}
          </>
        )}
      </div>
    );
  };

  return (
    <div
      className="synth-control"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 8,
        padding: 12,
        background: colors.bg.surface,
        borderRadius: 8,
      }}
    >
      {/* Meter */}
      <div style={{
        display: 'flex',
        flexDirection: isVertical ? 'row' : 'column',
        gap: isStereo ? 4 : 0,
      }}>
        {channels.map((ch, i) => renderChannel(ch, i, channels.length))}

        {/* dB scale */}
        {showDb && isVertical && (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            height: height,
            paddingLeft: 4,
          }}>
            {[0, -6, -12, -24, -48].map((db) => (
              <span
                key={db}
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 8,
                  color: colors.text.disabled,
                  lineHeight: 1,
                }}
              >
                {db}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Label */}
      {label && (
        <span style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 'var(--text-xs)',
          color: colors.text.muted,
          textTransform: 'uppercase',
        }}>
          {label}
        </span>
      )}

      {/* dB readout */}
      {showDb && (
        <div style={{
          display: 'flex',
          gap: 8,
          fontFamily: 'var(--font-numeric)',
          fontSize: 'var(--text-sm)',
        }}>
          {channels.map((ch, i) => (
            <span
              key={i}
              style={{
                color: ch.clip ? colors.accent.coral : colors.text.secondary,
              }}
            >
              {linearToDb(ch.peak).toFixed(1)}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

export default LevelMeter;
