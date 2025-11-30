/**
 * Module - Container wrapper for synth modules
 *
 * Provides consistent styling for module panels with optional header.
 */

import React from 'react';
import { colors, components } from '../../theme/tokens';

export interface ModuleProps {
  /** Module title */
  title?: string;
  /** Right-aligned header content (e.g., value display) */
  headerRight?: React.ReactNode;
  /** Module content */
  children: React.ReactNode;
  /** Width in pixels */
  width?: number | string;
  /** Compact mode */
  compact?: boolean;
  /** Custom padding */
  padding?: number;
  /** Custom gap between children */
  gap?: number;
  /** Additional styles */
  style?: React.CSSProperties;
}

export const Module: React.FC<ModuleProps> = ({
  title,
  headerRight,
  children,
  width,
  compact = false,
  padding,
  gap,
  style,
}) => {
  const effectivePadding = padding ?? (compact ? components.module.paddingCompact : components.module.padding);
  const effectiveGap = gap ?? (compact ? components.module.gapCompact : components.module.gap);

  return (
    <div
      className="synth-module"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: effectiveGap,
        padding: effectivePadding,
        background: colors.bg.surface,
        borderRadius: components.module.borderRadius,
        width,
        ...style,
      }}
    >
      {(title || headerRight) && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          {title && (
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: compact ? 10 : 11,
                color: colors.text.muted,
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
              }}
            >
              {title}
            </span>
          )}
          {headerRight}
        </div>
      )}
      {children}
    </div>
  );
};

export default Module;
