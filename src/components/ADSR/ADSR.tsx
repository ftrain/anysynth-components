/**
 * ADSR Envelope
 *
 * Visual envelope editor with draggable control points.
 * Shows attack, decay, sustain, and release as an interactive curve.
 * Touch-friendly with large hit areas.
 *
 * Grid-aligned version:
 * - Fills container by default (use fillContainer=true for SquareModule)
 * - SVG uses viewBox for responsive scaling
 * - Control points have large touch targets
 */

import React, { useState, useCallback, useRef, useMemo } from 'react';
import type { EnvelopeParams } from '../../types';
import { colors } from '../../theme/tokens';

interface ADSRProps {
  value: EnvelopeParams;
  onChange?: (value: EnvelopeParams) => void;
  label?: string;
  color?: string;
  maxAttack?: number;
  maxDecay?: number;
  maxRelease?: number;
  /** @deprecated Use fillContainer instead - height is ignored when fillContainer=true */
  height?: number;
  showValues?: boolean;
  /** Fill parent container (recommended for SquareModule) */
  fillContainer?: boolean;
}

type DragTarget = 'attack' | 'decay' | 'sustain' | 'release' | null;

export const ADSR: React.FC<ADSRProps> = ({
  value,
  onChange,
  label = 'ENV',
  color = colors.accent.pink,
  maxAttack = 2000,
  maxDecay = 2000,
  maxRelease = 4000,
  height = 120,
  showValues = true,
  fillContainer = false,
}) => {
  const [dragTarget, setDragTarget] = useState<DragTarget>(null);
  const [hoveredPoint, setHoveredPoint] = useState<DragTarget>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const dragStartRef = useRef<{ x: number; y: number; value: EnvelopeParams } | null>(null);
  // Track the working value during drag to prevent snap-back from stale props
  const workingValueRef = useRef<EnvelopeParams>(value);

  const padding = fillContainer
    ? { top: 8, right: 0, bottom: 8, left: 0 }
    : { top: 16, right: 16, bottom: 24, left: 16 };
  // SVG width for calculations (rendered responsively with viewBox)
  const svgWidth = 280;
  const graphWidth = svgWidth - padding.left - padding.right;
  const graphHeight = height - padding.top - padding.bottom;

  // Calculate segment widths (proportional to max times)
  const totalTime = maxAttack + maxDecay + maxRelease;
  const attackWidth = (maxAttack / totalTime) * graphWidth;
  const decayWidth = (maxDecay / totalTime) * graphWidth;
  const sustainWidth = graphWidth * 0.15; // Fixed width for sustain
  const releaseWidth = graphWidth - attackWidth - decayWidth - sustainWidth;

  // Calculate point positions
  const points = useMemo(() => {
    const attackX = padding.left + (value.attack / maxAttack) * attackWidth;
    const decayX = padding.left + attackWidth + (value.decay / maxDecay) * decayWidth;
    const sustainX = decayX + sustainWidth;
    const releaseX = sustainX + (value.release / maxRelease) * releaseWidth;

    const sustainY = padding.top + (1 - value.sustain) * graphHeight;

    return {
      start: { x: padding.left, y: padding.top + graphHeight },
      attack: { x: attackX, y: padding.top },
      decay: { x: decayX, y: sustainY },
      sustain: { x: sustainX, y: sustainY },
      release: { x: releaseX, y: padding.top + graphHeight },
    };
  }, [value, attackWidth, decayWidth, sustainWidth, releaseWidth, graphHeight, maxAttack, maxDecay, maxRelease, padding.left, padding.top]);

  // Generate path
  const pathD = `
    M ${points.start.x} ${points.start.y}
    L ${points.attack.x} ${points.attack.y}
    L ${points.decay.x} ${points.decay.y}
    L ${points.sustain.x} ${points.sustain.y}
    L ${points.release.x} ${points.release.y}
  `;

  // Fill path (closed)
  const fillD = pathD + ` L ${points.release.x} ${padding.top + graphHeight} L ${padding.left} ${padding.top + graphHeight} Z`;

  const handlePointerDown = useCallback((e: React.PointerEvent, target: DragTarget) => {
    e.preventDefault();
    e.stopPropagation();
    const svg = svgRef.current;
    if (!svg) return;

    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    setDragTarget(target);

    // Initialize working value from current props
    workingValueRef.current = { ...value };

    const rect = svg.getBoundingClientRect();
    dragStartRef.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      value: { ...value },
    };
  }, [value]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragTarget || !dragStartRef.current || !svgRef.current) return;

    const rect = svgRef.current.getBoundingClientRect();
    // Convert screen coordinates to SVG viewBox coordinates
    // Use container height for fillContainer mode
    const effectiveHeight = fillContainer ? 160 : height;
    const effectiveGraphHeight = effectiveHeight - padding.top - padding.bottom;
    const scaleX = svgWidth / rect.width;
    const scaleY = effectiveHeight / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    // Use working value to prevent snap-back from stale props during drag
    const newValue = { ...workingValueRef.current };

    switch (dragTarget) {
      case 'attack': {
        const attackX = Math.max(padding.left, Math.min(padding.left + attackWidth, x));
        newValue.attack = ((attackX - padding.left) / attackWidth) * maxAttack;
        break;
      }
      case 'decay': {
        const decayX = Math.max(padding.left + attackWidth, Math.min(padding.left + attackWidth + decayWidth, x));
        newValue.decay = ((decayX - padding.left - attackWidth) / decayWidth) * maxDecay;
        // Also adjust sustain level with Y
        const sustainY = Math.max(padding.top, Math.min(padding.top + effectiveGraphHeight, y));
        newValue.sustain = 1 - (sustainY - padding.top) / effectiveGraphHeight;
        break;
      }
      case 'sustain': {
        const sustainY = Math.max(padding.top, Math.min(padding.top + effectiveGraphHeight, y));
        newValue.sustain = 1 - (sustainY - padding.top) / effectiveGraphHeight;
        break;
      }
      case 'release': {
        // CRITICAL: Release zone starts where sustain ACTUALLY ends (depends on decay position)
        // Visual model: sustainX = decayX + sustainWidth, releaseX = sustainX + (release/max)*releaseWidth
        // So release zone must be calculated relative to actual sustain end, not fixed zone
        const actualDecayX = padding.left + attackWidth + (newValue.decay / maxDecay) * decayWidth;
        const actualSustainEndX = actualDecayX + sustainWidth;
        const releaseX = Math.max(actualSustainEndX, Math.min(actualSustainEndX + releaseWidth, x));
        newValue.release = ((releaseX - actualSustainEndX) / releaseWidth) * maxRelease;
        break;
      }
    }

    // Update working ref and notify parent
    workingValueRef.current = newValue;
    onChange?.(newValue);
  }, [dragTarget, onChange, attackWidth, decayWidth, sustainWidth, releaseWidth, graphHeight, maxAttack, maxDecay, maxRelease, padding.left, padding.top, fillContainer, height]);

  const handlePointerUp = useCallback(() => {
    setDragTarget(null);
    dragStartRef.current = null;
  }, []);

  const formatTime = (ms: number): string => {
    if (ms < 1000) return `${Math.round(ms)}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  const pointRadius = 4;  // Visual size (small)
  const hitRadius = 20;   // Touch target (large)

  // fillContainer mode: just render the SVG directly, filling parent
  if (fillContainer) {
    // Use a taller viewBox for fillContainer mode
    const containerHeight = 160;
    const containerGraphHeight = containerHeight - padding.top - padding.bottom;

    // Recalculate points for container height
    const containerSustainY = padding.top + (1 - value.sustain) * containerGraphHeight;
    const containerPoints = {
      start: { x: padding.left, y: padding.top + containerGraphHeight },
      attack: { x: padding.left + (value.attack / maxAttack) * attackWidth, y: padding.top },
      decay: { x: padding.left + attackWidth + (value.decay / maxDecay) * decayWidth, y: containerSustainY },
      sustain: { x: padding.left + attackWidth + (value.decay / maxDecay) * decayWidth + sustainWidth, y: containerSustainY },
      release: { x: padding.left + attackWidth + (value.decay / maxDecay) * decayWidth + sustainWidth + (value.release / maxRelease) * releaseWidth, y: padding.top + containerGraphHeight },
    };

    const containerPathD = `
      M ${containerPoints.start.x} ${containerPoints.start.y}
      L ${containerPoints.attack.x} ${containerPoints.attack.y}
      L ${containerPoints.decay.x} ${containerPoints.decay.y}
      L ${containerPoints.sustain.x} ${containerPoints.sustain.y}
      L ${containerPoints.release.x} ${containerPoints.release.y}
    `;
    const containerFillD = containerPathD + ` L ${containerPoints.release.x} ${padding.top + containerGraphHeight} L ${padding.left} ${padding.top + containerGraphHeight} Z`;

    return (
      <svg
        ref={svgRef}
        width="100%"
        height="100%"
        viewBox={`0 0 ${svgWidth} ${containerHeight}`}
        preserveAspectRatio="xMidYMid meet"
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        style={{
          display: 'block',
          touchAction: 'none',
          overflow: 'visible',
        }}
      >
        {/* Background grid */}
        <rect
          x={padding.left}
          y={padding.top}
          width={graphWidth}
          height={containerGraphHeight}
          fill={colors.bg.elevated}
          rx={4}
        />

        {/* Grid lines */}
        {[0.25, 0.5, 0.75].map((y) => (
          <line
            key={y}
            x1={padding.left}
            y1={padding.top + containerGraphHeight * y}
            x2={padding.left + graphWidth}
            y2={padding.top + containerGraphHeight * y}
            stroke={colors.bg.border}
            strokeDasharray="4,4"
          />
        ))}

        {/* Envelope fill */}
        <path
          d={containerFillD}
          fill={color}
          opacity={0.15}
        />

        {/* Envelope line */}
        <path
          d={containerPathD}
          fill="none"
          stroke={color}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Control points */}
        {(['attack', 'decay', 'sustain', 'release'] as const).map((point) => {
          const pos = containerPoints[point];
          const isActive = dragTarget === point;
          const isHovered = hoveredPoint === point;

          return (
            <g key={point}>
              <circle
                cx={pos.x}
                cy={pos.y}
                r={hitRadius}
                fill="transparent"
                style={{ cursor: 'pointer' }}
                onPointerDown={(e) => handlePointerDown(e, point)}
                onMouseEnter={() => setHoveredPoint(point)}
                onMouseLeave={() => setHoveredPoint(null)}
              />
              <circle
                cx={pos.x}
                cy={pos.y}
                r={isActive || isHovered ? pointRadius + 2 : pointRadius}
                fill={isActive ? color : colors.bg.surface}
                stroke={color}
                strokeWidth={2}
                style={{ pointerEvents: 'none', transition: 'r 100ms' }}
              />
              {isActive && (
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r={pointRadius + 6}
                  fill="none"
                  stroke={color}
                  strokeWidth={1}
                  opacity={0.5}
                  style={{ pointerEvents: 'none' }}
                />
              )}
            </g>
          );
        })}
      </svg>
    );
  }

  return (
    <div
      className="synth-control"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        padding: 16,
        background: colors.bg.surface,
        borderRadius: 8,
      }}
    >
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <span style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 'var(--text-sm)',
          color: colors.text.muted,
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
        }}>
          {label}
        </span>
        {showValues && hoveredPoint && (
          <span style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 'var(--text-xs)',
            color,
          }}>
            {hoveredPoint === 'sustain'
              ? `${Math.round(value.sustain * 100)}%`
              : formatTime(value[hoveredPoint])}
          </span>
        )}
      </div>

      {/* Envelope visualization */}
      <svg
        ref={svgRef}
        width="100%"
        height={height}
        viewBox={`0 0 ${svgWidth} ${height}`}
        preserveAspectRatio="xMidYMid meet"
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        style={{
          display: 'block',
          touchAction: 'none',
          overflow: 'visible',
          maxWidth: svgWidth,
        }}
      >
        {/* Background grid */}
        <rect
          x={padding.left}
          y={padding.top}
          width={graphWidth}
          height={graphHeight}
          fill={colors.bg.elevated}
          rx={4}
        />

        {/* Grid lines */}
        {[0.25, 0.5, 0.75].map((y) => (
          <line
            key={y}
            x1={padding.left}
            y1={padding.top + graphHeight * y}
            x2={padding.left + graphWidth}
            y2={padding.top + graphHeight * y}
            stroke={colors.bg.border}
            strokeDasharray="4,4"
          />
        ))}

        {/* Envelope fill */}
        <path
          d={fillD}
          fill={color}
          opacity={0.15}
        />

        {/* Envelope line */}
        <path
          d={pathD}
          fill="none"
          stroke={color}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Control points */}
        {(['attack', 'decay', 'sustain', 'release'] as const).map((point) => {
          const pos = points[point];
          const isActive = dragTarget === point;
          const isHovered = hoveredPoint === point;

          return (
            <g key={point}>
              {/* Hit area (invisible, larger) */}
              <circle
                cx={pos.x}
                cy={pos.y}
                r={hitRadius}
                fill="transparent"
                style={{ cursor: 'pointer' }}
                onPointerDown={(e) => handlePointerDown(e, point)}
                onMouseEnter={() => setHoveredPoint(point)}
                onMouseLeave={() => setHoveredPoint(null)}
              />

              {/* Visual point */}
              <circle
                cx={pos.x}
                cy={pos.y}
                r={isActive || isHovered ? pointRadius + 2 : pointRadius}
                fill={isActive ? color : colors.bg.surface}
                stroke={color}
                strokeWidth={2}
                style={{ pointerEvents: 'none', transition: 'r 100ms' }}
              />

              {/* Glow when active */}
              {isActive && (
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r={pointRadius + 6}
                  fill="none"
                  stroke={color}
                  strokeWidth={1}
                  opacity={0.5}
                  style={{ pointerEvents: 'none' }}
                />
              )}
            </g>
          );
        })}

      </svg>

      {/* Value display */}
      {showValues && (
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          gap: 8,
        }}>
          {[
            { key: 'attack', label: 'A', format: formatTime },
            { key: 'decay', label: 'D', format: formatTime },
            { key: 'sustain', label: 'S', format: (v: number) => `${Math.round(v * 100)}%` },
            { key: 'release', label: 'R', format: formatTime },
          ].map(({ key, label: l, format }) => (
            <div key={key} style={{ flex: 1, textAlign: 'center' }}>
              <div style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 'var(--text-xs)',
                color: colors.text.disabled,
              }}>
                {l}
              </div>
              <div style={{
                fontFamily: 'var(--font-numeric)',
                fontSize: 'var(--text-sm)',
                color: hoveredPoint === key || dragTarget === key ? color : colors.text.secondary,
              }}>
                {format(value[key as keyof EnvelopeParams] as number)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ADSR;
