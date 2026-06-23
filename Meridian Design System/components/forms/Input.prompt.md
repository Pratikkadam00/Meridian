Labelled text/number field. Turn on `mono` for anything verified digit-by-digit, `tone="confirm"` to mark an unverified AI-extracted money/date field.

```jsx
<Input label="Booking deposit" prefix="AED" mono tone="confirm"
       defaultValue="250,000" help="Tap to see where this came from in the SPA" />
<Input label="Escrow IBAN" mono placeholder="AE00 0000 0000 0000 0000 000" />
```
