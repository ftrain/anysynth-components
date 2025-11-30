/**
 * FractionPicker - A circular fraction selector with nested knobs
 * 
 * Following the NestedKnobSet design system: dark minimal synth aesthetic.
 * Two concentric rings: inner for denominator, outer for numerator.
 * Continuous values from 1 to 256.
 * 
 * @author Generated with Claude
 * @version 1.5.0
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';

const KNOB_CONFIG = [
  { id: 'denominator', color: '#ff6b6b', defaultValue: 4 },
  { id: 'numerator', color: '#48dbfb', defaultValue: 1 },
];

const MIN_VALUE = 1;
const MAX_VALUE = 256;

const FractionPicker = ({ minSize = 200, onChange }) => {
  const [numerator, setNumerator] = useState(1);
  const [denominator, setDenominator] = useState(4);
  const [selectedKnob, setSelectedKnob] = useState(null);
  const [activeKnob, setActiveKnob] = useState(null);
  const [hoveredKnob, setHoveredKnob] = useState(null);
  const [focusedKnob, setFocusedKnob] = useState(null);
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

  useEffect(() => {
    if (onChange) {
      onChange({ numerator, denominator, value: numerator / denominator });
    }
  }, [numerator, denominator, onChange]);

  const scale = size / 400;
  const bandWidth = 20 * scale;
  const startRadius = 30 * scale;
  const cx = size / 2;
  const cy = size / 2;
  
  const knobs = KNOB_CONFIG.map((knob, index) => ({
    ...knob,
    radius: startRadius + (index * bandWidth)
  }));

  const outerRadius = startRadius + (knobs.length * bandWidth);

  const valueToAngle = (value) => {
    const normalized = (value - MIN_VALUE) / (MAX_VALUE - MIN_VALUE);
    return -135 + (normalized * 270);
  };

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

  const getValue = (knobId) => knobId === 'numerator' ? numerator : denominator;
  const setValue = (knobId, value) => {
    const clamped = Math.max(MIN_VALUE, Math.min(MAX_VALUE, Math.round(value)));
    if (knobId === 'numerator') setNumerator(clamped);
    else setDenominator(clamped);
  };

  const resetToDefault = useCallback((knobId) => {
    const knob = KNOB_CONFIG.find(k => k.id === knobId);
    if (!knob) return;
    setValue(knobId, knob.defaultValue);
  }, []);

  const handleStart = useCallback((e) => {
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
    const currentValue = getValue(knobId);
    dragStartRef.current = { y: clientY, startValue: currentValue };

    const handleMove = (moveEvent) => {
      moveEvent.preventDefault();
      const { clientY: moveY } = getPositionFromEvent(moveEvent);
      const deltaY = dragStartRef.current.y - moveY;
      const sensitivity = 0.5;
      const newValue = dragStartRef.current.startValue + deltaY * sensitivity;
      setValue(knobId, newValue);
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
  }, [numerator, denominator, getKnobFromPosition, resetToDefault]);

  const handleMouseMove = useCallback((e) => {
    setHoveredKnob(getKnobFromPosition(e));
  }, [getKnobFromPosition]);

  const handleKeyDown = useCallback((e, knobId) => {
    if (e.key === 'Delete' || e.key === 'Backspace') {
      e.preventDefault();
      resetToDefault(knobId);
      return;
    }
    const currentValue = getValue(knobId);
    let newValue = currentValue;
    const step = e.shiftKey ? 10 : 1;
    
    switch (e.key) {
      case 'ArrowUp': case 'ArrowRight': 
        e.preventDefault(); 
        newValue = currentValue + step;
        break;
      case 'ArrowDown': case 'ArrowLeft': 
        e.preventDefault(); 
        newValue = currentValue - step;
        break;
      case 'Home': e.preventDefault(); newValue = MIN_VALUE; break;
      case 'End': e.preventDefault(); newValue = MAX_VALUE; break;
      default: return;
    }
    setValue(knobId, newValue);
  }, [numerator, denominator, resetToDefault]);

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

  const highlightedKnob = activeKnob || selectedKnob || hoveredKnob || focusedKnob;

  const getHighlightColor = () => {
    if (highlightedKnob === 'numerator') return '#48dbfb';
    if (highlightedKnob === 'denominator') return '#ff6b6b';
    return '#666';
  };

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
          onMouseLeave={() => { setHoveredKnob(null); }}
          style={{ 
            display: 'block',
            touchAction: 'none',
            cursor: hoveredKnob ? 'ns-resize' : 'default',
            WebkitTapHighlightColor: 'transparent',
            userSelect: 'none',
            overflow: 'visible'
          }}
        >
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
              opacity={highlightedKnob === knob.id ? 0.35 : 0.2}
            />
          ))}

          {/* Value arcs */}
          {knobs.map(knob => {
            const value = getValue(knob.id);
            const endAngle = valueToAngle(value);
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
          {focusedKnob && (() => {
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

          {/* Fraction display */}
          <g>
            {/* Numerator */}
            <text 
              x={cx} 
              y={cy + 34 * scale} 
              textAnchor="middle" 
              dominantBaseline="middle" 
              fill="#48dbfb"
              fontSize={11 * scale} 
              fontFamily="monospace" 
              fontWeight="500"
              opacity={highlightedKnob === 'numerator' ? 1 : 0.7}
            >
              {numerator}
            </text>
            
            {/* Fraction bar */}
            <line 
              x1={cx - 12 * scale} 
              y1={cy + 42 * scale} 
              x2={cx + 12 * scale} 
              y2={cy + 42 * scale} 
              stroke={getHighlightColor()}
              strokeWidth={1.5 * scale} 
              strokeLinecap="round"
              opacity={0.5}
            />
            
            {/* Denominator */}
            <text 
              x={cx} 
              y={cy + 52 * scale} 
              textAnchor="middle" 
              dominantBaseline="middle" 
              fill="#ff6b6b"
              fontSize={11 * scale} 
              fontFamily="monospace" 
              fontWeight="500"
              opacity={highlightedKnob === 'denominator' ? 1 : 0.7}
            >
              {denominator}
            </text>
          </g>

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

          {/* Value labels at ticks */}
          <text x={cx - (outerRadius + 16 * scale) * Math.cos(45 * Math.PI / 180)} y={cy + (outerRadius + 16 * scale) * Math.sin(45 * Math.PI / 180)} textAnchor="middle" dominantBaseline="middle" fill="#555" fontSize={7 * scale} fontFamily="monospace">1</text>
          <text x={cx} y={cy - outerRadius - 16 * scale} textAnchor="middle" dominantBaseline="middle" fill="#555" fontSize={7 * scale} fontFamily="monospace">128</text>
          <text x={cx + (outerRadius + 16 * scale) * Math.cos(45 * Math.PI / 180)} y={cy + (outerRadius + 16 * scale) * Math.sin(45 * Math.PI / 180)} textAnchor="middle" dominantBaseline="middle" fill="#555" fontSize={7 * scale} fontFamily="monospace">256</text>
        </svg>

        {/* Accessible controls */}
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
          {knobs.map((knob, index) => (
            <input
              key={knob.id}
              type="range"
              min={MIN_VALUE}
              max={MAX_VALUE}
              value={getValue(knob.id)}
              onChange={(e) => setValue(knob.id, parseInt(e.target.value))}
              onKeyDown={(e) => handleKeyDown(e, knob.id)}
              onFocus={() => { setFocusedKnob(knob.id); setSelectedKnob(knob.id); }}
              onBlur={() => setFocusedKnob(null)}
              aria-label={knob.id === 'numerator' ? 'Numerator' : 'Denominator'}
              style={{ position: 'absolute', width: 1, height: 1, opacity: 0, pointerEvents: 'auto', top: `${50 - (index + 1) * 5}%`, left: '50%' }}
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
        <FractionPicker minSize={200} />
      </div>
    </div>
  );
}

export { FractionPicker, MIN_VALUE, MAX_VALUE };
