import * as React from 'react';

/** Checkbox for consent gates, snagging checklist, multi-select. Label via children. */
export interface CheckboxProps {
  checked?: boolean;
  onChange?: (next: boolean) => void;
  disabled?: boolean;
  children?: React.ReactNode;
}
export declare function Checkbox(props: CheckboxProps): JSX.Element;
