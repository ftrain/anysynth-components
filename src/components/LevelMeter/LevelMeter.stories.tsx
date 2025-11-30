import type { Meta, StoryObj } from '@storybook/react';
import { useState, useEffect } from 'react';
import { LevelMeter } from './LevelMeter';
import type { MeterData } from '../../types';

const meta: Meta<typeof LevelMeter> = {
  title: 'Visualization/LevelMeter',
  component: LevelMeter,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof LevelMeter>;

// Animated meter simulation
const AnimatedMeter = (props: Partial<React.ComponentProps<typeof LevelMeter>>) => {
  const [value, setValue] = useState<MeterData>({ peak: 0.5, rms: 0.3, clip: false });

  useEffect(() => {
    const interval = setInterval(() => {
      const rms = 0.2 + Math.random() * 0.4;
      const peak = rms + Math.random() * 0.2;
      setValue({
        peak: Math.min(1, peak),
        rms,
        clip: peak > 0.95,
      });
    }, 50);
    return () => clearInterval(interval);
  }, []);

  return <LevelMeter value={value} {...props} />;
};

// Stereo animated meter
const StereoAnimatedMeter = (props: Partial<React.ComponentProps<typeof LevelMeter>>) => {
  const [value, setValue] = useState<[MeterData, MeterData]>([
    { peak: 0.5, rms: 0.3, clip: false },
    { peak: 0.5, rms: 0.3, clip: false },
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      const makeChannel = (): MeterData => {
        const rms = 0.2 + Math.random() * 0.4;
        const peak = rms + Math.random() * 0.2;
        return { peak: Math.min(1, peak), rms, clip: peak > 0.95 };
      };
      setValue([makeChannel(), makeChannel()]);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  return <LevelMeter value={value} {...props} />;
};

export const Default: Story = {
  render: () => <AnimatedMeter />,
};

export const Stereo: Story = {
  render: () => <StereoAnimatedMeter />,
};

export const Horizontal: Story = {
  render: () => <AnimatedMeter orientation="horizontal" height={24} width={200} />,
};

export const HorizontalStereo: Story = {
  render: () => <StereoAnimatedMeter orientation="horizontal" height={40} width={200} />,
};

export const WithLabel: Story = {
  render: () => <AnimatedMeter label="OUT" />,
};

export const StereoWithLabel: Story = {
  render: () => <StereoAnimatedMeter label="MAIN" />,
};

export const Tall: Story = {
  render: () => <AnimatedMeter height={300} />,
};

export const NoPeak: Story = {
  render: () => <AnimatedMeter showPeak={false} />,
};

export const NoDb: Story = {
  render: () => <AnimatedMeter showDb={false} />,
};

export const Static: Story = {
  render: () => <LevelMeter value={{ peak: 0.7, rms: 0.5, clip: false }} />,
};

export const Clipping: Story = {
  render: () => <LevelMeter value={{ peak: 1.0, rms: 0.9, clip: true }} />,
};

export const Quiet: Story = {
  render: () => <LevelMeter value={{ peak: 0.1, rms: 0.05, clip: false }} />,
};

export const MasterSection: Story = {
  name: 'Master Section Layout',
  render: () => (
    <div style={{ display: 'flex', gap: 16, padding: 16, background: '#1a1a1a', borderRadius: 8 }}>
      <StereoAnimatedMeter label="L/R" />
    </div>
  ),
};
