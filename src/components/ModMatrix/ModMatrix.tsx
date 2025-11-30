/**
 * ModMatrix
 *
 * A modulation matrix for routing modulation sources to destinations.
 * Visual grid-based interface for complex modulation routing.
 *
 * Features:
 * - Source/destination grid
 * - Modulation amount control
 * - Bipolar modulation support
 * - Multiple routing slots
 */

import React, { useState, useCallback } from 'react';
import { colors } from '../../theme/tokens';

export interface ModSource {
  id: string;
  name: string;
  shortName?: string;
  color?: string;
}

export interface ModDestination {
  id: string;
  name: string;
  shortName?: string;
  category?: string;
}

export interface ModRoute {
  id: string;
  sourceId: string;
  destId: string;
  amount: number; // -1 to 1 for bipolar, 0 to 1 for unipolar
  enabled: boolean;
}

export interface ModMatrixProps {
  /** Available modulation sources */
  sources: ModSource[];
  /** Available modulation destinations */
  destinations: ModDestination[];
  /** Current routing configuration */
  routes?: ModRoute[];
  /** Called when routes change */
  onChange?: (routes: ModRoute[]) => void;
  /** Maximum number of routes */
  maxRoutes?: number;
  /** Support bipolar modulation (-1 to 1) */
  bipolar?: boolean;
  /** Component label */
  label?: string;
  /** View mode */
  viewMode?: 'grid' | 'list';
  /** Show active connections only */
  showActiveOnly?: boolean;
  /** Compact mode */
  compact?: boolean;
}

const SOURCE_COLORS = [
  colors.accent.cyan,
  colors.accent.coral,
  colors.accent.orange,
  colors.accent.yellow,
  colors.accent.green,
  colors.accent.purple,
  colors.accent.pink,
];

export const ModMatrix: React.FC<ModMatrixProps> = ({
  sources,
  destinations,
  routes: initialRoutes = [],
  onChange,
  maxRoutes = 16,
  bipolar = true,
  label,
  viewMode = 'grid',
  showActiveOnly = false,
  compact = false,
}) => {
  const [routes, setRoutes] = useState<ModRoute[]>(initialRoutes);
  const [hoveredCell, setHoveredCell] = useState<{ srcId: string; destId: string } | null>(null);
  const dragRef = React.useRef<{
    srcId: string;
    destId: string;
    startY: number;
    startAmount: number;
  } | null>(null);

  // Get route for a source/dest pair
  const getRoute = useCallback(
    (srcId: string, destId: string): ModRoute | undefined => {
      return routes.find((r) => r.sourceId === srcId && r.destId === destId);
    },
    [routes]
  );

  // Update routes and notify parent
  const updateRoutes = useCallback(
    (newRoutes: ModRoute[]) => {
      setRoutes(newRoutes);
      onChange?.(newRoutes);
    },
    [onChange]
  );

  // Toggle route enabled state
  const toggleRoute = useCallback(
    (srcId: string, destId: string) => {
      const existing = getRoute(srcId, destId);

      if (existing) {
        // Toggle existing route
        updateRoutes(
          routes.map((r) =>
            r.id === existing.id ? { ...r, enabled: !r.enabled } : r
          )
        );
      } else if (routes.length < maxRoutes) {
        // Create new route
        const newRoute: ModRoute = {
          id: `route_${srcId}_${destId}`,
          sourceId: srcId,
          destId: destId,
          amount: bipolar ? 0.5 : 0.5,
          enabled: true,
        };
        updateRoutes([...routes, newRoute]);
      }
    },
    [routes, getRoute, maxRoutes, bipolar, updateRoutes]
  );

  // Update route amount
  const updateAmount = useCallback(
    (srcId: string, destId: string, amount: number) => {
      const existing = getRoute(srcId, destId);

      if (existing) {
        updateRoutes(
          routes.map((r) =>
            r.id === existing.id ? { ...r, amount } : r
          )
        );
      } else if (routes.length < maxRoutes) {
        const newRoute: ModRoute = {
          id: `route_${srcId}_${destId}`,
          sourceId: srcId,
          destId: destId,
          amount,
          enabled: true,
        };
        updateRoutes([...routes, newRoute]);
      }
    },
    [routes, getRoute, maxRoutes, updateRoutes]
  );

  // Remove route
  const removeRoute = useCallback(
    (routeId: string) => {
      updateRoutes(routes.filter((r) => r.id !== routeId));
    },
    [routes, updateRoutes]
  );

  // Get source color
  const getSourceColor = (srcId: string): string => {
    const src = sources.find((s) => s.id === srcId);
    if (src?.color) return src.color;
    const index = sources.findIndex((s) => s.id === srcId);
    return SOURCE_COLORS[index % SOURCE_COLORS.length];
  };

  // Filtered routes for display
  const visibleRoutes = showActiveOnly
    ? routes.filter((r) => r.enabled)
    : routes;

  // Compact sizes for mobile-friendly grid
  const cellSize = compact ? 24 : 28;
  const headerSize = compact ? 48 : 56;
  // Max 4 destinations visible on mobile (340px - headerSize) / cellSize
  // Note: maxVisibleDests = Math.floor((340 - headerSize) / (cellSize + 1));

  if (viewMode === 'list') {
    // List view - shows active routes as a list
    return (
      <div
        className="synth-control"
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
          padding: 12,
          background: colors.bg.surface,
          borderRadius: 8,
          maxWidth: 340,
          width: '100%',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          {label && (
            <div
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 11,
                color: colors.text.secondary,
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
              }}
            >
              {label}
            </div>
          )}
        </div>

        {/* Route list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {visibleRoutes.map((route) => {
            const src = sources.find((s) => s.id === route.sourceId);
            const dest = destinations.find((d) => d.id === route.destId);
            const srcColor = getSourceColor(route.sourceId);

            return (
              <div
                key={route.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: 8,
                  background: colors.bg.elevated,
                  borderRadius: 4,
                  opacity: route.enabled ? 1 : 0.5,
                }}
              >
                {/* Source */}
                <div
                  style={{
                    width: 60,
                    fontSize: 10,
                    fontFamily: 'var(--font-mono)',
                    color: srcColor,
                    fontWeight: 600,
                  }}
                >
                  {src?.shortName || src?.name}
                </div>

                {/* Arrow */}
                <div style={{ color: colors.text.disabled }}>→</div>

                {/* Amount slider */}
                <div
                  style={{
                    flex: 1,
                    height: 20,
                    background: colors.bg.base,
                    borderRadius: 4,
                    position: 'relative',
                    cursor: 'ew-resize',
                  }}
                  onMouseDown={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const updateValue = (clientX: number) => {
                      const relX = (clientX - rect.left) / rect.width;
                      const amount = bipolar
                        ? Math.max(-1, Math.min(1, (relX - 0.5) * 2))
                        : Math.max(0, Math.min(1, relX));
                      updateAmount(route.sourceId, route.destId, amount);
                    };
                    updateValue(e.clientX);

                    const handleMove = (moveE: MouseEvent) => updateValue(moveE.clientX);
                    const handleUp = () => {
                      window.removeEventListener('mousemove', handleMove);
                      window.removeEventListener('mouseup', handleUp);
                    };
                    window.addEventListener('mousemove', handleMove);
                    window.addEventListener('mouseup', handleUp);
                  }}
                >
                  {/* Center line for bipolar */}
                  {bipolar && (
                    <div
                      style={{
                        position: 'absolute',
                        left: '50%',
                        top: 0,
                        bottom: 0,
                        width: 1,
                        background: colors.bg.highlight,
                      }}
                    />
                  )}

                  {/* Amount bar */}
                  <div
                    style={{
                      position: 'absolute',
                      top: 2,
                      bottom: 2,
                      left: bipolar
                        ? route.amount >= 0
                          ? '50%'
                          : `${50 + route.amount * 50}%`
                        : 0,
                      width: bipolar
                        ? `${Math.abs(route.amount) * 50}%`
                        : `${route.amount * 100}%`,
                      background: srcColor,
                      borderRadius: 2,
                      opacity: 0.7,
                    }}
                  />

                  {/* Value display */}
                  <div
                    style={{
                      position: 'absolute',
                      right: 4,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      fontSize: 9,
                      fontFamily: 'var(--font-numeric)',
                      color: colors.text.muted,
                    }}
                  >
                    {bipolar && route.amount > 0 && '+'}
                    {Math.round(route.amount * 100)}%
                  </div>
                </div>

                {/* Arrow */}
                <div style={{ color: colors.text.disabled }}>→</div>

                {/* Destination */}
                <div
                  style={{
                    width: 70,
                    fontSize: 10,
                    fontFamily: 'var(--font-mono)',
                    color: colors.text.secondary,
                  }}
                >
                  {dest?.shortName || dest?.name}
                </div>

                {/* Enable toggle */}
                <button
                  onClick={() => toggleRoute(route.sourceId, route.destId)}
                  style={{
                    width: 20,
                    height: 20,
                    background: route.enabled ? srcColor : colors.bg.base,
                    border: 'none',
                    borderRadius: 3,
                    cursor: 'pointer',
                  }}
                />

                {/* Remove button */}
                <button
                  onClick={() => removeRoute(route.id)}
                  style={{
                    width: 20,
                    height: 20,
                    background: colors.bg.base,
                    border: 'none',
                    borderRadius: 3,
                    cursor: 'pointer',
                    color: colors.text.disabled,
                    fontSize: 14,
                  }}
                >
                  ×
                </button>
              </div>
            );
          })}

          {/* Empty state */}
          {visibleRoutes.length === 0 && (
            <div
              style={{
                padding: 24,
                textAlign: 'center',
                color: colors.text.disabled,
                fontSize: 11,
                fontFamily: 'var(--font-mono)',
              }}
            >
              No modulation routes
            </div>
          )}
        </div>
      </div>
    );
  }

  // Grid view - constrained to mobile width
  const maxWidth = 340; // Mobile-friendly max width

  return (
    <div
      className="synth-control"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        padding: 12,
        background: colors.bg.surface,
        borderRadius: 8,
        maxWidth,
        width: '100%',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        {label && (
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 11,
              color: colors.text.secondary,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
            }}
          >
            {label}
          </div>
        )}
      </div>

      {/* Matrix grid */}
      <div style={{ overflowX: 'auto' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: `${headerSize}px repeat(${destinations.length}, ${cellSize}px)`,
            gridTemplateRows: `${headerSize}px repeat(${sources.length}, ${cellSize}px)`,
            gap: 1,
          }}
        >
          {/* Top-left corner */}
          <div
            style={{
              background: colors.bg.base,
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'flex-end',
              padding: 4,
            }}
          >
            <span
              style={{
                fontSize: 7,
                color: colors.text.disabled,
                fontFamily: 'var(--font-mono)',
              }}
            >
              SRC→DEST
            </span>
          </div>

          {/* Destination headers */}
          {destinations.map((dest) => (
            <div
              key={dest.id}
              style={{
                background: colors.bg.elevated,
                display: 'flex',
                alignItems: 'flex-end',
                justifyContent: 'center',
                padding: 4,
                writingMode: 'vertical-rl',
                textOrientation: 'mixed',
                transform: 'rotate(180deg)',
              }}
            >
              <span
                style={{
                  fontSize: 8,
                  color: colors.text.muted,
                  fontFamily: 'var(--font-mono)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
                title={dest.name}
              >
                {dest.shortName || dest.name}
              </span>
            </div>
          ))}

          {/* Source rows */}
          {sources.map((src) => {
            const srcColor = getSourceColor(src.id);

            return (
              <React.Fragment key={src.id}>
                {/* Source header */}
                <div
                  style={{
                    background: colors.bg.elevated,
                    display: 'flex',
                    alignItems: 'center',
                    padding: '0 8px',
                    borderLeft: `3px solid ${srcColor}`,
                  }}
                >
                  <span
                    style={{
                      fontSize: 9,
                      color: srcColor,
                      fontFamily: 'var(--font-mono)',
                      fontWeight: 600,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                    title={src.name}
                  >
                    {src.shortName || src.name}
                  </span>
                </div>

                {/* Cells */}
                {destinations.map((dest) => {
                  const route = getRoute(src.id, dest.id);
                  const isHovered =
                    hoveredCell?.srcId === src.id && hoveredCell?.destId === dest.id;

                  return (
                    <div
                      key={dest.id}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        const existing = getRoute(src.id, dest.id);
                        if (!existing) {
                          // Create new route on first click
                          toggleRoute(src.id, dest.id);
                          return;
                        }
                        // Start drag to adjust amount
                        dragRef.current = {
                          srcId: src.id,
                          destId: dest.id,
                          startY: e.clientY,
                          startAmount: existing.amount,
                        };
                        const handleMove = (moveE: MouseEvent) => {
                          if (!dragRef.current) return;
                          const deltaY = dragRef.current.startY - moveE.clientY;
                          const sensitivity = 0.01;
                          let newAmount = dragRef.current.startAmount + deltaY * sensitivity;
                          if (bipolar) {
                            newAmount = Math.max(-1, Math.min(1, newAmount));
                          } else {
                            newAmount = Math.max(0, Math.min(1, newAmount));
                          }
                          updateAmount(dragRef.current.srcId, dragRef.current.destId, newAmount);
                        };
                        const handleUp = () => {
                          dragRef.current = null;
                          window.removeEventListener('mousemove', handleMove);
                          window.removeEventListener('mouseup', handleUp);
                        };
                        window.addEventListener('mousemove', handleMove);
                        window.addEventListener('mouseup', handleUp);
                      }}
                      onDoubleClick={() => {
                        const existing = getRoute(src.id, dest.id);
                        if (existing) {
                          // Toggle enabled or remove on double-click
                          toggleRoute(src.id, dest.id);
                        }
                      }}
                      onMouseEnter={() => setHoveredCell({ srcId: src.id, destId: dest.id })}
                      onMouseLeave={() => setHoveredCell(null)}
                      style={{
                        background: isHovered
                          ? colors.bg.elevated
                          : colors.bg.base,
                        cursor: 'ns-resize',
                        position: 'relative',
                        transition: 'background 0.1s',
                        border: isHovered ? `1px solid ${srcColor}40` : '1px solid transparent',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {/* Route indicator - colored based on positive/negative */}
                      {route && route.enabled && (
                        <div
                          style={{
                            position: 'absolute',
                            inset: 2,
                            background: route.amount >= 0
                              ? srcColor
                              : colors.accent.coral,
                            opacity: Math.abs(route.amount) * 0.7 + 0.2,
                            borderRadius: 3,
                          }}
                        />
                      )}

                      {/* Percentage text */}
                      {route && route.enabled && (
                        <span
                          style={{
                            position: 'relative',
                            zIndex: 1,
                            fontSize: compact ? 7 : 9,
                            fontFamily: 'var(--font-numeric)',
                            fontWeight: 600,
                            color: colors.text.primary,
                            textShadow: '0 1px 2px rgba(0,0,0,0.5)',
                          }}
                        >
                          {route.amount >= 0 ? '+' : ''}{Math.round(route.amount * 100)}
                        </span>
                      )}

                      {/* Amount indicator for disabled routes */}
                      {route && !route.enabled && (
                        <div
                          style={{
                            position: 'absolute',
                            inset: 4,
                            border: `1px dashed ${srcColor}`,
                            borderRadius: 3,
                            opacity: 0.3,
                          }}
                        />
                      )}
                    </div>
                  );
                })}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Info panel - always visible to prevent jitter */}
      <div
        style={{
          padding: 8,
          background: colors.bg.elevated,
          borderRadius: 4,
          fontSize: 10,
          color: colors.text.muted,
          fontFamily: 'var(--font-mono)',
          textAlign: 'center',
          minHeight: 32,
        }}
      >
        {hoveredCell && getRoute(hoveredCell.srcId, hoveredCell.destId) ? (
          <>
            {sources.find((s) => s.id === hoveredCell.srcId)?.name} →{' '}
            {destinations.find((d) => d.id === hoveredCell.destId)?.name}:{' '}
            <span style={{ color: colors.text.primary, fontWeight: 600 }}>
              {Math.round((getRoute(hoveredCell.srcId, hoveredCell.destId)?.amount ?? 0) * 100)}%
            </span>
            <span style={{ color: colors.text.disabled, marginLeft: 8 }}>
              (drag ↕ to adjust)
            </span>
          </>
        ) : (
          <span style={{ color: colors.text.disabled }}>
            Click cell to create route, drag to adjust
          </span>
        )}
      </div>
    </div>
  );
};

export default ModMatrix;
