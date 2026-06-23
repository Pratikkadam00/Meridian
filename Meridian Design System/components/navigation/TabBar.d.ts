import * as React from 'react';

export interface TabItem {
  value: string;
  label: string;
  icon: React.ReactNode;
  /** Optional count badge (e.g. overdue count). */
  badge?: number | string;
}

/** Bottom tab bar — blurred chrome, jade active pill. 3–5 items, RTL-aware. */
export interface TabBarProps extends React.HTMLAttributes<HTMLElement> {
  items: TabItem[];
  value: string;
  onChange?: (value: string) => void;
}
export declare function TabBar(props: TabBarProps): JSX.Element;
