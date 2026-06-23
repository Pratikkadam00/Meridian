import * as React from 'react';

/** Buyer/client avatar — initials fallback or image. */
export interface AvatarProps extends React.HTMLAttributes<HTMLSpanElement> {
  name?: string;
  src?: string;
  size?: 'sm' | 'md' | 'lg';
}
export declare function Avatar(props: AvatarProps): JSX.Element;
