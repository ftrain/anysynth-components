import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { ModWheel } from './ModWheel';
import { colors } from '../../theme/tokens';
import { expect, within } from '@storybook/test';

const meta: Meta<typeof ModWheel> = {
  title: 'Controls/ModWheel',
  component: ModWheel,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof ModWheel>;

// Interactive wrapper
const ModWheelWrapper = (props: Partial<React.ComponentProps<typeof ModWheel>>) => {
  const [value, setValue] = useState(props.value ?? 0);
  return <ModWheel value={value} onChange={setValue} {...props} />;
};

export const Default: Story = {
  render: () => <ModWheelWrapper />,
};

export const PitchBend: Story = {
  render: () => (
    <ModWheelWrapper
      label="PITCH"
      value={0.5}
      bipolar
      springReturn="center"
      color={colors.accent.orange}
    />
  ),
};

export const WithSpringReturnCenter: Story = {
  render: () => <ModWheelWrapper springReturn="center" value={0.5} bipolar />,
};

export const WithSpringReturnZero: Story = {
  render: () => <ModWheelWrapper springReturn="zero" />,
};

export const Horizontal: Story = {
  render: () => (
    <ModWheelWrapper
      orientation="horizontal"
      width={160}
      height={48}
      label="EXPRESSION"
    />
  ),
};

export const CustomColor: Story = {
  render: () => <ModWheelWrapper color={colors.accent.purple} label="FILTER" />,
};

export const NoValue: Story = {
  render: () => <ModWheelWrapper showValue={false} />,
};

export const Compact: Story = {
  render: () => <ModWheelWrapper height={100} width={36} />,
};

export const Large: Story = {
  render: () => <ModWheelWrapper height={250} width={60} />,
};

export const PerformanceControls: Story = {
  name: 'Performance Layout',
  render: () => {
    const [pitch, setPitch] = useState(0.5);
    const [mod, setMod] = useState(0);
    return (
      <div style={{ display: 'flex', gap: 24, padding: 16, background: '#1a1a1a', borderRadius: 8 }}>
        <ModWheel
          value={pitch}
          onChange={setPitch}
          label="PITCH"
          bipolar
          springReturn="center"
          color={colors.accent.orange}
        />
        <ModWheel
          value={mod}
          onChange={setMod}
          label="MOD"
          color={colors.accent.cyan}
        />
      </div>
    );
  },
};

// Interactive test
export const InteractionTest: Story = {
  render: () => <ModWheelWrapper />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Find the wheel by its label
    const label = canvas.getByText('MOD');
    expect(label).toBeInTheDocument();

    // The component should render a value display
    const valueDisplay = canvas.getByText('0');
    expect(valueDisplay).toBeInTheDocument();
  },
};
