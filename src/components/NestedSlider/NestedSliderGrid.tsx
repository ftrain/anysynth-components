/**
 * NestedSliderGrid
 *
 * Parameters arranged in a square grid.
 * Each cell is a mini-slider with fill visualization.
 * Compact, great for macro controls or mod matrix.
 * Supports both continuous dragging and tap-to-edit.
 */

import React, { useState, useCallback, useRef } from 'react';
import type { Parameter, ParameterChangeHandler, ParameterWithOptions, OptionChangeHandler } from '../../types';
import { colors, components } from '../../theme/tokens';
import { moduleStyles, labelStyles, getAccentColor } from '../../theme/styles';

// Component-specific constants from theme
const GRID = components.knobGrid;

interface NestedSliderGridProps {
  parameters: (Parameter | ParameterWithOptions)[];
  onChange?: ParameterChangeHandler;
  onOptionChange?: OptionChangeHandler;
  label?: string;
  columns?: number;
  cellSize?: number;
  gap?: number;
  showLabels?: boolean;
  bipolarVisualization?: boolean;
  compact?: boolean;
  /** Fill width using auto-fill grid */
  fillWidth?: boolean;
}

const hasOptions = (p: Parameter | ParameterWithOptions): p is ParameterWithOptions => {
  return 'options' in p && Array.isArray(p.options);
};

export const NestedSliderGrid: React.FC<NestedSliderGridProps> = ({
  parameters,
  onChange,
  onOptionChange,
  label,
  columns = GRID.columns,
  cellSize = GRID.cellSize,
  gap = GRID.gap,
  showLabels = true,
  bipolarVisualization = false,
  compact = false,
  fillWidth = false,
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
  const [editingParam, setEditingParam] = useState<string | null>(null);

  const dragRef = useRef<{ id: string; startY: number; startValue: number } | null>(null);
  const lastClickRef = useRef<Record<string, number>>({});

  // Use compact cell size if compact mode
  const effectiveCellSize = compact ? GRID.cellSizeCompact : cellSize;
  const infoHeight = GRID.infoHeight;

  const getColor = (param: Parameter): string => {
    return param.color ? getAccentColor(param.color) : colors.accent.cyan;
  };

  const formatValue = (param: Parameter, val: number): string => {
    const min = param.min ?? 0;
    const max = param.max ?? 100;
    const displayVal = min + val * (max - min);

    if (param.bipolar || bipolarVisualization) {
      // Show as -50 to +50 style
      const centered = (val - 0.5) * (max - min);
      return centered >= 0 ? `+${Math.round(centered)}` : `${Math.round(centered)}`;
    }

    return Math.round(displayVal).toString();
  };

  const handlePointerDown = useCallback((e: React.PointerEvent, param: Parameter) => {
    e.preventDefault();
    const target = e.currentTarget as HTMLElement;
    target.setPointerCapture(e.pointerId);

    // Double-click detection
    const now = Date.now();
    const lastClick = lastClickRef.current[param.id] || 0;
    if (now - lastClick < 300) {
      setValues(prev => ({ ...prev, [param.id]: param.defaultValue }));
      onChange?.(param.id, param.defaultValue);
      lastClickRef.current[param.id] = 0;
      return;
    }
    lastClickRef.current[param.id] = now;

    setActiveParam(param.id);
    dragRef.current = {
      id: param.id,
      startY: e.clientY,
      startValue: values[param.id],
    };
  }, [values, onChange]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    const drag = dragRef.current;
    if (!drag) return;

    const deltaY = drag.startY - e.clientY;
    const sensitivity = 0.008;
    const newValue = Math.max(0, Math.min(1, drag.startValue + deltaY * sensitivity));

    setValues(prev => ({ ...prev, [drag.id]: newValue }));
    onChange?.(drag.id, newValue);
  }, [onChange]);

  const handlePointerUp = useCallback(() => {
    dragRef.current = null;
    setActiveParam(null);
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent, param: Parameter) => {
    const step = e.shiftKey ? 0.1 : 0.02;
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
      case 'Delete':
      case 'Backspace':
        e.preventDefault();
        newValue = param.defaultValue;
        break;
      case ' ':
      case 'Enter':
        e.preventDefault();
        if (hasOptions(param)) {
          setEditingParam(editingParam === param.id ? null : param.id);
        }
        break;
      case 'Escape':
        setEditingParam(null);
        break;
      default:
        return;
    }

    setValues(prev => ({ ...prev, [param.id]: newValue }));
    onChange?.(param.id, newValue);
  }, [values, onChange, editingParam]);

  const gridWidth = fillWidth ? '100%' : columns * effectiveCellSize + (columns - 1) * gap;

  return (
    <div
      className="synth-control"
      style={{
        ...moduleStyles.base,
        ...(compact ? moduleStyles.compact : {}),
        width: fillWidth ? '100%' : 'auto',
      }}
    >
      {/* Label */}
      {label && (
        <div style={labelStyles.module}>
          {label}
        </div>
      )}

      {/* Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: fillWidth
            ? `repeat(auto-fill, minmax(${effectiveCellSize}px, 1fr))`
            : `repeat(${columns}, ${effectiveCellSize}px)`,
          gap,
          width: gridWidth,
        }}
      >
        {parameters.map((param) => {
          const color = getColor(param);
          const value = values[param.id];
          const isActive = activeParam === param.id;
          const isHovered = hoveredParam === param.id;
          const isEditing = editingParam === param.id;
          const isBipolar = param.bipolar || bipolarVisualization;

          return (
            <div
              key={param.id}
              style={{
                position: 'relative',
                width: fillWidth ? '100%' : effectiveCellSize,
                aspectRatio: '1',
              }}
            >
              {/* Cell */}
              <div
                onPointerDown={(e) => handlePointerDown(e, param)}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
                onMouseEnter={() => setHoveredParam(param.id)}
                onMouseLeave={() => setHoveredParam(null)}
                onKeyDown={(e) => handleKeyDown(e, param)}
                tabIndex={0}
                role="slider"
                aria-label={param.name}
                aria-valuenow={Math.round(value * 100)}
                aria-valuemin={0}
                aria-valuemax={100}
                style={{
                  width: '100%',
                  height: '100%',
                  background: colors.bg.elevated,
                  borderRadius: 6,
                  overflow: 'hidden',
                  cursor: 'ns-resize',
                  position: 'relative',
                  border: isActive || isHovered
                    ? `1px solid ${color}60`
                    : `1px solid ${colors.bg.border}`,
                  transition: 'border-color 100ms',
                }}
              >
                {/* Fill visualization */}
                {isBipolar ? (
                  // Bipolar: center-out fill
                  <>
                    <div style={{
                      position: 'absolute',
                      left: 0,
                      right: 0,
                      top: '50%',
                      height: 1,
                      background: colors.bg.border,
                    }} />
                    <div style={{
                      position: 'absolute',
                      left: 2,
                      right: 2,
                      top: value >= 0.5 ? `${(1 - value) * 100}%` : '50%',
                      bottom: value < 0.5 ? `${value * 100}%` : '50%',
                      background: `linear-gradient(180deg, ${color}cc 0%, ${color}99 100%)`,
                      borderRadius: 2,
                      opacity: isActive ? 1 : isHovered ? 0.9 : 0.8,
                      transition: 'opacity 100ms',
                    }} />
                  </>
                ) : (
                  // Unipolar: bottom-up fill
                  <div style={{
                    position: 'absolute',
                    left: 2,
                    right: 2,
                    bottom: 2,
                    height: `calc(${value * 100}% - 4px)`,
                    background: `linear-gradient(0deg, ${color}cc 0%, ${color}66 100%)`,
                    borderRadius: 3,
                    opacity: isActive ? 1 : isHovered ? 0.9 : 0.75,
                    transition: 'opacity 100ms',
                  }} />
                )}

                {/* Value display */}
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: 'var(--font-numeric)',
                  fontSize: cellSize * 0.28,
                  fontWeight: 600,
                  color: colors.text.primary,
                  textShadow: '0 1px 2px rgba(0,0,0,0.5)',
                  opacity: isActive || isHovered ? 1 : 0.9,
                  fontVariantNumeric: 'tabular-nums',
                }}>
                  {formatValue(param, value)}
                </div>

                {/* Label */}
                {showLabels && (
                  <div style={{
                    position: 'absolute',
                    bottom: 3,
                    left: 0,
                    right: 0,
                    textAlign: 'center',
                    fontFamily: 'var(--font-mono)',
                    fontSize: cellSize * 0.16,
                    color: isActive || isHovered ? color : colors.text.muted,
                    textTransform: 'uppercase',
                    letterSpacing: '0.02em',
                    transition: 'color 100ms',
                  }}>
                    {param.name.length > 5 ? param.name.slice(0, 4) : param.name}
                  </div>
                )}

                {/* Options indicator */}
                {hasOptions(param) && (
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingParam(editingParam === param.id ? null : param.id);
                    }}
                    style={{
                      position: 'absolute',
                      top: 3,
                      right: 3,
                      width: 10,
                      height: 10,
                      borderRadius: 2,
                      background: color,
                      opacity: 0.6,
                      cursor: 'pointer',
                    }}
                  />
                )}
              </div>

              {/* Options dropdown */}
              {isEditing && hasOptions(param) && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  marginTop: 4,
                  background: colors.bg.elevated,
                  border: `1px solid ${colors.bg.border}`,
                  borderRadius: 4,
                  padding: 4,
                  zIndex: 100,
                  minWidth: cellSize,
                }}>
                  {(param as ParameterWithOptions).options.map((opt) => {
                    const isSelected = selectedOptions[param.id] === opt;
                    return (
                      <button
                        key={opt}
                        onClick={() => {
                          setSelectedOptions(prev => ({ ...prev, [param.id]: opt }));
                          onOptionChange?.(param.id, opt);
                          setEditingParam(null);
                        }}
                        style={{
                          display: 'block',
                          width: '100%',
                          padding: '4px 8px',
                          background: isSelected ? color : 'transparent',
                          color: isSelected ? colors.bg.base : colors.text.secondary,
                          border: 'none',
                          borderRadius: 2,
                          fontFamily: 'var(--font-mono)',
                          fontSize: 'var(--text-xs)',
                          textAlign: 'left',
                          cursor: 'pointer',
                        }}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Focused param info - always visible to prevent jitter */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 4,
        minHeight: infoHeight,
        visibility: (activeParam || hoveredParam) ? 'visible' : 'hidden',
      }}>
        {(activeParam || hoveredParam) && (
          <>
            <span style={{
              ...labelStyles.parameter,
              color: getColor(parameters.find(p => p.id === (activeParam || hoveredParam))!),
            }}>
              {parameters.find(p => p.id === (activeParam || hoveredParam))?.name}
            </span>
            {hasOptions(parameters.find(p => p.id === (activeParam || hoveredParam))!) && (
              <span style={{
                ...labelStyles.parameter,
                color: colors.text.muted,
              }}>
                {selectedOptions[activeParam || hoveredParam!]}
              </span>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default NestedSliderGrid;
