import * as React from 'react';

export type SegOption = string | { value: string; label: React.ReactNode; icon?: React.ReactNode };

/** Pill segmented control for 2–4 exclusive options (EN/AR, milestone type, filters). */
export interface SegmentedControlProps {
  options: SegOption[];
  value: string;
  onChange?: (value: string) => void;
  fullWidth?: boolean;
}
export declare function SegmentedControl(props: SegmentedControlProps): JSX.Element;
