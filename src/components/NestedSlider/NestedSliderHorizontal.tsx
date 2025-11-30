/**
 * NestedSliderHorizontal
 *
 * Multiple parameters as stacked horizontal sliders.
 * Clean, space-efficient, excellent for mobile.
 * Uses the Slider primitive for consistent behavior.
 */

import React, { useState, useCallback } from 'react';
import type { Parameter, ParameterChangeHandler, ParameterWithOptions, OptionChangeHandler } from '../../types';
import { colors, components, type ColorAccent } from '../../theme/tokens';
import { moduleStyles, labelStyles, getAccentColor } from '../../theme/styles';
import { Slider } from '../Primitives';

// Component-specific constants from theme
const SLIDER = components.sliderHorizontal;

interface NestedSliderHorizontalProps {
  parameters: (Parameter | ParameterWithOptions)[];
  onChange?: ParameterChangeHandler;
  onOptionChange?: OptionChangeHandler;
  label?: string;
  showValues?: boolean;
  trackHeight?: number;
  gap?: number;
  compact?: boolean;
}

const hasOptions = (p: Parameter | ParameterWithOptions): p is ParameterWithOptions => {
  return 'options' in p && Array.isArray(p.options);
};

export const NestedSliderHorizontal: React.FC<NestedSliderHorizontalProps> = ({
  parameters,
  onChange,
  onOptionChange,
  label,
  showValues = true,
  trackHeight = SLIDER.trackHeight,
  gap = SLIDER.gap,
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
  const [hoveredParam, setHoveredParam] = useState<string | null>(null);

  // Use compact track height if compact mode
  const effectiveTrackHeight = compact ? SLIDER.trackHeightCompact : trackHeight;

  const getColorAccent = (param: Parameter): ColorAccent => {
    return (param.color as ColorAccent) || 'cyan';
  };

  const formatValue = (param: Parameter, val: number): string => {
    const min = param.min ?? 0;
    const max = param.max ?? 100;
    const displayVal = min + val * (max - min);
    const unit = param.unit ?? '';

    if (param.step && param.step >= 1) {
      return `${Math.round(displayVal)}${unit}`;
    }
    return `${displayVal.toFixed(1)}${unit}`;
  };

  const handleSliderChange = useCallback((paramId: string, newValue: number) => {
    setValues(prev => ({ ...prev, [paramId]: newValue }));
    onChange?.(paramId, newValue);
  }, [onChange]);

  const displayParam = hoveredParam;

  return (
    <div
      className="synth-control"
      style={{
        ...moduleStyles.base,
        ...(compact ? moduleStyles.compact : {}),
        gap,
        minWidth: 200,
      }}
    >
      {/* Header with label and value display */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'baseline',
        marginBottom: compact ? 4 : 8,
        minHeight: 24,
      }}>
        <span style={labelStyles.module}>
          {label}
        </span>
        {showValues && displayParam && (
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
            <span style={{
              ...labelStyles.parameter,
              color: getAccentColor(getColorAccent(parameters.find(p => p.id === displayParam)!)),
            }}>
              {parameters.find(p => p.id === displayParam)?.name}
            </span>
            <span style={labelStyles.value}>
              {formatValue(
                parameters.find(p => p.id === displayParam)!,
                values[displayParam]
              )}
            </span>
          </div>
        )}
      </div>

      {/* Stacked sliders */}
      <div style={{ display: 'flex', flexDirection: 'column', gap }}>
        {parameters.map((param) => (
          <div
            key={param.id}
            onMouseEnter={() => setHoveredParam(param.id)}
            onMouseLeave={() => setHoveredParam(null)}
          >
            <Slider
              value={values[param.id]}
              onChange={(newValue) => handleSliderChange(param.id, newValue)}
              length="100%"
              thickness={effectiveTrackHeight}
              color={getColorAccent(param)}
              ariaLabel={param.name}
              defaultValue={param.defaultValue}
            />
          </div>
        ))}
      </div>

      {/* Option selectors for parameters that have them */}
      {parameters.some(hasOptions) && (
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 4,
          marginTop: compact ? 4 : 8,
        }}>
          {parameters.filter(hasOptions).map((param) => {
            const typedParam = param as ParameterWithOptions;
            const color = getAccentColor(getColorAccent(param));
            return (
              <div key={param.id} style={{ display: 'flex', gap: 2 }}>
                {typedParam.options.map((opt) => {
                  const isSelected = selectedOptions[param.id] === opt;
                  return (
                    <button
                      key={opt}
                      onClick={() => {
                        setSelectedOptions(prev => ({ ...prev, [param.id]: opt }));
                        onOptionChange?.(param.id, opt);
                      }}
                      style={{
                        padding: '4px 8px',
                        background: isSelected ? color : colors.bg.elevated,
                        color: isSelected ? colors.bg.base : colors.text.muted,
                        border: 'none',
                        borderRadius: 4,
                        fontFamily: 'var(--font-mono)',
                        fontSize: 'var(--text-xs)',
                        cursor: 'pointer',
                        transition: 'all 100ms',
                      }}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default NestedSliderHorizontal;
