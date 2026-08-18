import type { ComponentType, SVGProps } from "react";

export type IconType = ComponentType<SVGProps<SVGSVGElement>>;

export interface NavSubItem {
  label: string;
  path?: string;
  badge?: string;
  otherSub?: NavSubItem[];
}

export interface NavItem {
  id: string;
  label: string;
  icon: IconType;
  path?: string;
  badge?: string;
  subItems?: NavSubItem[];
}

export interface NavSection {
  id: string;
  title: string;
  items: NavItem[];
}
