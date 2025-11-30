import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { ModMatrix, ModSource, ModDestination, ModRoute } from './ModMatrix';
import { colors } from '../../theme/tokens';

const meta: Meta<typeof ModMatrix> = {
  title: 'Modulation/ModMatrix',
  component: ModMatrix,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

const defaultSources: ModSource[] = [
  { id: 'lfo1', name: 'LFO 1', shortName: 'LFO1', color: colors.accent.cyan },
  { id: 'lfo2', name: 'LFO 2', shortName: 'LFO2', color: colors.accent.coral },
  { id: 'env1', name: 'Envelope 1', shortName: 'ENV1', color: colors.accent.orange },
  { id: 'env2', name: 'Envelope 2', shortName: 'ENV2', color: colors.accent.yellow },
  { id: 'vel', name: 'Velocity', shortName: 'VEL', color: colors.accent.green },
  { id: 'mod', name: 'Mod Wheel', shortName: 'MOD', color: colors.accent.purple },
];

// Mobile-friendly: 4 destinations max
const defaultDestinations: ModDestination[] = [
  { id: 'filter_cutoff', name: 'Filter Cutoff', shortName: 'CUT', category: 'Filter' },
  { id: 'filter_res', name: 'Filter Resonance', shortName: 'RES', category: 'Filter' },
  { id: 'amp_level', name: 'Amp Level', shortName: 'AMP', category: 'Amp' },
  { id: 'pan', name: 'Pan', shortName: 'PAN', category: 'Amp' },
];

export const Default: Story = {
  render: () => {
    const [routes, setRoutes] = useState<ModRoute[]>([
      { id: 'r1', sourceId: 'lfo1', destId: 'filter_cutoff', amount: 0.5, enabled: true },
      { id: 'r2', sourceId: 'env1', destId: 'amp_level', amount: 1, enabled: true },
      { id: 'r3', sourceId: 'vel', destId: 'filter_res', amount: 0.3, enabled: true },
    ]);

    return (
      <ModMatrix
        sources={defaultSources}
        destinations={defaultDestinations}
        routes={routes}
        onChange={setRoutes}
        label="MOD MATRIX"
      />
    );
  },
};

export const ListView: Story = {
  render: () => {
    const [routes, setRoutes] = useState<ModRoute[]>([
      { id: 'r1', sourceId: 'lfo1', destId: 'filter_cutoff', amount: 0.5, enabled: true },
      { id: 'r2', sourceId: 'env1', destId: 'amp_level', amount: 1, enabled: true },
      { id: 'r3', sourceId: 'lfo2', destId: 'osc1_pitch', amount: -0.25, enabled: true },
      { id: 'r4', sourceId: 'mod', destId: 'filter_res', amount: 0.7, enabled: true },
    ]);

    return (
      <ModMatrix
        sources={defaultSources}
        destinations={defaultDestinations}
        routes={routes}
        onChange={setRoutes}
        label="MODULATION ROUTES"
        viewMode="list"
        bipolar={true}
      />
    );
  },
};

export const CompactGrid: Story = {
  render: () => {
    const compactSources: ModSource[] = [
      { id: 'lfo', name: 'LFO', color: colors.accent.cyan },
      { id: 'env', name: 'ENV', color: colors.accent.orange },
      { id: 'vel', name: 'VEL', color: colors.accent.green },
    ];

    const compactDests: ModDestination[] = [
      { id: 'pitch', name: 'Pitch' },
      { id: 'cutoff', name: 'Cutoff' },
      { id: 'level', name: 'Level' },
      { id: 'pan', name: 'Pan' },
    ];

    const [routes, setRoutes] = useState<ModRoute[]>([]);

    return (
      <ModMatrix
        sources={compactSources}
        destinations={compactDests}
        routes={routes}
        onChange={setRoutes}
        label="QUICK MOD"
        compact={true}
      />
    );
  },
};

export const ManyDestinations: Story = {
  render: () => {
    const extendedDests: ModDestination[] = [
      { id: 'osc1_pitch', name: 'OSC1 Pitch', shortName: 'O1-P' },
      { id: 'osc1_pw', name: 'OSC1 PW', shortName: 'O1-PW' },
      { id: 'osc1_level', name: 'OSC1 Level', shortName: 'O1-L' },
      { id: 'osc2_pitch', name: 'OSC2 Pitch', shortName: 'O2-P' },
      { id: 'osc2_pw', name: 'OSC2 PW', shortName: 'O2-PW' },
      { id: 'osc2_level', name: 'OSC2 Level', shortName: 'O2-L' },
      { id: 'flt_cut', name: 'Filter Cutoff', shortName: 'FLT-C' },
      { id: 'flt_res', name: 'Filter Res', shortName: 'FLT-R' },
      { id: 'flt_env', name: 'Filter Env', shortName: 'FLT-E' },
      { id: 'amp_lvl', name: 'Amp Level', shortName: 'AMP-L' },
      { id: 'amp_pan', name: 'Pan', shortName: 'PAN' },
      { id: 'lfo_rate', name: 'LFO Rate', shortName: 'LFO-R' },
    ];

    const [routes, setRoutes] = useState<ModRoute[]>([]);

    return (
      <div style={{ maxWidth: 600 }}>
        <ModMatrix
          sources={defaultSources}
          destinations={extendedDests}
          routes={routes}
          onChange={setRoutes}
          label="FULL MOD MATRIX"
          maxRoutes={32}
        />
      </div>
    );
  },
};

export const UnipolarOnly: Story = {
  render: () => {
    const [routes, setRoutes] = useState<ModRoute[]>([
      { id: 'r1', sourceId: 'env1', destId: 'amp_level', amount: 1, enabled: true },
    ]);

    return (
      <ModMatrix
        sources={defaultSources.slice(0, 4)}
        destinations={defaultDestinations.slice(0, 4)}
        routes={routes}
        onChange={setRoutes}
        label="UNIPOLAR MOD"
        bipolar={false}
        viewMode="list"
      />
    );
  },
};
