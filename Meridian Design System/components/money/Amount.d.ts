import * as React from 'react';

/** AED money display — mono, tabular, thousands-separated. Renders "—" for
 *  unknown values (never guesses). `currencyAfter` for RTL placement. */
export interface AmountProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Numeric or numeric-string value; null/undefined → "—". */
  value: number | string | null;
  /** @default "AED" */
  currency?: string;
  /** sm | md | lg | xl (xl = display weight, for the hero total). @default "md" */
  size?: 'sm' | 'md' | 'lg' | 'xl';
  tone?: 'default' | 'paid' | 'muted' | 'risk';
  /** Place currency after the figure (RTL). */
  currencyAfter?: boolean;
}
export declare function Amount(props: AmountProps): JSX.Element;
