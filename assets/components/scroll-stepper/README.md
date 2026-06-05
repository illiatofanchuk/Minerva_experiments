# ScrollStepper — integration notes (for Claude Code)

A pinned landing section that turns vertical scroll into 3 discrete steps.
The active step renders as a capsule whose fill tracks scroll progress;
passed steps are dark dots, upcoming steps are light dots. When the last step
fills, the page scrolls on normally. No looping.

## Files

- `ScrollStepper.tsx` — component (TypeScript + JSX, default export)
- `ScrollStepper.module.css` — scoped styles (the indicator + sticky layout)
- `usage-example.tsx` — placement example
- `README.md` — this file
- (`preview.html` in the parent folder, `scroll-indicator-preview.html`, is a
  vanilla prototype — see "Why the React version differs" below)

## Stack

Vite + React + TS. CSS Modules work out of the box. Type-checks clean under
`tsc --strict`; builds clean under Vite; verified by walking native scroll in
a headless browser (step/fill mapping confirmed monotonic, releases at 100%).

## Install

Copy `ScrollStepper.tsx` + `ScrollStepper.module.css` into
`src/components/ScrollStepper/`, then place the component in normal page flow:

```tsx
import ScrollStepper from "@/components/ScrollStepper/ScrollStepper";

<ScrollStepper steps={3} renderPanel={(step, fill) => <YourPanel .../>} />
```

## CRITICAL: placement

The component **is its own scroll region**. It renders a wrapper that is
`(steps + 1) * 100vh` tall with a `position: sticky` inner. It must sit in the
normal document flow (between other full-height sections). Do **not**:

- put it inside a fixed-height / `overflow:hidden` container,
- wrap it in a flex/grid cell that constrains its height,
- nest it inside another sticky/transformed ancestor (a `transform` on any
  ancestor breaks `position: sticky`).

If the steps never advance, the cause is almost always a constrained or
transformed ancestor.

## Props

| prop          | type                                              | default | notes                                  |
| ------------- | ------------------------------------------------- | ------- | -------------------------------------- |
| `steps`       | `number`                                          | `3`     | number of dots/steps                   |
| `renderPanel` | `(activeStep: number, fill: number) => ReactNode` | —       | content shown in the pinned panel      |
| `className`   | `string`                                          | —       | merged onto the wrapper                |

`renderPanel` is called on every scroll frame with the current step index
(0-based) and fill (0..1). Use it to cross-fade headings/illustrations per
step.

## How it works (and why it differs from the HTML preview)

The vanilla preview (`scroll-indicator-preview.html`) hard-hijacks the wheel:
`preventDefault()` + accumulate `deltaY` + `window.scrollTo` to pin the page.
That demonstrates the behaviour but is fragile in production — trackpad
inertia can overshoot the boundary, and it fights the browser's native scroll.

**This React version uses the robust approach instead:** it does NOT hijack
the wheel. The wrapper is made tall (`(steps+1) * 100vh`) and its inner is
`sticky`. As the user scrolls through the wrapper's extra height, the
component reads `getBoundingClientRect().top` on `scroll` and maps that
position onto `(step, fill)`. Consequences:

- native momentum, keyboard (PageUp/Down, arrows, Home/End) and a11y all work;
- reverse scroll is automatically symmetric (same scroll position -> same
  state), which is what fixed the "abrupt jump back to the first block";
- no `preventDefault`, so it never interferes with the rest of the page.

Trade-off: the section consumes `steps * 100vh` of scroll distance. To make
each step require more/less scrolling, change nothing in JS — adjust the
wrapper height multiplier. Currently one step ≈ one viewport of scroll. For
"more scroll per step", raise the multiplier in the inline style
(`${(steps + 1) * 100}vh` → e.g. `${(steps * 1.5 + 1) * 100}vh`) and divide
`exact` accordingly, or expose a `scrollPerStep` prop (see below).

### Optional: tune scroll length per step

If you want an explicit knob, add a prop and use it in two places:

```tsx
// height: `${(steps * scrollPerStep + 1) * 100}vh`
// const scrollable = wrap.offsetHeight - vh;  // unchanged
// exact = progress * steps;                   // unchanged
```

Increasing `scrollPerStep` just lengthens the wrapper, so each step maps to
more scroll distance — smoother, no logic change.

## Indicator visuals

- dot (upcoming): `#CBD5E1`, 8px
- dot (passed): `#1E293B`
- capsule (active): 48px wide, track `#CBD5E1`, fill `#1E293B`
- pill background: `#EDEFF2`
- dot↔capsule width transition: `.45s cubic-bezier(.22,1,.36,1)`
- fill transition: `.08s linear` (tight to scroll; raise for a softer feel)

`prefers-reduced-motion: reduce` removes the width/fill transitions (state
still updates, just without easing).

## Tokens

Map the five indicator colors into `tokens.ts` if you want them themeable.
They're plain literals in `ScrollStepper.module.css` right now. The dark value
`#1E293B` matches the NetworkHero core; `#CBD5E1` is slate-300.
