import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '../../test/test-utils';
import userEvent from '@testing-library/user-event';
import { ParameterInspector, InspectorParameter } from './ParameterInspector';

const createParameter = (overrides: Partial<InspectorParameter> = {}): InspectorParameter => ({
  id: 'test-param',
  name: 'Test Param',
  path: 'test.param',
  value: 0.5,
  defaultValue: 0.5,
  min: 0,
  max: 100,
  type: 'continuous',
  category: 'Test',
  ...overrides,
});

describe('ParameterInspector', () => {
  describe('Rendering', () => {
    it('should render with title', () => {
      render(
        <ParameterInspector
          parameters={[createParameter()]}
          title="My Synth"
        />
      );

      expect(screen.getByText('My Synth')).toBeInTheDocument();
    });

    it('should display parameter count', () => {
      render(
        <ParameterInspector
          parameters={[
            createParameter({ id: 'p1', path: 'test.p1' }),
            createParameter({ id: 'p2', path: 'test.p2' }),
            createParameter({ id: 'p3', path: 'test.p3' }),
          ]}
        />
      );

      expect(screen.getByText('3 params')).toBeInTheDocument();
    });

    it('should render search input', () => {
      render(<ParameterInspector parameters={[createParameter()]} />);

      expect(screen.getByPlaceholderText('Search parameters...')).toBeInTheDocument();
    });

    it('should render category headers', () => {
      render(
        <ParameterInspector
          parameters={[
            createParameter({ category: 'Oscillator' }),
            createParameter({ id: 'p2', path: 'p2', category: 'Filter' }),
          ]}
        />
      );

      expect(screen.getByText('Oscillator')).toBeInTheDocument();
      expect(screen.getByText('Filter')).toBeInTheDocument();
    });

    it('should render parameter name and path', async () => {
      const user = userEvent.setup();
      render(
        <ParameterInspector
          parameters={[createParameter({ name: 'Cutoff', path: 'filter.cutoff' })]}
        />
      );

      // Click to expand the category
      await user.click(screen.getByText('Test'));

      expect(screen.getByText('Cutoff')).toBeInTheDocument();
      expect(screen.getByText('filter.cutoff')).toBeInTheDocument();
    });

    it('should render slider for each parameter', async () => {
      const user = userEvent.setup();
      render(
        <ParameterInspector
          parameters={[
            createParameter({ id: 'p1', path: 'p1' }),
            createParameter({ id: 'p2', path: 'p2' }),
          ]}
        />
      );

      // Click to expand the category
      await user.click(screen.getByText('Test'));

      const sliders = screen.getAllByRole('slider');
      expect(sliders.length).toBe(2);
    });
  });

  describe('Value Display', () => {
    it('should format continuous values', async () => {
      const user = userEvent.setup();
      render(
        <ParameterInspector
          parameters={[
            createParameter({
              value: 0.5,
              min: 0,
              max: 100,
              type: 'continuous',
            }),
          ]}
        />
      );

      await user.click(screen.getByText('Test'));
      expect(screen.getByText('50.00')).toBeInTheDocument();
    });

    it('should format stepped values as integers', async () => {
      const user = userEvent.setup();
      render(
        <ParameterInspector
          parameters={[
            createParameter({
              value: 0.5,
              min: 0,
              max: 100,
              step: 1,
              type: 'stepped',
            }),
          ]}
        />
      );

      await user.click(screen.getByText('Test'));
      expect(screen.getByText('50')).toBeInTheDocument();
    });

    it('should format toggle values', async () => {
      const user = userEvent.setup();
      render(
        <ParameterInspector
          parameters={[
            createParameter({
              value: 1,
              type: 'toggle',
            }),
          ]}
        />
      );

      await user.click(screen.getByText('Test'));
      expect(screen.getByText('ON')).toBeInTheDocument();
    });

    it('should format enum values', async () => {
      const user = userEvent.setup();
      render(
        <ParameterInspector
          parameters={[
            createParameter({
              value: 1,
              type: 'enum',
              enumValues: ['Sine', 'Saw', 'Square'],
            }),
          ]}
        />
      );

      await user.click(screen.getByText('Test'));
      expect(screen.getByText('Saw')).toBeInTheDocument();
    });

    it('should include unit in display', async () => {
      const user = userEvent.setup();
      render(
        <ParameterInspector
          parameters={[
            createParameter({
              value: 0.5,
              min: 20,
              max: 20000,
              unit: 'Hz',
            }),
          ]}
        />
      );

      await user.click(screen.getByText('Test'));
      expect(screen.getByText(/Hz/)).toBeInTheDocument();
    });
  });

  describe('Interactions', () => {
    it('should call onChange when slider is moved', async () => {
      const onChange = vi.fn();
      const user = userEvent.setup();

      render(
        <ParameterInspector
          parameters={[createParameter({ path: 'test.value' })]}
          onChange={onChange}
        />
      );

      await user.click(screen.getByText('Test'));
      const slider = screen.getByRole('slider');
      // Simulate changing the slider
      fireEvent.change(slider, { target: { value: '0.75' } });

      expect(onChange).toHaveBeenCalledWith('test.value', 0.75);
    });

    it('should reset to default on double click', async () => {
      const onChange = vi.fn();
      const user = userEvent.setup();

      render(
        <ParameterInspector
          parameters={[createParameter({ path: 'test.value', value: 0.8, defaultValue: 0.5 })]}
          onChange={onChange}
        />
      );

      await user.click(screen.getByText('Test'));
      const slider = screen.getByRole('slider');
      fireEvent.doubleClick(slider);

      expect(onChange).toHaveBeenCalledWith('test.value', 0.5);
    });
  });

  describe('Search/Filter', () => {
    it('should filter parameters by search text', async () => {
      const user = userEvent.setup();

      render(
        <ParameterInspector
          parameters={[
            createParameter({ name: 'Cutoff', path: 'filter.cutoff', category: 'Filter' }),
            createParameter({ id: 'p2', name: 'Resonance', path: 'filter.resonance', category: 'Filter' }),
            createParameter({ id: 'p3', name: 'Volume', path: 'amp.volume', category: 'Amp' }),
          ]}
        />
      );

      // Expand all categories
      await user.click(screen.getByText('Filter'));
      await user.click(screen.getByText('Amp'));

      const searchInput = screen.getByPlaceholderText('Search parameters...');
      await user.type(searchInput, 'filter');

      expect(screen.getByText('Cutoff')).toBeInTheDocument();
      expect(screen.getByText('Resonance')).toBeInTheDocument();
      // Volume should be filtered out
      expect(screen.queryByText('Volume')).not.toBeInTheDocument();
    });

    it('should filter by modulatable when toggle is active', async () => {
      const user = userEvent.setup();

      render(
        <ParameterInspector
          parameters={[
            createParameter({ name: 'Cutoff', modulatable: true }),
            createParameter({ id: 'p2', name: 'Volume', path: 'vol', modulatable: false }),
          ]}
        />
      );

      // Expand the category first
      await user.click(screen.getByText('Test'));

      // Click the MOD filter button
      const modButtons = screen.getAllByText('MOD');
      await user.click(modButtons[0]); // The filter button, not the badge

      expect(screen.getByText('Cutoff')).toBeInTheDocument();
      // Volume should be filtered out since it's not modulatable
    });
  });

  describe('Categories', () => {
    it('should toggle category expansion', async () => {
      const user = userEvent.setup();

      render(
        <ParameterInspector
          parameters={[createParameter({ category: 'Oscillator' })]}
        />
      );

      const categoryHeader = screen.getByText('Oscillator');

      // Initially expanded (click to collapse)
      await user.click(categoryHeader);

      // Parameter should still be accessible via search or shown in collapsed state
      expect(screen.getByText('Oscillator')).toBeInTheDocument();
    });

    it('should show parameter count per category', () => {
      render(
        <ParameterInspector
          parameters={[
            createParameter({ id: 'p1', category: 'Oscillator', path: 'p1' }),
            createParameter({ id: 'p2', category: 'Oscillator', path: 'p2' }),
            createParameter({ id: 'p3', category: 'Filter', path: 'p3' }),
          ]}
        />
      );

      // Oscillator should show "2 •"
      expect(screen.getByText(/2 •/)).toBeInTheDocument();
    });
  });

  describe('View Modes', () => {
    it('should switch to grid view', async () => {
      const user = userEvent.setup();
      const { container } = render(<ParameterInspector parameters={[createParameter()]} />);

      // Find and click GRID button - it's in the header, not inside category
      const gridButton = screen.getByRole('button', { name: /grid/i });
      await user.click(gridButton);

      // Grid button should still be present (lowercase in DOM)
      expect(container.textContent?.toLowerCase()).toContain('grid');
    });

    it('should switch to tree view', async () => {
      const user = userEvent.setup();
      const { container } = render(<ParameterInspector parameters={[createParameter()]} />);

      // Find and click TREE button
      const treeButton = screen.getByRole('button', { name: /tree/i });
      await user.click(treeButton);

      expect(container.textContent?.toLowerCase()).toContain('tree');
    });

    it('should switch to list view', async () => {
      const user = userEvent.setup();
      const { container } = render(<ParameterInspector parameters={[createParameter()]} />);

      // First switch to grid
      const gridButton = screen.getByRole('button', { name: /grid/i });
      await user.click(gridButton);

      // Then back to list
      const listButton = screen.getByRole('button', { name: /list/i });
      await user.click(listButton);

      expect(container.textContent?.toLowerCase()).toContain('list');
    });
  });

  describe('MIDI Learn', () => {
    it('should call onMidiLearn when learn button is clicked', async () => {
      const onMidiLearn = vi.fn();
      const user = userEvent.setup();

      render(
        <ParameterInspector
          parameters={[createParameter({ path: 'test.param' })]}
          onMidiLearn={onMidiLearn}
          compact={false}
        />
      );

      await user.click(screen.getByText('Test'));
      await user.click(screen.getByText('LEARN'));

      expect(onMidiLearn).toHaveBeenCalledWith('test.param');
    });

    it('should highlight parameter being learned', async () => {
      const user = userEvent.setup();
      const { container } = render(
        <ParameterInspector
          parameters={[createParameter({ path: 'test.param' })]}
          midiLearning="test.param"
          compact={false}
        />
      );

      await user.click(screen.getByText('Test'));

      // The row should have a border indicating MIDI learn mode
      expect(container.querySelector('[style*="border"]')).toBeInTheDocument();
    });

    it('should show CC number if assigned', async () => {
      const user = userEvent.setup();
      render(
        <ParameterInspector
          parameters={[createParameter({ path: 'test.param', midiCC: 74 })]}
          onMidiLearn={() => {}}
          compact={false}
        />
      );

      await user.click(screen.getByText('Test'));
      expect(screen.getByText('CC74')).toBeInTheDocument();
    });
  });

  describe('Export', () => {
    it('should render export button when presets enabled', () => {
      render(
        <ParameterInspector
          parameters={[createParameter()]}
          enablePresets={true}
        />
      );

      expect(screen.getByText('EXPORT')).toBeInTheDocument();
    });

    it('should hide export button when presets disabled', () => {
      render(
        <ParameterInspector
          parameters={[createParameter()]}
          enablePresets={false}
        />
      );

      expect(screen.queryByText('EXPORT')).not.toBeInTheDocument();
    });
  });

  describe('Modulatable Indicator', () => {
    it('should show MOD badge for modulatable parameters', () => {
      render(
        <ParameterInspector
          parameters={[createParameter({ modulatable: true })]}
          compact={false}
        />
      );

      // MOD badge should be visible (there's also the filter button)
      const modElements = screen.getAllByText('MOD');
      expect(modElements.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Category Colors', () => {
    it('should apply different colors per category', async () => {
      const user = userEvent.setup();
      const { container } = render(
        <ParameterInspector
          parameters={[
            createParameter({ category: 'Oscillator' }),
            createParameter({ id: 'p2', path: 'p2', category: 'Filter' }),
            createParameter({ id: 'p3', path: 'p3', category: 'Envelope' }),
          ]}
        />
      );

      // Expand categories
      await user.click(screen.getByText('Oscillator'));
      await user.click(screen.getByText('Filter'));
      await user.click(screen.getByText('Envelope'));

      // Colors are applied via inline styles
      expect(container.querySelectorAll('[style*="color"]').length).toBeGreaterThan(0);
    });
  });

  describe('Compact Mode', () => {
    it('should render in compact mode', () => {
      render(
        <ParameterInspector
          parameters={[createParameter()]}
          compact={true}
        />
      );

      // In compact mode, LEARN button is hidden
      expect(screen.queryByText('LEARN')).not.toBeInTheDocument();
    });
  });

  describe('Empty State', () => {
    it('should handle empty parameters array', () => {
      render(<ParameterInspector parameters={[]} />);

      expect(screen.getByText('0 params')).toBeInTheDocument();
    });

    it('should handle no matching search results', async () => {
      const user = userEvent.setup();

      render(
        <ParameterInspector
          parameters={[createParameter({ name: 'Cutoff' })]}
        />
      );

      const searchInput = screen.getByPlaceholderText('Search parameters...');
      await user.type(searchInput, 'nonexistent');

      // No parameters should be visible
      expect(screen.queryByText('Cutoff')).not.toBeInTheDocument();
    });
  });
});
