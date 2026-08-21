import type { ComponentType, SVGProps } from "react";

export type IconType = ComponentType<SVGProps<SVGSVGElement>>;

export interface NavSubItem {
  label: string;
  path?: string;
  badge?: string;
  otherSub?: NavSubItem[];
  /** Optional title to use when this sub-item is active */
  title?: string;
  /** Optional favicon path (public) to set when this sub-item is active */
  favicon?: string;
}

export interface NavItem {
  id: string;
  label: string;
  icon: IconType;
  path?: string;
  badge?: string;
  subItems?: NavSubItem[];
  /** Optional title to use when this item is active */
  title?: string;
  /** Optional favicon path (public) to set when this item is active */
  favicon?: string;
}

export interface NavSection {
  id: string;
  title: string;
  items: NavItem[];
}
