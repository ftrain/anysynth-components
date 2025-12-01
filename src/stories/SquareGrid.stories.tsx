/**
 * SquareGrid Layout Demo
 *
 * Demonstrates the 8x8 grid alignment system.
 * All modules are fixed-size squares (320×320 by default).
 * Uses flexbox wrap for responsive reflow.
 */

import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { SquareModule } from '../components/Primitives';
import { NestedSliderCircular } from '../components/NestedSlider';
import { ADSR } from '../components/ADSR';
import { LFO } from '../components/LFO';
import { Slider } from '../components/Primitives';
import { colors } from '../theme/tokens';
import { MODULE_SIZE, CELL_SIZE, HALF_CELL } from '../theme/grid';
import type { EnvelopeParams, LFOParams, Parameter, ParameterWithOptions } from '../types';

const meta: Meta = {
  title: 'Layouts/SquareGrid',
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;

// Compact waveform display for oscillators
const WaveformDisplay: React.FC<{ type: 'saw' | 'tri' | 'pulse' | 'sine'; color?: string }> = ({
  type,
  color = colors.accent.yellow,
}) => {
  const paths: Record<string, string> = {
    saw: 'M 0,50 L 50,10 L 50,50 L 100,10 L 100,50',
    tri: 'M 0,50 L 25,10 L 50,50 L 75,10 L 100,50',
    pulse: 'M 0,40 L 0,10 L 25,10 L 25,40 L 50,40 L 50,10 L 75,10 L 75,40 L 100,40',
    sine: 'M 0,30 Q 12.5,5 25,30 T 50,30 T 75,30 T 100,30',
  };
  return (
    <svg
      width="100%"
      height={CELL_SIZE * 1.5}
      viewBox="0 0 100 60"
      preserveAspectRatio="xMidYMid meet"
      style={{ maxWidth: CELL_SIZE * 5 }}
    >
      <path d={paths[type]} stroke={color} strokeWidth="2" fill="none" opacity="0.8" />
    </svg>
  );
};

// Option button group
const OptionButtons: React.FC<{
  options: string[];
  value: string;
  onChange?: (v: string) => void;
  color?: string;
  size?: 'sm' | 'md';
}> = ({ options, value, onChange, color = colors.accent.cyan, size = 'md' }) => (
  <div
    style={{
      display: 'flex',
      gap: size === 'sm' ? 2 : 4,
      flexWrap: 'wrap',
      justifyContent: 'center',
    }}
  >
    {options.map((opt) => (
      <button
        key={opt}
        onClick={() => onChange?.(opt)}
        style={{
          background: value === opt ? color : colors.bg.elevated,
          border: 'none',
          borderRadius: 4,
          padding: size === 'sm' ? '4px 6px' : '6px 10px',
          fontFamily: 'var(--font-mono)',
          fontSize: size === 'sm' ? 9 : 10,
          color: value === opt ? colors.bg.base : colors.text.muted,
          cursor: 'pointer',
          textTransform: 'uppercase',
        }}
      >
        {opt}
      </button>
    ))}
  </div>
);

// Compact slider with label
const LabeledSlider: React.FC<{
  label: string;
  value: number;
  onChange?: (v: number) => void;
  color?: string;
}> = ({ label, value, onChange, color = colors.accent.cyan }) => (
  <div style={{ width: '100%', marginBottom: HALF_CELL * 0.4 }}>
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        marginBottom: 4,
        fontFamily: 'var(--font-mono)',
        fontSize: 9,
        color: colors.text.muted,
        textTransform: 'uppercase',
      }}
    >
      <span>{label}</span>
      <span style={{ color: colors.text.secondary }}>{Math.round(value * 100)}%</span>
    </div>
    <Slider
      value={value}
      onChange={onChange}
      length="100%"
      thickness={6}
      color={color as any}
    />
  </div>
);

// =======================================
// Model D Style Synth - All Square Modules
// =======================================
export const ModelD: StoryObj = {
  render: () => {
    // Oscillator state
    const [osc1Wave, setOsc1Wave] = useState('SAW');
    const [osc2Wave, setOsc2Wave] = useState('SAW');
    const [osc3Wave, setOsc3Wave] = useState('SAW');
    const [osc1Range, setOsc1Range] = useState("8'");
    const [osc2Range, setOsc2Range] = useState("8'");
    const [osc3Range, setOsc3Range] = useState("8'");
    const [osc1Level, setOsc1Level] = useState(0.7);
    const [osc2Detune, setOsc2Detune] = useState(0.5);
    const [osc2Level, setOsc2Level] = useState(0);
    const [osc3Detune, setOsc3Detune] = useState(0.5);
    const [osc3Level, setOsc3Level] = useState(0);
    const [noiseLevel, setNoiseLevel] = useState(0);
    const [masterLevel] = useState(0.7);

    // Filter state
    const [filterCutoff, setFilterCutoff] = useState(0.7);
    const [filterRes, setFilterRes] = useState(0);
    const [filterEnvAmt, setFilterEnvAmt] = useState(0.5);
    const [filterKeyTrk, setFilterKeyTrk] = useState(0.5);

    // Glide
    const [glideMode, setGlideMode] = useState('OFF');

    // Envelopes
    const [ampEnv, setAmpEnv] = useState<EnvelopeParams>({
      attack: 10,
      decay: 100,
      sustain: 0.8,
      release: 1560,
    });

    const [filterEnv, setFilterEnv] = useState<EnvelopeParams>({
      attack: 10,
      decay: 300,
      sustain: 0,
      release: 200,
    });

    // LFO
    const [lfo1, setLfo1] = useState<LFOParams>({
      rate: 2,
      depth: 0.5,
      shape: 'sine',
      phase: 0,
      delay: 0,
    });

    // Waveform type mapping
    const waveTypeMap: Record<string, 'saw' | 'tri' | 'pulse'> = {
      SAW: 'saw',
      TRI: 'tri',
      PLS: 'pulse',
    };

    return (
      <div
        style={{
          minHeight: '100vh',
          background: colors.bg.base,
          padding: HALF_CELL,
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: HALF_CELL,
            padding: `0 ${HALF_CELL * 0.5}px`,
          }}
        >
          <div>
            <h1
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 24,
                fontWeight: 700,
                color: colors.text.primary,
                margin: 0,
                letterSpacing: '0.05em',
              }}
            >
              MODEL D
            </h1>
            <div
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 11,
                color: colors.text.muted,
                marginTop: 2,
              }}
            >
              Monophonic Synthesizer • 320×320 Square Modules
            </div>
          </div>
          <div style={{ width: CELL_SIZE * 4 }}>
            <div
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 10,
                color: colors.text.muted,
                marginBottom: 4,
                textAlign: 'right',
              }}
            >
              MASTER
            </div>
            <div
              style={{
                height: 8,
                background: colors.bg.elevated,
                borderRadius: 4,
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  width: `${masterLevel * 100}%`,
                  height: '100%',
                  background: colors.accent.green,
                  borderRadius: 4,
                }}
              />
            </div>
            <div
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 11,
                color: colors.text.secondary,
                marginTop: 4,
                textAlign: 'right',
              }}
            >
              {Math.round(masterLevel * 100)}%
            </div>
          </div>
        </div>

        {/* Main Grid - Flexbox with wrap, NOT CSS Grid */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: HALF_CELL,
          }}
        >
          {/* OSC 1 */}
          <SquareModule title="OSC 1" color="yellow">
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: HALF_CELL * 0.6,
                width: '100%',
                height: '100%',
              }}
            >
              <WaveformDisplay type={waveTypeMap[osc1Wave] || 'saw'} color={colors.accent.yellow} />
              <OptionButtons
                options={['SAW', 'TRI', 'PLS']}
                value={osc1Wave}
                onChange={setOsc1Wave}
                color={colors.accent.yellow}
              />
              <div style={{ height: HALF_CELL * 0.5 }} />
              <OptionButtons
                options={["32'", "16'", "8'", "4'", "2'"]}
                value={osc1Range}
                onChange={setOsc1Range}
                size="sm"
              />
              <div style={{ marginTop: 'auto', width: '100%' }}>
                <LabeledSlider label="Level" value={osc1Level} onChange={setOsc1Level} color="coral" />
              </div>
            </div>
          </SquareModule>

          {/* OSC 2 */}
          <SquareModule title="OSC 2" color="yellow">
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: HALF_CELL * 0.6,
                width: '100%',
                height: '100%',
              }}
            >
              <WaveformDisplay type={waveTypeMap[osc2Wave] || 'saw'} color={colors.accent.yellow} />
              <OptionButtons
                options={['SAW', 'TRI', 'PLS']}
                value={osc2Wave}
                onChange={setOsc2Wave}
                color={colors.accent.yellow}
              />
              <div style={{ height: HALF_CELL * 0.5 }} />
              <OptionButtons
                options={["32'", "16'", "8'", "4'", "2'"]}
                value={osc2Range}
                onChange={setOsc2Range}
                size="sm"
              />
              <div style={{ marginTop: 'auto', width: '100%' }}>
                <LabeledSlider
                  label="Detune"
                  value={osc2Detune}
                  onChange={setOsc2Detune}
                  color="cyan"
                />
                <LabeledSlider label="Level" value={osc2Level} onChange={setOsc2Level} color="coral" />
              </div>
            </div>
          </SquareModule>

          {/* OSC 3 */}
          <SquareModule title="OSC 3" color="yellow">
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: HALF_CELL * 0.6,
                width: '100%',
                height: '100%',
              }}
            >
              <WaveformDisplay type={waveTypeMap[osc3Wave] || 'saw'} color={colors.accent.yellow} />
              <OptionButtons
                options={['SAW', 'TRI', 'PLS']}
                value={osc3Wave}
                onChange={setOsc3Wave}
                color={colors.accent.yellow}
              />
              <div style={{ height: HALF_CELL * 0.5 }} />
              <OptionButtons
                options={["32'", "16'", "8'", "4'", "2'"]}
                value={osc3Range}
                onChange={setOsc3Range}
                size="sm"
              />
              <div style={{ marginTop: 'auto', width: '100%' }}>
                <LabeledSlider
                  label="Detune"
                  value={osc3Detune}
                  onChange={setOsc3Detune}
                  color="cyan"
                />
                <LabeledSlider label="Level" value={osc3Level} onChange={setOsc3Level} color="coral" />
              </div>
            </div>
          </SquareModule>

          {/* NOISE */}
          <SquareModule title="NOISE" color="cyan">
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                width: '100%',
                height: '100%',
              }}
            >
              <svg width="80" height={CELL_SIZE * 1.5} viewBox="0 0 80 60">
                {Array.from({ length: 40 }).map((_, i) => (
                  <line
                    key={i}
                    x1={i * 2}
                    y1={30 + (Math.sin(i * 1.7) * 20)}
                    x2={i * 2 + 1}
                    y2={30 + (Math.cos(i * 2.3) * 20)}
                    stroke={colors.accent.cyan}
                    strokeWidth="1"
                    opacity="0.6"
                  />
                ))}
              </svg>
              <div style={{ marginTop: 'auto', width: '100%' }}>
                <LabeledSlider label="Level" value={noiseLevel} onChange={setNoiseLevel} color="cyan" />
              </div>
            </div>
          </SquareModule>

          {/* FILTER */}
          <SquareModule title="FILTER" color="orange">
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                width: '100%',
                height: '100%',
              }}
            >
              <LabeledSlider
                label="Cutoff"
                value={filterCutoff}
                onChange={setFilterCutoff}
                color="orange"
              />
              <LabeledSlider label="Resonance" value={filterRes} onChange={setFilterRes} color="coral" />
              <LabeledSlider
                label="Env Amount"
                value={filterEnvAmt}
                onChange={setFilterEnvAmt}
                color="pink"
              />
              <LabeledSlider
                label="Key Track"
                value={filterKeyTrk}
                onChange={setFilterKeyTrk}
                color="yellow"
              />
            </div>
          </SquareModule>

          {/* FILTER ENV */}
          <SquareModule title="FILTER ENV" color="pink">
            <ADSR value={filterEnv} onChange={setFilterEnv} color={colors.accent.pink} fillContainer />
          </SquareModule>

          {/* AMP ENV */}
          <SquareModule title="AMP ENV" color="coral">
            <ADSR value={ampEnv} onChange={setAmpEnv} color={colors.accent.coral} fillContainer />
          </SquareModule>

          {/* GLIDE */}
          <SquareModule title="GLIDE" color="purple">
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: HALF_CELL,
                height: '100%',
              }}
            >
              <OptionButtons
                options={['OFF', 'LEG', 'ON']}
                value={glideMode}
                onChange={setGlideMode}
                color={colors.accent.purple}
              />
              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 10,
                  color: colors.text.muted,
                  textTransform: 'uppercase',
                }}
              >
                TIME
              </div>
              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 18,
                  color: glideMode === 'OFF' ? colors.text.muted : colors.text.primary,
                }}
              >
                {glideMode === 'OFF' ? 'OFF' : '50ms'}
              </div>
            </div>
          </SquareModule>

          {/* LFO */}
          <SquareModule title="LFO 1" color="yellow">
            <LFO value={lfo1} onChange={setLfo1} showDelay={false} fillContainer />
          </SquareModule>

          {/* OUTPUT */}
          <SquareModule title="OUTPUT" color="green">
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: HALF_CELL,
                height: '100%',
              }}
            >
              <div
                style={{
                  width: CELL_SIZE * 2,
                  height: CELL_SIZE * 2,
                  borderRadius: '50%',
                  background: `conic-gradient(${colors.accent.green} ${masterLevel * 270}deg, ${colors.bg.elevated} 0deg)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <div
                  style={{
                    width: CELL_SIZE * 1.5,
                    height: CELL_SIZE * 1.5,
                    borderRadius: '50%',
                    background: colors.bg.surface,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: 'var(--font-mono)',
                    fontSize: 18,
                    color: colors.text.primary,
                  }}
                >
                  {Math.round(masterLevel * 100)}
                </div>
              </div>
              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 10,
                  color: colors.text.muted,
                  textTransform: 'uppercase',
                }}
              >
                VOLUME
              </div>
            </div>
          </SquareModule>
        </div>
      </div>
    );
  },
};

// =======================================
// Debug Grid View - Shows 8x8 alignment
// =======================================
export const DebugGrid: StoryObj = {
  render: () => {
    const [ampEnv, setAmpEnv] = useState<EnvelopeParams>({
      attack: 10,
      decay: 200,
      sustain: 0.7,
      release: 300,
    });

    const [lfo1, setLfo1] = useState<LFOParams>({
      rate: 2,
      depth: 0.5,
      shape: 'sine',
      phase: 0,
      delay: 0,
    });

    const oscParams: (Parameter | ParameterWithOptions)[] = [
      { id: 'level', name: 'LEVEL', color: 'coral', value: 0.7, defaultValue: 0.7 },
      { id: 'pitch', name: 'PITCH', color: 'green', value: 0.5, defaultValue: 0.5, bipolar: true },
      {
        id: 'wave',
        name: 'WAVE',
        color: 'yellow',
        value: 0.6,
        defaultValue: 0.5,
        options: ['Saw', 'Square', 'Tri', 'Sine'],
        selectedOption: 'Saw',
      } as ParameterWithOptions,
    ];

    return (
      <div
        style={{
          minHeight: '100vh',
          background: colors.bg.base,
          padding: HALF_CELL,
        }}
      >
        <h2
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 18,
            color: colors.text.primary,
            marginBottom: HALF_CELL,
          }}
        >
          Debug Grid View (8×8)
        </h2>
        <p
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 12,
            color: colors.text.muted,
            marginBottom: HALF_CELL,
          }}
        >
          Pink lines show the 8×8 grid alignment. Each cell is {CELL_SIZE}px.
        </p>

        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: HALF_CELL,
          }}
        >
          <SquareModule title="OSCILLATOR" color="yellow" showGrid>
            <NestedSliderCircular parameters={oscParams} label="OSC" />
          </SquareModule>

          <SquareModule title="ENVELOPE" color="pink" showGrid>
            <ADSR value={ampEnv} onChange={setAmpEnv} color={colors.accent.pink} fillContainer />
          </SquareModule>

          <SquareModule title="LFO" color="cyan" showGrid>
            <LFO value={lfo1} onChange={setLfo1} showDelay={false} fillContainer />
          </SquareModule>

          <SquareModule title="EMPTY" color="green" showGrid>
            <div
              style={{
                width: CELL_SIZE * 6,
                height: CELL_SIZE * 4,
                background: colors.bg.elevated,
                borderRadius: 8,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: 'var(--font-mono)',
                fontSize: 11,
                color: colors.text.muted,
              }}
            >
              6×4 cells ({CELL_SIZE * 6}×{CELL_SIZE * 4}px)
            </div>
          </SquareModule>
        </div>
      </div>
    );
  },
};

// =======================================
// Responsive Reflow Demo
// =======================================
export const ResponsiveReflow: StoryObj = {
  render: () => (
    <div
      style={{
        minHeight: '100vh',
        background: colors.bg.base,
        padding: HALF_CELL,
      }}
    >
      <h2
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 18,
          color: colors.text.primary,
          marginBottom: HALF_CELL,
        }}
      >
        Responsive Reflow
      </h2>
      <p
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 12,
          color: colors.text.muted,
          marginBottom: HALF_CELL,
        }}
      >
        Resize the window to see modules wrap like words in a sentence.
        <br />
        Modules maintain their {MODULE_SIZE}×{MODULE_SIZE}px size - they never shrink.
      </p>

      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: HALF_CELL,
        }}
      >
        {Array.from({ length: 12 }).map((_, i) => (
          <SquareModule
            key={i}
            title={`MODULE ${i + 1}`}
            color={(['coral', 'orange', 'yellow', 'green', 'cyan', 'teal', 'purple', 'pink'] as const)[i % 8]}
          >
            <div
              style={{
                width: CELL_SIZE * 5,
                height: CELL_SIZE * 4,
                background: colors.bg.elevated,
                borderRadius: 8,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: 'var(--font-mono)',
                fontSize: 24,
                color: colors.text.muted,
              }}
            >
              {i + 1}
            </div>
          </SquareModule>
        ))}
      </div>
    </div>
  ),
};
