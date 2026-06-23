import * as React from 'react';

/**
 * AI extraction confidence — word + distinct icon shape + color, never a
 * bare percentage. Shapes (filled / half / hollow) keep it color-blind safe.
 * @startingPoint section="AI" subtitle="Trust-but-verify confidence cues" viewport="700x150"
 */
export interface ConfidenceCueProps extends React.HTMLAttributes<HTMLSpanElement> {
  level: 'high' | 'med' | 'low';
  /** Render as a tinted chip rather than inline text. */
  chip?: boolean;
  /** Hide the word (icon only) — discouraged; word aids accessibility. */
  showWord?: boolean;
}
export declare function ConfidenceCue(props: ConfidenceCueProps): JSX.Element;
