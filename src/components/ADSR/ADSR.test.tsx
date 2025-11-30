import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '../../test/test-utils';
import { ADSR } from './ADSR';
import type { EnvelopeParams } from '../../types';

const createEnvelope = (overrides: Partial<EnvelopeParams> = {}): EnvelopeParams => ({
  attack: 100,
  decay: 200,
  sustain: 0.7,
  release: 500,
  ...overrides,
});

describe('ADSR', () => {
  describe('Rendering', () => {
    it('should render with label', () => {
      render(<ADSR value={createEnvelope()} label="AMP ENV" />);

      expect(screen.getByText('AMP ENV')).toBeInTheDocument();
    });

    it('should render SVG visualization', () => {
      render(<ADSR value={createEnvelope()} />);

      const svg = document.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });

    it('should display ADSR labels', () => {
      const { container } = render(<ADSR value={createEnvelope()} showValues={true} />);

      // ADSR labels are rendered as SVG text or div elements
      expect(container.textContent).toContain('A');
      expect(container.textContent).toContain('D');
      expect(container.textContent).toContain('S');
      expect(container.textContent).toContain('R');
    });

    it('should display formatted values when showValues is true', () => {
      render(
        <ADSR
          value={createEnvelope({ attack: 100, sustain: 0.7 })}
          showValues={true}
        />
      );

      // Attack: 100ms
      expect(screen.getByText('100ms')).toBeInTheDocument();
      // Sustain: 70%
      expect(screen.getByText('70%')).toBeInTheDocument();
    });

    it('should hide values when showValues is false', () => {
      render(
        <ADSR
          value={createEnvelope({ attack: 100 })}
          showValues={false}
        />
      );

      expect(screen.queryByText('100ms')).not.toBeInTheDocument();
    });

    it('should render four control points', () => {
      render(<ADSR value={createEnvelope()} />);

      // Should have 4 visible control points (circles)
      const circles = document.querySelectorAll('circle[r]');
      // Filter for visual points (not hit areas)
      const visualPoints = Array.from(circles).filter(
        c => parseFloat(c.getAttribute('r') || '0') < 15
      );
      expect(visualPoints.length).toBeGreaterThanOrEqual(4);
    });
  });

  describe('Interactions', () => {
    it('should call onChange when dragging attack point', () => {
      const onChange = vi.fn();
      render(<ADSR value={createEnvelope()} onChange={onChange} />);

      const svg = document.querySelector('svg');
      expect(svg).toBeInTheDocument();

      // Find attack control point hit area (larger circle)
      const hitAreas = document.querySelectorAll('circle[fill="transparent"]');
      const attackHitArea = hitAreas[0]; // First control point is attack

      fireEvent.pointerDown(attackHitArea!, { pointerId: 1, clientX: 50, clientY: 50 });
      fireEvent.pointerMove(svg!, { clientX: 100, clientY: 50 });

      expect(onChange).toHaveBeenCalled();
    });

    it('should update attack time on horizontal drag', () => {
      const onChange = vi.fn();
      render(
        <ADSR
          value={createEnvelope({ attack: 100 })}
          onChange={onChange}
          maxAttack={2000}
        />
      );

      const svg = document.querySelector('svg');
      const hitAreas = document.querySelectorAll('circle[fill="transparent"]');
      const attackHitArea = hitAreas[0];

      fireEvent.pointerDown(attackHitArea!, { pointerId: 1, clientX: 50, clientY: 30 });
      fireEvent.pointerMove(svg!, { clientX: 100, clientY: 30 });

      expect(onChange).toHaveBeenCalledWith(
        expect.objectContaining({
          attack: expect.any(Number),
        })
      );
    });

    it('should update sustain level on vertical drag', () => {
      const onChange = vi.fn();
      render(<ADSR value={createEnvelope()} onChange={onChange} />);

      const svg = document.querySelector('svg');
      const hitAreas = document.querySelectorAll('circle[fill="transparent"]');
      const sustainHitArea = hitAreas[2]; // Third control point is sustain

      fireEvent.pointerDown(sustainHitArea!, { pointerId: 1, clientX: 150, clientY: 50 });
      fireEvent.pointerMove(svg!, { clientX: 150, clientY: 80 }); // Drag down

      expect(onChange).toHaveBeenCalledWith(
        expect.objectContaining({
          sustain: expect.any(Number),
        })
      );
    });

    it('should release drag on pointer up', () => {
      const onChange = vi.fn();
      render(<ADSR value={createEnvelope()} onChange={onChange} />);

      const svg = document.querySelector('svg');
      const hitAreas = document.querySelectorAll('circle[fill="transparent"]');
      const attackHitArea = hitAreas[0];

      fireEvent.pointerDown(attackHitArea!, { pointerId: 1, clientX: 50, clientY: 50 });
      fireEvent.pointerUp(svg!);

      // After pointer up, further movement shouldn't trigger onChange
      onChange.mockClear();
      fireEvent.pointerMove(svg!, { clientX: 200, clientY: 50 });

      expect(onChange).not.toHaveBeenCalled();
    });
  });

  describe('Value constraints', () => {
    it('should respect maxAttack prop', () => {
      const onChange = vi.fn();
      render(
        <ADSR
          value={createEnvelope()}
          onChange={onChange}
          maxAttack={1000}
        />
      );

      const svg = document.querySelector('svg');
      const hitAreas = document.querySelectorAll('circle[fill="transparent"]');
      const attackHitArea = hitAreas[0];

      // Drag far to the right
      fireEvent.pointerDown(attackHitArea!, { pointerId: 1, clientX: 50, clientY: 50 });
      fireEvent.pointerMove(svg!, { clientX: 500, clientY: 50 });

      // Should be clamped to maxAttack
      const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1];
      expect(lastCall[0].attack).toBeLessThanOrEqual(1000);
    });

    it('should clamp sustain between 0 and 1', () => {
      const onChange = vi.fn();
      render(<ADSR value={createEnvelope()} onChange={onChange} />);

      const svg = document.querySelector('svg');
      const hitAreas = document.querySelectorAll('circle[fill="transparent"]');
      const sustainHitArea = hitAreas[2];

      // Drag very far up (trying to exceed 1)
      fireEvent.pointerDown(sustainHitArea!, { pointerId: 1, clientX: 150, clientY: 100 });
      fireEvent.pointerMove(svg!, { clientX: 150, clientY: -100 });

      const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1];
      expect(lastCall[0].sustain).toBeLessThanOrEqual(1);
      expect(lastCall[0].sustain).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Time formatting', () => {
    it('should format milliseconds for short times', () => {
      render(
        <ADSR
          value={createEnvelope({ attack: 50, decay: 100 })}
          showValues={true}
        />
      );

      expect(screen.getByText('50ms')).toBeInTheDocument();
      expect(screen.getByText('100ms')).toBeInTheDocument();
    });

    it('should format seconds for long times', () => {
      render(
        <ADSR
          value={createEnvelope({ release: 2500 })}
          showValues={true}
        />
      );

      expect(screen.getByText('2.50s')).toBeInTheDocument();
    });

    it('should format sustain as percentage', () => {
      render(
        <ADSR
          value={createEnvelope({ sustain: 0.85 })}
          showValues={true}
        />
      );

      expect(screen.getByText('85%')).toBeInTheDocument();
    });
  });

  describe('Hover states', () => {
    it('should show point value on hover', () => {
      const { container } = render(<ADSR value={createEnvelope({ attack: 150 })} showValues={true} />);

      const hitAreas = container.querySelectorAll('circle[fill="transparent"]');
      const attackHitArea = hitAreas[0];

      if (attackHitArea) {
        fireEvent.mouseEnter(attackHitArea);
      }

      // Should show attack time somewhere in the component
      expect(container.textContent).toContain('150');
    });
  });

  describe('Custom styling', () => {
    it('should accept custom color prop', () => {
      render(<ADSR value={createEnvelope()} color="#ff0000" />);

      const path = document.querySelector('path[stroke="#ff0000"]');
      expect(path).toBeInTheDocument();
    });

    it('should accept custom height prop', () => {
      render(<ADSR value={createEnvelope()} height={200} />);

      const svg = document.querySelector('svg');
      expect(svg).toHaveAttribute('height', '200');
    });
  });
});
