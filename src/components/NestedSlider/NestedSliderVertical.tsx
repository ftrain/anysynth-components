/**
 * NestedSliderVertical
 *
 * Multiple parameters as side-by-side vertical sliders.
 * Classic mixer/fader aesthetic, great for gain staging.
 * Touch-friendly with generous hit areas.
 */

import React, { useState, useCallback, useRef } from 'react';
import type { Parameter, ParameterChangeHandler, ParameterWithOptions, OptionChangeHandler } from '../../types';
import { colors, components } from '../../theme/tokens';
import { moduleStyles, labelStyles, getAccentColor } from '../../theme/styles';

// Component-specific constants from theme
const SLIDER = components.sliderVertical;

interface NestedSliderVerticalProps {
  parameters: (Parameter | ParameterWithOptions)[];
  onChange?: ParameterChangeHandler;
  onOptionChange?: OptionChangeHandler;
  label?: string;
  height?: number;
  trackWidth?: number;
  showLabels?: boolean;
  showValues?: boolean;
  compact?: boolean;
}

const hasOptions = (p: Parameter | ParameterWithOptions): p is ParameterWithOptions => {
  return 'options' in p && Array.isArray(p.options);
};

export const NestedSliderVertical: React.FC<NestedSliderVerticalProps> = ({
  parameters,
  onChange,
  onOptionChange,
  label,
  height = SLIDER.height,
  trackWidth = SLIDER.trackWidth,
  showLabels = true,
  showValues = true,
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
  const dragRef = useRef<{ id: string; startY: number; startValue: number } | null>(null);

  // Use compact height if compact mode
  const effectiveHeight = compact ? SLIDER.heightCompact : height;
  const effectiveTrackWidth = compact ? SLIDER.trackWidthCompact : trackWidth;

  const getColor = (param: Parameter): string => {
    return param.color ? getAccentColor(param.color) : colors.accent.cyan;
  };

  const formatValue = (param: Parameter, val: number): string => {
    const min = param.min ?? 0;
    const max = param.max ?? 100;
    const displayVal = min + val * (max - min);
    const unit = param.unit ?? '';

    if (param.step && param.step >= 1) {
      return `${Math.round(displayVal)}${unit}`;
    }
    return `${displayVal.toFixed(0)}${unit}`;
  };

  const handlePointerDown = useCallback((e: React.PointerEvent, param: Parameter) => {
    e.preventDefault();
    const target = e.currentTarget as HTMLElement;
    target.setPointerCapture(e.pointerId);

    const rect = target.getBoundingClientRect();
    const y = e.clientY - rect.top;
    // Invert: top = 1, bottom = 0
    const newValue = Math.max(0, Math.min(1, 1 - y / rect.height));

    setValues(prev => ({ ...prev, [param.id]: newValue }));
    onChange?.(param.id, newValue);
    setActiveParam(param.id);

    dragRef.current = { id: param.id, startY: e.clientY, startValue: newValue };
  }, [onChange]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    const drag = dragRef.current;
    if (!drag) return;

    const target = e.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const newValue = Math.max(0, Math.min(1, 1 - y / rect.height));

    setValues(prev => ({ ...prev, [drag.id]: newValue }));
    onChange?.(drag.id, newValue);
  }, [onChange]);

  const handlePointerUp = useCallback(() => {
    dragRef.current = null;
    setActiveParam(null);
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent, param: Parameter) => {
    const step = e.shiftKey ? 0.1 : 0.01;
    let newValue = values[param.id];

    switch (e.key) {
      case 'ArrowUp':
      case 'ArrowRight':
        e.preventDefault();
        newValue = Math.min(1, newValue + step);
        break;
      case 'ArrowDown':
      case 'ArrowLeft':
        e.preventDefault();
        newValue = Math.max(0, newValue - step);
        break;
      case 'Home':
        e.preventDefault();
        newValue = 1;
        break;
      case 'End':
        e.preventDefault();
        newValue = 0;
        break;
      case 'Delete':
      case 'Backspace':
        e.preventDefault();
        newValue = param.defaultValue;
        break;
      default:
        return;
    }

    setValues(prev => ({ ...prev, [param.id]: newValue }));
    onChange?.(param.id, newValue);
  }, [values, onChange]);

  const handleDoubleClick = useCallback((param: Parameter) => {
    setValues(prev => ({ ...prev, [param.id]: param.defaultValue }));
    onChange?.(param.id, param.defaultValue);
  }, [onChange]);

  return (
    <div
      className="synth-control"
      style={{
        ...moduleStyles.base,
        ...(compact ? moduleStyles.compact : {}),
      }}
    >
      {/* Module label */}
      {label && (
        <div style={{
          ...labelStyles.module,
          textAlign: 'center',
        }}>
          {label}
        </div>
      )}

      {/* Faders row */}
      <div style={{
        display: 'flex',
        gap: SLIDER.gap,
        justifyContent: 'center',
      }}>
        {parameters.map((param) => {
          const color = getColor(param);
          const value = values[param.id];
          const isActive = activeParam === param.id;
          const isHovered = hoveredParam === param.id;

          return (
            <div
              key={param.id}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 8,
                minWidth: 44,
              }}
            >
              {/* Value display */}
              {showValues && (
                <div style={{
                  ...labelStyles.value,
                  color: isActive || isHovered ? colors.text.primary : colors.text.secondary,
                  minWidth: 40,
                  textAlign: 'center',
                  transition: 'color 100ms',
                }}>
                  {formatValue(param, value)}
                </div>
              )}

              {/* Fader track */}
              <div
                style={{
                  position: 'relative',
                  width: effectiveTrackWidth,
                  height: effectiveHeight,
                  display: 'flex',
                  justifyContent: 'center',
                  cursor: 'ns-resize',
                }}
                onPointerDown={(e) => handlePointerDown(e, param)}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
                onMouseEnter={() => setHoveredParam(param.id)}
                onMouseLeave={() => setHoveredParam(null)}
                onDoubleClick={() => handleDoubleClick(param)}
                onKeyDown={(e) => handleKeyDown(e, param)}
                tabIndex={0}
                role="slider"
                aria-label={param.name}
                aria-valuenow={Math.round(value * 100)}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-orientation="vertical"
              >
                {/* Track background */}
                <div style={{
                  position: 'absolute',
                  top: 0,
                  bottom: 0,
                  width: effectiveTrackWidth,
                  background: colors.bg.elevated,
                  borderRadius: effectiveTrackWidth / 2,
                  overflow: 'hidden',
                }}>
                  {/* Value fill (from bottom) - solid bar like horizontal */}
                  <div style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: `${value * 100}%`,
                    background: color,
                    borderRadius: effectiveTrackWidth / 2,
                    opacity: isActive ? 1 : isHovered ? 0.9 : 0.8,
                    transition: 'opacity 100ms',
                  }} />
                </div>
              </div>

              {/* Parameter label */}
              {showLabels && (
                <div style={{
                  ...labelStyles.parameter,
                  color: isActive || isHovered ? color : colors.text.muted,
                  transition: 'color 100ms',
                }}>
                  {param.name}
                </div>
              )}

              {/* Option selector (if applicable) */}
              {hasOptions(param) && (
                <select
                  value={selectedOptions[param.id]}
                  onChange={(e) => {
                    setSelectedOptions(prev => ({ ...prev, [param.id]: e.target.value }));
                    onOptionChange?.(param.id, e.target.value);
                  }}
                  style={{
                    background: colors.bg.elevated,
                    color: colors.text.secondary,
                    border: `1px solid ${colors.bg.border}`,
                    borderRadius: 4,
                    padding: '2px 4px',
                    fontFamily: 'var(--font-mono)',
                    fontSize: 'var(--text-xs)',
                    cursor: 'pointer',
                    width: '100%',
                  }}
                >
                  {(param as ParameterWithOptions).options.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default NestedSliderVertical;
