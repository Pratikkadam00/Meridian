import * as React from 'react';

/** Small label/count chip. `tone="sample"` = dashed amber for clearly-labeled sample data. */
export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  tone?: 'neutral' | 'jade' | 'amber' | 'slate' | 'sample';
  /** Leading dot. */
  dot?: boolean;
  /** Sentence-case, non-tracked variant (for labels rather than overlines). */
  soft?: boolean;
  children?: React.ReactNode;
}
export declare function Badge(props: BadgeProps): JSX.Element;
