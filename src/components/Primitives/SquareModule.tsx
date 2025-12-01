/**
 * SquareModule - A fixed-size square container for synth modules
 *
 * Uses an 8x8 inner grid for consistent alignment across all modules.
 * Each grid cell is 40px × 40px (for a 320px module).
 *
 * Grid Layout:
 * - Title bar: 1 cell height (40px)
 * - Content area: 6 cells height (240px) with 10px padding
 * - Total: 320px × 320px
 *
 * @example
 * ```tsx
 * <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
 *   <SquareModule title="OSC 1" color="yellow">
 *     <NestedSliderCircular ... />
 *   </SquareModule>
 *   <SquareModule title="FILTER" color="orange">
 *     <Slider ... />
 *   </SquareModule>
 * </div>
 * ```
 */

import React from 'react';
import { colors, type ColorAccent } from '../../theme/tokens';
import {
  MODULE_SIZE,
  CELL_SIZE,
  MODULE_RADIUS,
  MODULE_PADDING,
  TITLE_HEIGHT,
} from '../../theme/grid';

export interface SquareModuleProps {
  /** Module title displayed at top */
  title?: string;
  /** Accent color for border and title */
  color?: ColorAccent;
  /** Size multiplier (1 = 320px, 2 = 640px, 0.5 = 160px) */
  size?: number;
  /** Child content */
  children: React.ReactNode;
  /** Additional inline styles */
  style?: React.CSSProperties;
  /** Show debug grid overlay */
  showGrid?: boolean;
}

export const SquareModule: React.FC<SquareModuleProps> = ({
  title,
  color,
  size = 1,
  children,
  style,
  showGrid = false,
}) => {
  const accentColor = color ? colors.accent[color] : undefined;
  const moduleSize = MODULE_SIZE * size;
  const cellSize = CELL_SIZE * size;
  const padding = MODULE_PADDING * size;
  const titleHeight = title ? TITLE_HEIGHT * size : 0;

  return (
    <div
      style={{
        width: moduleSize,
        height: moduleSize,
        flexShrink: 0,
        background: colors.bg.surface,
        borderRadius: MODULE_RADIUS,
        border: `1px solid ${accentColor ? accentColor + '33' : colors.bg.border}`,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        position: 'relative',
        ...style,
      }}
    >
      {/* Debug grid overlay */}
      {showGrid && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            zIndex: 100,
          }}
        >
          {/* Horizontal lines */}
          {Array.from({ length: 9 }).map((_, i) => (
            <div
              key={`h-${i}`}
              style={{
                position: 'absolute',
                left: 0,
                right: 0,
                top: i * cellSize,
                height: 1,
                background: i === 0 || i === 8 ? 'transparent' : 'rgba(255,0,255,0.2)',
              }}
            />
          ))}
          {/* Vertical lines */}
          {Array.from({ length: 9 }).map((_, i) => (
            <div
              key={`v-${i}`}
              style={{
                position: 'absolute',
                top: 0,
                bottom: 0,
                left: i * cellSize,
                width: 1,
                background: i === 0 || i === 8 ? 'transparent' : 'rgba(255,0,255,0.2)',
              }}
            />
          ))}
        </div>
      )}

      {/* Title bar - 1 cell height */}
      {title && (
        <div
          style={{
            height: titleHeight,
            padding: `0 ${padding}px`,
            display: 'flex',
            alignItems: 'center',
            color: accentColor || colors.text.muted,
            fontFamily: 'var(--font-mono)',
            fontSize: 11 * size,
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            flexShrink: 0,
          }}
        >
          {title}
        </div>
      )}

      {/* Content area - remaining space with padding */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: padding,
          paddingTop: title ? 0 : padding,
          minHeight: 0,
          overflow: 'hidden',
        }}
      >
        {children}
      </div>
    </div>
  );
};

/**
 * GridContent - Helper wrapper that snaps content to the 8x8 grid
 */
export interface GridContentProps {
  /** Number of cells wide (1-8) */
  cols?: number;
  /** Number of cells tall (1-8) */
  rows?: number;
  /** Alignment within the grid */
  align?: 'start' | 'center' | 'end';
  /** Child content */
  children: React.ReactNode;
  /** Size multiplier (inherited from parent SquareModule) */
  scale?: number;
}

export const GridContent: React.FC<GridContentProps> = ({
  cols = 8,
  rows,
  align = 'center',
  children,
  scale = 1,
}) => {
  const width = CELL_SIZE * cols * scale;
  const height = rows ? CELL_SIZE * rows * scale : 'auto';

  return (
    <div
      style={{
        width,
        height,
        display: 'flex',
        alignItems: align === 'start' ? 'flex-start' : align === 'end' ? 'flex-end' : 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}
    >
      {children}
    </div>
  );
};

export default SquareModule;
