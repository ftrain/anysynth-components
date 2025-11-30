import type { Meta, StoryObj } from '@storybook/react';
import { useState, useEffect } from 'react';

// Import all components
import {
  NestedSliderHorizontal,
  NestedSliderVertical,
  NestedSliderCircular,
  NestedSliderGrid,
  Sequencer,
  ADSR,
  Transport,
  LevelMeter,
  Oscilloscope,
  PianoKeyboard,
  LFO,
  WaveformSelector,
  WavetableView,
  ModWheel,
  XYPad,
  FractionPicker,
  ChordKnob,
  TimeKnob,
  DrumPadGrid,
  DrumPadSequencer,
  ModMatrix,
  EffectsChain,
  MIDIMonitor,
} from '../components';

import type {
  ModSource,
  ModDestination,
  Effect,
  WavetableFrame,
  MIDIEvent,
} from '../components';

// Module wrapper for consistent styling
const Module: React.FC<{ title: string; children: React.ReactNode; width?: string }> = ({
  title,
  children,
  width = 'auto',
}) => (
  <div
    style={{
      background: '#1a1a1a',
      borderRadius: 8,
      padding: 12,
      border: '1px solid #333',
      width,
      minWidth: 0,
    }}
  >
    <div
      style={{
        fontFamily: 'monospace',
        fontSize: 10,
        color: '#666',
        marginBottom: 8,
        textTransform: 'uppercase',
        letterSpacing: '0.1em',
      }}
    >
      {title}
    </div>
    {children}
  </div>
);

// Section header
const Section: React.FC<{ title: string }> = ({ title }) => (
  <div
    style={{
      gridColumn: '1 / -1',
      fontFamily: 'system-ui',
      fontSize: 14,
      fontWeight: 600,
      color: '#48dbfb',
      borderBottom: '1px solid #333',
      paddingBottom: 8,
      marginTop: 16,
    }}
  >
    {title}
  </div>
);

const meta: Meta = {
  title: 'All Components',
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;

// Generate demo waveform data
const generateWaveform = (type: 'sine' | 'saw' | 'square' = 'sine'): Float32Array => {
  const data = new Float32Array(256);
  for (let i = 0; i < 256; i++) {
    const t = i / 256;
    if (type === 'sine') {
      data[i] = Math.sin(t * Math.PI * 4);
    } else if (type === 'saw') {
      data[i] = (t * 2 - 1) * Math.sin(t * Math.PI * 2);
    } else {
      data[i] = Math.sign(Math.sin(t * Math.PI * 4)) * 0.8;
    }
  }
  return data;
};

// Generate wavetable frames
const generateWavetable = (): WavetableFrame[] => {
  return Array(8).fill(null).map((_, i) => ({
    id: `frame-${i}`,
    name: `Frame ${i + 1}`,
    samples: Array(64).fill(0).map((_, j) =>
      Math.sin((j / 64) * Math.PI * 2) * (1 - i * 0.1) +
      Math.sin((j / 64) * Math.PI * 4) * (i * 0.1)
    ),
  }));
};

export const AllComponents: StoryObj = {
  render: () => {
    // Transport state
    const [transport, setTransport] = useState({
      playing: false,
      recording: false,
      bpm: 120,
      position: 0,
    });

    // Oscilloscope data
    const [scopeData, setScopeData] = useState<Float32Array>(generateWaveform('sine'));

    // Animate scope
    useEffect(() => {
      let frame = 0;
      const interval = setInterval(() => {
        const data = new Float32Array(256);
        for (let i = 0; i < 256; i++) {
          data[i] = Math.sin((i + frame) * 0.1) * 0.8;
        }
        setScopeData(data);
        frame += 2;
      }, 50);
      return () => clearInterval(interval);
    }, []);

    // Level meter values
    const [levels, setLevels] = useState({ left: -12, right: -14 });
    useEffect(() => {
      const interval = setInterval(() => {
        setLevels({
          left: -20 + Math.random() * 14,
          right: -20 + Math.random() * 14,
        });
      }, 100);
      return () => clearInterval(interval);
    }, []);

    // Piano keyboard state
    const [activeNotes, setActiveNotes] = useState<number[]>([]);

    // Mod matrix data
    const modSources: ModSource[] = [
      { id: 'lfo1', name: 'LFO 1', color: 'cyan' },
      { id: 'lfo2', name: 'LFO 2', color: 'purple' },
      { id: 'env1', name: 'Env 1', color: 'orange' },
      { id: 'env2', name: 'Env 2', color: 'yellow' },
    ];

    const modDestinations: ModDestination[] = [
      { id: 'pitch', name: 'Pitch' },
      { id: 'filter', name: 'Filter' },
      { id: 'amp', name: 'Amp' },
      { id: 'pan', name: 'Pan' },
    ];

    // Effects chain
    const effects: Effect[] = [
      {
        id: 'dist',
        name: 'Distortion',
        type: 'distortion',
        bypassed: false,
        parameters: [
          { id: 'drive', name: 'Drive', value: 0.5, min: 0, max: 100 },
          { id: 'tone', name: 'Tone', value: 0.6, min: 0, max: 100 },
        ],
      },
      {
        id: 'delay',
        name: 'Delay',
        type: 'delay',
        bypassed: false,
        parameters: [
          { id: 'time', name: 'Time', value: 0.3, min: 0, max: 1000, unit: 'ms' },
          { id: 'feedback', name: 'Feedback', value: 0.4, min: 0, max: 100 },
          { id: 'mix', name: 'Mix', value: 0.3, min: 0, max: 100 },
        ],
      },
      {
        id: 'reverb',
        name: 'Reverb',
        type: 'reverb',
        bypassed: true,
        parameters: [
          { id: 'size', name: 'Size', value: 0.7, min: 0, max: 100 },
          { id: 'decay', name: 'Decay', value: 0.5, min: 0, max: 100 },
          { id: 'mix', name: 'Mix', value: 0.25, min: 0, max: 100 },
        ],
      },
    ];

    // MIDI events
    const [midiEvents] = useState<MIDIEvent[]>([
      { type: 'noteOn', channel: 1, data: [60, 100], timestamp: Date.now() - 1000 },
      { type: 'cc', channel: 1, data: [1, 64], timestamp: Date.now() - 500 },
      { type: 'noteOff', channel: 1, data: [60, 0], timestamp: Date.now() },
    ]);

    return (
      <div
        style={{
          minHeight: '100vh',
          background: '#0a0a0a',
          padding: 24,
        }}
      >
        <h1
          style={{
            fontFamily: 'system-ui',
            fontSize: 24,
            fontWeight: 700,
            color: '#fff',
            marginBottom: 24,
          }}
        >
          Synth Components Library
        </h1>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: 16,
            alignItems: 'start',
          }}
        >
          {/* SLIDERS */}
          <Section title="Sliders" />

          <Module title="Horizontal Sliders">
            <NestedSliderHorizontal
              parameters={[
                { id: 'osc1', name: 'OSC 1', value: 0.8, defaultValue: 0.5, color: 'coral' },
                { id: 'osc2', name: 'OSC 2', value: 0.5, defaultValue: 0.5, color: 'cyan' },
                { id: 'sub', name: 'SUB', value: 0.3, defaultValue: 0.5, color: 'green' },
                { id: 'noise', name: 'NOISE', value: 0.1, defaultValue: 0, color: 'yellow' },
              ]}
              label="MIXER"
            />
          </Module>

          <Module title="Vertical Sliders">
            <NestedSliderVertical
              parameters={[
                { id: 'osc1', name: 'OSC1', value: 0.8, defaultValue: 0.5, color: 'coral' },
                { id: 'osc2', name: 'OSC2', value: 0.5, defaultValue: 0.5, color: 'cyan' },
                { id: 'sub', name: 'SUB', value: 0.3, defaultValue: 0.5, color: 'green' },
                { id: 'noise', name: 'NOISE', value: 0.1, defaultValue: 0, color: 'yellow' },
              ]}
              label="MIX"
            />
          </Module>

          <Module title="Circular Knob">
            <NestedSliderCircular
              parameters={[
                { id: 'cutoff', name: 'Cutoff', value: 0.7, defaultValue: 0.5, color: 'coral' },
                { id: 'reso', name: 'Reso', value: 0.3, defaultValue: 0, color: 'cyan' },
                { id: 'drive', name: 'Drive', value: 0.5, defaultValue: 0, color: 'orange' },
              ]}
              label="FILTER"
            />
          </Module>

          <Module title="Grid Macros">
            <NestedSliderGrid
              parameters={[
                { id: 'm1', name: 'M1', value: 0.5, defaultValue: 0.5, color: 'coral' },
                { id: 'm2', name: 'M2', value: 0.7, defaultValue: 0.5, color: 'cyan' },
                { id: 'm3', name: 'M3', value: 0.3, defaultValue: 0.5, color: 'green' },
                { id: 'm4', name: 'M4', value: 0.8, defaultValue: 0.5, color: 'yellow' },
              ]}
              label="MACROS"
              columns={2}
              fillWidth
            />
          </Module>

          {/* OSCILLATORS */}
          <Section title="Oscillators" />

          <Module title="Waveform Selector">
            <WaveformSelector
              value="saw"
              label="OSC 1"
            />
          </Module>

          <Module title="Wavetable View">
            <WavetableView
              frames={generateWavetable()}
              position={0.4}
              label="WAVETABLE"
            />
          </Module>

          <Module title="LFO">
            <LFO
              value={{ shape: 'sine', rate: 1.5, depth: 0.8, phase: 0, delay: 0 }}
              label="LFO 1"
            />
          </Module>

          {/* ENVELOPES */}
          <Section title="Envelopes" />

          <Module title="ADSR">
            <ADSR
              value={{ attack: 0.01, decay: 0.2, sustain: 0.7, release: 0.5 }}
              label="AMP ENV"
            />
          </Module>

          <Module title="ADSR (Filter)">
            <ADSR
              value={{ attack: 0.05, decay: 0.3, sustain: 0.4, release: 0.8 }}
              label="FILTER ENV"
              color="#ff9f43"
            />
          </Module>

          {/* TIME & RHYTHM */}
          <Section title="Time & Rhythm" />

          <Module title="Time Knob">
            <TimeKnob
              label="DELAY TIME"
            />
          </Module>

          <Module title="Fraction Picker">
            <FractionPicker
              label="TIME SIG"
            />
          </Module>

          {/* SEQUENCERS */}
          <Section title="Sequencers" />

          <Module title="Step Sequencer" width="100%">
            <Sequencer
              label="SEQ 1"
              playingStep={transport.playing ? Math.floor(transport.position) % 16 : null}
            />
          </Module>

          <Module title="Drum Pads">
            <DrumPadGrid
              pads={[
                { id: 'kick', label: 'KICK', color: 'coral' },
                { id: 'snare', label: 'SNARE', color: 'cyan' },
                { id: 'hat', label: 'HAT', color: 'yellow' },
                { id: 'clap', label: 'CLAP', color: 'purple' },
              ]}
              columns={2}
            />
          </Module>

          <Module title="Drum Sequencer" width="100%">
            <DrumPadSequencer
              tracks={[
                { id: 'kick', name: 'KICK', color: 'coral', steps: Array(16).fill(null).map((_, i) => ({ active: i % 4 === 0, velocity: 1, probability: 1, accent: false })) },
                { id: 'snare', name: 'SNARE', color: 'cyan', steps: Array(16).fill(null).map((_, i) => ({ active: i % 8 === 4, velocity: 0.8, probability: 1, accent: false })) },
                { id: 'hat', name: 'HAT', color: 'yellow', steps: Array(16).fill(null).map((_, i) => ({ active: i % 2 === 0, velocity: 0.6, probability: 1, accent: false })) },
              ]}
              currentStep={transport.playing ? Math.floor(transport.position) % 16 : -1}
            />
          </Module>

          {/* CHORD & MUSICAL */}
          <Section title="Musical Input" />

          <Module title="Chord Knob">
            <ChordKnob
              label="CHORD"
              keyboardOctaves={2}
            />
          </Module>

          <Module title="Piano Keyboard" width="100%">
            <PianoKeyboard
              startOctave={3}
              octaves={2}
              activeNotes={activeNotes}
              onNoteOn={(note) => setActiveNotes((prev) => [...prev, note])}
              onNoteOff={(note) => setActiveNotes((prev) => prev.filter((n) => n !== note))}
              showNoteNames
              label="KEYBOARD"
            />
          </Module>

          {/* PERFORMANCE */}
          <Section title="Performance Controls" />

          <Module title="Mod Wheel">
            <ModWheel
              value={0.5}
              label="MOD"
            />
          </Module>

          <Module title="XY Pad">
            <XYPad
              x={0.5}
              y={0.5}
              xLabel="Cutoff"
              yLabel="Resonance"
              label="FILTER"
            />
          </Module>

          {/* MODULATION */}
          <Section title="Modulation" />

          <Module title="Mod Matrix" width="100%">
            <ModMatrix
              sources={modSources}
              destinations={modDestinations}
              label="MOD MATRIX"
            />
          </Module>

          {/* EFFECTS */}
          <Section title="Effects" />

          <Module title="Effects Chain" width="100%">
            <EffectsChain
              effects={effects}
              label="FX CHAIN"
            />
          </Module>

          {/* MONITORING */}
          <Section title="Monitoring" />

          <Module title="Transport">
            <Transport
              state={{
                playing: transport.playing,
                recording: transport.recording,
                bpm: transport.bpm,
                position: transport.position,
                timeSignature: [4, 4],
                loop: false,
                loopStart: 0,
                loopEnd: 16,
              }}
              onStateChange={(changes) => setTransport((t) => ({
                ...t,
                playing: changes.playing ?? t.playing,
                recording: changes.recording ?? t.recording,
                bpm: changes.bpm ?? t.bpm,
              }))}
            />
          </Module>

          <Module title="Level Meter">
            <LevelMeter
              value={[
                { peak: levels.left, rms: levels.left - 6, clip: false },
                { peak: levels.right, rms: levels.right - 6, clip: false },
              ]}
              label="OUTPUT"
            />
          </Module>

          <Module title="Oscilloscope">
            <Oscilloscope
              data={scopeData}
              label="SCOPE"
            />
          </Module>

          <Module title="MIDI Monitor">
            <MIDIMonitor
              events={midiEvents}
              maxEvents={10}
              label="MIDI"
            />
          </Module>
        </div>
      </div>
    );
  },
};
