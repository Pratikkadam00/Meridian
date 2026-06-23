A single extracted field in the SPA review screen. Tap → highlight source in the PDF. `money` fields demand an explicit confirm; `confidence="low"` escalates to terracotta; empty `value` shows the manual-entry fallback.

```jsx
<FieldReviewRow label="Total price" value="AED 1,250,000" confidence="high" money
  active={sel==='price'} onClick={()=>highlight('price')} />
<FieldReviewRow label="Escrow IBAN" value="AE07 0331…" confidence="low" />
<FieldReviewRow label="Oqood no." value={null} confidence="low" />
```
