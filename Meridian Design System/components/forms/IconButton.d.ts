import * as React from 'react';

/** Icon-only button. Always pass `label` for a11y. 44px target by default. */
export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** The icon node (e.g. 20–24px Lucide svg). */
  icon: React.ReactNode;
  /** Accessible label (aria-label + title) — required. */
  label: string;
  /** @default "plain" */
  variant?: 'plain' | 'tonal' | 'filled' | 'danger';
  /** @default "md" (44px) */
  size?: 'sm' | 'md' | 'lg';
}
export declare function IconButton(props: IconButtonProps): JSX.Element;
