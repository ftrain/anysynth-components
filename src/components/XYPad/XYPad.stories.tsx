import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { XYPad } from './XYPad';
import { colors } from '../../theme/tokens';
import { expect, within } from '@storybook/test';

const meta: Meta<typeof XYPad> = {
  title: 'Controls/XYPad',
  component: XYPad,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof XYPad>;

// Interactive wrapper
const XYPadWrapper = (props: Partial<React.ComponentProps<typeof XYPad>>) => {
  const [x, setX] = useState(props.x ?? 0.5);
  const [y, setY] = useState(props.y ?? 0.5);
  return (
    <XYPad
      x={x}
      y={y}
      onChange={(newX, newY) => {
        setX(newX);
        setY(newY);
      }}
      {...props}
    />
  );
};

export const Default: Story = {
  render: () => <XYPadWrapper />,
};

export const FilterControl: Story = {
  render: () => (
    <XYPadWrapper
      xLabel="CUTOFF"
      yLabel="RES"
      xColor={colors.accent.orange}
      yColor={colors.accent.coral}
      label="FILTER"
    />
  ),
};

export const PanVolume: Story = {
  render: () => (
    <XYPadWrapper
      xLabel="PAN"
      yLabel="VOL"
      xColor={colors.accent.cyan}
      yColor={colors.accent.green}
      bipolar
      label="OUTPUT"
    />
  ),
};

export const WithSpringReturn: Story = {
  render: () => <XYPadWrapper springReturn />,
};

export const Large: Story = {
  render: () => <XYPadWrapper size={300} />,
};

export const Compact: Story = {
  render: () => <XYPadWrapper size={120} />,
};

export const NoGrid: Story = {
  render: () => <XYPadWrapper gridDivisions={0} />,
};

export const FineGrid: Story = {
  render: () => <XYPadWrapper gridDivisions={8} />,
};

export const NoCrosshairs: Story = {
  render: () => <XYPadWrapper showCrosshairs={false} />,
};

export const NoValues: Story = {
  render: () => <XYPadWrapper showValues={false} />,
};

export const BipolarMode: Story = {
  render: () => (
    <XYPadWrapper
      bipolar
      xLabel="PAN"
      yLabel="PITCH"
      xColor={colors.accent.purple}
      yColor={colors.accent.yellow}
    />
  ),
};

export const EffectControl: Story = {
  name: 'Effect XY Control',
  render: () => (
    <XYPadWrapper
      xLabel="TIME"
      yLabel="FEEDBACK"
      xColor={colors.accent.teal}
      yColor={colors.accent.pink}
      label="DELAY"
      size={180}
    />
  ),
};

export const ModulationMatrix: Story = {
  name: 'Dual XY Pads',
  render: () => (
    <div style={{ display: 'flex', gap: 16, padding: 16, background: '#1a1a1a', borderRadius: 8 }}>
      <XYPadWrapper
        xLabel="X"
        yLabel="Y"
        label="MOD 1"
        size={150}
        xColor={colors.accent.orange}
        yColor={colors.accent.coral}
      />
      <XYPadWrapper
        xLabel="X"
        yLabel="Y"
        label="MOD 2"
        size={150}
        xColor={colors.accent.cyan}
        yColor={colors.accent.purple}
      />
    </div>
  ),
};

// Interactive test
export const InteractionTest: Story = {
  render: () => <XYPadWrapper />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Check that labels are present
    expect(canvas.getByText('X')).toBeInTheDocument();
    expect(canvas.getByText('Y')).toBeInTheDocument();
  },
};
