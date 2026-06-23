import * as React from 'react';

/** Construction % or payment-plan progress. Always shows a numeric label
 *  (value isn't conveyed by bar length/color alone). */
export interface ProgressMeterProps extends React.HTMLAttributes<HTMLDivElement> {
  /** 0–100. */
  value: number;
  label?: string;
  /** construction = amber (build %) · payment = jade (paid %) · neutral. @default "payment" */
  variant?: 'construction' | 'payment' | 'neutral';
  showValue?: boolean;
  /** Optional target tick (0–100), e.g. the next construction-linked trigger. */
  marker?: number;
}
export declare function ProgressMeter(props: ProgressMeterProps): JSX.Element;
