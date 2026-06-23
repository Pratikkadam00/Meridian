Bottom navigation (3–5 items). Active item gets a jade pill + label; supports a count badge.

```jsx
<TabBar value={tab} onChange={setTab} items={[
  { value:'home',  label:'Due',    icon:icon('layout-list'), badge:3 },
  { value:'deals', label:'Deals',  icon:icon('folder') },
  { value:'comms', label:'Comms',  icon:icon('bell') },
  { value:'me',    label:'You',    icon:icon('user') },
]} />
```
