/**
 * EffectsChain
 *
 * A visual effects chain for audio processing.
 * Supports drag-to-reorder, bypass, and wet/dry controls.
 *
 * Features:
 * - Drag to reorder effects
 * - Bypass individual effects
 * - Wet/dry mix per effect
 * - Expandable effect parameters
 * - Visual signal flow
 */

import React, { useState, useCallback, useRef } from 'react';
import { colors } from '../../theme/tokens';
import { moduleStyles, labelStyles } from '../../theme/styles';

export interface EffectParameter {
  id: string;
  name: string;
  value: number;
  min?: number;
  max?: number;
  unit?: string;
}

export interface Effect {
  id: string;
  type: string;
  name: string;
  color?: string;
  bypassed?: boolean;
  mix?: number; // 0-1 wet/dry
  parameters?: EffectParameter[];
}

export interface EffectsChainProps {
  /** Effects in the chain */
  effects: Effect[];
  /** Called when effects order or state changes */
  onChange?: (effects: Effect[]) => void;
  /** Called when effect bypass changes */
  onBypassChange?: (effectId: string, bypassed: boolean) => void;
  /** Called when effect mix changes */
  onMixChange?: (effectId: string, mix: number) => void;
  /** Called when effect parameter changes */
  onParameterChange?: (effectId: string, parameterId: string, value: number) => void;
  /** Called when effect is removed */
  onRemove?: (effectId: string) => void;
  /** Called when add effect is clicked */
  onAddClick?: () => void;
  /** Available effect types for adding */
  availableEffects?: Array<{ type: string; name: string; color?: string }>;
  /** Component label */
  label?: string;
  /** Orientation */
  orientation?: 'horizontal' | 'vertical';
  /** Compact mode */
  compact?: boolean;
  /** Show parameters inline */
  showParameters?: boolean;
}

const EFFECT_COLORS: Record<string, string> = {
  reverb: colors.accent.cyan,
  delay: colors.accent.orange,
  chorus: colors.accent.purple,
  flanger: colors.accent.pink,
  phaser: colors.accent.green,
  distortion: colors.accent.coral,
  compressor: colors.accent.yellow,
  eq: colors.accent.cyan,
  filter: colors.accent.orange,
  tremolo: colors.accent.green,
  vibrato: colors.accent.purple,
};

export const EffectsChain: React.FC<EffectsChainProps> = ({
  effects,
  onChange,
  onBypassChange,
  onMixChange,
  onParameterChange,
  onRemove,
  onAddClick,
  availableEffects: _availableEffects,
  label,
  orientation = 'horizontal',
  compact = false,
  showParameters = true,
}) => {
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const [expandedEffect, setExpandedEffect] = useState<string | null>(null);
  const dragIndexRef = useRef<number>(-1);

  // Get effect color
  const getEffectColor = (effect: Effect): string => {
    return effect.color || EFFECT_COLORS[effect.type.toLowerCase()] || colors.accent.cyan;
  };

  // Handle drag start
  const handleDragStart = useCallback(
    (e: React.DragEvent, effectId: string, index: number) => {
      e.dataTransfer.effectAllowed = 'move';
      setDraggedId(effectId);
      dragIndexRef.current = index;
    },
    []
  );

  // Handle drag over
  const handleDragOver = useCallback(
    (e: React.DragEvent, effectId: string) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      if (effectId !== draggedId) {
        setDragOverId(effectId);
      }
    },
    [draggedId]
  );

  // Handle drop
  const handleDrop = useCallback(
    (e: React.DragEvent, targetIndex: number) => {
      e.preventDefault();
      if (dragIndexRef.current === -1 || dragIndexRef.current === targetIndex) {
        setDraggedId(null);
        setDragOverId(null);
        return;
      }

      const newEffects = [...effects];
      const [removed] = newEffects.splice(dragIndexRef.current, 1);
      newEffects.splice(targetIndex, 0, removed);

      onChange?.(newEffects);
      setDraggedId(null);
      setDragOverId(null);
      dragIndexRef.current = -1;
    },
    [effects, onChange]
  );

  // Handle drag end
  const handleDragEnd = useCallback(() => {
    setDraggedId(null);
    setDragOverId(null);
    dragIndexRef.current = -1;
  }, []);

  // Toggle bypass
  const toggleBypass = useCallback(
    (effectId: string) => {
      const effect = effects.find((e) => e.id === effectId);
      if (effect) {
        onBypassChange?.(effectId, !effect.bypassed);
      }
    },
    [effects, onBypassChange]
  );

  // Handle mix change
  const handleMixChange = useCallback(
    (effectId: string, mix: number) => {
      onMixChange?.(effectId, mix);
    },
    [onMixChange]
  );

  const isHorizontal = orientation === 'horizontal';
  const itemSize = compact ? { width: 100, height: 80 } : { width: 140, height: 120 };

  return (
    <div
      className="synth-control"
      style={{
        ...moduleStyles.base,
        ...(compact ? moduleStyles.compact : {}),
        width: '100%',
        maxWidth: '100%',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      {label && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div
            style={labelStyles.module}
          >
            {label}
          </div>
          <div
            style={{
              fontSize: 10,
              color: colors.text.muted,
              fontFamily: 'var(--font-mono)',
            }}
          >
            {effects.filter((e) => !e.bypassed).length}/{effects.length} active
          </div>
        </div>
      )}

      {/* Effects chain */}
      <div
        style={{
          display: 'flex',
          flexDirection: isHorizontal ? 'row' : 'column',
          gap: 8,
          alignItems: 'center',
          overflowX: isHorizontal ? 'auto' : 'visible',
          overflowY: isHorizontal ? 'visible' : 'auto',
          paddingBottom: isHorizontal ? 8 : 0,
        }}
      >
        {/* Input indicator */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 8,
            background: colors.bg.base,
            borderRadius: 4,
            fontSize: 9,
            fontFamily: 'var(--font-mono)',
            color: colors.text.muted,
            minWidth: 40,
          }}
        >
          IN
        </div>

        {/* Connection line */}
        <div
          style={{
            width: isHorizontal ? 20 : 2,
            height: isHorizontal ? 2 : 20,
            background: colors.accent.green,
            opacity: 0.5,
          }}
        />

        {/* Effects */}
        {effects.map((effect, index) => {
          const effectColor = getEffectColor(effect);
          const isDragging = draggedId === effect.id;
          const isDragOver = dragOverId === effect.id;
          const isExpanded = expandedEffect === effect.id;

          return (
            <React.Fragment key={effect.id}>
              <div
                draggable
                onDragStart={(e) => handleDragStart(e, effect.id, index)}
                onDragOver={(e) => handleDragOver(e, effect.id)}
                onDrop={(e) => handleDrop(e, index)}
                onDragEnd={handleDragEnd}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 4,
                  padding: compact ? 8 : 12,
                  background: isDragOver
                    ? colors.bg.highlight
                    : colors.bg.elevated,
                  borderRadius: 6,
                  border: `2px solid ${isDragging ? effectColor : 'transparent'}`,
                  opacity: effect.bypassed ? 0.5 : isDragging ? 0.8 : 1,
                  cursor: 'grab',
                  minWidth: itemSize.width,
                  transition: 'opacity 0.1s, border-color 0.1s, background 0.1s',
                }}
              >
                {/* Effect header */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                    }}
                  >
                    {/* Color indicator */}
                    <div
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        background: effect.bypassed ? colors.text.disabled : effectColor,
                      }}
                    />
                    <span
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: compact ? 9 : 10,
                        fontWeight: 600,
                        color: effect.bypassed ? colors.text.disabled : effectColor,
                        textTransform: 'uppercase',
                      }}
                    >
                      {effect.name}
                    </span>
                  </div>

                  {/* Controls */}
                  <div style={{ display: 'flex', gap: 2 }}>
                    {/* Bypass button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleBypass(effect.id);
                      }}
                      style={{
                        width: 18,
                        height: 18,
                        background: effect.bypassed ? colors.bg.base : effectColor,
                        border: 'none',
                        borderRadius: 3,
                        cursor: 'pointer',
                        fontSize: 8,
                        fontWeight: 600,
                        color: effect.bypassed ? colors.text.disabled : colors.bg.base,
                      }}
                      title={effect.bypassed ? 'Enable' : 'Bypass'}
                    >
                      {effect.bypassed ? 'OFF' : 'ON'}
                    </button>

                    {/* Remove button */}
                    {onRemove && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onRemove(effect.id);
                        }}
                        style={{
                          width: 18,
                          height: 18,
                          background: colors.bg.base,
                          border: 'none',
                          borderRadius: 3,
                          cursor: 'pointer',
                          fontSize: 12,
                          color: colors.text.disabled,
                        }}
                        title="Remove"
                      >
                        ×
                      </button>
                    )}
                  </div>
                </div>

                {/* Mix slider */}
                {!compact && (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                      marginTop: 4,
                    }}
                  >
                    <span
                      style={{
                        fontSize: 8,
                        color: colors.text.disabled,
                        fontFamily: 'var(--font-mono)',
                      }}
                    >
                      MIX
                    </span>
                    <div
                      style={{
                        flex: 1,
                        height: 12,
                        background: colors.bg.base,
                        borderRadius: 3,
                        position: 'relative',
                        cursor: 'ew-resize',
                      }}
                      onMouseDown={(e) => {
                        e.stopPropagation();
                        const rect = e.currentTarget.getBoundingClientRect();
                        const updateMix = (clientX: number) => {
                          const mix = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
                          handleMixChange(effect.id, mix);
                        };
                        updateMix(e.clientX);

                        const handleMove = (moveE: MouseEvent) => updateMix(moveE.clientX);
                        const handleUp = () => {
                          window.removeEventListener('mousemove', handleMove);
                          window.removeEventListener('mouseup', handleUp);
                        };
                        window.addEventListener('mousemove', handleMove);
                        window.addEventListener('mouseup', handleUp);
                      }}
                    >
                      <div
                        style={{
                          position: 'absolute',
                          left: 0,
                          top: 0,
                          bottom: 0,
                          width: `${(effect.mix ?? 1) * 100}%`,
                          background: effectColor,
                          borderRadius: 3,
                          opacity: effect.bypassed ? 0.3 : 0.7,
                        }}
                      />
                    </div>
                    <span
                      style={{
                        fontSize: 8,
                        color: colors.text.muted,
                        fontFamily: 'var(--font-numeric)',
                        width: 28,
                        textAlign: 'right',
                      }}
                    >
                      {Math.round((effect.mix ?? 1) * 100)}%
                    </span>
                  </div>
                )}

                {/* Expandable parameters */}
                {showParameters && effect.parameters && effect.parameters.length > 0 && (
                  <div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setExpandedEffect(isExpanded ? null : effect.id);
                      }}
                      style={{
                        width: '100%',
                        padding: '4px 0',
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: 8,
                        color: colors.text.disabled,
                        fontFamily: 'var(--font-mono)',
                      }}
                    >
                      {isExpanded ? '▼ PARAMS' : '▶ PARAMS'}
                    </button>

                    {isExpanded && (
                      <div
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 4,
                          padding: 4,
                          background: colors.bg.base,
                          borderRadius: 4,
                        }}
                      >
                        {effect.parameters.map((param) => (
                          <div
                            key={param.id}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 4,
                            }}
                          >
                            <span
                              style={{
                                fontSize: 8,
                                color: colors.text.muted,
                                fontFamily: 'var(--font-mono)',
                                width: 40,
                              }}
                            >
                              {param.name}
                            </span>
                            <input
                              type="range"
                              min={param.min ?? 0}
                              max={param.max ?? 100}
                              value={param.value}
                              onChange={(e) =>
                                onParameterChange?.(
                                  effect.id,
                                  param.id,
                                  parseFloat(e.target.value)
                                )
                              }
                              onClick={(e) => e.stopPropagation()}
                              style={{ flex: 1, height: 10 }}
                            />
                            <span
                              style={{
                                fontSize: 8,
                                color: colors.text.secondary,
                                fontFamily: 'var(--font-numeric)',
                                width: 30,
                                textAlign: 'right',
                              }}
                            >
                              {Math.round(param.value)}
                              {param.unit}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Connection line between effects */}
              {index < effects.length - 1 && (
                <div
                  style={{
                    width: isHorizontal ? 20 : 2,
                    height: isHorizontal ? 2 : 20,
                    background: effect.bypassed ? colors.text.disabled : colors.accent.green,
                    opacity: 0.5,
                  }}
                />
              )}
            </React.Fragment>
          );
        })}

        {/* Connection to output */}
        <div
          style={{
            width: isHorizontal ? 20 : 2,
            height: isHorizontal ? 2 : 20,
            background: colors.accent.green,
            opacity: 0.5,
          }}
        />

        {/* Add effect button */}
        {onAddClick && (
          <button
            onClick={onAddClick}
            style={{
              width: compact ? 36 : 48,
              height: compact ? 36 : 48,
              background: colors.bg.elevated,
              border: `2px dashed ${colors.bg.highlight}`,
              borderRadius: 6,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 20,
              color: colors.text.disabled,
            }}
            title="Add effect"
          >
            +
          </button>
        )}

        {/* Output indicator */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 8,
            background: colors.bg.base,
            borderRadius: 4,
            fontSize: 9,
            fontFamily: 'var(--font-mono)',
            color: colors.text.muted,
            minWidth: 40,
          }}
        >
          OUT
        </div>
      </div>
    </div>
  );
};

export default EffectsChain;
