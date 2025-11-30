/**
 * ParameterInspector
 *
 * Debug/exploration interface that shows ALL parameters for any synth.
 * Enables easy backend-to-frontend mapping and parameter discovery.
 *
 * Use this during development to:
 * - View all parameters in real-time
 * - Test parameter ranges and responses
 * - Debug state synchronization
 * - Map MIDI CC to parameters
 * - Generate parameter documentation
 */

import React, { useState, useCallback, useMemo } from 'react';
import { colors } from '../../theme/tokens';

// Universal parameter definition
export interface InspectorParameter {
  id: string;
  name: string;
  path: string;           // Dot-notation path: "osc1.level" or "filter.cutoff"
  value: number;
  defaultValue: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  type: 'continuous' | 'stepped' | 'toggle' | 'enum';
  enumValues?: string[];  // For type='enum'
  category?: string;      // Grouping: "Oscillator", "Filter", "Envelope"
  modulatable?: boolean;  // Can this be modulated?
  automatable?: boolean;  // Can this be automated?
  midiCC?: number;        // MIDI CC assignment
  description?: string;
}

interface ParameterInspectorProps {
  /** All parameters from the synth */
  parameters: InspectorParameter[];
  /** Called when any parameter changes */
  onChange?: (path: string, value: number) => void;
  /** Called when MIDI learn is triggered */
  onMidiLearn?: (path: string) => void;
  /** Current MIDI learning parameter */
  midiLearning?: string | null;
  /** Title of the synth/module */
  title?: string;
  /** Show in compact mode */
  compact?: boolean;
  /** Filter parameters by category */
  categoryFilter?: string;
  /** Search filter */
  searchFilter?: string;
  /** Show only modulatable parameters */
  modulatableOnly?: boolean;
  /** Enable export/import */
  enablePresets?: boolean;
}

export const ParameterInspector: React.FC<ParameterInspectorProps> = ({
  parameters,
  onChange,
  onMidiLearn,
  midiLearning,
  title = 'Parameter Inspector',
  compact = false,
  categoryFilter,
  searchFilter,
  modulatableOnly = false,
  enablePresets = true,
}) => {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['all']));
  const [localSearch, setLocalSearch] = useState(searchFilter || '');
  const [showModulatable, setShowModulatable] = useState(modulatableOnly);
  const [viewMode, setViewMode] = useState<'list' | 'grid' | 'tree'>('list');

  // Group parameters by category
  const groupedParameters = useMemo(() => {
    const groups: Record<string, InspectorParameter[]> = {};

    parameters.forEach(param => {
      const category = param.category || 'Uncategorized';
      if (!groups[category]) groups[category] = [];

      // Apply filters
      const matchesSearch = !localSearch ||
        param.name.toLowerCase().includes(localSearch.toLowerCase()) ||
        param.path.toLowerCase().includes(localSearch.toLowerCase());

      const matchesCategory = !categoryFilter || param.category === categoryFilter;
      const matchesModulatable = !showModulatable || param.modulatable;

      if (matchesSearch && matchesCategory && matchesModulatable) {
        groups[category].push(param);
      }
    });

    // Remove empty categories
    Object.keys(groups).forEach(key => {
      if (groups[key].length === 0) delete groups[key];
    });

    return groups;
  }, [parameters, localSearch, categoryFilter, showModulatable]);

  const categories = Object.keys(groupedParameters).sort();

  const toggleCategory = useCallback((category: string) => {
    setExpandedCategories(prev => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  }, []);

  const handleValueChange = useCallback((path: string, value: number) => {
    onChange?.(path, value);
  }, [onChange]);

  const handleExport = useCallback(() => {
    const preset: Record<string, number> = {};
    parameters.forEach(p => {
      preset[p.path] = p.value;
    });
    const json = JSON.stringify(preset, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'preset.json';
    a.click();
    URL.revokeObjectURL(url);
  }, [parameters]);

  const formatValue = (param: InspectorParameter): string => {
    if (param.type === 'enum' && param.enumValues) {
      return param.enumValues[Math.round(param.value)] || param.value.toString();
    }
    if (param.type === 'toggle') {
      return param.value > 0.5 ? 'ON' : 'OFF';
    }
    const displayValue = param.min + param.value * (param.max - param.min);
    if (param.step && param.step >= 1) {
      return `${Math.round(displayValue)}${param.unit || ''}`;
    }
    return `${displayValue.toFixed(2)}${param.unit || ''}`;
  };

  const getParamColor = (param: InspectorParameter): string => {
    const categoryColors: Record<string, string> = {
      'Oscillator': colors.accent.green,
      'Filter': colors.accent.orange,
      'Envelope': colors.accent.pink,
      'LFO': colors.accent.yellow,
      'Effects': colors.accent.cyan,
      'Mixer': colors.accent.coral,
      'Modulation': colors.accent.purple,
    };
    return categoryColors[param.category || ''] || colors.accent.cyan;
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      background: colors.bg.surface,
      borderRadius: 8,
      border: `1px solid ${colors.bg.border}`,
      maxHeight: '100vh',
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        padding: '12px 16px',
        borderBottom: `1px solid ${colors.bg.border}`,
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <span style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 'var(--text-sm)',
            color: colors.text.primary,
            fontWeight: 600,
          }}>
            {title}
          </span>
          <span style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 'var(--text-xs)',
            color: colors.text.muted,
          }}>
            {parameters.length} params
          </span>
        </div>

        {/* Search and filters */}
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            type="text"
            placeholder="Search parameters..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            style={{
              flex: 1,
              padding: '6px 10px',
              background: colors.bg.elevated,
              border: `1px solid ${colors.bg.border}`,
              borderRadius: 4,
              color: colors.text.primary,
              fontFamily: 'var(--font-mono)',
              fontSize: 'var(--text-xs)',
            }}
          />
          <button
            onClick={() => setShowModulatable(!showModulatable)}
            style={{
              padding: '6px 10px',
              background: showModulatable ? colors.accent.purple : colors.bg.elevated,
              border: 'none',
              borderRadius: 4,
              color: showModulatable ? colors.bg.base : colors.text.muted,
              fontFamily: 'var(--font-mono)',
              fontSize: 'var(--text-xs)',
              cursor: 'pointer',
            }}
          >
            MOD
          </button>
        </div>

        {/* View mode and actions */}
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: 4 }}>
            {(['list', 'grid', 'tree'] as const).map(mode => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                style={{
                  padding: '4px 8px',
                  background: viewMode === mode ? colors.accent.cyan : colors.bg.elevated,
                  border: 'none',
                  borderRadius: 4,
                  color: viewMode === mode ? colors.bg.base : colors.text.muted,
                  fontFamily: 'var(--font-mono)',
                  fontSize: 9,
                  cursor: 'pointer',
                  textTransform: 'uppercase',
                }}
              >
                {mode}
              </button>
            ))}
          </div>
          {enablePresets && (
            <button
              onClick={handleExport}
              style={{
                padding: '4px 8px',
                background: colors.bg.elevated,
                border: 'none',
                borderRadius: 4,
                color: colors.text.muted,
                fontFamily: 'var(--font-mono)',
                fontSize: 9,
                cursor: 'pointer',
              }}
            >
              EXPORT
            </button>
          )}
        </div>
      </div>

      {/* Parameter list */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: 8,
      }}>
        {categories.map(category => (
          <div key={category} style={{ marginBottom: 8 }}>
            {/* Category header */}
            <button
              onClick={() => toggleCategory(category)}
              style={{
                width: '100%',
                padding: '8px 12px',
                background: colors.bg.elevated,
                border: 'none',
                borderRadius: 4,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                cursor: 'pointer',
                marginBottom: 4,
              }}
            >
              <span style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 'var(--text-xs)',
                color: colors.text.secondary,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}>
                {category}
              </span>
              <span style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 'var(--text-xs)',
                color: colors.text.disabled,
              }}>
                {groupedParameters[category].length} • {expandedCategories.has(category) ? '▼' : '▶'}
              </span>
            </button>

            {/* Parameters */}
            {expandedCategories.has(category) && (
              <div style={{
                display: viewMode === 'grid' ? 'grid' : 'flex',
                gridTemplateColumns: viewMode === 'grid' ? 'repeat(auto-fill, minmax(150px, 1fr))' : undefined,
                flexDirection: viewMode === 'list' ? 'column' : undefined,
                gap: 4,
                paddingLeft: viewMode === 'tree' ? 16 : 0,
              }}>
                {groupedParameters[category].map(param => (
                  <ParameterRow
                    key={param.path}
                    param={param}
                    color={getParamColor(param)}
                    compact={compact || viewMode === 'grid'}
                    onChange={handleValueChange}
                    onMidiLearn={onMidiLearn}
                    isMidiLearning={midiLearning === param.path}
                    formatValue={formatValue}
                  />
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// Individual parameter row
interface ParameterRowProps {
  param: InspectorParameter;
  color: string;
  compact: boolean;
  onChange: (path: string, value: number) => void;
  onMidiLearn?: (path: string) => void;
  isMidiLearning: boolean;
  formatValue: (param: InspectorParameter) => string;
}

const ParameterRow: React.FC<ParameterRowProps> = ({
  param,
  color,
  compact,
  onChange,
  onMidiLearn,
  isMidiLearning,
  formatValue,
}) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(param.path, parseFloat(e.target.value));
  };

  const handleDoubleClick = () => {
    onChange(param.path, param.defaultValue);
  };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: compact ? 'flex-start' : 'center',
        flexDirection: compact ? 'column' : 'row',
        gap: compact ? 4 : 8,
        padding: '6px 8px',
        background: isDragging ? colors.bg.highlight : colors.bg.base,
        borderRadius: 4,
        border: isMidiLearning ? `1px solid ${colors.accent.yellow}` : `1px solid transparent`,
      }}
    >
      {/* Name and path */}
      <div style={{
        flex: compact ? undefined : 1,
        minWidth: compact ? '100%' : 120,
      }}>
        <div style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 'var(--text-xs)',
          color: color,
          fontWeight: 500,
        }}>
          {param.name}
        </div>
        <div style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 9,
          color: colors.text.disabled,
        }}>
          {param.path}
        </div>
      </div>

      {/* Slider */}
      <div style={{
        flex: compact ? undefined : 2,
        width: compact ? '100%' : undefined,
        display: 'flex',
        alignItems: 'center',
        gap: 8,
      }}>
        <input
          type="range"
          min={0}
          max={1}
          step={param.step ? param.step / (param.max - param.min) : 0.001}
          value={param.value}
          onChange={handleChange}
          onMouseDown={() => setIsDragging(true)}
          onMouseUp={() => setIsDragging(false)}
          onDoubleClick={handleDoubleClick}
          style={{
            flex: 1,
            height: 6,
            appearance: 'none',
            background: `linear-gradient(90deg, ${color} 0%, ${color} ${param.value * 100}%, ${colors.bg.elevated} ${param.value * 100}%)`,
            borderRadius: 3,
            cursor: 'pointer',
          }}
        />

        {/* Value display */}
        <span style={{
          minWidth: 50,
          fontFamily: 'var(--font-numeric)',
          fontSize: 'var(--text-xs)',
          color: isDragging ? colors.text.primary : colors.text.secondary,
          textAlign: 'right',
        }}>
          {formatValue(param)}
        </span>
      </div>

      {/* Actions */}
      {!compact && (
        <div style={{ display: 'flex', gap: 4 }}>
          {param.modulatable && (
            <span style={{
              fontSize: 8,
              color: colors.accent.purple,
              fontFamily: 'var(--font-mono)',
            }}>
              MOD
            </span>
          )}
          {onMidiLearn && (
            <button
              onClick={() => onMidiLearn(param.path)}
              style={{
                padding: '2px 6px',
                background: isMidiLearning ? colors.accent.yellow : colors.bg.elevated,
                border: 'none',
                borderRadius: 2,
                color: isMidiLearning ? colors.bg.base : colors.text.disabled,
                fontFamily: 'var(--font-mono)',
                fontSize: 8,
                cursor: 'pointer',
              }}
            >
              {param.midiCC !== undefined ? `CC${param.midiCC}` : 'LEARN'}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default ParameterInspector;
