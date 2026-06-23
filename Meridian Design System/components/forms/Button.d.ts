import * as React from 'react';

/**
 * Primary action button for Meridian. 1–2 tap actions, 44px+ targets.
 *
 * @startingPoint section="Forms" subtitle="Buttons — primary, secondary, ghost, danger" viewport="700x180"
 */
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Visual weight. @default "primary" */
  variant?: 'primary' | 'secondary' | 'ghost' | 'quiet' | 'danger';
  /** Control height. @default "md" */
  size?: 'sm' | 'md' | 'lg';
  /** Stretch to container width (use for bottom-docked CTAs). */
  fullWidth?: boolean;
  /** Icon node before the label (e.g. a 20px Lucide svg). */
  leftIcon?: React.ReactNode;
  /** Icon node after the label (e.g. chevron — mirror in RTL). */
  rightIcon?: React.ReactNode;
  /** Shows a spinner and blocks interaction. */
  loading?: boolean;
  /** Render as another element/anchor. @default "button" */
  as?: 'button' | 'a';
  children?: React.ReactNode;
}
export declare function Button(props: ButtonProps): JSX.Element;
