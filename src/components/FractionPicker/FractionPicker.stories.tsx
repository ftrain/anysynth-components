import type { Meta, StoryObj } from '@storybook/react';
import { FractionPicker } from './FractionPicker';

const meta: Meta<typeof FractionPicker> = {
  title: 'Musical Input/FractionPicker',
  component: FractionPicker,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    numerator: 1,
    denominator: 4,
    label: 'TIME',
  },
};

export const WithPresets: Story = {
  args: {
    numerator: 1,
    denominator: 4,
    label: 'DIVISION',
    presets: [
      { numerator: 1, denominator: 1, label: '1' },
      { numerator: 1, denominator: 2, label: '1/2' },
      { numerator: 1, denominator: 4, label: '1/4' },
      { numerator: 1, denominator: 8, label: '1/8' },
      { numerator: 1, denominator: 16, label: '1/16' },
      { numerator: 1, denominator: 32, label: '1/32' },
      { numerator: 3, denominator: 4, label: '3/4' },
      { numerator: 2, denominator: 3, label: '2/3' },
    ],
  },
};

export const TimeSignature: Story = {
  args: {
    numerator: 4,
    denominator: 4,
    label: 'TIME SIG',
    min: 1,
    max: 16,
    presets: [
      { numerator: 4, denominator: 4 },
      { numerator: 3, denominator: 4 },
      { numerator: 6, denominator: 8 },
      { numerator: 5, denominator: 4 },
      { numerator: 7, denominator: 8 },
      { numerator: 12, denominator: 8 },
    ],
  },
};

export const LargeSize: Story = {
  args: {
    numerator: 3,
    denominator: 16,
    label: 'RATE',
    size: 300,
  },
};

export const SmallSize: Story = {
  args: {
    numerator: 1,
    denominator: 8,
    label: 'SWING',
    size: 150,
  },
};

export const DelayTime: Story = {
  args: {
    numerator: 3,
    denominator: 8,
    label: 'DELAY SYNC',
    presets: [
      { numerator: 1, denominator: 8, label: '1/8' },
      { numerator: 1, denominator: 4, label: '1/4' },
      { numerator: 3, denominator: 8, label: '3/8' },
      { numerator: 1, denominator: 2, label: '1/2' },
      { numerator: 3, denominator: 4, label: '3/4 dot' },
      { numerator: 1, denominator: 6, label: '1/8T' },
      { numerator: 1, denominator: 3, label: '1/4T' },
    ],
  },
};
