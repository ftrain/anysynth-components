import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { ParameterInspector, InspectorParameter } from './ParameterInspector';

const meta: Meta<typeof ParameterInspector> = {
  title: 'Debug/ParameterInspector',
  component: ParameterInspector,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof ParameterInspector>;

const createParameter = (overrides: Partial<InspectorParameter> = {}): InspectorParameter => ({
  id: 'param',
  name: 'Parameter',
  path: 'synth.param',
  value: 0.5,
  defaultValue: 0.5,
  min: 0,
  max: 100,
  type: 'continuous',
  ...overrides,
});

const sampleParameters: InspectorParameter[] = [
  createParameter({ id: 'cutoff', name: 'Cutoff', path: 'filter.cutoff', value: 0.7, min: 20, max: 20000, unit: 'Hz', category: 'Filter' }),
  createParameter({ id: 'resonance', name: 'Resonance', path: 'filter.resonance', value: 0.3, max: 100, unit: '%', category: 'Filter' }),
  createParameter({ id: 'attack', name: 'Attack', path: 'env.attack', value: 0.01, max: 2000, unit: 'ms', category: 'Envelope' }),
  createParameter({ id: 'decay', name: 'Decay', path: 'env.decay', value: 0.2, max: 2000, unit: 'ms', category: 'Envelope' }),
  createParameter({ id: 'sustain', name: 'Sustain', path: 'env.sustain', value: 0.7, max: 100, unit: '%', category: 'Envelope' }),
  createParameter({ id: 'release', name: 'Release', path: 'env.release', value: 0.5, max: 4000, unit: 'ms', category: 'Envelope' }),
];

const parametersWithOptions: InspectorParameter[] = [
  ...sampleParameters.slice(0, 2),
  createParameter({
    id: 'filterType',
    name: 'Filter Type',
    path: 'filter.type',
    value: 0,
    type: 'enum',
    enumValues: ['LP', 'HP', 'BP', 'Notch'],
    category: 'Filter',
  }),
];

// Interactive wrapper
const InspectorWrapper = (props: Partial<React.ComponentProps<typeof ParameterInspector>>) => {
  const [params, setParams] = useState<InspectorParameter[]>(props.parameters ?? sampleParameters);

  const handleChange = (path: string, value: number) => {
    setParams(p => p.map(param =>
      param.path === path ? { ...param, value } : param
    ));
  };

  return (
    <ParameterInspector
      parameters={params}
      onChange={handleChange}
      {...props}
    />
  );
};

export const Default: Story = {
  render: () => <InspectorWrapper />,
};

export const WithOptions: Story = {
  render: () => <InspectorWrapper parameters={parametersWithOptions} />,
};

export const CustomTitle: Story = {
  render: () => <InspectorWrapper title="FILTER PARAMS" />,
};

export const SingleParameter: Story = {
  render: () => (
    <InspectorWrapper
      parameters={[sampleParameters[0]]}
      title="CUTOFF"
    />
  ),
};

export const ManyParameters: Story = {
  render: () => {
    const categories = ['Oscillator', 'Filter', 'Envelope', 'LFO', 'Effects', 'Mixer'];
    const manyParams: InspectorParameter[] = [];
    for (let i = 0; i < 20; i++) {
      const category = categories[i % categories.length];
      manyParams.push(createParameter({
        id: `param${i}`,
        name: `Parameter ${i + 1}`,
        path: `${category.toLowerCase()}.param${i}`,
        value: Math.random(),
        category,
      }));
    }
    return <InspectorWrapper parameters={manyParams} title="ALL PARAMETERS" />;
  },
};

export const Compact: Story = {
  render: () => <InspectorWrapper compact />,
};

export const WithMidiLearn: Story = {
  render: () => {
    const params = sampleParameters.map(p => ({ ...p, modulatable: true }));
    return <InspectorWrapper parameters={params} midiLearning={null} />;
  },
};

export const FilteredByCategory: Story = {
  render: () => <InspectorWrapper categoryFilter="Filter" title="FILTER ONLY" />,
};

export const DeveloperDebug: Story = {
  name: 'Developer Debug Panel',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <InspectorWrapper parameters={sampleParameters.slice(0, 2)} title="FILTER" />
      <InspectorWrapper parameters={sampleParameters.slice(2, 6)} title="ENVELOPE" />
    </div>
  ),
};
