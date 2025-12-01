import { describe, it, expect } from 'vitest';
import { render, screen } from '../../test/test-utils';
import { SquareModule, GridContent } from './SquareModule';
import { MODULE_SIZE, CELL_SIZE } from '../../theme/grid';

describe('SquareModule', () => {
  describe('Rendering', () => {
    it('should render children', () => {
      render(
        <SquareModule>
          <div data-testid="child">Content</div>
        </SquareModule>
      );

      expect(screen.getByTestId('child')).toBeInTheDocument();
    });

    it('should render with title', () => {
      render(
        <SquareModule title="OSC 1">
          <div>Content</div>
        </SquareModule>
      );

      expect(screen.getByText('OSC 1')).toBeInTheDocument();
    });

    it('should not render title bar when title is not provided', () => {
      const { container } = render(
        <SquareModule>
          <div>Content</div>
        </SquareModule>
      );

      // Check that content is rendered (no title area since no title was provided)
      const contentArea = container.querySelector('div > div:last-child');
      expect(contentArea).toBeInTheDocument();
      // Should only have the main container and content area, no title div
      const module = container.firstChild as HTMLElement;
      // Without title, should have fewer child divs
      expect(module.children.length).toBeLessThan(3);
    });
  });

  describe('Sizing', () => {
    it('should have default size of MODULE_SIZE (320px)', () => {
      const { container } = render(
        <SquareModule>
          <div>Content</div>
        </SquareModule>
      );

      const module = container.firstChild as HTMLElement;
      expect(module.style.width).toBe(`${MODULE_SIZE}px`);
      expect(module.style.height).toBe(`${MODULE_SIZE}px`);
    });

    it('should scale size based on size prop', () => {
      const { container } = render(
        <SquareModule size={2}>
          <div>Content</div>
        </SquareModule>
      );

      const module = container.firstChild as HTMLElement;
      expect(module.style.width).toBe(`${MODULE_SIZE * 2}px`);
      expect(module.style.height).toBe(`${MODULE_SIZE * 2}px`);
    });

    it('should support half-size modules', () => {
      const { container } = render(
        <SquareModule size={0.5}>
          <div>Content</div>
        </SquareModule>
      );

      const module = container.firstChild as HTMLElement;
      expect(module.style.width).toBe(`${MODULE_SIZE * 0.5}px`);
      expect(module.style.height).toBe(`${MODULE_SIZE * 0.5}px`);
    });

    it('should have flexShrink: 0 to prevent shrinking', () => {
      const { container } = render(
        <SquareModule>
          <div>Content</div>
        </SquareModule>
      );

      const module = container.firstChild as HTMLElement;
      expect(module.style.flexShrink).toBe('0');
    });
  });

  describe('Color accent', () => {
    it('should apply accent color to title when provided', () => {
      render(
        <SquareModule title="OSC" color="yellow">
          <div>Content</div>
        </SquareModule>
      );

      const title = screen.getByText('OSC');
      // The color should be set on the title element
      expect(title.style.color).toBeTruthy();
    });

    it('should apply accent color to border', () => {
      const { container } = render(
        <SquareModule title="OSC" color="coral">
          <div>Content</div>
        </SquareModule>
      );

      const module = container.firstChild as HTMLElement;
      // Border should include the accent color with transparency
      expect(module.style.border).toContain('rgb');
    });
  });

  describe('Debug grid', () => {
    it('should show grid overlay when showGrid is true', () => {
      const { container } = render(
        <SquareModule showGrid>
          <div>Content</div>
        </SquareModule>
      );

      // Should have grid lines
      const gridLines = container.querySelectorAll('div[style*="position: absolute"]');
      expect(gridLines.length).toBeGreaterThan(0);
    });

    it('should not show grid overlay when showGrid is false', () => {
      const { container } = render(
        <SquareModule showGrid={false}>
          <div>Content</div>
        </SquareModule>
      );

      // Should only have main container and content area
      const module = container.firstChild as HTMLElement;
      const divs = module.querySelectorAll('div');
      // Without grid overlay, should be minimal divs
      expect(divs.length).toBeLessThan(10);
    });

    it('should render 8 grid lines in each direction when showGrid is true', () => {
      const { container } = render(
        <SquareModule showGrid>
          <div>Content</div>
        </SquareModule>
      );

      // 9 horizontal lines + 9 vertical lines = 18 (0-8 indices)
      // Find grid lines by position: absolute style
      const gridOverlay = container.querySelector('div[style*="position: absolute"][style*="inset: 0"]');
      expect(gridOverlay).toBeInTheDocument();

      // Should contain multiple children (the grid lines)
      const gridChildren = gridOverlay?.children;
      expect(gridChildren?.length).toBeGreaterThanOrEqual(18); // 9 horizontal + 9 vertical
    });
  });

  describe('Custom styles', () => {
    it('should merge custom styles', () => {
      const { container } = render(
        <SquareModule style={{ opacity: 0.5 }}>
          <div>Content</div>
        </SquareModule>
      );

      const module = container.firstChild as HTMLElement;
      expect(module.style.opacity).toBe('0.5');
    });

    it('should allow custom width via style override', () => {
      const { container } = render(
        <SquareModule style={{ width: '400px' }}>
          <div>Content</div>
        </SquareModule>
      );

      const module = container.firstChild as HTMLElement;
      // Note: style prop is spread last, so it should override
      expect(module.style.width).toBe('400px');
    });
  });
});

describe('GridContent', () => {
  describe('Sizing', () => {
    it('should use default 8 columns width', () => {
      const { container } = render(
        <GridContent>
          <div>Content</div>
        </GridContent>
      );

      const content = container.firstChild as HTMLElement;
      expect(content.style.width).toBe(`${CELL_SIZE * 8}px`);
    });

    it('should set width based on cols prop', () => {
      const { container } = render(
        <GridContent cols={4}>
          <div>Content</div>
        </GridContent>
      );

      const content = container.firstChild as HTMLElement;
      expect(content.style.width).toBe(`${CELL_SIZE * 4}px`);
    });

    it('should set height based on rows prop', () => {
      const { container } = render(
        <GridContent rows={3}>
          <div>Content</div>
        </GridContent>
      );

      const content = container.firstChild as HTMLElement;
      expect(content.style.height).toBe(`${CELL_SIZE * 3}px`);
    });

    it('should default to auto height when rows is not specified', () => {
      const { container } = render(
        <GridContent>
          <div>Content</div>
        </GridContent>
      );

      const content = container.firstChild as HTMLElement;
      expect(content.style.height).toBe('auto');
    });
  });

  describe('Alignment', () => {
    it('should center content by default', () => {
      const { container } = render(
        <GridContent>
          <div>Content</div>
        </GridContent>
      );

      const content = container.firstChild as HTMLElement;
      expect(content.style.alignItems).toBe('center');
      expect(content.style.justifyContent).toBe('center');
    });

    it('should align to start when align="start"', () => {
      const { container } = render(
        <GridContent align="start">
          <div>Content</div>
        </GridContent>
      );

      const content = container.firstChild as HTMLElement;
      expect(content.style.alignItems).toBe('flex-start');
    });

    it('should align to end when align="end"', () => {
      const { container } = render(
        <GridContent align="end">
          <div>Content</div>
        </GridContent>
      );

      const content = container.firstChild as HTMLElement;
      expect(content.style.alignItems).toBe('flex-end');
    });
  });

  describe('Scaling', () => {
    it('should scale dimensions based on scale prop', () => {
      const { container } = render(
        <GridContent cols={4} rows={2} scale={2}>
          <div>Content</div>
        </GridContent>
      );

      const content = container.firstChild as HTMLElement;
      expect(content.style.width).toBe(`${CELL_SIZE * 4 * 2}px`);
      expect(content.style.height).toBe(`${CELL_SIZE * 2 * 2}px`);
    });

    it('should default scale to 1', () => {
      const { container } = render(
        <GridContent cols={2}>
          <div>Content</div>
        </GridContent>
      );

      const content = container.firstChild as HTMLElement;
      expect(content.style.width).toBe(`${CELL_SIZE * 2}px`);
    });
  });

  describe('Rendering', () => {
    it('should render children', () => {
      render(
        <GridContent>
          <div data-testid="child">Content</div>
        </GridContent>
      );

      expect(screen.getByTestId('child')).toBeInTheDocument();
    });

    it('should hide overflow', () => {
      const { container } = render(
        <GridContent>
          <div>Content</div>
        </GridContent>
      );

      const content = container.firstChild as HTMLElement;
      expect(content.style.overflow).toBe('hidden');
    });
  });
});

describe('SquareModule with GridContent', () => {
  it('should work together for grid-aligned content', () => {
    render(
      <SquareModule title="TEST">
        <GridContent cols={6} rows={4}>
          <div data-testid="content">Aligned Content</div>
        </GridContent>
      </SquareModule>
    );

    expect(screen.getByTestId('content')).toBeInTheDocument();
    expect(screen.getByText('TEST')).toBeInTheDocument();
  });
});
