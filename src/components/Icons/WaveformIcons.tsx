/**
 * WaveformIcons - SVG Icon Library
 *
 * Reusable SVG icons for waveforms, shapes, and synth functions.
 * All icons use currentColor for easy theming.
 */

import React from 'react';

interface IconProps {
  size?: number;
  color?: string;
  className?: string;
  strokeWidth?: number;
}

const defaultProps: IconProps = {
  size: 24,
  strokeWidth: 2,
};

// Oscillator Waveforms

export const SineWave: React.FC<IconProps> = ({
  size = defaultProps.size,
  color = 'currentColor',
  strokeWidth = defaultProps.strokeWidth,
  className,
}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path
      d="M2 12 C 2 12, 6 4, 12 12 S 22 12, 22 12"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      fill="none"
    />
  </svg>
);

export const SawWave: React.FC<IconProps> = ({
  size = defaultProps.size,
  color = 'currentColor',
  strokeWidth = defaultProps.strokeWidth,
  className,
}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path
      d="M2 18 L12 6 L12 18 L22 6"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  </svg>
);

export const SquareWave: React.FC<IconProps> = ({
  size = defaultProps.size,
  color = 'currentColor',
  strokeWidth = defaultProps.strokeWidth,
  className,
}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path
      d="M2 18 L2 6 L12 6 L12 18 L22 18 L22 6"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  </svg>
);

export const TriangleWave: React.FC<IconProps> = ({
  size = defaultProps.size,
  color = 'currentColor',
  strokeWidth = defaultProps.strokeWidth,
  className,
}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path
      d="M2 12 L7 6 L17 18 L22 12"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  </svg>
);

export const NoiseWave: React.FC<IconProps> = ({
  size = defaultProps.size,
  color = 'currentColor',
  strokeWidth = defaultProps.strokeWidth,
  className,
}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path
      d="M2 12 L4 8 L6 15 L8 10 L10 14 L12 7 L14 16 L16 9 L18 13 L20 11 L22 12"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  </svg>
);

export const PulseWave: React.FC<IconProps> = ({
  size = defaultProps.size,
  color = 'currentColor',
  strokeWidth = defaultProps.strokeWidth,
  className,
}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path
      d="M2 18 L2 6 L8 6 L8 18 L14 18 L14 6 L20 6 L20 18 L22 18"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  </svg>
);

// LFO/Modulation Shapes

export const RampUp: React.FC<IconProps> = ({
  size = defaultProps.size,
  color = 'currentColor',
  strokeWidth = defaultProps.strokeWidth,
  className,
}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path
      d="M2 18 L12 6 L12 18 L22 6"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  </svg>
);

export const RampDown: React.FC<IconProps> = ({
  size = defaultProps.size,
  color = 'currentColor',
  strokeWidth = defaultProps.strokeWidth,
  className,
}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path
      d="M2 6 L12 18 L12 6 L22 18"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  </svg>
);

export const SampleHold: React.FC<IconProps> = ({
  size = defaultProps.size,
  color = 'currentColor',
  strokeWidth = defaultProps.strokeWidth,
  className,
}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path
      d="M2 14 L6 14 L6 8 L10 8 L10 16 L14 16 L14 10 L18 10 L18 14 L22 14"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  </svg>
);

// Filter Types

export const FilterLowpass: React.FC<IconProps> = ({
  size = defaultProps.size,
  color = 'currentColor',
  strokeWidth = defaultProps.strokeWidth,
  className,
}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path
      d="M2 8 L10 8 Q 14 8 16 12 T 22 18"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      fill="none"
    />
  </svg>
);

export const FilterHighpass: React.FC<IconProps> = ({
  size = defaultProps.size,
  color = 'currentColor',
  strokeWidth = defaultProps.strokeWidth,
  className,
}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path
      d="M2 18 Q 6 18 8 14 T 14 8 L22 8"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      fill="none"
    />
  </svg>
);

export const FilterBandpass: React.FC<IconProps> = ({
  size = defaultProps.size,
  color = 'currentColor',
  strokeWidth = defaultProps.strokeWidth,
  className,
}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path
      d="M2 18 Q 6 18 8 8 L 16 8 Q 18 18 22 18"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      fill="none"
    />
  </svg>
);

export const FilterNotch: React.FC<IconProps> = ({
  size = defaultProps.size,
  color = 'currentColor',
  strokeWidth = defaultProps.strokeWidth,
  className,
}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path
      d="M2 8 L8 8 Q 10 8 11 18 L 13 18 Q 14 8 16 8 L 22 8"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      fill="none"
    />
  </svg>
);

// Transport Controls

export const PlayIcon: React.FC<IconProps> = ({
  size = defaultProps.size,
  color = 'currentColor',
  className,
}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color} className={className}>
    <path d="M8 5v14l11-7z" />
  </svg>
);

export const PauseIcon: React.FC<IconProps> = ({
  size = defaultProps.size,
  color = 'currentColor',
  className,
}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color} className={className}>
    <rect x="6" y="4" width="4" height="16" rx="1" />
    <rect x="14" y="4" width="4" height="16" rx="1" />
  </svg>
);

export const StopIcon: React.FC<IconProps> = ({
  size = defaultProps.size,
  color = 'currentColor',
  className,
}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color} className={className}>
    <rect x="6" y="6" width="12" height="12" rx="1" />
  </svg>
);

export const RecordIcon: React.FC<IconProps> = ({
  size = defaultProps.size,
  color = 'currentColor',
  className,
}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color} className={className}>
    <circle cx="12" cy="12" r="6" />
  </svg>
);

export const LoopIcon: React.FC<IconProps> = ({
  size = defaultProps.size,
  color = 'currentColor',
  strokeWidth = defaultProps.strokeWidth,
  className,
}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path
      d="M17 2l4 4-4 4M7 22l-4-4 4-4M3 6h18M3 18h18"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// Misc Controls

export const PowerIcon: React.FC<IconProps> = ({
  size = defaultProps.size,
  color = 'currentColor',
  strokeWidth = defaultProps.strokeWidth,
  className,
}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path
      d="M12 2v10M18.36 6.64a9 9 0 11-12.73 0"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
    />
  </svg>
);

export const LinkIcon: React.FC<IconProps> = ({
  size = defaultProps.size,
  color = 'currentColor',
  strokeWidth = defaultProps.strokeWidth,
  className,
}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path
      d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
    />
  </svg>
);

export const SyncIcon: React.FC<IconProps> = ({
  size = defaultProps.size,
  color = 'currentColor',
  strokeWidth = defaultProps.strokeWidth,
  className,
}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path
      d="M4 4v5h5M20 20v-5h-5M20.49 9A9 9 0 005.64 5.64L4 7M3.51 15a9 9 0 0014.85 3.36L20 17"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// Icon Map for easy access
export const WaveformIconMap: Record<string, React.FC<IconProps>> = {
  sine: SineWave,
  saw: SawWave,
  square: SquareWave,
  triangle: TriangleWave,
  noise: NoiseWave,
  pulse: PulseWave,
  rampUp: RampUp,
  rampDown: RampDown,
  sampleHold: SampleHold,
};

export const FilterIconMap: Record<string, React.FC<IconProps>> = {
  lowpass: FilterLowpass,
  highpass: FilterHighpass,
  bandpass: FilterBandpass,
  notch: FilterNotch,
};

export const TransportIconMap: Record<string, React.FC<IconProps>> = {
  play: PlayIcon,
  pause: PauseIcon,
  stop: StopIcon,
  record: RecordIcon,
  loop: LoopIcon,
};
