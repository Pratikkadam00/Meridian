import * as React from 'react';

/**
 * One AI-extracted SPA field on the review/confirm screen. Tapping highlights
 * its source in the PDF; money/date fields require explicit confirm; low
 * confidence is escalated (terracotta). Empty value falls back to manual entry.
 * @startingPoint section="AI" subtitle="SPA field review + confirm row" viewport="700x220"
 */
export interface FieldReviewRowProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Field name (e.g. "Booking deposit", "Escrow IBAN"). */
  label: string;
  /** Extracted value; null/empty → "Tap to enter" (manual fallback). */
  value?: React.ReactNode;
  confidence?: 'high' | 'med' | 'low';
  /** Currently selected (source highlighted in PDF). */
  active?: boolean;
  /** User has explicitly confirmed — shows a confirmed check instead of the cue. */
  confirmed?: boolean;
  /** Money/date field — requires explicit confirm before save. */
  money?: boolean;
}
export declare function FieldReviewRow(props: FieldReviewRowProps): JSX.Element;
