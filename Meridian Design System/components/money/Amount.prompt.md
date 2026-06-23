AED money. Tabular mono; shows "—" for unknown rather than guessing. `size="xl"` for the hero "what's due" total.

```jsx
<Amount value={1250000} size="xl" />          {/* AED 1,250,000 */}
<Amount value={250000} tone="paid" size="sm" />
<Amount value={null} />                         {/* AED — */}
```
