import * as React from 'react';

/** Binary toggle for settings (push, app-lock, quiet hours, channels). RTL-aware. */
export interface SwitchProps {
  checked?: boolean;
  onChange?: (next: boolean) => void;
  disabled?: boolean;
  /** Accessible label. */
  label?: string;
}
export declare function Switch(props: SwitchProps): JSX.Element;
