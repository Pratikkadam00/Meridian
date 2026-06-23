import * as React from 'react';

/** Labelled input. Use `mono` for amounts/IBANs/IDs, `tone="confirm"` to flag
 *  a money/date field awaiting explicit verification, `prefix="AED"` for currency. */
export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'prefix'> {
  label?: string;
  required?: boolean;
  /** Static leading text (e.g. "AED"). */
  prefix?: React.ReactNode;
  /** Static trailing text (e.g. "%"). */
  suffix?: React.ReactNode;
  leadingIcon?: React.ReactNode;
  /** Mono + tabular figures — for money, IBANs, DLD/Oqood IDs. */
  mono?: boolean;
  /** "confirm" = amber highlight for unverified money/date fields. */
  tone?: 'default' | 'confirm' | 'error';
  help?: string;
  error?: string;
}
export declare function Input(props: InputProps): JSX.Element;
