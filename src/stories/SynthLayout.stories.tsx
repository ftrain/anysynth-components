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
