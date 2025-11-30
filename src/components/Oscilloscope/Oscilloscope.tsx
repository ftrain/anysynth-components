/**
 * Oscilloscope
 *
 * Real-time waveform and spectrum visualization.
 * Supports time-domain (scope) and frequency-domain (spectrum) modes.
 */

import React, { useRef, useEffect, useCallback, useState } from 'react';
import { colors, components } from '../../theme/tokens';
import { moduleStyles, labelStyles } from '../../theme/styles';

type OscilloscopeMode = 'scope' | 'spectrum' | 'both';

interface OscilloscopeProps {
  /** Audio data - Float32Array of samples (-1 to 1) for scope, or frequency bins for spectrum */
  data?: Float32Array;
  /** Frequency data for spectrum mode */
  frequencyData?: Float32Array;
  mode?: OscilloscopeMode;
  width?: number;
  height?: number;
  color?: string;
  backgroundColor?: string;
  gridColor?: string;
  lineWidth?: number;
  showGrid?: boolean;
  showLabels?: boolean;
  label?: string;
  /** Trigger level for scope mode (-1 to 1) */
  triggerLevel?: number;
  /** Time scale in ms per division */
  timeScale?: number;
  /** Frequency range for spectrum (Hz) */
  frequencyRange?: [number, number];
  /** Compact mode */
  compact?: boolean;
}

const SCOPE = components.oscilloscope;

export const Oscilloscope: React.FC<OscilloscopeProps> = ({
  data,
  frequencyData,
  mode = 'scope',
  width: widthProp,
  height: heightProp,
  color = colors.accent.cyan,
  backgroundColor = colors.bg.elevated,
  gridColor = colors.bg.border,
  lineWidth = 1.5,
  showGrid = true,
  showLabels = true,
  label,
  triggerLevel = 0,
  timeScale = 10,
  frequencyRange = [20, 20000],
  compact = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const [paused, setPaused] = useState(false);
  const [containerWidth, setContainerWidth] = useState(0);

  // Responsive width detection
  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerWidth(entry.contentRect.width);
      }
    });

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Use container width or prop or default
  const width = widthProp ?? (containerWidth > 0 ? containerWidth : (compact ? SCOPE.widthCompact : SCOPE.width));
  const height = heightProp ?? (compact ? SCOPE.heightCompact : SCOPE.height);

  const drawScope = useCallback((ctx: CanvasRenderingContext2D, samples: Float32Array) => {
    const w = width;
    const h = height;

    // Find trigger point
    let triggerIndex = 0;
    for (let i = 1; i < samples.length - 1; i++) {
      if (samples[i - 1] <= triggerLevel && samples[i] > triggerLevel) {
        triggerIndex = i;
        break;
      }
    }

    // Draw waveform
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';

    const displaySamples = Math.min(samples.length - triggerIndex, Math.floor(w * 2));

    for (let i = 0; i < displaySamples; i++) {
      const x = (i / displaySamples) * w;
      const sample = samples[triggerIndex + i] || 0;
      const y = h / 2 - sample * (h / 2) * 0.9;

      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }

    ctx.stroke();

    // Draw glow effect
    ctx.shadowColor = color;
    ctx.shadowBlur = 4;
    ctx.stroke();
    ctx.shadowBlur = 0;
  }, [width, height, color, lineWidth, triggerLevel]);

  const drawSpectrum = useCallback((ctx: CanvasRenderingContext2D, bins: Float32Array) => {
    const w = width;
    const h = height;
    const binCount = bins.length;

    // Logarithmic frequency mapping
    const minLog = Math.log10(frequencyRange[0]);
    const maxLog = Math.log10(frequencyRange[1]);
    const logRange = maxLog - minLog;

    // Draw bars
    ctx.fillStyle = color;

    const barWidth = Math.max(1, w / 64);
    const barCount = Math.floor(w / (barWidth + 1));

    for (let i = 0; i < barCount; i++) {
      // Map bar position to frequency (logarithmic)
      const logFreq = minLog + (i / barCount) * logRange;
      const freq = Math.pow(10, logFreq);

      // Map frequency to bin index
      const binIndex = Math.floor((freq / (frequencyRange[1] * 2)) * binCount);
      const value = bins[Math.min(binIndex, binCount - 1)] || 0;

      // Normalize value (assuming 0-255 range from analyser)
      const normalized = value / 255;
      const barHeight = normalized * h * 0.9;

      const x = (i / barCount) * w;
      const y = h - barHeight;

      // Gradient fill based on height
      const gradient = ctx.createLinearGradient(x, h, x, y);
      gradient.addColorStop(0, `${color}40`);
      gradient.addColorStop(1, color);
      ctx.fillStyle = gradient;

      ctx.fillRect(x, y, barWidth, barHeight);
    }
  }, [width, height, color, frequencyRange]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, width, height);

    // Draw grid
    if (showGrid) {
      ctx.strokeStyle = gridColor;
      ctx.lineWidth = 0.5;

      // Vertical lines
      for (let i = 1; i < 8; i++) {
        const x = (width / 8) * i;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }

      // Horizontal lines
      for (let i = 1; i < 4; i++) {
        const y = (height / 4) * i;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Center line (stronger)
      if (mode === 'scope' || mode === 'both') {
        ctx.strokeStyle = `${gridColor}80`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, height / 2);
        ctx.lineTo(width, height / 2);
        ctx.stroke();
      }
    }

    // Draw waveform/spectrum
    if (!paused) {
      if ((mode === 'scope' || mode === 'both') && data) {
        drawScope(ctx, data);
      }

      if ((mode === 'spectrum' || mode === 'both') && frequencyData) {
        if (mode === 'both') {
          // Draw spectrum with reduced opacity when showing both
          ctx.globalAlpha = 0.5;
        }
        drawSpectrum(ctx, frequencyData);
        ctx.globalAlpha = 1;
      }
    }

    // Continue animation
    animationRef.current = requestAnimationFrame(draw);
  }, [data, frequencyData, mode, width, height, backgroundColor, gridColor, showGrid, paused, drawScope, drawSpectrum]);

  useEffect(() => {
    draw();
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [draw]);

  return (
    <div
      ref={containerRef}
      className="synth-control"
      style={{
        ...moduleStyles.base,
        ...(compact ? moduleStyles.compact : {}),
        width: '100%',
        minWidth: 0, // Allow shrinking
      }}
    >
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <span style={labelStyles.module}>
          {label || (mode === 'scope' ? 'SCOPE' : mode === 'spectrum' ? 'SPECTRUM' : 'SCOPE/SPECTRUM')}
        </span>
        <button
          onClick={() => setPaused(!paused)}
          style={{
            padding: '2px 8px',
            background: paused ? colors.accent.orange : colors.bg.elevated,
            border: 'none',
            borderRadius: 4,
            fontFamily: 'var(--font-mono)',
            fontSize: 9,
            color: paused ? colors.bg.base : colors.text.muted,
            cursor: 'pointer',
          }}
        >
          {paused ? '▶' : '⏸'}
        </button>
      </div>

      {/* Canvas - fills container width */}
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        style={{
          display: 'block',
          borderRadius: 4,
          width: '100%',
          height: 'auto',
        }}
      />

      {/* Labels */}
      {showLabels && mode === 'scope' && (
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          fontFamily: 'var(--font-mono)',
          fontSize: 8,
          color: colors.text.disabled,
        }}>
          <span>0ms</span>
          <span>{timeScale * 4}ms</span>
          <span>{timeScale * 8}ms</span>
        </div>
      )}

      {showLabels && mode === 'spectrum' && (
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          fontFamily: 'var(--font-mono)',
          fontSize: 8,
          color: colors.text.disabled,
        }}>
          <span>{frequencyRange[0]}Hz</span>
          <span>1kHz</span>
          <span>{frequencyRange[1] >= 1000 ? `${frequencyRange[1] / 1000}kHz` : `${frequencyRange[1]}Hz`}</span>
        </div>
      )}
    </div>
  );
};

export default Oscilloscope;
