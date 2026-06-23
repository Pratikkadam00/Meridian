import * as React from 'react';

/** Bottom sheet for in-context actions (mark-paid, add-deal chooser, nudge
 *  composer, notification primer). Position:absolute — host needs a relative
 *  phone frame. Pass onClose for scrim dismissal. */
export interface SheetProps extends React.HTMLAttributes<HTMLDivElement> {
  open?: boolean;
  title?: string;
  subtitle?: string;
  onClose?: () => void;
  /** Node docked at the header's trailing edge (e.g. a close IconButton). */
  headerRight?: React.ReactNode;
  children?: React.ReactNode;
}
export declare function Sheet(props: SheetProps): JSX.Element;
