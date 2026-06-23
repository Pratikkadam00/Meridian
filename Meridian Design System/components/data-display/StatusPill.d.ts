import * as React from 'react';

/**
 * Milestone / deal status — icon + word + color, never color alone.
 * `atrisk` adds a hatch pattern for color-blind safety.
 * @startingPoint section="Status" subtitle="Milestone status pills" viewport="700x150"
 */
export interface StatusPillProps extends React.HTMLAttributes<HTMLSpanElement> {
  status: 'paid' | 'due' | 'upcoming' | 'overdue' | 'grace' | 'atrisk';
  /** Override the default word (e.g. "Due in 3 days", "Overdue by 6 days"). */
  children?: React.ReactNode;
  /** Compact variant for inside dense list rows. */
  dense?: boolean;
}
export declare function StatusPill(props: StatusPillProps): JSX.Element;
