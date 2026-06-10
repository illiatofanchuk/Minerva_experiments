# SectorDock

A macOS-dock-style magnification list for the MINERVA landing page. On hover, the item under the cursor scales up and neighbours follow with a smooth cosine falloff. Built as a **controlled** component: the parent owns the selected index and swaps the content of a linked block on click.

## Stack
React 19 · TypeScript (strict) · MUI v9 (`styled` + theme tokens). No external animation library — magnification runs on a single `requestAnimationFrame` interpolation loop.

## Files
- `SectorDock.tsx` — component + types (`Sector`, `SectorDockProps`)
- `sectors.ts` — default `SECTORS` data array
- `index.ts` — barrel export

## Install
Drop the `SectorDock/` folder into `src/components/`. No new dependencies.

## Props
| prop | type | default | notes |
|---|---|---|---|
| `sectors` | `Sector[]` | — | required |
| `selectedIndex` | `number \| null` | `null` | controlled selection |
| `onSelect` | `(sector, index) => void` | — | fires on click / Enter / Space |
| `maxScale` | `number` | `1.22` | scale of hovered item |
| `spread` | `number` | `1.7` | influence radius (item-heights) |
| `ease` | `number` | `0.14` | rAF lerp factor — lower = silkier |

`Sector` = `{ id: string; label: string }`.

## Linked-content pattern (the click behaviour)
The dock does not own content. The parent holds `selectedIndex`, and the click handler swaps whatever the adjacent block renders, keyed off `sector.id`.

```tsx
import { useState } from 'react';
import Box from '@mui/material/Box';
import { SectorDock, SECTORS } from '@/components/SectorDock';

const CONTENT: Record<string, React.ReactNode> = {
  manufacturing: <ManufacturingPanel />,
  technology: <TechnologyPanel />,
  // ...one entry per sector id
};

export function SectorsSection() {
  const [selected, setSelected] = useState(0);
  const activeId = SECTORS[selected].id;

  return (
    <Box sx={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
      <SectorDock
        sectors={SECTORS}
        selectedIndex={selected}
        onSelect={(_, index) => setSelected(index)}
      />
      <Box sx={{ flex: 1 }}>{CONTENT[activeId]}</Box>
    </Box>
  );
}
```

## Theming
Colours and the index font come from the theme — no hard-coded values:
- text: `palette.text.primary` (hovered/selected) / `text.secondary` (idle)
- accent dot + active index: `palette.primary.main`
- index numerals: `typography.h1.fontFamily` (serif display font)

If your theme lacks a serif display family, set `typography.h1.fontFamily` or adjust the `SectorDock-idx` rule.

## Accessibility & motion
- Each row is a keyboard-focusable `role="button"` with `aria-pressed`; Enter/Space trigger `onSelect`.
- Magnification is disabled on touch (`@media (hover: none)`) and skipped entirely when `prefers-reduced-motion: reduce` — selection/colour still work.
- Scaling is `transform`-only with `transform-origin: left center`, so it never reflows the layout or nudges surrounding content.

## Notes for integration
- Default export is the component; named exports cover types + data.
- The rAF loop self-stops when motion settles (no idle frames) and cleans up on unmount.
- To preselect nothing on load, pass `selectedIndex={null}`.
