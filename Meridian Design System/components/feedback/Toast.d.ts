import * as React from 'react';

/** Transient confirmation/info. tone sets icon + accent. One optional action. */
export interface ToastProps extends React.HTMLAttributes<HTMLDivElement> {
  tone?: 'success' | 'info' | 'warn' | 'error';
  actionLabel?: string;
  onAction?: () => void;
  children?: React.ReactNode;
}
export declare function Toast(props: ToastProps): JSX.Element;
