/**
 * SquareModule - A fixed-size square container for synth modules
 *
 * Follows the "box layout pattern" from CLAUDE.md:
 * - Fixed size (default 320x320px)
 * - Works with flexbox wrap for responsive layouts
 * - Use flex-shrink: 0 to prevent scaling
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

export interface SquareModuleProps {
  /** Module title displayed at top */
  title?: string;
  /** Accent color for border and title */
  color?: ColorAccent;
  /** Size in pixels (default 320) */
  size?: number;
  /** Child content */
  children: React.ReactNode;
  /** Additional inline styles */
  style?: React.CSSProperties;
}

export const SquareModule: React.FC<SquareModuleProps> = ({
  title,
  color,
  size = 320,
  children,
  style,
}) => {
  const accentColor = color ? colors.accent[color] : undefined;

  return (
    <div
      style={{
        width: size,
        height: size,
        flexShrink: 0,
        background: colors.bg.surface,
        borderRadius: 12,
        border: `1px solid ${accentColor ? accentColor + '33' : colors.bg.border}`,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        ...style,
      }}
    >
      {title && (
        <div
          style={{
            padding: '10px 8px',
            color: accentColor || colors.text.muted,
            fontFamily: 'var(--font-mono)',
            fontSize: 11,
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            flexShrink: 0,
          }}
        >
          {title}
        </div>
      )}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 8,
          minHeight: 0,
          overflow: 'hidden',
        }}
      >
        {children}
      </div>
    </div>
  );
};

export default SquareModule;
