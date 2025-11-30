import type { Meta, StoryObj } from '@storybook/react';
import { useState, useEffect, useMemo } from 'react';
import { Oscilloscope } from './Oscilloscope';
import { colors } from '../../theme/tokens';

const meta: Meta<typeof Oscilloscope> = {
  title: 'Visualization/Oscilloscope',
  component: Oscilloscope,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Oscilloscope>;

// Generate sine wave data
const generateSineWave = (frequency: number, sampleRate: number, samples: number, phase: number = 0): Float32Array => {
  const data = new Float32Array(samples);
  for (let i = 0; i < samples; i++) {
    data[i] = Math.sin(2 * Math.PI * frequency * (i / sampleRate) + phase);
  }
  return data;
};

// Generate frequency spectrum data (simulated)
const generateSpectrum = (): Float32Array => {
  const data = new Float32Array(128);
  for (let i = 0; i < 128; i++) {
    // Simulate a frequency spectrum with some peaks
    const freq = (i / 128) * 20000;
    let value = Math.exp(-freq / 2000) * 0.8; // Low-pass rolloff
    if (i > 10 && i < 15) value += 0.5; // Fundamental
    if (i > 20 && i < 25) value += 0.3; // First harmonic
    if (i > 40 && i < 45) value += 0.15; // Second harmonic
    data[i] = Math.min(1, value + Math.random() * 0.05);
  }
  return data;
};

// Animated scope
const AnimatedScope = (props: Partial<React.ComponentProps<typeof Oscilloscope>>) => {
  const [phase, setPhase] = useState(0);
  const frequency = 440; // A4
  const sampleRate = 44100;
  const samples = 512;

  useEffect(() => {
    const interval = setInterval(() => {
      setPhase(p => (p + 0.1) % (Math.PI * 2));
    }, 50);
    return () => clearInterval(interval);
  }, []);

  const data = useMemo(() => generateSineWave(frequency, sampleRate, samples, phase), [phase]);

  return <Oscilloscope data={data} {...props} />;
};

// Animated spectrum
const AnimatedSpectrum = (props: Partial<React.ComponentProps<typeof Oscilloscope>>) => {
  const [data, setData] = useState<Float32Array>(() => generateSpectrum());

  useEffect(() => {
    const interval = setInterval(() => {
      setData(generateSpectrum());
    }, 100);
    return () => clearInterval(interval);
  }, []);

  return <Oscilloscope frequencyData={data} mode="spectrum" {...props} />;
};

export const Default: Story = {
  render: () => <AnimatedScope />,
};

export const Spectrum: Story = {
  render: () => <AnimatedSpectrum />,
};

export const Large: Story = {
  render: () => <AnimatedScope width={400} height={200} />,
};

export const Compact: Story = {
  render: () => <AnimatedScope compact />,
};

export const NoGrid: Story = {
  render: () => <AnimatedScope showGrid={false} />,
};

export const NoLabels: Story = {
  render: () => <AnimatedScope showLabels={false} />,
};

export const CustomColor: Story = {
  render: () => <AnimatedScope color={colors.accent.coral} />,
};

export const GreenScope: Story = {
  render: () => <AnimatedScope color={colors.accent.green} />,
};

export const WithLabel: Story = {
  render: () => <AnimatedScope label="OSC 1" />,
};

export const SpectrumWithLabel: Story = {
  render: () => <AnimatedSpectrum label="FFT" />,
};

export const WideSpectrum: Story = {
  render: () => <AnimatedSpectrum width={400} height={120} />,
};

export const StaticSine: Story = {
  render: () => {
    const data = generateSineWave(440, 44100, 512, 0);
    return <Oscilloscope data={data} />;
  },
};

export const StaticSquare: Story = {
  render: () => {
    const data = new Float32Array(512);
    for (let i = 0; i < 512; i++) {
      data[i] = i % 64 < 32 ? 0.8 : -0.8;
    }
    return <Oscilloscope data={data} />;
  },
};

export const OutputSection: Story = {
  name: 'Output Section Layout',
  render: () => (
    <div style={{ display: 'flex', gap: 16, padding: 16, background: '#1a1a1a', borderRadius: 8 }}>
      <AnimatedScope label="SCOPE" width={150} height={80} compact />
      <AnimatedSpectrum label="SPECTRUM" width={150} height={80} compact />
    </div>
  ),
};
