# Screenshots

Captured with headless Chrome (`/Applications/Google Chrome.app/Contents/MacOS/Google Chrome --headless=new`) against `file://.../index.html` with `?theme=light` and `?theme=dark` URL flags.

| # | File | Viewport | Theme | Notes |
|---|---|---|---|---|
| 01 | `01-desktop-hero-light.png` | 1440 × 900 | Light | Above-the-fold on desktop. Hero split layout, match scorecard visible. |
| 02 | `02-desktop-full-light.png` | 1440 × 7200 | Light | Full page, all 12 sections + nav + footer. |
| 03 | `03-tablet-light.png` | 1024 × 1400 | Light | Tablet breakpoint — verifies hero stays split at lg:, trust strip stays 4-col. |
| 04 | `04-mobile-hero-light.png` | 500 × 900 | Light | Mobile-tier above-the-fold. See "Mobile note" below. |
| 05 | `05-mobile-full-light.png` | 500 × 10000 | Light | Mobile-tier full page — verifies single-column stacking across all 12 sections. |
| 06 | `06-desktop-hero-dark.png` | 1440 × 900 | Dark | Dark-mode parity check above the fold. |
| 07 | `07-desktop-full-dark.png` | 1440 × 7200 | Dark | Full dark-mode pass — every section must hold up in both themes. |

## Mobile note: Chrome headless has a 500px minimum CSS viewport

The original task asked for a 375px mobile screenshot. Captured at 500px instead — here is why, with no apology hidden in it:

Headless Chrome (`--headless=new`) clamps `window.innerWidth` to a minimum of **500px** regardless of the `--window-size` flag. I verified this directly:

```bash
$ chrome --headless=new --window-size=375,812 --dump-dom check-viewport.html
window.innerWidth=500 | clientWidth=500 | screen.width=800 | devicePixelRatio=1
```

So a `--window-size=375,812` screenshot is rendered at 500px CSS viewport and then cropped to a 375px-wide PNG. That produces what looks like horizontal overflow but is actually a tooling artifact, not a real responsive bug.

**What I did about it:**
1. Took mobile-tier screenshots at 500px wide — Chrome headless's actual minimum. The page renders correctly at 500px (single-column hero, stacked features, footer, etc.) and is representative of mobile-tier behavior. The `sm:` breakpoint (640px) does not fire at 500px, so the layout below it is the same as at 375px.
2. Verified the CSS math for sub-500px holds via inspection:
   - `.display`: `clamp(1.625rem, 5.5vw, 3.75rem)` → 26px at 375px viewport. "Find Italian partners who" (25 chars × ~12px) ≈ 300px, fits inside the 327px content area (375 − 48 padding).
   - All grid columns are `lg:grid-cols-X` (≥1024px), so all sections single-stack below tablet.
   - Added `overflow-x: hidden` on `html, body` as a defense-in-depth safety net.
3. The `<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />` tag is present, so real browsers (mobile or desktop devtools at 375px) will render at the intended viewport.

**To verify true 375px behavior**, open the file in a regular browser:

```bash
open -a "Google Chrome" experiments/landing-uupm/index.html
```

Then use Chrome devtools (`⌘⌥I`), toggle device toolbar (`⌘⇧M`), and pick "iPhone 12 Pro" (390×844) or set the responsive width to 375. The actual mobile rendering will be visible there.

## Coverage map (which sections are visible in which screenshot)

| Section | 01 hero | 02 full | 03 tablet | 04 mob hero | 05 mob full | 06 dark hero | 07 dark full |
|---|---|---|---|---|---|---|---|
| Nav | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Hero (split layout / scorecard) | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Trust strip (4-col) | — | ✓ | ✓ | — | ✓ | — | ✓ |
| Problem (2-col split) | — | ✓ | ✓ | — | ✓ | — | ✓ |
| How it works (3-step) | — | ✓ | ✓ | — | ✓ | — | ✓ |
| Features (3-col) | — | ✓ | partial | — | ✓ | — | ✓ |
| Industries (3-col) | — | ✓ | — | — | ✓ | — | ✓ |
| Comparison table | — | ✓ | — | — | ✓ | — | ✓ |
| Pricing (2-col) | — | ✓ | — | — | ✓ | — | ✓ |
| Trust & security (3-col) | — | ✓ | — | — | ✓ | — | ✓ |
| FAQ (accordion) | — | ✓ | — | — | ✓ | — | ✓ |
| Final CTA | — | ✓ | — | — | ✓ | — | ✓ |
| Footer | — | ✓ | — | — | ✓ | — | ✓ |

## Validation checklist results

Ran a grep-based scan of `index.html` against the anti-pattern list:

| Anti-pattern | Status |
|---|---|
| Purple/pink/fuchsia/violet gradients | ✓ Not found |
| Italic / serif headings | ✓ Not found (the only `serif` hit is the `sans-serif` fallback in font stack; the only `italic` hit is `not-italic` defensively on `<address>`) |
| Uppercase letter-spaced eyebrow (`tracking-widest` / `tracking-wider`) | ✓ Not found — eyebrow is `text-sm font-medium text-accent`, sentence case |
| Glassmorphism / neumorphism (`backdrop-blur`, `shadow-inner`, inset shadow) | ✓ Not found |
| Emoji icons | ✓ Not found — all icons inline SVG |
| Plus Jakarta Sans / Geist / Fraunces | ✓ Not found |
| Gradient text effects (`bg-clip-text`) | ✓ Not found |
| Off-palette Tailwind colors (red/blue/indigo/etc.) | ✓ None — everything uses semantic tokens via CSS variables |
| Heavy shadows | ✓ None — zero `shadow-*` utility uses in markup |

| Required pattern | Count |
|---|---|
| `:focus-visible` global rule | 1 (applies to `a, button, summary, input, [role=button]`) |
| `@media (prefers-reduced-motion: reduce)` | 1 (disables all transitions) |
| `duration-150` hover transitions | 35 instances |
| `IBM Plex Sans` referenced | 2 (Google Fonts + Tailwind config) |
| `IBM Plex Mono` referenced | 1 (Google Fonts) |
| All 6 brief-required company names | ✓ All present (Tessuti Belluno, Aurora Digital, Conserve Nonna Maria, Studio Architettura Verona, MedicHub Italia, Lombardia Logistica) |

## How to reproduce

```bash
cd experiments/landing-uupm
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
BASE="file://$(pwd)/index.html"

# Desktop light
"$CHROME" --headless=new --disable-gpu --hide-scrollbars --window-size=1440,900 \
  --screenshot=screenshots/01-desktop-hero-light.png --virtual-time-budget=2500 "${BASE}?theme=light"

# Mobile-tier (500 = headless minimum)
"$CHROME" --headless=new --disable-gpu --hide-scrollbars --window-size=500,900 \
  --screenshot=screenshots/04-mobile-hero-light.png --virtual-time-budget=2500 "${BASE}?theme=light"

# Dark variant — append ?theme=dark
"$CHROME" --headless=new --disable-gpu --hide-scrollbars --window-size=1440,900 \
  --screenshot=screenshots/06-desktop-hero-dark.png --virtual-time-budget=2500 "${BASE}?theme=dark"
```
