/**
 * Portal sidebar nav types.
 * Supports flat links and sections with ↳ children (doctor portal reference).
 */

export type NavIcon = React.ComponentType<{ className?: string }>;

export interface NavItemChild {
  label: string;
  href: string;
  icon?: NavIcon;
  description?: string;
}

export interface NavItem {
  label: string;
  href?: string;
  icon: NavIcon;
  description?: string;
  /** When set, this item is a section with sub-items (↳) in the sidebar */
  children?: NavItemChild[];
}

export function hasNavChildren(item: NavItem): item is NavItem & { children: NavItemChild[] } {
  return Array.isArray(item.children) && item.children.length > 0;
}
