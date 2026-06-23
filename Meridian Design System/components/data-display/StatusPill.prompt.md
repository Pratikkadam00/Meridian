Milestone/deal status — pairs an icon, a word, and a color (accessibility: never color-alone; `atrisk` is also hatched).

```jsx
<StatusPill status="overdue">Overdue by 6 days</StatusPill>
<StatusPill status="due">Due in 3 days</StatusPill>
<StatusPill status="paid">Paid 12 Aug</StatusPill>
<StatusPill status="grace">In grace · 4 days</StatusPill>
```

Statuses: `paid` `due` `upcoming` `overdue` `grace` `atrisk`. Pass custom text as children.
