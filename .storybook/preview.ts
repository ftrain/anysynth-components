import type { Preview } from '@storybook/react';
import '../src/theme/global.css';

const preview: Preview = {
  parameters: {
    backgrounds: {
      default: 'synth-dark',
      values: [
        { name: 'synth-dark', value: '#0a0a0a' },
        { name: 'synth-mid', value: '#1a1a1a' },
        { name: 'synth-surface', value: '#2a2a2a' },
      ],
    },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    layout: 'centered',
  },
  globalTypes: {
    viewport: {
      description: 'Device viewport',
      defaultValue: 'desktop',
      toolbar: {
        title: 'Viewport',
        icon: 'mobile',
        items: ['mobile', 'tablet', 'desktop'],
        dynamicTitle: true,
      },
    },
  },
};

export default preview;
