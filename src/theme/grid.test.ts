import { describe, it, expect } from 'vitest';
import {
  MODULE_SIZE,
  GRID_CELLS,
  CELL_SIZE,
  HALF_CELL,
  QUARTER_CELL,
  MODULE_RADIUS,
  MODULE_PADDING,
  TITLE_HEIGHT,
  CONTENT_HEIGHT,
  CONTENT_WIDTH,
  pixelsToCells,
  cellsToPixels,
  snapToGrid,
  snapToHalfGrid,
  gridSizes,
  gridSpacing,
  moduleSizes,
} from './grid';

describe('Grid Constants', () => {
  describe('Core dimensions', () => {
    it('should have MODULE_SIZE of 320px', () => {
      expect(MODULE_SIZE).toBe(320);
    });

    it('should have 8 grid cells', () => {
      expect(GRID_CELLS).toBe(8);
    });

    it('should have CELL_SIZE of 40px (320 / 8)', () => {
      expect(CELL_SIZE).toBe(40);
    });

    it('should have HALF_CELL of 20px', () => {
      expect(HALF_CELL).toBe(20);
    });

    it('should have QUARTER_CELL of 10px', () => {
      expect(QUARTER_CELL).toBe(10);
    });
  });

  describe('Module layout', () => {
    it('should have MODULE_RADIUS of 12px', () => {
      expect(MODULE_RADIUS).toBe(12);
    });

    it('should have MODULE_PADDING of 10px (quarter cell)', () => {
      expect(MODULE_PADDING).toBe(10);
    });

    it('should have TITLE_HEIGHT of 40px (1 cell)', () => {
      expect(TITLE_HEIGHT).toBe(40);
    });

    it('should have correct CONTENT_HEIGHT calculation', () => {
      // Content height = MODULE_SIZE - TITLE_HEIGHT - 2 * MODULE_PADDING
      const expected = MODULE_SIZE - TITLE_HEIGHT - MODULE_PADDING * 2;
      expect(CONTENT_HEIGHT).toBe(expected);
      expect(CONTENT_HEIGHT).toBe(260);
    });

    it('should have correct CONTENT_WIDTH calculation', () => {
      // Content width = MODULE_SIZE - 2 * MODULE_PADDING
      const expected = MODULE_SIZE - MODULE_PADDING * 2;
      expect(CONTENT_WIDTH).toBe(expected);
      expect(CONTENT_WIDTH).toBe(300);
    });
  });
});

describe('Grid Utility Functions', () => {
  describe('pixelsToCells', () => {
    it('should convert exact multiples correctly', () => {
      expect(pixelsToCells(40)).toBe(1);
      expect(pixelsToCells(80)).toBe(2);
      expect(pixelsToCells(120)).toBe(3);
      expect(pixelsToCells(320)).toBe(8);
    });

    it('should floor non-exact values', () => {
      expect(pixelsToCells(50)).toBe(1);
      expect(pixelsToCells(79)).toBe(1);
      expect(pixelsToCells(81)).toBe(2);
    });

    it('should return 0 for values less than CELL_SIZE', () => {
      expect(pixelsToCells(0)).toBe(0);
      expect(pixelsToCells(39)).toBe(0);
    });
  });

  describe('cellsToPixels', () => {
    it('should convert cells to pixels correctly', () => {
      expect(cellsToPixels(1)).toBe(40);
      expect(cellsToPixels(2)).toBe(80);
      expect(cellsToPixels(4)).toBe(160);
      expect(cellsToPixels(8)).toBe(320);
    });

    it('should handle fractional cells', () => {
      expect(cellsToPixels(0.5)).toBe(20);
      expect(cellsToPixels(1.5)).toBe(60);
    });

    it('should handle zero', () => {
      expect(cellsToPixels(0)).toBe(0);
    });
  });

  describe('snapToGrid', () => {
    it('should snap to nearest grid boundary', () => {
      expect(snapToGrid(0)).toBe(0);
      expect(snapToGrid(20)).toBe(40); // Rounds up to nearest 40
      expect(snapToGrid(19)).toBe(0);  // Rounds down
      expect(snapToGrid(21)).toBe(40); // Rounds up
      expect(snapToGrid(40)).toBe(40);
      expect(snapToGrid(50)).toBe(40); // 50 is closer to 40 than 80
      expect(snapToGrid(60)).toBe(80); // 60 is closer to 80 than 40
    });

    it('should work with larger values', () => {
      expect(snapToGrid(150)).toBe(160);
      expect(snapToGrid(300)).toBe(320);
    });
  });

  describe('snapToHalfGrid', () => {
    it('should snap to nearest half-cell boundary', () => {
      expect(snapToHalfGrid(0)).toBe(0);
      expect(snapToHalfGrid(10)).toBe(20); // Rounds to nearest 20
      expect(snapToHalfGrid(9)).toBe(0);   // Rounds down
      expect(snapToHalfGrid(11)).toBe(20); // Rounds up
      expect(snapToHalfGrid(20)).toBe(20);
      expect(snapToHalfGrid(30)).toBe(40);
    });

    it('should provide finer granularity than snapToGrid', () => {
      // snapToGrid: 25 -> 40
      // snapToHalfGrid: 25 -> 20
      expect(snapToHalfGrid(25)).toBe(20);
      expect(snapToGrid(25)).toBe(40);
    });
  });
});

describe('Grid Size Presets', () => {
  describe('gridSizes', () => {
    it('should have correct size values', () => {
      expect(gridSizes.xs).toBe(40);   // 1 cell
      expect(gridSizes.sm).toBe(80);   // 2 cells
      expect(gridSizes.md).toBe(120);  // 3 cells
      expect(gridSizes.lg).toBe(160);  // 4 cells
      expect(gridSizes.xl).toBe(200);  // 5 cells
      expect(gridSizes.xxl).toBe(240); // 6 cells
      expect(gridSizes.xxxl).toBe(280);// 7 cells
      expect(gridSizes.full).toBe(300);// Content width
    });

    it('should be multiples of CELL_SIZE (except full)', () => {
      expect(gridSizes.xs % CELL_SIZE).toBe(0);
      expect(gridSizes.sm % CELL_SIZE).toBe(0);
      expect(gridSizes.md % CELL_SIZE).toBe(0);
      expect(gridSizes.lg % CELL_SIZE).toBe(0);
      expect(gridSizes.xl % CELL_SIZE).toBe(0);
      expect(gridSizes.xxl % CELL_SIZE).toBe(0);
      expect(gridSizes.xxxl % CELL_SIZE).toBe(0);
    });
  });

  describe('gridSpacing', () => {
    it('should have correct spacing values', () => {
      expect(gridSpacing.xs).toBe(10);  // Quarter cell
      expect(gridSpacing.sm).toBe(20);  // Half cell
      expect(gridSpacing.md).toBe(40);  // 1 cell
      expect(gridSpacing.lg).toBe(80);  // 2 cells
    });
  });

  describe('moduleSizes', () => {
    it('should have standard 320x320 size', () => {
      expect(moduleSizes.standard.width).toBe(320);
      expect(moduleSizes.standard.height).toBe(320);
    });

    it('should have wide 640x320 size (2:1 ratio)', () => {
      expect(moduleSizes.wide.width).toBe(640);
      expect(moduleSizes.wide.height).toBe(320);
    });

    it('should have compact 160x160 size (half)', () => {
      expect(moduleSizes.compact.width).toBe(160);
      expect(moduleSizes.compact.height).toBe(160);
    });

    it('should have mini 80x80 size (2 cells)', () => {
      expect(moduleSizes.mini.width).toBe(80);
      expect(moduleSizes.mini.height).toBe(80);
    });

    it('should all be perfect squares or 2:1 rectangles', () => {
      Object.values(moduleSizes).forEach(size => {
        const ratio = size.width / size.height;
        expect(ratio === 1 || ratio === 2).toBe(true);
      });
    });
  });
});

describe('Grid System Consistency', () => {
  it('should have grid that evenly divides module size', () => {
    expect(MODULE_SIZE % GRID_CELLS).toBe(0);
    expect(MODULE_SIZE / GRID_CELLS).toBe(CELL_SIZE);
  });

  it('should have consistent cell subdivisions', () => {
    expect(CELL_SIZE / 2).toBe(HALF_CELL);
    expect(CELL_SIZE / 4).toBe(QUARTER_CELL);
    expect(HALF_CELL / 2).toBe(QUARTER_CELL);
  });

  it('should be able to fit content within module', () => {
    expect(CONTENT_WIDTH).toBeLessThan(MODULE_SIZE);
    expect(CONTENT_HEIGHT).toBeLessThan(MODULE_SIZE);
    expect(CONTENT_WIDTH + MODULE_PADDING * 2).toBe(MODULE_SIZE);
  });
});
