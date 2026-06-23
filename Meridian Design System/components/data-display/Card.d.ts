import * as React from 'react';

/**
 * Surface container — hairline border + warm shadow.
 * @startingPoint section="Surfaces" subtitle="Card surfaces — default, ink hero, sunken" viewport="700x260"
 */
export interface CardProps extends React.HTMLAttributes<HTMLElement> {
  /** default = white card · ink = dark hero panel · sunk = inset/sunken. @default "default" */
  tone?: 'default' | 'ink' | 'sunk';
  /** Use the raised (md) shadow. */
  raised?: boolean;
  /** Adds hover lift + press; renders as <button>. */
  interactive?: boolean;
  as?: keyof JSX.IntrinsicElements;
  children?: React.ReactNode;
}
export declare function Card(props: CardProps): JSX.Element;
