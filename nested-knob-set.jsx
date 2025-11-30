/**
 * NestedKnobSet - A circular multi-parameter control with halo option selectors
 * 
 * A NestedKnobSet contains multiple NestedKnobs arranged as concentric rings.
 * Each NestedKnob has a Name, Value, and optionally Options that appear as
 * halos around the top when that knob is selected.
 * 
 * Click on a knob to select it. If it has Options, they appear as halos.
 * Halos stay visible until you click a different knob.
 * 
 * @author Generated with Claude
 * @version 2.0.0
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';

/**
 * NestedKnob configuration
 * @typedef {Object} NestedKnob
 * @property {string} id - Unique identifier
 * @property {string} name - Display name
 * @property {string} color - Hex color
 * @property {number} defaultValue - Default value (0-1)
 * @property {string[]} [options] - Optional array of type options
 * @property {string} [defaultOption] - Default selected option
 */

/** @type {NestedKnob[]} */
const KNOB_CONFIG = [
  { id: 'gain', name: 'GAIN', color: '#ff6b6b', defaultValue: 0.7 },
  { id: 'lpf', name: 'LPF', color: '#ff9f43', defaultValue: 0.5 },
  { 
    id: 'flfo', 
    name: 'FLFO', 
    color: '#feca57', 
    defaultValue: 0.3,
    options: ['Sine', 'Ramp', 'Tri', 'Noise'],
    defaultOption: 'Sine'
  },
  { 
    id: 'osc', 
    name: 'OSC', 
    color: '#1dd1a1', 
    defaultValue: 0.6,
    options: ['Saw', 'Square', 'Tri', 'Sine'],
    defaultOption: 'Saw'
  },
  { id: 'pitch', name: 'PITCH', color: '#5f27cd', defaultValue: 0.5 },
  { 
    id: 'plfo', 
    name: 'PLFO', 
    color: '#ee5a9b', 
    defaultValue: 0.4,
    options: ['Sine', 'Ramp', 'Tri', 'Noise'],
    defaultOption: 'Sine'
  },
];

const NestedKnobSet = ({ label = "Osc 1", minSize = 200 }) => {
  const getInitialValues = () => {
    const initial = {};
    KNOB_CONFIG.forEach(knob => { initial[knob.id] = knob.defaultValue; });
    return initial;
  };

  const getInitialOptions = () => {
    const initial = {};
    KNOB_CONFIG.forEach(knob => { 
      if (knob.options) {
        initial[knob.id] = knob.defaultOption || knob.options[0]; 
      }
    });
    return initial;
  };

  const [values, setValues] = useState(getInitialValues);
  const [selectedOptions, setSelectedOptions] = useState(getInitialOptions);
  const [enabled, setEnabled] = useState(true);
  const [selectedKnob, setSelectedKnob] = useState(null);
  const [activeKnob, setActiveKnob] = useState(null);
  const [hoveredKnob, setHoveredKnob] = useState(null);
  const [focusedKnob, setFocusedKnob] = useState(null);
  const [hoveredOption, setHoveredOption] = useState(null);
  const [size, setSize] = useState(300);
  
  const containerRef = useRef(null);
  const svgRef = useRef(null);
  const dragStartRef = useRef({ y: 0, startValue: 0 });
  const lastClickTimeRef = useRef({});

  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const w = rect.width;
        const h = rect.height;
        if (w > 0 && h > 0) {
          setSize(Math.max(minSize, Math.min(w, h)));
        }
      }
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, [minSize]);

  const scale = size / 400;
  const bandWidth = 12 * scale;
  const startRadius = 25 * scale;
  const cx = size / 2;
  const cy = size / 2;
  
  const knobs = KNOB_CONFIG.map((knob, index) => ({
    ...knob,
    radius: startRadius + (index * bandWidth)
  }));

  const outerRadius = startRadius + (knobs.length * bandWidth);
  const haloRadius = outerRadius + 25 * scale;
  
  const valueToAngle = (value) => -135 + (value * 270);

  const getPositionFromEvent = (e) => {
    if (e.touches && e.touches.length > 0) {
      return { clientX: e.touches[0].clientX, clientY: e.touches[0].clientY };
    }
    return { clientX: e.clientX, clientY: e.clientY };
  };

  const getKnobFromPosition = useCallback((e) => {
    if (!svgRef.current) return null;
    const { clientX, clientY } = getPositionFromEvent(e);
    const rect = svgRef.current.getBoundingClientRect();
    const x = clientX - rect.left - cx;
    const y = clientY - rect.top - cy;
    const distance = Math.sqrt(x * x + y * y);
    const angle = Math.atan2(y, x) * 180 / Math.PI + 90;
    const normalizedAngle = angle < -180 ? angle + 360 : angle;
    if (normalizedAngle > 135 && normalizedAngle < 225) return null;
    for (let i = 0; i < knobs.length; i++) {
      const innerR = knobs[i].radius - bandWidth / 2;
      const outerR = knobs[i].radius + bandWidth / 2;
      if (distance >= innerR && distance <= outerR) return knobs[i].id;
    }
    return null;
  }, [cx, cy, knobs, bandWidth]);

  const isClickOnCenter = useCallback((e) => {
    if (!svgRef.current) return false;
    const { clientX, clientY } = getPositionFromEvent(e);
    const rect = svgRef.current.getBoundingClientRect();
    const x = clientX - rect.left - cx;
    const y = clientY - rect.top - cy;
    return Math.sqrt(x * x + y * y) <= 15 * scale;
  }, [cx, cy, scale]);

  const resetToDefault = useCallback((knobId) => {
    const knob = KNOB_CONFIG.find(k => k.id === knobId);
    if (!knob) return;
    setValues(prev => ({ ...prev, [knobId]: knob.defaultValue }));
    if (knob.options && knob.defaultOption) {
      setSelectedOptions(prev => ({ ...prev, [knobId]: knob.defaultOption }));
    }
  }, []);

  const handleStart = useCallback((e) => {
    if (isClickOnCenter(e)) {
      e.preventDefault();
      setEnabled(prev => !prev);
      return;
    }
    if (!enabled) {
      e.preventDefault();
      setEnabled(true);
      return;
    }
    const knobId = getKnobFromPosition(e);
    if (!knobId) return;
    e.preventDefault();

    const now = Date.now();
    const lastClick = lastClickTimeRef.current[knobId] || 0;
    if (now - lastClick < 300) {
      resetToDefault(knobId);
      lastClickTimeRef.current[knobId] = 0;
      return;
    }
    lastClickTimeRef.current[knobId] = now;

    setSelectedKnob(knobId);
    setActiveKnob(knobId);
    
    const { clientY } = getPositionFromEvent(e);
    dragStartRef.current = { y: clientY, startValue: values[knobId] };

    const handleMove = (moveEvent) => {
      moveEvent.preventDefault();
      const { clientY: moveY } = getPositionFromEvent(moveEvent);
      const deltaY = dragStartRef.current.y - moveY;
      const newValue = Math.max(0, Math.min(1, dragStartRef.current.startValue + deltaY * 0.003));
      setValues(prev => ({ ...prev, [knobId]: newValue }));
    };

    const handleEnd = () => {
      setActiveKnob(null);
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleEnd);
      window.removeEventListener('touchmove', handleMove);
      window.removeEventListener('touchend', handleEnd);
      window.removeEventListener('touchcancel', handleEnd);
    };

    window.addEventListener('mousemove', handleMove, { passive: false });
    window.addEventListener('mouseup', handleEnd);
    window.addEventListener('touchmove', handleMove, { passive: false });
    window.addEventListener('touchend', handleEnd);
    window.addEventListener('touchcancel', handleEnd);
  }, [values, enabled, getKnobFromPosition, isClickOnCenter, resetToDefault]);

  const handleMouseMove = useCallback((e) => {
    if (!enabled) { setHoveredKnob(null); return; }
    setHoveredKnob(getKnobFromPosition(e));
  }, [getKnobFromPosition, enabled]);

  const handleKeyDown = useCallback((e, knobId) => {
    if (!enabled) return;
    if (e.key === 'Delete' || e.key === 'Backspace') {
      e.preventDefault();
      resetToDefault(knobId);
      return;
    }
    const step = e.shiftKey ? 0.1 : 0.01;
    let newValue = values[knobId];
    switch (e.key) {
      case 'ArrowUp': case 'ArrowRight': e.preventDefault(); newValue = Math.min(1, values[knobId] + step); break;
      case 'ArrowDown': case 'ArrowLeft': e.preventDefault(); newValue = Math.max(0, values[knobId] - step); break;
      case 'Home': e.preventDefault(); newValue = 0; break;
      case 'End': e.preventDefault(); newValue = 1; break;
      default: return;
    }
    setValues(prev => ({ ...prev, [knobId]: newValue }));
  }, [values, enabled, resetToDefault]);

  const handleOptionSelect = (knobId, option) => {
    setSelectedOptions(prev => ({ ...prev, [knobId]: option }));
  };

  const createArcPath = (radius, startAngle, endAngle) => {
    const startRad = (startAngle - 90) * Math.PI / 180;
    const endRad = (endAngle - 90) * Math.PI / 180;
    const x1 = cx + radius * Math.cos(startRad);
    const y1 = cy + radius * Math.sin(startRad);
    const x2 = cx + radius * Math.cos(endRad);
    const y2 = cy + radius * Math.sin(endRad);
    const largeArc = Math.abs(endAngle - startAngle) > 180 ? 1 : 0;
    return `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`;
  };

  const displayKnobId = selectedKnob || hoveredKnob || focusedKnob;
  const displayKnob = displayKnobId ? knobs.find(k => k.id === displayKnobId) : null;
  const highlightedKnob = activeKnob || selectedKnob || hoveredKnob || focusedKnob;
  
  const optionsKnob = selectedKnob ? knobs.find(k => k.id === selectedKnob && k.options) : null;

  const getOptionPositions = (knob) => {
    if (!knob?.options) return [];
    const options = knob.options;
    const totalAngle = 120;
    const startAngle = -90 - totalAngle / 2;
    const angleStep = totalAngle / (options.length - 1 || 1);
    
    return options.map((opt, i) => {
      const angle = options.length === 1 ? -90 : startAngle + (i * angleStep);
      const rad = angle * Math.PI / 180;
      return {
        label: opt,
        x: cx + haloRadius * Math.cos(rad),
        y: cy + haloRadius * Math.sin(rad),
        angle
      };
    });
  };

  const optionPositions = optionsKnob ? getOptionPositions(optionsKnob) : [];

  return (
    <div 
      ref={containerRef}
      style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
    >
      <div style={{ position: 'relative' }}>
        <svg 
          ref={svgRef}
          width={size}
          height={size}
          onMouseDown={handleStart}
          onTouchStart={handleStart}
          onMouseMove={handleMouseMove}
          onMouseLeave={() => { setHoveredKnob(null); setHoveredOption(null); }}
          style={{ 
            display: 'block',
            touchAction: 'none',
            cursor: !enabled ? 'pointer' : (hoveredKnob ? 'ns-resize' : 'default'),
            WebkitTapHighlightColor: 'transparent',
            userSelect: 'none',
            overflow: 'visible'
          }}
        >
          {/* Option halos - shown for selected knob with options */}
          {optionsKnob && optionPositions.map((pos) => {
            const isSelected = selectedOptions[optionsKnob.id] === pos.label;
            const isHovered = hoveredOption === `${optionsKnob.id}-${pos.label}`;
            return (
              <g 
                key={`option-${pos.label}`}
                style={{ cursor: 'pointer' }}
                onMouseEnter={() => setHoveredOption(`${optionsKnob.id}-${pos.label}`)}
                onMouseLeave={() => setHoveredOption(null)}
                onClick={(e) => { e.stopPropagation(); handleOptionSelect(optionsKnob.id, pos.label); }}
              >
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r={18 * scale}
                  fill={isSelected ? optionsKnob.color : '#1a1a1a'}
                  stroke={optionsKnob.color}
                  strokeWidth={isSelected ? 2 * scale : 1 * scale}
                  opacity={isHovered ? 1 : (isSelected ? 0.9 : 0.7)}
                />
                <text
                  x={pos.x}
                  y={pos.y}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill={isSelected ? '#000' : optionsKnob.color}
                  fontSize={8 * scale}
                  fontFamily="monospace"
                  fontWeight={isSelected ? '600' : '400'}
                  style={{ pointerEvents: 'none' }}
                >
                  {pos.label}
                </text>
              </g>
            );
          })}

          {/* Background bands */}
          {knobs.map(knob => (
            <circle
              key={`bg-${knob.id}`}
              cx={cx}
              cy={cy}
              r={knob.radius}
              fill="none"
              stroke={highlightedKnob === knob.id ? '#2a2a2a' : '#1a1a1a'}
              strokeWidth={bandWidth}
            />
          ))}

          {/* Track arcs */}
          {knobs.map(knob => (
            <path
              key={`track-${knob.id}`}
              d={createArcPath(knob.radius, -135, 135)}
              fill="none"
              stroke={knob.color}
              strokeWidth={bandWidth - 2 * scale}
              strokeLinecap="butt"
              opacity={enabled ? (highlightedKnob === knob.id ? 0.35 : 0.2) : 0.08}
            />
          ))}

          {/* Value arcs */}
          {enabled && knobs.map(knob => {
            const endAngle = valueToAngle(values[knob.id]);
            if (values[knob.id] <= 0.01) return null;
            return (
              <path
                key={`value-${knob.id}`}
                d={createArcPath(knob.radius, -135, endAngle)}
                fill="none"
                stroke={knob.color}
                strokeWidth={bandWidth - 2 * scale}
                strokeLinecap="butt"
                opacity={highlightedKnob === knob.id ? 1 : 0.8}
              />
            );
          })}

          {/* Focus indicator */}
          {focusedKnob && enabled && (() => {
            const fk = knobs.find(k => k.id === focusedKnob);
            return fk ? (
              <circle
                cx={cx}
                cy={cy}
                r={fk.radius}
                fill="none"
                stroke="white"
                strokeWidth={1 * scale}
                strokeDasharray={`${4 * scale} ${2 * scale}`}
                opacity={0.6}
              />
            ) : null;
          })()}

          {/* Center power dot */}
          <circle cx={cx} cy={cy} r={5 * scale} fill={enabled ? '#1dd1a1' : '#333'} />
          <circle cx={cx} cy={cy} r={2 * scale} fill="#0a0a0a" />

          {/* Info display */}
          {displayKnob ? (
            <g>
              <text x={cx} y={cy + 42 * scale} textAnchor="middle" dominantBaseline="middle" fill={displayKnob.color} fontSize={9 * scale} fontFamily="monospace">
                {displayKnob.name}
              </text>
              <text x={cx} y={cy + 56 * scale} textAnchor="middle" dominantBaseline="middle" fill="white" fontSize={14 * scale} fontFamily="system-ui">
                {Math.round(values[displayKnob.id] * 100)}
              </text>
              {displayKnob.options && (
                <text x={cx} y={cy + 70 * scale} textAnchor="middle" dominantBaseline="middle" fill={displayKnob.color} fontSize={7 * scale} fontFamily="monospace" opacity={0.8}>
                  {selectedOptions[displayKnob.id]}
                </text>
              )}
            </g>
          ) : (
            <text x={cx} y={cy + 55 * scale} textAnchor="middle" dominantBaseline="middle" fill="#888" fontSize={11 * scale} fontFamily="system-ui">
              {label}
            </text>
          )}

          {/* Tick marks */}
          {[-135, 0, 135].map((angle, i) => {
            const rad = (angle - 90) * Math.PI / 180;
            const outerR = outerRadius + 3 * scale;
            const tickLen = 5 * scale;
            return (
              <line
                key={`tick-${i}`}
                x1={cx + outerR * Math.cos(rad)}
                y1={cy + outerR * Math.sin(rad)}
                x2={cx + (outerR + tickLen) * Math.cos(rad)}
                y2={cy + (outerR + tickLen) * Math.sin(rad)}
                stroke="#555"
                strokeWidth={1.5 * scale}
                strokeLinecap="round"
              />
            );
          })}
        </svg>

        {/* Accessible controls */}
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
          <button
            onClick={() => setEnabled(prev => !prev)}
            onFocus={() => setFocusedKnob(null)}
            aria-label={`${label} power`}
            aria-pressed={enabled}
            style={{ position: 'absolute', width: 32, height: 32, opacity: 0, pointerEvents: 'auto', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', borderRadius: '50%' }}
          />
          {knobs.map((knob, index) => (
            <input
              key={knob.id}
              type="range"
              min="0"
              max="100"
              value={Math.round(values[knob.id] * 100)}
              onChange={(e) => { if (enabled) setValues(prev => ({ ...prev, [knob.id]: parseInt(e.target.value) / 100 })); }}
              onKeyDown={(e) => handleKeyDown(e, knob.id)}
              onFocus={() => { setFocusedKnob(knob.id); setSelectedKnob(knob.id); }}
              onBlur={() => setFocusedKnob(null)}
              aria-label={`${knob.name} level`}
              disabled={!enabled}
              style={{ position: 'absolute', width: 1, height: 1, opacity: 0, pointerEvents: 'auto', top: `${50 - (index + 1) * 3}%`, left: '50%' }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #1a1a2e 100%)',
      padding: 32
    }}>
      <div style={{ width: '100%', height: 'calc(100vh - 64px)' }}>
        <NestedKnobSet label="Osc 1" minSize={200} />
      </div>
    </div>
  );
}

export { NestedKnobSet, KNOB_CONFIG };
