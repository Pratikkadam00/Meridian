import * as React from 'react';

/**
 * One installment in a payment plan. Distinguishes time-linked (calendar)
 * from construction-linked (hard-hat; floating due date) milestones.
 * @startingPoint section="Money" subtitle="Payment-plan milestone rows" viewport="700x300"
 */
export interface MilestoneRowProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  title: string;
  /** Due text — a date ("12 Aug 2026") OR a build trigger ("on 60% build · est. Q3 2026"). */
  due: string;
  amount: number | string | null;
  status?: 'paid' | 'due' | 'upcoming' | 'overdue' | 'grace' | 'atrisk';
  /** time = fixed date · construction = floating, tied to build %. @default "time" */
  type?: 'time' | 'construction';
  /** Override the pill word (e.g. "Due in 3 days"). */
  statusLabel?: React.ReactNode;
  /** RTL currency placement. */
  currencyAfter?: boolean;
}
export declare function MilestoneRow(props: MilestoneRowProps): JSX.Element;
