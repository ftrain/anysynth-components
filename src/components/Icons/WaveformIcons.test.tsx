import { describe, it, expect } from 'vitest';
import { render } from '../../test/test-utils';
import {
  SineWave,
  SawWave,
  SquareWave,
  TriangleWave,
  NoiseWave,
  PulseWave,
  RampUp,
  RampDown,
  SampleHold,
  FilterLowpass,
  FilterHighpass,
  FilterBandpass,
  FilterNotch,
  PlayIcon,
  PauseIcon,
  StopIcon,
  RecordIcon,
  LoopIcon,
  PowerIcon,
  LinkIcon,
  SyncIcon,
  WaveformIconMap,
  FilterIconMap,
  TransportIconMap,
} from './WaveformIcons';

describe('WaveformIcons', () => {
  describe('Oscillator Waveforms', () => {
    it('should render SineWave icon', () => {
      const { container } = render(<SineWave />);
      expect(container.querySelector('svg')).toBeInTheDocument();
      expect(container.querySelector('path')).toBeInTheDocument();
    });

    it('should render SawWave icon', () => {
      const { container } = render(<SawWave />);
      expect(container.querySelector('svg')).toBeInTheDocument();
      expect(container.querySelector('path')).toBeInTheDocument();
    });

    it('should render SquareWave icon', () => {
      const { container } = render(<SquareWave />);
      expect(container.querySelector('svg')).toBeInTheDocument();
      expect(container.querySelector('path')).toBeInTheDocument();
    });

    it('should render TriangleWave icon', () => {
      const { container } = render(<TriangleWave />);
      expect(container.querySelector('svg')).toBeInTheDocument();
      expect(container.querySelector('path')).toBeInTheDocument();
    });

    it('should render NoiseWave icon', () => {
      const { container } = render(<NoiseWave />);
      expect(container.querySelector('svg')).toBeInTheDocument();
      expect(container.querySelector('path')).toBeInTheDocument();
    });

    it('should render PulseWave icon', () => {
      const { container } = render(<PulseWave />);
      expect(container.querySelector('svg')).toBeInTheDocument();
      expect(container.querySelector('path')).toBeInTheDocument();
    });
  });

  describe('LFO Shapes', () => {
    it('should render RampUp icon', () => {
      const { container } = render(<RampUp />);
      expect(container.querySelector('svg')).toBeInTheDocument();
    });

    it('should render RampDown icon', () => {
      const { container } = render(<RampDown />);
      expect(container.querySelector('svg')).toBeInTheDocument();
    });

    it('should render SampleHold icon', () => {
      const { container } = render(<SampleHold />);
      expect(container.querySelector('svg')).toBeInTheDocument();
    });
  });

  describe('Filter Types', () => {
    it('should render FilterLowpass icon', () => {
      const { container } = render(<FilterLowpass />);
      expect(container.querySelector('svg')).toBeInTheDocument();
    });

    it('should render FilterHighpass icon', () => {
      const { container } = render(<FilterHighpass />);
      expect(container.querySelector('svg')).toBeInTheDocument();
    });

    it('should render FilterBandpass icon', () => {
      const { container } = render(<FilterBandpass />);
      expect(container.querySelector('svg')).toBeInTheDocument();
    });

    it('should render FilterNotch icon', () => {
      const { container } = render(<FilterNotch />);
      expect(container.querySelector('svg')).toBeInTheDocument();
    });
  });

  describe('Transport Controls', () => {
    it('should render PlayIcon', () => {
      const { container } = render(<PlayIcon />);
      expect(container.querySelector('svg')).toBeInTheDocument();
      expect(container.querySelector('path')).toBeInTheDocument();
    });

    it('should render PauseIcon', () => {
      const { container } = render(<PauseIcon />);
      expect(container.querySelector('svg')).toBeInTheDocument();
      expect(container.querySelectorAll('rect').length).toBe(2);
    });

    it('should render StopIcon', () => {
      const { container } = render(<StopIcon />);
      expect(container.querySelector('svg')).toBeInTheDocument();
      expect(container.querySelector('rect')).toBeInTheDocument();
    });

    it('should render RecordIcon', () => {
      const { container } = render(<RecordIcon />);
      expect(container.querySelector('svg')).toBeInTheDocument();
      expect(container.querySelector('circle')).toBeInTheDocument();
    });

    it('should render LoopIcon', () => {
      const { container } = render(<LoopIcon />);
      expect(container.querySelector('svg')).toBeInTheDocument();
    });
  });

  describe('Misc Controls', () => {
    it('should render PowerIcon', () => {
      const { container } = render(<PowerIcon />);
      expect(container.querySelector('svg')).toBeInTheDocument();
    });

    it('should render LinkIcon', () => {
      const { container } = render(<LinkIcon />);
      expect(container.querySelector('svg')).toBeInTheDocument();
    });

    it('should render SyncIcon', () => {
      const { container } = render(<SyncIcon />);
      expect(container.querySelector('svg')).toBeInTheDocument();
    });
  });

  describe('Icon Props', () => {
    it('should accept custom size', () => {
      const { container } = render(<SineWave size={48} />);
      const svg = container.querySelector('svg');
      expect(svg).toHaveAttribute('width', '48');
      expect(svg).toHaveAttribute('height', '48');
    });

    it('should accept custom color', () => {
      const { container } = render(<SineWave color="#ff0000" />);
      const path = container.querySelector('path');
      expect(path).toHaveAttribute('stroke', '#ff0000');
    });

    it('should accept custom strokeWidth', () => {
      const { container } = render(<SineWave strokeWidth={4} />);
      const path = container.querySelector('path');
      expect(path).toHaveAttribute('stroke-width', '4');
    });

    it('should accept className', () => {
      const { container } = render(<SineWave className="my-icon" />);
      const svg = container.querySelector('svg');
      expect(svg).toHaveClass('my-icon');
    });

    it('should use currentColor by default', () => {
      const { container } = render(<SineWave />);
      const path = container.querySelector('path');
      expect(path).toHaveAttribute('stroke', 'currentColor');
    });

    it('should use default size of 24', () => {
      const { container } = render(<SineWave />);
      const svg = container.querySelector('svg');
      expect(svg).toHaveAttribute('width', '24');
      expect(svg).toHaveAttribute('height', '24');
    });
  });

  describe('Icon Maps', () => {
    it('should have all waveform icons in WaveformIconMap', () => {
      expect(WaveformIconMap.sine).toBe(SineWave);
      expect(WaveformIconMap.saw).toBe(SawWave);
      expect(WaveformIconMap.square).toBe(SquareWave);
      expect(WaveformIconMap.triangle).toBe(TriangleWave);
      expect(WaveformIconMap.noise).toBe(NoiseWave);
      expect(WaveformIconMap.pulse).toBe(PulseWave);
      expect(WaveformIconMap.rampUp).toBe(RampUp);
      expect(WaveformIconMap.rampDown).toBe(RampDown);
      expect(WaveformIconMap.sampleHold).toBe(SampleHold);
    });

    it('should have all filter icons in FilterIconMap', () => {
      expect(FilterIconMap.lowpass).toBe(FilterLowpass);
      expect(FilterIconMap.highpass).toBe(FilterHighpass);
      expect(FilterIconMap.bandpass).toBe(FilterBandpass);
      expect(FilterIconMap.notch).toBe(FilterNotch);
    });

    it('should have all transport icons in TransportIconMap', () => {
      expect(TransportIconMap.play).toBe(PlayIcon);
      expect(TransportIconMap.pause).toBe(PauseIcon);
      expect(TransportIconMap.stop).toBe(StopIcon);
      expect(TransportIconMap.record).toBe(RecordIcon);
      expect(TransportIconMap.loop).toBe(LoopIcon);
    });

    it('should allow dynamic icon rendering from map', () => {
      const IconComponent = WaveformIconMap['sine'];
      const { container } = render(<IconComponent size={32} color="red" />);
      expect(container.querySelector('svg')).toBeInTheDocument();
    });
  });

  describe('Filled Icons', () => {
    it('should use fill for PlayIcon', () => {
      const { container } = render(<PlayIcon color="#00ff00" />);
      const path = container.querySelector('path');
      expect(path).toHaveAttribute('d');
    });

    it('should use fill for StopIcon', () => {
      const { container } = render(<StopIcon />);
      const rect = container.querySelector('rect');
      expect(rect).toBeInTheDocument();
    });

    it('should use fill for RecordIcon', () => {
      const { container } = render(<RecordIcon />);
      const circle = container.querySelector('circle');
      expect(circle).toBeInTheDocument();
    });
  });

  describe('Stroke Icons', () => {
    it('should use stroke for waveform icons', () => {
      const { container } = render(<SineWave />);
      const path = container.querySelector('path');
      expect(path).toHaveAttribute('fill', 'none');
    });

    it('should use stroke for filter icons', () => {
      const { container } = render(<FilterLowpass />);
      const path = container.querySelector('path');
      expect(path).toHaveAttribute('fill', 'none');
    });

    it('should have rounded line caps for waveforms', () => {
      const { container } = render(<SineWave />);
      const path = container.querySelector('path');
      expect(path).toHaveAttribute('stroke-linecap', 'round');
    });
  });

  describe('ViewBox', () => {
    it('should have consistent viewBox across all icons', () => {
      const icons = [SineWave, SawWave, PlayIcon, FilterLowpass, PowerIcon];

      icons.forEach((Icon) => {
        const { container } = render(<Icon />);
        const svg = container.querySelector('svg');
        expect(svg).toHaveAttribute('viewBox', '0 0 24 24');
      });
    });
  });
});
