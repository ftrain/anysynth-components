import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Slider } from './Slider';
import { OptionPicker } from './OptionPicker';
import { WaveformPicker, WaveformShape } from './WaveformPicker';
import { colors } from '../../theme/tokens';

const meta: Meta = {
  title: 'Primitives/Controls',
  parameters: {
    layout: 'centered',
  },
};

export default meta;

// === SLIDER STORIES ===

export const HorizontalSlider: StoryObj = {
  render: () => {
    const [value, setValue] = useState(0.5);
    return (
      <div style={{ padding: 20, background: colors.bg.surface, borderRadius: 8 }}>
        <Slider
          value={value}
          onChange={setValue}
          orientation="horizontal"
          length={200}
          thickness={12}
          color="cyan"
          showValue
          label="CUTOFF"
          formatValue={(v) => Math.round(v * 100) + '%'}
        />
      </div>
    );
  },
};

export const VerticalSlider: StoryObj = {
  render: () => {
    const [value, setValue] = useState(0.7);
    return (
      <div style={{ padding: 20, background: colors.bg.surface, borderRadius: 8 }}>
        <Slider
          value={value}
          onChange={setValue}
          orientation="vertical"
          length={150}
          thickness={16}
          color="coral"
          showValue
          label="VOL"
        />
      </div>
    );
  },
};

export const BipolarSlider: StoryObj = {
  render: () => {
    const [value, setValue] = useState(0.5);
    return (
      <div style={{ padding: 20, background: colors.bg.surface, borderRadius: 8 }}>
        <Slider
          value={value}
          onChange={setValue}
          orientation="horizontal"
          length={180}
          thickness={10}
          color="green"
          bipolar
          showValue
          label="PAN"
          formatValue={(v) => {
            const pan = Math.round((v - 0.5) * 200);
            return pan === 0 ? 'C' : pan > 0 ? `R${pan}` : `L${Math.abs(pan)}`;
          }}
        />
      </div>
    );
  },
};

export const SliderColors: StoryObj = {
  render: () => {
    const [values, setValues] = useState({
      coral: 0.8,
      orange: 0.6,
      yellow: 0.4,
      green: 0.7,
      cyan: 0.5,
      purple: 0.3,
    });
    return (
      <div style={{ padding: 20, background: colors.bg.surface, borderRadius: 8, display: 'flex', flexDirection: 'column', gap: 16 }}>
        {Object.entries(values).map(([color, value]) => (
          <Slider
            key={color}
            value={value}
            onChange={(v) => setValues((prev) => ({ ...prev, [color]: v }))}
            orientation="horizontal"
            length={160}
            thickness={10}
            color={color as keyof typeof colors.accent}
            label={color.toUpperCase()}
          />
        ))}
      </div>
    );
  },
};

// === OPTION PICKER STORIES ===

export const HorizontalOptions: StoryObj = {
  render: () => {
    const [value, setValue] = useState('LP');
    return (
      <div style={{ padding: 20, background: colors.bg.surface, borderRadius: 8 }}>
        <OptionPicker
          options={['LP', 'HP', 'BP', 'Notch']}
          value={value}
          onChange={setValue}
          layout="horizontal"
          color="orange"
          label="FILTER TYPE"
        />
      </div>
    );
  },
};

export const GridOptions: StoryObj = {
  render: () => {
    const [value, setValue] = useState('Mono');
    return (
      <div style={{ padding: 20, background: colors.bg.surface, borderRadius: 8, width: 180 }}>
        <OptionPicker
          options={['Mono', 'Poly', 'Unison', 'Legato']}
          value={value}
          onChange={setValue}
          layout="grid"
          columns={2}
          color="cyan"
          label="VOICE MODE"
        />
      </div>
    );
  },
};

export const VerticalOptions: StoryObj = {
  render: () => {
    const [value, setValue] = useState('x1');
    return (
      <div style={{ padding: 20, background: colors.bg.surface, borderRadius: 8 }}>
        <OptionPicker
          options={['x1', 'x2', 'x4', 'x8']}
          value={value}
          onChange={setValue}
          layout="vertical"
          size="sm"
          color="purple"
          label="OVERSAMPLE"
        />
      </div>
    );
  },
};

// === WAVEFORM PICKER STORIES ===

export const WaveformSelector: StoryObj = {
  render: () => {
    const [value, setValue] = useState<WaveformShape>('saw');
    return (
      <div style={{ padding: 20, background: colors.bg.surface, borderRadius: 8 }}>
        <WaveformPicker
          value={value}
          onChange={setValue}
          color="yellow"
          iconSize={28}
          label="OSC 1 WAVE"
        />
      </div>
    );
  },
};

export const WaveformVertical: StoryObj = {
  render: () => {
    const [value, setValue] = useState<WaveformShape>('sine');
    return (
      <div style={{ padding: 20, background: colors.bg.surface, borderRadius: 8 }}>
        <WaveformPicker
          value={value}
          onChange={setValue}
          options={['sine', 'triangle', 'saw', 'square']}
          layout="vertical"
          color="coral"
          iconSize={24}
          label="LFO SHAPE"
        />
      </div>
    );
  },
};

export const WaveformLarge: StoryObj = {
  render: () => {
    const [value, setValue] = useState<WaveformShape>('square');
    return (
      <div style={{ padding: 20, background: colors.bg.surface, borderRadius: 8 }}>
        <WaveformPicker
          value={value}
          onChange={setValue}
          color="green"
          iconSize={48}
          label="SUB OSCILLATOR"
        />
      </div>
    );
  },
};

// === COMBINED EXAMPLE ===

export const LFOModule: StoryObj = {
  render: () => {
    const [shape, setShape] = useState<WaveformShape>('sine');
    const [rate, setRate] = useState(0.3);
    const [depth, setDepth] = useState(0.5);
    const [sync, setSync] = useState('Free');

    return (
      <div
        style={{
          padding: 16,
          background: colors.bg.surface,
          borderRadius: 8,
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
          width: 200,
        }}
      >
        <div
          style={{
            fontSize: 11,
            fontFamily: 'var(--font-mono)',
            color: colors.text.secondary,
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            borderBottom: `1px solid ${colors.bg.border}`,
            paddingBottom: 8,
          }}
        >
          LFO 1
        </div>

        <WaveformPicker
          value={shape}
          onChange={setShape}
          options={['sine', 'triangle', 'saw', 'square']}
          color="yellow"
          iconSize={24}
          label="SHAPE"
        />

        <OptionPicker
          options={['Free', '1/4', '1/8', '1/16']}
          value={sync}
          onChange={setSync}
          layout="horizontal"
          size="sm"
          color="cyan"
          label="SYNC"
        />

        <Slider
          value={rate}
          onChange={setRate}
          length={168}
          thickness={8}
          color="orange"
          showValue
          label="RATE"
          formatValue={(v) => (v * 20).toFixed(1) + ' Hz'}
        />

        <Slider
          value={depth}
          onChange={setDepth}
          length={168}
          thickness={8}
          color="coral"
          showValue
          label="DEPTH"
          formatValue={(v) => Math.round(v * 100) + '%'}
        />
      </div>
    );
  },
};

export const OscillatorModule: StoryObj = {
  render: () => {
    const [wave, setWave] = useState<WaveformShape>('saw');
    const [level, setLevel] = useState(0.8);
    const [pitch, setPitch] = useState(0.5);
    const [fine, setFine] = useState(0.5);

    return (
      <div
        style={{
          padding: 16,
          background: colors.bg.surface,
          borderRadius: 8,
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
          width: 220,
        }}
      >
        <div
          style={{
            fontSize: 11,
            fontFamily: 'var(--font-mono)',
            color: colors.text.secondary,
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            borderBottom: `1px solid ${colors.bg.border}`,
            paddingBottom: 8,
          }}
        >
          OSC 1
        </div>

        <WaveformPicker
          value={wave}
          onChange={setWave}
          options={['sine', 'triangle', 'saw', 'square']}
          color="yellow"
          iconSize={28}
        />

        <Slider
          value={level}
          onChange={setLevel}
          length={188}
          thickness={10}
          color="coral"
          showValue
          label="LEVEL"
          formatValue={(v) => Math.round(v * 100) + '%'}
        />

        <Slider
          value={pitch}
          onChange={setPitch}
          length={188}
          thickness={10}
          color="green"
          bipolar
          showValue
          label="PITCH"
          formatValue={(v) => {
            const st = Math.round((v - 0.5) * 48);
            return (st >= 0 ? '+' : '') + st + ' st';
          }}
        />

        <Slider
          value={fine}
          onChange={setFine}
          length={188}
          thickness={10}
          color="cyan"
          bipolar
          showValue
          label="FINE"
          formatValue={(v) => {
            const ct = Math.round((v - 0.5) * 200);
            return (ct >= 0 ? '+' : '') + ct + ' ct';
          }}
        />
      </div>
    );
  },
};
