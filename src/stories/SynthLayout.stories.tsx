/**
 * Synth Layout Demo
 *
 * Demonstrates how components flow and fill space responsively.
 * Shows a complete synthesizer interface with all module types.
 */

import type { Meta, StoryObj } from '@storybook/react';
import { useState, useEffect } from 'react';
import {
  NestedSliderHorizontal,
  NestedSliderVertical,
  NestedSliderCircular,
  NestedSliderGrid,
} from '../components/NestedSlider';
import { Sequencer } from '../components/Sequencer';
import { ADSR } from '../components/ADSR';
import { Transport } from '../components/Transport';
import { LevelMeter } from '../components/LevelMeter';
import { Oscilloscope } from '../components/Oscilloscope';
import { PianoKeyboard } from '../components/PianoKeyboard';
import { LFO } from '../components/LFO';
import { colors } from '../theme/tokens';
import type { Parameter, ParameterWithOptions, EnvelopeParams, LFOParams, TransportState, MeterData } from '../types';

// Sample data
const oscillatorParams: (Parameter | ParameterWithOptions)[] = [
  { id: 'level', name: 'LEVEL', color: 'coral', value: 0.7, defaultValue: 0.7 },
  { id: 'pitch', name: 'PITCH', color: 'green', value: 0.5, defaultValue: 0.5, bipolar: true },
  { id: 'fine', name: 'FINE', color: 'cyan', value: 0.5, defaultValue: 0.5, bipolar: true },
  { id: 'wave', name: 'WAVE', color: 'yellow', value: 0.6, defaultValue: 0.5, options: ['Saw', 'Square', 'Tri', 'Sine'], selectedOption: 'Saw' } as ParameterWithOptions,
];

const filterParams: Parameter[] = [
  { id: 'cutoff', name: 'CUT', color: 'orange', value: 0.6, defaultValue: 0.5 },
  { id: 'res', name: 'RES', color: 'coral', value: 0.3, defaultValue: 0.0 },
  { id: 'env', name: 'ENV', color: 'pink', value: 0.5, defaultValue: 0.5, bipolar: true },
  { id: 'key', name: 'KEY', color: 'purple', value: 0.0, defaultValue: 0.0 },
];

const mixerParams: Parameter[] = [
  { id: 'osc1', name: 'OSC1', color: 'coral', value: 0.8, defaultValue: 0.7 },
  { id: 'osc2', name: 'OSC2', color: 'orange', value: 0.5, defaultValue: 0.7 },
  { id: 'sub', name: 'SUB', color: 'yellow', value: 0.3, defaultValue: 0.5 },
  { id: 'noise', name: 'NOISE', color: 'cyan', value: 0.1, defaultValue: 0.0 },
];

const macroParams: Parameter[] = [
  { id: 'm1', name: 'M1', color: 'coral', value: 0.5, defaultValue: 0.5 },
  { id: 'm2', name: 'M2', color: 'orange', value: 0.3, defaultValue: 0.5 },
  { id: 'm3', name: 'M3', color: 'yellow', value: 0.7, defaultValue: 0.5 },
  { id: 'm4', name: 'M4', color: 'green', value: 0.4, defaultValue: 0.5 },
  { id: 'm5', name: 'M5', color: 'cyan', value: 0.6, defaultValue: 0.5 },
  { id: 'm6', name: 'M6', color: 'teal', value: 0.2, defaultValue: 0.5 },
  { id: 'm7', name: 'M7', color: 'purple', value: 0.8, defaultValue: 0.5 },
  { id: 'm8', name: 'M8', color: 'pink', value: 0.5, defaultValue: 0.5 },
];

const meta: Meta = {
  title: 'Layouts/Complete Synth',
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;

// Module wrapper component
const Module: React.FC<{ title?: string; children: React.ReactNode; className?: string }> = ({
  title,
  children,
  className,
}) => (
  <div
    className={className}
    style={{
      background: colors.bg.surface,
      borderRadius: 8,
      border: `1px solid ${colors.bg.border}`,
      overflow: 'hidden',
    }}
  >
    {title && (
      <div style={{
        padding: '8px 12px',
        borderBottom: `1px solid ${colors.bg.border}`,
        fontFamily: 'var(--font-mono)',
        fontSize: 11,
        color: colors.text.muted,
        textTransform: 'uppercase',
        letterSpacing: '0.1em',
      }}>
        {title}
      </div>
    )}
    <div style={{ padding: 0 }}>
      {children}
    </div>
  </div>
);

// Full synthesizer layout
export const FullSynthesizer: StoryObj = {
  render: () => {
    const [transport, setTransport] = useState<TransportState>({
      playing: false,
      recording: false,
      bpm: 120,
      timeSignature: [4, 4],
      position: 0,
      loop: false,
      loopStart: 0,
      loopEnd: 16,
    });

    const [ampEnv, setAmpEnv] = useState<EnvelopeParams>({
      attack: 10,
      decay: 200,
      sustain: 0.7,
      release: 300,
    });

    const [filterEnv, setFilterEnv] = useState<EnvelopeParams>({
      attack: 50,
      decay: 400,
      sustain: 0.3,
      release: 500,
    });

    const [lfo1, setLfo1] = useState<LFOParams>({
      rate: 2,
      depth: 0.5,
      shape: 'sine',
      phase: 0,
      delay: 0,
    });

    const [activeNotes, setActiveNotes] = useState<number[]>([]);
    const [meterData, setMeterData] = useState<[MeterData, MeterData]>([
      { peak: 0.6, rms: 0.4, clip: false },
      { peak: 0.55, rms: 0.38, clip: false },
    ]);

    // Generate fake waveform data
    const [waveformData, setWaveformData] = useState<Float32Array>(new Float32Array(256));

    useEffect(() => {
      const interval = setInterval(() => {
        const data = new Float32Array(256);
        for (let i = 0; i < 256; i++) {
          data[i] = Math.sin(i * 0.1 + Date.now() * 0.01) * 0.5;
        }
        setWaveformData(data);

        // Animate meter
        setMeterData([
          { peak: 0.3 + Math.random() * 0.4, rms: 0.2 + Math.random() * 0.3, clip: Math.random() > 0.98 },
          { peak: 0.3 + Math.random() * 0.4, rms: 0.2 + Math.random() * 0.3, clip: Math.random() > 0.98 },
        ]);

        // Animate transport position
        if (transport.playing) {
          setTransport(prev => ({
            ...prev,
            position: (prev.position + 0.05) % 16,
          }));
        }
      }, 50);

      return () => clearInterval(interval);
    }, [transport.playing]);

    return (
      <div style={{
        minHeight: '100vh',
        background: colors.bg.base,
        padding: 16,
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
      }}>
        {/* Top row: Transport + Output */}
        <div style={{
          display: 'flex',
          gap: 16,
          flexWrap: 'wrap',
        }}>
          <Module title="TRANSPORT" className="flex-grow">
            <Transport
              state={transport}
              onStateChange={(changes) => setTransport(prev => ({ ...prev, ...changes }))}
              showBpm
              showPosition
              showTimeSignature
            />
          </Module>

          <Module title="OUTPUT">
            <div style={{ display: 'flex', gap: 16, padding: 12 }}>
              <LevelMeter
                value={meterData}
                height={100}
                showDb
              />
              <Oscilloscope
                data={waveformData}
                mode="scope"
                width={200}
                height={100}
              />
            </div>
          </Module>
        </div>

        {/* Main synth area */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 16,
          flex: 1,
        }}>
          {/* Oscillator 1 */}
          <Module title="OSC 1">
            <NestedSliderCircular
              parameters={oscillatorParams}
              label="OSC 1"
              size={180}
            />
          </Module>

          {/* Oscillator 2 */}
          <Module title="OSC 2">
            <NestedSliderHorizontal
              parameters={oscillatorParams}
              label="OSC 2"
            />
          </Module>

          {/* Mixer */}
          <Module title="MIXER">
            <NestedSliderVertical
              parameters={mixerParams}
              label="MIX"
              height={140}
            />
          </Module>

          {/* Filter */}
          <Module title="FILTER">
            <NestedSliderHorizontal
              parameters={filterParams}
              label="FILTER"
            />
          </Module>

          {/* Amp Envelope */}
          <Module title="AMP ENV">
            <ADSR
              value={ampEnv}
              onChange={setAmpEnv}
              label="AMP"
              color={colors.accent.coral}
            />
          </Module>

          {/* Filter Envelope */}
          <Module title="FILTER ENV">
            <ADSR
              value={filterEnv}
              onChange={setFilterEnv}
              label="FLT"
              color={colors.accent.orange}
            />
          </Module>

          {/* LFO 1 */}
          <Module title="LFO 1">
            <LFO
              value={lfo1}
              onChange={setLfo1}
              label="LFO 1"
              showDelay
            />
          </Module>

          {/* Macros */}
          <Module title="MACROS">
            <NestedSliderGrid
              parameters={macroParams}
              label="MACRO"
              columns={4}
              fillWidth
            />
          </Module>
        </div>

        {/* Sequencer */}
        <Module title="SEQUENCER">
          <Sequencer
            label="SEQ"
            playingStep={transport.playing ? Math.floor(transport.position) : null}
          />
        </Module>

        {/* Keyboard */}
        <Module title="KEYBOARD">
          <PianoKeyboard
            startOctave={4}
            octaves={2}
            activeNotes={activeNotes}
            onNoteOn={(note) => setActiveNotes(prev => [...prev, note])}
            onNoteOff={(note) => setActiveNotes(prev => prev.filter(n => n !== note))}
            height={60}
            compact
          />
        </Module>
      </div>
    );
  },
};

// Mobile-first layout
export const MobileLayout: StoryObj = {
  render: () => {
    const [transport, setTransport] = useState<TransportState>({
      playing: false,
      recording: false,
      bpm: 120,
      timeSignature: [4, 4],
      position: 0,
      loop: false,
      loopStart: 0,
      loopEnd: 16,
    });

    return (
      <div style={{
        width: 375, // iPhone width
        maxWidth: '100%',
        minHeight: 812, // iPhone height
        background: colors.bg.base,
        padding: 12,
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        margin: '0 auto',
        border: `1px solid ${colors.bg.border}`,
        borderRadius: 12,
        overflow: 'hidden', // Prevent overflow
        boxSizing: 'border-box',
      }}>
        {/* Transport (compact) */}
        <Transport
          state={transport}
          onStateChange={(changes) => setTransport(prev => ({ ...prev, ...changes }))}
          compact
        />

        {/* Main control - circular knob */}
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <NestedSliderCircular
            parameters={oscillatorParams}
            label="OSC"
            size={Math.min(200, 375 - 48)} // Constrain to container
          />
        </div>

        {/* Filter - uses full width */}
        <div style={{ width: '100%', maxWidth: '100%' }}>
          <NestedSliderHorizontal
            parameters={filterParams}
            label="FILTER"
            trackHeight={16}
          />
        </div>

        {/* ADSR - constrained */}
        <div style={{ width: '100%', overflow: 'hidden' }}>
          <ADSR
            value={{ attack: 10, decay: 200, sustain: 0.7, release: 300 }}
            label="ENV"
            height={80}
          />
        </div>

        {/* Sequencer (compact) - constrained */}
        <div style={{ width: '100%', overflow: 'hidden' }}>
          <Sequencer
            label="SEQ"
            compact
          />
        </div>

        {/* Mini keyboard - constrained */}
        <div style={{ width: '100%', overflow: 'hidden' }}>
          <PianoKeyboard
            startOctave={4}
            octaves={2}
            height={70}
          />
        </div>
      </div>
    );
  },
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
};

// Square module wrapper - EVERY module is a perfect square
const SquareModule: React.FC<{
  title?: string;
  children: React.ReactNode;
  span?: number;  // How many grid cells to span horizontally
  color?: string;
}> = ({ title, children, span = 1, color }) => (
  <div
    style={{
      gridColumn: span > 1 ? `span ${span}` : undefined,
      aspectRatio: span > 1 ? `${span} / 1` : '1 / 1',
      background: colors.bg.surface,
      borderRadius: 12,
      border: `1px solid ${color ? color + '33' : colors.bg.border}`,
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      minWidth: 0,
    }}
  >
    {title && (
      <div style={{
        padding: '10px 14px',
        fontFamily: 'var(--font-mono)',
        fontSize: 11,
        color: color || colors.text.muted,
        textTransform: 'uppercase',
        letterSpacing: '0.1em',
        flexShrink: 0,
      }}>
        {title}
      </div>
    )}
    <div style={{
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 12,
      minHeight: 0,
      overflow: 'hidden',
    }}>
      {children}
    </div>
  </div>
);

// Compact waveform display for oscillators
const WaveformDisplay: React.FC<{ type: 'saw' | 'tri' | 'pulse' | 'sine'; color?: string }> = ({ type, color = colors.accent.yellow }) => {
  const paths: Record<string, string> = {
    saw: 'M 0,40 L 80,10 L 80,40 L 160,10 L 160,40',
    tri: 'M 0,40 L 40,10 L 80,40 L 120,10 L 160,40',
    pulse: 'M 0,35 L 0,10 L 40,10 L 40,35 L 80,35 L 80,10 L 120,10 L 120,35 L 160,35',
    sine: 'M 0,25 Q 20,5 40,25 T 80,25 T 120,25 T 160,25',
  };
  return (
    <svg width="100%" height="50" viewBox="0 0 160 50" preserveAspectRatio="xMidYMid meet">
      <path d={paths[type]} stroke={color} strokeWidth="2" fill="none" opacity="0.8" />
    </svg>
  );
};

// Compact option buttons
const OptionButtons: React.FC<{
  options: string[];
  value: string;
  onChange?: (v: string) => void;
  color?: string;
  size?: 'sm' | 'md';
}> = ({ options, value, onChange, color = colors.accent.cyan, size = 'md' }) => (
  <div style={{
    display: 'flex',
    gap: size === 'sm' ? 2 : 4,
    flexWrap: 'wrap',
    justifyContent: 'center',
  }}>
    {options.map(opt => (
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

// Compact slider for square modules
const CompactSlider: React.FC<{
  label: string;
  value: number;
  onChange?: (v: number) => void;
  color?: string;
  showValue?: boolean;
}> = ({ label, value, color = colors.accent.cyan, showValue = true }) => (
  <div style={{ width: '100%', marginBottom: 8 }}>
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      marginBottom: 4,
      fontFamily: 'var(--font-mono)',
      fontSize: 9,
      color: colors.text.muted,
      textTransform: 'uppercase',
    }}>
      <span>{label}</span>
      {showValue && <span style={{ color: colors.text.secondary }}>{Math.round(value * 100)}%</span>}
    </div>
    <div
      style={{
        width: '100%',
        height: 6,
        background: colors.bg.elevated,
        borderRadius: 3,
        cursor: 'ew-resize',
        position: 'relative',
      }}
    >
      <div style={{
        width: `${value * 100}%`,
        height: '100%',
        background: color,
        borderRadius: 3,
      }} />
    </div>
  </div>
);

// Square Grid Synthesizer - every module is a perfect square
export const SquareGrid: StoryObj = {
  render: () => {
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
    const [filterCutoff, setFilterCutoff] = useState(0.7);
    const [filterRes, setFilterRes] = useState(0);
    const [filterEnvAmt] = useState(0.5);
    const [filterKeyTrk, setFilterKeyTrk] = useState(0.5);
    const [glideMode, setGlideMode] = useState('OFF');
    const [activeNotes, setActiveNotes] = useState<number[]>([]);

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

    const waveTypeMap: Record<string, 'saw' | 'tri' | 'pulse'> = {
      'SAW': 'saw', 'TRI': 'tri', 'PLS': 'pulse'
    };

    return (
      <div style={{
        minHeight: '100vh',
        background: colors.bg.base,
        padding: 20,
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: 20,
          padding: '0 4px',
        }}>
          <div>
            <h1 style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 24,
              fontWeight: 700,
              color: colors.text.primary,
              margin: 0,
              letterSpacing: '0.05em',
            }}>
              MODEL D
            </h1>
            <div style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 11,
              color: colors.text.muted,
              marginTop: 2,
            }}>
              Monophonic Synthesizer
            </div>
          </div>
          <div style={{ width: 160 }}>
            <div style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 10,
              color: colors.text.muted,
              marginBottom: 4,
              textAlign: 'right',
            }}>
              MASTER
            </div>
            <div style={{
              height: 8,
              background: colors.bg.elevated,
              borderRadius: 4,
              overflow: 'hidden',
            }}>
              <div style={{
                width: `${masterLevel * 100}%`,
                height: '100%',
                background: colors.accent.green,
                borderRadius: 4,
              }} />
            </div>
            <div style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 11,
              color: colors.text.secondary,
              marginTop: 4,
              textAlign: 'right',
            }}>
              {Math.round(masterLevel * 100)}%
            </div>
          </div>
        </div>

        {/* Main Grid - ALL SQUARES */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 16,
          maxWidth: 1000,
        }}>
          {/* Row 1: Three Oscillators + Noise */}
          <SquareModule title="OSC 1" color={colors.accent.yellow}>
            <WaveformDisplay type={waveTypeMap[osc1Wave] || 'saw'} color={colors.accent.yellow} />
            <OptionButtons
              options={['SAW', 'TRI', 'PLS']}
              value={osc1Wave}
              onChange={setOsc1Wave}
              color={colors.accent.yellow}
            />
            <div style={{ height: 12 }} />
            <OptionButtons
              options={["32'", "16'", "8'", "4'", "2'"]}
              value={osc1Range}
              onChange={setOsc1Range}
              size="sm"
            />
            <div style={{ marginTop: 'auto', width: '100%' }}>
              <CompactSlider label="Level" value={osc1Level} onChange={setOsc1Level} color={colors.accent.coral} />
            </div>
          </SquareModule>

          <SquareModule title="OSC 2" color={colors.accent.yellow}>
            <WaveformDisplay type={waveTypeMap[osc2Wave] || 'saw'} color={colors.accent.yellow} />
            <OptionButtons
              options={['SAW', 'TRI', 'PLS']}
              value={osc2Wave}
              onChange={setOsc2Wave}
              color={colors.accent.yellow}
            />
            <div style={{ height: 12 }} />
            <OptionButtons
              options={["32'", "16'", "8'", "4'", "2'"]}
              value={osc2Range}
              onChange={setOsc2Range}
              size="sm"
            />
            <div style={{ marginTop: 'auto', width: '100%' }}>
              <CompactSlider label="Detune" value={osc2Detune} onChange={setOsc2Detune} color={colors.accent.cyan} showValue={false} />
              <CompactSlider label="Level" value={osc2Level} onChange={setOsc2Level} color={colors.accent.coral} />
            </div>
          </SquareModule>

          <SquareModule title="OSC 3" color={colors.accent.yellow}>
            <WaveformDisplay type={waveTypeMap[osc3Wave] || 'saw'} color={colors.accent.yellow} />
            <OptionButtons
              options={['SAW', 'TRI', 'PLS']}
              value={osc3Wave}
              onChange={setOsc3Wave}
              color={colors.accent.yellow}
            />
            <div style={{ height: 12 }} />
            <OptionButtons
              options={["32'", "16'", "8'", "4'", "2'"]}
              value={osc3Range}
              onChange={setOsc3Range}
              size="sm"
            />
            <div style={{ marginTop: 'auto', width: '100%' }}>
              <CompactSlider label="Detune" value={osc3Detune} onChange={setOsc3Detune} color={colors.accent.cyan} showValue={false} />
              <CompactSlider label="Level" value={osc3Level} onChange={setOsc3Level} color={colors.accent.coral} />
            </div>
          </SquareModule>

          <SquareModule title="NOISE" color={colors.accent.cyan}>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="80" height="60" viewBox="0 0 80 60">
                {Array.from({ length: 40 }).map((_, i) => (
                  <line
                    key={i}
                    x1={i * 2}
                    y1={30 + (Math.random() - 0.5) * 40}
                    x2={i * 2 + 1}
                    y2={30 + (Math.random() - 0.5) * 40}
                    stroke={colors.accent.cyan}
                    strokeWidth="1"
                    opacity="0.6"
                  />
                ))}
              </svg>
            </div>
            <div style={{ marginTop: 'auto', width: '100%' }}>
              <CompactSlider label="Level" value={noiseLevel} onChange={setNoiseLevel} color={colors.accent.cyan} />
            </div>
          </SquareModule>

          {/* Row 2: Filter + Filter Env + Amp Env + Glide */}
          <SquareModule title="FILTER" color={colors.accent.orange}>
            <div style={{ width: '100%', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <CompactSlider label="Cutoff" value={filterCutoff} onChange={setFilterCutoff} color={colors.accent.orange} />
              <CompactSlider label="Res" value={filterRes} onChange={setFilterRes} color={colors.accent.coral} />
              <CompactSlider label="Env Amt" value={filterEnvAmt} color={colors.accent.pink} showValue={false} />
              <CompactSlider label="Key Trk" value={filterKeyTrk} onChange={setFilterKeyTrk} color={colors.accent.yellow} />
            </div>
          </SquareModule>

          <SquareModule title="FILTER ENV" color={colors.accent.pink}>
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ADSR
                value={filterEnv}
                onChange={setFilterEnv}
                color={colors.accent.pink}
                height={140}
              />
            </div>
          </SquareModule>

          <SquareModule title="AMP ENV" color={colors.accent.coral}>
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ADSR
                value={ampEnv}
                onChange={setAmpEnv}
                color={colors.accent.coral}
                height={140}
              />
            </div>
          </SquareModule>

          <SquareModule title="GLIDE" color={colors.accent.purple}>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
              <OptionButtons
                options={['OFF', 'LEG', 'ON']}
                value={glideMode}
                onChange={setGlideMode}
                color={colors.accent.purple}
              />
              <div style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 10,
                color: colors.text.muted,
                textTransform: 'uppercase',
              }}>
                TIME
              </div>
              <div style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 18,
                color: glideMode === 'OFF' ? colors.text.muted : colors.text.primary,
              }}>
                {glideMode === 'OFF' ? 'OFF' : '50ms'}
              </div>
            </div>
          </SquareModule>

          {/* Row 3: More square modules */}
          <SquareModule title="KEYBOARD" color={colors.text.muted}>
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <PianoKeyboard
                startOctave={4}
                octaves={2}
                activeNotes={activeNotes}
                onNoteOn={(note) => setActiveNotes(prev => [...prev, note])}
                onNoteOff={(note) => setActiveNotes(prev => prev.filter(n => n !== note))}
                height={80}
              />
            </div>
          </SquareModule>

          <SquareModule title="LFO" color={colors.accent.yellow}>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              <WaveformDisplay type="sine" color={colors.accent.yellow} />
              <OptionButtons
                options={['SIN', 'TRI', 'SAW', 'SQR']}
                value="SIN"
                color={colors.accent.yellow}
                size="sm"
              />
              <CompactSlider label="Rate" value={0.3} color={colors.accent.yellow} />
              <CompactSlider label="Depth" value={0.5} color={colors.accent.cyan} />
            </div>
          </SquareModule>

          <SquareModule title="MIXER" color={colors.accent.coral}>
            <div style={{ width: '100%', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <CompactSlider label="OSC 1" value={0.7} color={colors.accent.coral} />
              <CompactSlider label="OSC 2" value={0} color={colors.accent.coral} />
              <CompactSlider label="OSC 3" value={0} color={colors.accent.coral} />
              <CompactSlider label="Noise" value={0} color={colors.accent.cyan} />
            </div>
          </SquareModule>

          <SquareModule title="OUTPUT" color={colors.accent.green}>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
              <div style={{
                width: 60,
                height: 60,
                borderRadius: '50%',
                background: `conic-gradient(${colors.accent.green} ${masterLevel * 270}deg, ${colors.bg.elevated} 0deg)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <div style={{
                  width: 48,
                  height: 48,
                  borderRadius: '50%',
                  background: colors.bg.surface,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: 'var(--font-mono)',
                  fontSize: 14,
                  color: colors.text.primary,
                }}>
                  {Math.round(masterLevel * 100)}
                </div>
              </div>
              <div style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 10,
                color: colors.text.muted,
                textTransform: 'uppercase',
              }}>
                VOLUME
              </div>
            </div>
          </SquareModule>
        </div>
      </div>
    );
  },
};

// Minimal effect plugin
export const EffectPlugin: StoryObj = {
  render: () => (
    <div style={{
      width: 400,
      background: colors.bg.base,
      padding: 16,
      display: 'flex',
      flexDirection: 'column',
      gap: 16,
      borderRadius: 12,
      border: `1px solid ${colors.bg.border}`,
    }}>
      <div style={{
        fontFamily: 'var(--font-mono)',
        fontSize: 14,
        color: colors.text.primary,
        textAlign: 'center',
        padding: 8,
      }}>
        DELAY
      </div>

      <NestedSliderHorizontal
        parameters={[
          { id: 'time', name: 'TIME', color: 'cyan', value: 0.4, defaultValue: 0.3 },
          { id: 'feedback', name: 'FDBK', color: 'orange', value: 0.5, defaultValue: 0.3 },
          { id: 'mix', name: 'MIX', color: 'green', value: 0.3, defaultValue: 0.3 },
          { id: 'tone', name: 'TONE', color: 'yellow', value: 0.6, defaultValue: 0.5 },
        ]}
        label="DELAY"
        trackHeight={12}
      />

      <LFO
        value={{ rate: 0.5, depth: 0.3, shape: 'sine', phase: 0, delay: 0 }}
        label="MOD"
        width={368}
      />

      <div style={{ display: 'flex', gap: 16 }}>
        <LevelMeter
          value={{ peak: 0.5, rms: 0.35, clip: false }}
          height={80}
          label="IN"
        />
        <Oscilloscope
          width={240}
          height={80}
          mode="scope"
        />
        <LevelMeter
          value={{ peak: 0.45, rms: 0.3, clip: false }}
          height={80}
          label="OUT"
        />
      </div>
    </div>
  ),
};
