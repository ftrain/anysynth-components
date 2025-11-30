/**
 * NestedSliderCircular
 *
 * Concentric ring sliders - the classic nested knob.
 * Space-efficient, intuitive, distinctive.
 * Updated with TypeScript and refined interaction.
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import type { Parameter, ParameterChangeHandler, ParameterWithOptions, OptionChangeHandler } from '../../types';
import { colors, components } from '../../theme/tokens';
import { moduleStyles, getAccentColor } from '../../theme/styles';

// Component-specific constants from theme
const KNOB = components.knobCircular;

interface NestedSliderCircularProps {
  parameters: (Parameter | ParameterWithOptions)[];
  onChange?: ParameterChangeHandler;
  onOptionChange?: OptionChangeHandler;
  label?: string;
  size?: number;
  startAngle?: number;
  sweepAngle?: number;
  /** When true, dragging through halo options selects them automatically */
  dragSelectOptions?: boolean;
  compact?: boolean;
}

const hasOptions = (p: Parameter | ParameterWithOptions): p is ParameterWithOptions => {
  return 'options' in p && Array.isArray(p.options);
};

export const NestedSliderCircular: React.FC<NestedSliderCircularProps> = ({
  parameters,
  onChange,
  onOptionChange,
  label,
  size: sizeProp = KNOB.defaultSize,
  startAngle = KNOB.arcStart,
  sweepAngle = KNOB.arcRange,
  dragSelectOptions = true,
  compact = false,
}) => {
  const [values, setValues] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    parameters.forEach(p => { initial[p.id] = p.value; });
    return initial;
  });
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    parameters.forEach(p => {
      if (hasOptions(p)) {
        initial[p.id] = p.selectedOption;
      }
    });
    return initial;
  });
  const [activeParam, setActiveParam] = useState<string | null>(null);
  const [hoveredParam, setHoveredParam] = useState<string | null>(null);
  const [hoveredOption, setHoveredOption] = useState<string | null>(null);
  const [enabled, setEnabled] = useState(true);
  const [containerSize, setContainerSize] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const dragRef = useRef<{ id: string; startY: number; startValue: number } | null>(null);
  const lastClickRef = useRef<Record<string, number>>({});
  const lastOptionRef = useRef<string | null>(null);

  // Always observe container size for responsive behavior
  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        // Use the smaller dimension to keep it square
        setContainerSize(Math.min(width, height || width));
      }
    });

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Effective size: fill container by default, or use prop if specified
  const size = containerSize > 0
    ? Math.max(KNOB.minSize, containerSize - 16) // Minimal padding
    : sizeProp;

  const cx = size / 2;
  const cy = size / 2;
  const trackWidth = compact ? KNOB.trackWidthCompact : KNOB.trackWidth;
  const bandWidth = Math.max(trackWidth, size / (parameters.length * 3 + 2));
  const startRadius = bandWidth * 1.5;
  const gap = KNOB.gap;

  const getColor = (param: Parameter): string => {
    return param.color ? getAccentColor(param.color) : colors.accent.cyan;
  };

  const formatValue = (param: Parameter, val: number): string => {
    const min = param.min ?? 0;
    const max = param.max ?? 100;
    const displayVal = min + val * (max - min);
    return Math.round(displayVal).toString();
  };

  // Calculate ring data for each parameter
  const rings = parameters.map((param, index) => ({
    ...param,
    radius: startRadius + index * (bandWidth + gap),
  }));

  // Find any parameter with options (calculated early for use in handlers)
  const paramWithOptions = parameters.find(p => hasOptions(p)) as ParameterWithOptions | undefined;

  // Calculate outer radius for options positioning
  const outerRadius = rings.length > 0
    ? rings[rings.length - 1].radius + bandWidth / 2
    : startRadius;

  // Calculate option positions along the halo arc (like ChordKnob)
  const getOptionPositions = (param: ParameterWithOptions) => {
    const opts = param.options;
    const optCount = opts.length;

    // Halo radius is just outside the outermost ring
    const haloRadius = outerRadius + 16;

    // Distribute options along the arc (same 270° range as the knob)
    const angleSpan = sweepAngle; // Usually 270°
    const anglePerOption = optCount > 1 ? angleSpan / (optCount - 1) : 0;

    return opts.map((opt, i) => {
      // Calculate angle for this option (startAngle is typically -135°)
      const angle = startAngle + i * anglePerOption;
      const rad = (angle - 90) * Math.PI / 180;

      return {
        label: opt,
        x: cx + haloRadius * Math.cos(rad),
        y: cy + haloRadius * Math.sin(rad),
        angle,
      };
    });
  };

  // Detect which option the cursor is hovering over
  // Uses simple distance-based detection to option dots
  const getOptionFromPosition = useCallback((clientX: number, clientY: number, param: ParameterWithOptions | null): string | null => {
    if (!svgRef.current || !param) return null;

    const rect = svgRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    // Get positions of all option dots
    const positions = getOptionPositions(param);

    // Find the closest option within hit range
    let closestOption: string | null = null;
    let closestDistance = Infinity;
    const hitRadius = 25; // Generous hit radius

    for (const pos of positions) {
      const dx = x - pos.x;
      const dy = y - pos.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < hitRadius && distance < closestDistance) {
        closestDistance = distance;
        closestOption = pos.label;
      }
    }

    return closestOption;
  }, [outerRadius, sweepAngle, startAngle, cx, cy]);

  const valueToAngle = (value: number): number => {
    return startAngle + value * sweepAngle;
  };

  const createArcPath = (radius: number, start: number, end: number): string => {
    const startRad = (start - 90) * Math.PI / 180;
    const endRad = (end - 90) * Math.PI / 180;
    const x1 = cx + radius * Math.cos(startRad);
    const y1 = cy + radius * Math.sin(startRad);
    const x2 = cx + radius * Math.cos(endRad);
    const y2 = cy + radius * Math.sin(endRad);
    const largeArc = Math.abs(end - start) > 180 ? 1 : 0;
    return `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`;
  };

  const getParamFromPosition = useCallback((e: React.MouseEvent | React.TouchEvent): string | null => {
    if (!svgRef.current) return null;

    const rect = svgRef.current.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const x = clientX - rect.left - cx;
    const y = clientY - rect.top - cy;
    const distance = Math.sqrt(x * x + y * y);
    const angle = Math.atan2(y, x) * 180 / Math.PI + 90;
    const normalizedAngle = angle < -180 ? angle + 360 : angle;

    // Check if in dead zone
    if (normalizedAngle > startAngle + sweepAngle && normalizedAngle < startAngle + 360) {
      return null;
    }

    // Find which ring
    for (const ring of rings) {
      const innerR = ring.radius - bandWidth / 2;
      const outerR = ring.radius + bandWidth / 2;
      if (distance >= innerR && distance <= outerR) {
        return ring.id;
      }
    }

    return null;
  }, [cx, cy, rings, bandWidth, startAngle, sweepAngle]);

  const isClickOnCenter = useCallback((e: React.MouseEvent | React.TouchEvent): boolean => {
    if (!svgRef.current) return false;

    const rect = svgRef.current.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const x = clientX - rect.left - cx;
    const y = clientY - rect.top - cy;
    return Math.sqrt(x * x + y * y) <= startRadius - bandWidth / 2;
  }, [cx, cy, startRadius, bandWidth]);

  const handleStart = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    // Check if clicking on an option button - if so, let the click event handle it
    const target = e.target as Element;
    // Options are rendered as <circle> and <text> inside <g> elements
    const isOptionClick = target.tagName === 'circle' || target.tagName === 'text';
    const parentG = target.closest('g');
    if (isOptionClick && parentG && parentG.style.cursor === 'pointer') {
      return; // Don't prevent default, let the onClick on the option <g> handle it
    }

    e.preventDefault();

    // Center click toggles enabled
    if (isClickOnCenter(e)) {
      setEnabled(prev => !prev);
      return;
    }

    if (!enabled) {
      setEnabled(true);
      return;
    }

    const paramId = getParamFromPosition(e);
    if (!paramId) return;

    const param = parameters.find(p => p.id === paramId)!;

    // Double-click detection
    const now = Date.now();
    const lastClick = lastClickRef.current[paramId] || 0;
    if (now - lastClick < 300) {
      setValues(prev => ({ ...prev, [paramId]: param.defaultValue }));
      onChange?.(paramId, param.defaultValue);
      lastClickRef.current[paramId] = 0;
      return;
    }
    lastClickRef.current[paramId] = now;

    setActiveParam(paramId);
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    dragRef.current = { id: paramId, startY: clientY, startValue: values[paramId] };

    const handleMove = (moveEvent: MouseEvent | TouchEvent) => {
      const drag = dragRef.current;
      if (!drag) return;
      moveEvent.preventDefault();

      const moveY = 'touches' in moveEvent
        ? (moveEvent as TouchEvent).touches[0].clientY
        : (moveEvent as MouseEvent).clientY;
      const deltaY = drag.startY - moveY;
      const sensitivity = 0.005;
      const newValue = Math.max(0, Math.min(1, drag.startValue + deltaY * sensitivity));

      setValues(prev => ({ ...prev, [drag.id]: newValue }));
      onChange?.(drag.id, newValue);

      // Drag-to-select option based on the current value position on the arc
      // When dragging the wave parameter (or any param with options), the value determines the selected option
      if (dragSelectOptions && paramWithOptions && drag.id === paramWithOptions.id) {
        const opts = paramWithOptions.options;
        const optCount = opts.length;
        // Map value (0-1) to option index
        const optIndex = Math.round(newValue * (optCount - 1));
        const detectedOption = opts[Math.max(0, Math.min(optCount - 1, optIndex))];

        setHoveredOption(detectedOption);

        // Auto-select on drag through option (only if changed)
        if (detectedOption && detectedOption !== lastOptionRef.current) {
          lastOptionRef.current = detectedOption;
          setSelectedOptions(prev => ({ ...prev, [paramWithOptions.id]: detectedOption }));
          onOptionChange?.(paramWithOptions.id, detectedOption);
        }
      }
    };

    const handleEnd = () => {
      dragRef.current = null;
      setActiveParam(null);
      setHoveredOption(null);
      lastOptionRef.current = null;
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleEnd);
      window.removeEventListener('touchmove', handleMove);
      window.removeEventListener('touchend', handleEnd);
    };

    window.addEventListener('mousemove', handleMove, { passive: false });
    window.addEventListener('mouseup', handleEnd);
    window.addEventListener('touchmove', handleMove, { passive: false });
    window.addEventListener('touchend', handleEnd);
  }, [enabled, getParamFromPosition, isClickOnCenter, parameters, values, onChange, dragSelectOptions, paramWithOptions, getOptionFromPosition, onOptionChange]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!enabled) {
      setHoveredParam(null);
      return;
    }
    setHoveredParam(getParamFromPosition(e));
  }, [enabled, getParamFromPosition]);

  const displayParam = activeParam || hoveredParam;
  const displayRing = displayParam ? rings.find(r => r.id === displayParam) : null;
  const highlightedParam = activeParam || hoveredParam;

  return (
    <div
      ref={containerRef}
      className="synth-control"
      style={{
        ...moduleStyles.base,
        ...(compact ? moduleStyles.compact : {}),
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        height: '100%',
        aspectRatio: '1',
      }}
    >
      <svg
        ref={svgRef}
        width={size}
        height={size}
        onMouseDown={handleStart}
        onTouchStart={handleStart}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setHoveredParam(null)}
        style={{
          display: 'block',
          touchAction: 'none',
          cursor: !enabled ? 'pointer' : hoveredParam ? 'ns-resize' : 'default',
          WebkitTapHighlightColor: 'transparent',
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
            stroke={highlightedParam === ring.id ? colors.bg.highlight : colors.bg.elevated}
            strokeWidth={bandWidth}
          />
        ))}

        {/* Track arcs */}
        {rings.map((ring) => {
          const color = getColor(ring);
          return (
            <path
              key={`track-${ring.id}`}
              d={createArcPath(ring.radius, startAngle, startAngle + sweepAngle)}
              fill="none"
              stroke={color}
              strokeWidth={bandWidth - 2}
              strokeLinecap="butt"
              opacity={enabled ? (highlightedParam === ring.id ? 0.35 : 0.2) : 0.08}
            />
          );
        })}

        {/* Value arcs */}
        {enabled && rings.map((ring) => {
          const value = values[ring.id];
          if (value <= 0.01) return null;
          const color = getColor(ring);
          const endAngle = valueToAngle(value);
          return (
            <path
              key={`value-${ring.id}`}
              d={createArcPath(ring.radius, startAngle, endAngle)}
              fill="none"
              stroke={color}
              strokeWidth={bandWidth - 2}
              strokeLinecap="butt"
              opacity={highlightedParam === ring.id ? 1 : 0.8}
            />
          );
        })}

        {/* Center power indicator */}
        <circle
          cx={cx}
          cy={cy}
          r={startRadius - bandWidth / 2 - 4}
          fill={enabled ? colors.semantic.active : colors.bg.elevated}
          opacity={0.8}
        />
        <circle cx={cx} cy={cy} r={4} fill={colors.bg.base} />

        {/* Info display */}
        {displayRing ? (
          <g>
            <text
              x={cx}
              y={cy + outerRadius * 0.35}
              textAnchor="middle"
              dominantBaseline="middle"
              fill={getColor(displayRing)}
              fontSize={size * 0.045}
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
              fontSize={size * 0.07}
              fontFamily="var(--font-numeric)"
              fontWeight={500}
              style={{ fontVariantNumeric: 'tabular-nums' }}
            >
              {formatValue(displayRing, values[displayRing.id])}
            </text>
            {hasOptions(displayRing) && (
              <text
                x={cx}
                y={cy + outerRadius * 0.72}
                textAnchor="middle"
                dominantBaseline="middle"
                fill={getColor(displayRing)}
                fontSize={size * 0.035}
                fontFamily="var(--font-mono)"
                opacity={0.8}
              >
                {selectedOptions[displayRing.id]}
              </text>
            )}
          </g>
        ) : (
          label && (
            <text
              x={cx}
              y={cy + outerRadius * 0.5}
              textAnchor="middle"
              dominantBaseline="middle"
              fill={colors.text.muted}
              fontSize={size * 0.055}
              fontFamily="var(--font-numeric)"
            >
              {label}
            </text>
          )
        )}

        {/* Tick marks */}
        {[startAngle, startAngle + sweepAngle / 2, startAngle + sweepAngle].map((angle, i) => {
          const rad = (angle - 90) * Math.PI / 180;
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

        {/* Options halo - dots along the arc outside the knob */}
        {paramWithOptions && getOptionPositions(paramWithOptions).map((pos) => {
          const isSelected = selectedOptions[paramWithOptions.id] === pos.label;
          const isHovered = hoveredOption === pos.label;
          const color = getColor(paramWithOptions);

          // Position label next to the dot, adjusting anchor based on position
          const isLeftSide = pos.x < cx;
          const labelOffset = 12;
          const labelX = isLeftSide ? pos.x - labelOffset : pos.x + labelOffset;
          const labelY = pos.y;
          const textAnchor = isLeftSide ? 'end' : 'start';

          return (
            <g
              key={pos.label}
              style={{ cursor: 'pointer' }}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedOptions(prev => ({ ...prev, [paramWithOptions.id]: pos.label }));
                onOptionChange?.(paramWithOptions.id, pos.label);
              }}
            >
              {/* Option dot */}
              <circle
                cx={pos.x}
                cy={pos.y}
                r={isSelected ? 7 : 5}
                fill={isSelected ? color : colors.bg.elevated}
                stroke={color}
                strokeWidth={isSelected ? 0 : 1}
                opacity={isSelected ? 1 : isHovered ? 0.9 : 0.6}
              />
              {/* Option label */}
              <text
                x={labelX}
                y={labelY}
                textAnchor={textAnchor}
                dominantBaseline="middle"
                fill={isSelected ? color : colors.text.muted}
                fontSize={isSelected ? 11 : 9}
                fontFamily="var(--font-mono)"
                fontWeight={isSelected ? 600 : 400}
                style={{ pointerEvents: 'none' }}
              >
                {pos.label.length > 4 ? pos.label.slice(0, 4) : pos.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};

export default NestedSliderCircular;
