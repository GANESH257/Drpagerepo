import type { ComponentType } from 'react';

/**
 * Nav item for portal sidebar. Can be a single link or a group with children (↳).
 * Matches doctor portal reference: main item = first-level, sub-items = children.
 */
export interface PortalNavItem {
  label: string;
  href?: string;
  icon: ComponentType<{ className?: string }>;
  description?: string;
  /** Sub-items (↳) shown under this item when expanded */
  children?: PortalNavItem[];
}
