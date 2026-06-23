A single payment-plan installment. `type` distinguishes the two first-class milestone kinds; construction-linked rows carry a build-trigger `due` string instead of a fixed date.

```jsx
<MilestoneRow type="time" title="DLD registration fee (4%)"
  due="Due 28 Jun 2026" status="due" statusLabel="Due in 3 days" amount={75000} />
<MilestoneRow type="construction" title="20% construction milestone"
  due="on 40% build · est. Q1 2027" status="upcoming" amount={375000} />
```
