/**
 * Grid System Constants
 *
 * All modules use a consistent 8x8 inner grid for alignment.
 * This ensures visual consistency across the entire synth UI.
 *
 * Default module size: 320px × 320px
 * Grid: 8 columns × 8 rows = 40px per cell
 * Content padding: 8px (leaves 304px × 304px content area = 38px cells)
 *
 * For perfect alignment, content should:
 * - Use multiples of CELL_SIZE (40px) for major elements
 * - Use HALF_CELL (20px) for fine adjustments
 * - Use QUARTER_CELL (10px) for minimal padding
 */

/** Default square module size in pixels */
export const MODULE_SIZE = 320;

/** Number of grid cells per axis */
export const GRID_CELLS = 8;

/** Size of each grid cell in pixels */
export const CELL_SIZE = MODULE_SIZE / GRID_CELLS; // 40px

/** Half cell size for fine adjustments */
export const HALF_CELL = CELL_SIZE / 2; // 20px

/** Quarter cell for minimal padding */
export const QUARTER_CELL = CELL_SIZE / 4; // 10px

/** Module border radius */
export const MODULE_RADIUS = 12;

/** Standard module padding */
export const MODULE_PADDING = QUARTER_CELL; // 10px

/** Title bar height (1 cell) */
export const TITLE_HEIGHT = CELL_SIZE; // 40px

/** Content area after title */
export const CONTENT_HEIGHT = MODULE_SIZE - TITLE_HEIGHT - MODULE_PADDING * 2;

/** Content area width */
export const CONTENT_WIDTH = MODULE_SIZE - MODULE_PADDING * 2;

/**
 * Calculate the number of cells that fit in a given pixel dimension
 */
export const pixelsToCells = (pixels: number): number => {
  return Math.floor(pixels / CELL_SIZE);
};

/**
 * Convert cells to pixels
 */
export const cellsToPixels = (cells: number): number => {
  return cells * CELL_SIZE;
};

/**
 * Snap a pixel value to the nearest cell boundary
 */
export const snapToGrid = (pixels: number): number => {
  return Math.round(pixels / CELL_SIZE) * CELL_SIZE;
};

/**
 * Snap to half-cell for finer control
 */
export const snapToHalfGrid = (pixels: number): number => {
  return Math.round(pixels / HALF_CELL) * HALF_CELL;
};

/**
 * Get grid-aligned dimensions for common element sizes
 */
export const gridSizes = {
  /** 1 cell = 40px */
  xs: CELL_SIZE,
  /** 2 cells = 80px */
  sm: CELL_SIZE * 2,
  /** 3 cells = 120px */
  md: CELL_SIZE * 3,
  /** 4 cells = 160px */
  lg: CELL_SIZE * 4,
  /** 5 cells = 200px */
  xl: CELL_SIZE * 5,
  /** 6 cells = 240px */
  xxl: CELL_SIZE * 6,
  /** 7 cells = 280px */
  xxxl: CELL_SIZE * 7,
  /** Full content width = 300px (7.5 cells) */
  full: CONTENT_WIDTH,
} as const;

/**
 * Standard spacing values aligned to grid
 */
export const gridSpacing = {
  /** 10px - quarter cell */
  xs: QUARTER_CELL,
  /** 20px - half cell */
  sm: HALF_CELL,
  /** 40px - 1 cell */
  md: CELL_SIZE,
  /** 80px - 2 cells */
  lg: CELL_SIZE * 2,
} as const;

/**
 * Module size variants
 * All are perfect squares or 2:1 rectangles
 */
export const moduleSizes = {
  /** Standard 320×320 module */
  standard: { width: MODULE_SIZE, height: MODULE_SIZE },
  /** Double-wide 640×320 module */
  wide: { width: MODULE_SIZE * 2, height: MODULE_SIZE },
  /** Half-size 160×160 module */
  compact: { width: MODULE_SIZE / 2, height: MODULE_SIZE / 2 },
  /** Mini 80×80 module */
  mini: { width: CELL_SIZE * 2, height: CELL_SIZE * 2 },
} as const;

export default {
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
};
