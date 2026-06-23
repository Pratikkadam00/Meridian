import * as React from 'react';

/** Sticky top header — optional back chevron (RTL-mirrored), eyebrow + title,
 *  trailing actions, blurred translucent bar. */
export interface AppHeaderProps extends React.HTMLAttributes<HTMLElement> {
  title?: React.ReactNode;
  /** Small overline above the title (e.g. project name). */
  eyebrow?: React.ReactNode;
  /** Shows a back chevron when provided. */
  onBack?: () => void;
  /** Trailing action nodes (IconButtons). */
  actions?: React.ReactNode;
  /** Show the bottom hairline (set when content scrolls under it). */
  bordered?: boolean;
  /** Center the title (modal-style screens). */
  center?: boolean;
}
export declare function AppHeader(props: AppHeaderProps): JSX.Element;
