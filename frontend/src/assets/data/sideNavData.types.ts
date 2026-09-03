import type { ComponentType, SVGProps } from "react";

export type IconType = ComponentType<SVGProps<SVGSVGElement>>;

/** A single leaf link inside a dropdown sub-menu */
export interface NavSubItem {
  label: string;
  path?: string;
  badge?: string;
  otherSub?: NavSubItem[];
  role?: string[];
}

/** A top-level sidebar entry. Either links directly to `path`,
 *  or — if `subItems` is provided — expands into a dropdown. */
export interface NavItem {
  id: string;
  label: string;
  icon: IconType;
  path?: string;
  badge?: string;
  subItems?: NavSubItem[];
  role?: string[];
}

/** A named group of nav items, rendered under its own section heading */
export interface NavSection {
  id: string;
  title: string;
  items: NavItem[];
}
