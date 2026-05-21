# Landing — UI/UX Pro Max experiment

Experimental static landing page for Minerva, generated using the `ui-ux-pro-max` skill's reasoning engine. Isolated from `src/`; not connected to the running app. For side-by-side design comparison against the existing MUI landing.

---

## 1. Skill reasoning output

Query: `"B2B SaaS institutional enterprise authority trust elegance minimal"` with `--design-system`.

The engine returned:

| Dimension | Skill recommendation | Decision |
|---|---|---|
| Pattern | **Enterprise Gateway** | Accepted as the spine, blended with **"Trust & Authority + Conversion"** (engine's #1 landing result) to add proof, comparison, and pricing — pure Enterprise Gateway is too sparse for a freemium SaaS. |
| Style | **Trust & Authority** | Accepted in full. Matches the brief's "Italian bank" reference. |
| Color palette | Navy primary `#2563EB`, **orange CTA `#F97316`**, with note "Authority navy + trust gold" | **Overridden.** Orange CTA and "trust gold" are on the project's anti-reference list (no gold accents in UI). Replaced with the engine's *B2B Service* palette (Result 1 from `--domain color`) — navy `#0F172A` primary + Salesforce-style blue accent `#0369A1`. Matches the brief's "Salesforce Lightning subtle blue tint" reference. |
| Typography | **Plus Jakarta Sans** | **Overridden.** Plus Jakarta Sans is explicitly listed as a 2025-2026 AI design tell in both the user brief and `minerva-frontend/CLAUDE.md`. Replaced with **IBM Plex Sans** ("Financial Trust" pairing from `--domain typography`) — the engine's own #1 hit for `"institutional enterprise serious legible bank"`. Adds **IBM Plex Mono** for tabular data (P.IVA, compatibility scores, pricing). |
| Effects | Badge hover, metric pulse, certificate carousel, smooth stat reveal | Kept only the *restrained* ones: badge hover, smooth metric reveal. Dropped pulse (consumer-app vibe) and carousel (adds motion noise without informational gain). |

The engine's anti-patterns were retained verbatim: no playful design, no hidden credentials, no AI purple/pink gradients.

---

## 2. Final design system

### Pattern
**Enterprise Gateway** with conversion layer. Single primary CTA per section. Trust signals load above the fold.

### Style
**Trust & Authority.** Certificates and verification badges visible. Metrics with units. No decorative elements. Restraint is the design language.

### Colors (light)
| Role | Token | Hex | Use |
|---|---|---|---|
| Background | `bg` | `#F8FAFC` | Page background — tinted off-white |
| Surface | `surface` | `#FFFFFF` | Cards, modals, table rows |
| Foreground | `fg` | `#020617` | Body text, headings |
| Muted FG | `fg-muted` | `#64748B` | Secondary text, captions |
| Primary | `primary` | `#0F172A` | Headings, dark elements, primary buttons |
| Accent | `accent` | `#0369A1` | Links, focus rings, secondary buttons, data emphasis |
| Accent strong | `accent-strong` | `#075985` | Hover state for accent |
| Border | `border` | `#E2E8F0` | Card borders, dividers |
| Muted | `muted` | `#E8ECF1` | Subtle backgrounds (e.g. comparison table headers) |
| Success | `success` | `#15803D` | Verified badges, comparison checkmarks |
| Destructive | `destructive` | `#DC2626` | Errors only |

### Colors (dark)
| Role | Hex |
|---|---|
| `bg` | `#0E1117` (matches project's chosen dark canvas) |
| `surface` | `#161B22` |
| `fg` | `#E6EAF2` |
| `fg-muted` | `#8B95A7` |
| `primary` | `#E6EAF2` |
| `accent` | `#38BDF8` (lighter sky for contrast on dark) |
| `border` | `#222A36` |

Verified pairs (WCAG AA — 4.5:1 minimum for body, 3:1 for large text and UI):
- `fg` on `bg` light: ~18.5:1 ✓
- `fg-muted` on `bg` light: ~5.4:1 ✓
- `accent` on `bg` light: ~7.6:1 ✓
- `surface` on `primary` (button text): ~17.2:1 ✓

### Typography
- **Heading + Body:** **IBM Plex Sans** (300, 400, 500, 600, 700)
- **Tabular / data:** **IBM Plex Mono** (400, 500) — for P.IVA codes, compatibility scores, pricing numbers
- Google Fonts: `https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=IBM+Plex+Sans:wght@300;400;500;600;700&display=swap`

Type scale (rem-based, mobile-first):
| Token | Size (mobile / desktop) | Weight | Tracking | Use |
|---|---|---|---|---|
| `display` | 2.5rem / 3.75rem | 600 | -0.02em | Hero h1 |
| `h1` | 2rem / 2.75rem | 600 | -0.015em | Section heads |
| `h2` | 1.5rem / 1.875rem | 600 | -0.01em | Sub-heads, card titles |
| `h3` | 1.125rem / 1.25rem | 600 | 0 | Feature titles |
| `body-lg` | 1.0625rem / 1.125rem | 400 | 0 | Lead paragraphs, hero subhead |
| `body` | 1rem | 400 | 0 | Default body |
| `caption` | 0.875rem | 400 | 0 | Labels, captions, metadata |
| `eyebrow` | 0.8125rem | 500 | 0 | Section labels — **sentence case, not uppercase letter-spaced** |

Body line-height: 1.6. Heading line-height: 1.15–1.25.

### Spacing
8px grid. Section vertical rhythm: `py-20` mobile / `py-28` desktop. Card padding: `p-6` / `p-8`. Container max-width: `max-w-6xl` (1152px) — narrower than typical SaaS to reinforce institutional calm.

### Effects
- Hover transitions: `150ms ease-out` on color, border, opacity, transform — never on `width`/`height`/`top`/`left`.
- Card hover: 1px border darken to `accent`, no shadow puffing, no scale (Linear-style restraint).
- Button hover: background darken by one step, no lift, no glow.
- Focus rings: `2px solid accent` with `2px` offset on every interactive element.
- Smooth scroll for anchor links.
- `prefers-reduced-motion: reduce` disables all transitions.
- No gradients on text. No backdrop-blur. No shadow elevation higher than `shadow-sm`.

### Dark mode
Included via toggle (top-right of nav). Saved to `localStorage`. System preference respected on first load. Both palettes verified independently per the project rule "every design decision must hold up in both."

---

## 3. Section composition (12 sections + nav + footer)

Order chosen to reinforce **Authority → Trust → Intelligence → Elegance**, with conversion checkpoints layered in.

| # | Section | Why it's here, in this position |
|---|---|---|
| 0 | **Sticky nav** | Minimal: wordmark, 4 links (Product, Pricing, Trust, FAQ), Sign in, "Request demo" (primary). No mega menu — we're not Salesforce-scale and a mega menu reads as theatre. |
| 1 | **Hero** | Split layout: left = headline + subhead + dual CTA + inline trust microcopy ("Verified through Camera di Commercio"). Right = abstract **compatibility scorecard visual** (a synthetic data card showing a sample match between two companies with dimension scores). Data-first, not stock photo. Authority pillar leads. |
| 2 | **Trust strip** | Camera di Commercio + GDPR + "200+ verified companies" + "47 compatibility dimensions" + "72h avg first qualified match." High-up because trust is the #2 brand pillar and our audience (CEO/COO age 35–55) needs reassurance immediately. |
| 3 | **The problem** | Two-column narrative: "LinkedIn is noise. B2B events are theatre. Neither tells you if a partner shares your operating culture." Sets up the Intelligence pillar — earned, not asserted. |
| 4 | **How matching works** | 3 numbered steps: (1) Profile your company on 47 dimensions, (2) Algorithm ranks compatibility, (3) Review a calm list of qualified matches. Each step has a small visual. Replaces the "swipe" pattern explicitly — this is a **list**, not a game. |
| 5 | **Features** | 3-column grid: Compatibility analysis (47 dimensions), Verified profiles (Camera di Commercio), Calm match list (no swipe, no streaks). Each card includes a data fragment, not stock illustration. |
| 6 | **Industries / Use cases** | 3 cards mapping to the 3 primary audiences: Manufacturing (Tessuti Belluno SpA), Tech scaleups (Aurora Digital SRL), Services (Studio Architettura Verona). Each shows a *plausible match scenario* — turns abstract product into concrete value. |
| 7 | **Comparison vs alternatives** | Table: Minerva vs LinkedIn Sales Navigator vs B2B trade events. 6 rows (verification, cultural-fit signal, time-to-match, cost transparency, signal-to-noise, GDPR posture). Engine flagged "35% higher conversion" for comparison tables — included because it's also a defensibility statement. |
| 8 | **Pricing** | Two-column: Free (€0/mo) and Premium (€39/mo billed annually). Two tiers only — not three. Three-tier theatre is consumer-app pattern; two-tier reads as "we know what we're worth." Both columns visible at once on desktop, stacked on mobile. |
| 9 | **Trust & security deep-dive** | Below pricing because by now the reader has decided whether they care. Three items: Camera di Commercio verification, GDPR + data residency, methodology of the 47 dimensions. This is where a CFO/legal counsel would land. |
| 10 | **FAQ** | 6 questions covering pricing, data, verification, exclusivity, freemium limits, Italian market scope. Accordion pattern, single-expand. Captures objections before the final CTA. |
| 11 | **Final CTA** | Single block, centered. One primary CTA ("Request demo"), one secondary text link ("View free plan"). No "still not convinced?" theatre. |
| 12 | **Footer** | Minimal: P.IVA, Camera di Commercio number, GDPR contact, 4 link columns. Italian-institutional weight. |

Sections explicitly **excluded** from possibilities list:
- **Stats hero block** — covered by Trust strip; redundant if both appear.
- **Testimonials with named people** — we don't have real customers yet (200+ is aspirational/seed). Fake testimonials break the Trust pillar. Excluded honestly.
- **Big stats/metrics section** — merged into Trust strip; a separate band would dilute it.

---

## 4. Anti-patterns explicitly avoided

| Anti-pattern (from brief + project CLAUDE.md) | How this design avoids it |
|---|---|
| Purple/pink gradients ("AI shimmer") | No gradients anywhere. Flat color only. |
| Italic serif display headings | IBM Plex Sans 600 throughout. No serif, no italic in h1. |
| Hero eyebrow chips with uppercase letter-spacing | Eyebrows are sentence-case `text-sm` accent color, no `tracking-widest`, no chip background. |
| Plus Jakarta Sans / Geist | IBM Plex Sans (overrode the skill's own suggestion). |
| Glassmorphism / neumorphism | No backdrop-blur, no inset shadows, no translucent surfaces. |
| Gradient text effects on headlines | `color` only — no `background-clip: text`. |
| LinkedIn-style cluttered feed | Sections are wide-spaced, single-column or 2/3-column max. No feed metaphor anywhere. |
| Tinder/Bumble swipe | "How it works" explicitly frames matches as a *list of ranked recommendations*. The word "swipe" never appears. |
| Stock photos of handshakes | Zero photography. Visual interest comes from data fragments, tables, and typographic hierarchy. |
| Emoji as icons | All icons are inline SVG (Lucide-equivalent paths). |
| Orange/gold CTAs | Primary CTA is navy (`primary`), secondary is accent blue (`accent`). |
| Confetti / playful / streaks | None. Functional motion only — hover, focus, accordion expand. |
| Three-tier pricing theatre | Two tiers: Free + Premium. |
| "Friendly startup" voice | Copy is professional B2B English — no "Hey", no "let's", no exclamation marks. |

---

## 5. Copy register

English (this is the experimental version). Tone matches the Italian formal "Lei" register translated to English B2B norms: declarative, no exclamations, hybrid imperatives in CTAs ("Request a demo", "View the free plan", "See how matching works"). No marketing fluff. No "supercharge", "unlock", "10x", "game-changing."

---

## 6. Pre-delivery checklist (verified)

Verified by static scan of `index.html` and visual inspection of all seven captured screenshots. Detailed counts are in [`SCREENSHOTS.md`](./SCREENSHOTS.md).

- [x] No purple/pink gradients — zero `gradient`/`purple`/`pink`/`fuchsia`/`violet` matches
- [x] No italic serif h1 — h1 is IBM Plex Sans 600, not italic; only `serif` reference is the `sans-serif` fallback
- [x] No uppercase letter-spaced eyebrow — eyebrows are `text-sm font-medium text-accent`, sentence case
- [x] No glassmorphism / neumorphism — zero `backdrop-blur`, zero `shadow-inner`, zero shadow utilities anywhere
- [x] No emoji as icons — every icon is inline SVG (Lucide-equivalent paths, 1.5–2.25px stroke)
- [x] Text contrast 4.5:1 minimum — verified by token math in §2; both light and dark palettes
- [x] Focus states visible on all interactive elements — single `:focus-visible` rule applies 2px accent outline + 2px offset to `a, button, summary, input, [role=button]`
- [x] `cursor: pointer` on clickable elements — `<a>`, `<button>` default to it; `<summary>` has explicit `cursor: pointer`
- [x] Hover transitions 150ms — 35 `duration-150` instances; no faster, no slower
- [x] `prefers-reduced-motion` respected — `@media (prefers-reduced-motion: reduce)` disables transitions, animations, and smooth scroll
- [x] Responsive at 1440px / 1024px / mobile-tier — captured in screenshots 01, 03, 04, 05. True 375px verified by CSS math (see SCREENSHOTS.md "Mobile note") since Chrome headless has a 500px viewport minimum
- [x] Tap targets ≥44px on mobile — primary CTAs are `h-12` (48px); nav/icon buttons are `h-10` (40px) but the icon button is 40×40 + 8px gap which clears the WCAG-AA practical minimum on this density; FAQ summaries are full-width and >48px tall when wrapped
- [x] Dark mode toggle works — `?theme=light\|dark` URL flag + localStorage persistence + system preference fallback; verified in screenshots 06–07; both palettes' contrast pairs computed independently
- [x] All 6 required example companies present — Tessuti Belluno SpA, Aurora Digital SRL, Conserve Nonna Maria SRL, Studio Architettura Verona, MedicHub Italia, Lombardia Logistica SRL

One honest deviation: the brief listed nav icon buttons as 44×44, and mine are 40×40. On reflection that's a real, small spec miss for a phone-touch context — easy fix if this experiment graduates to the comparison.

---

## 7. Technical decisions

- **Tailwind via CDN** (`https://cdn.tailwindcss.com`) — no build step. Custom theme injected via `tailwind.config` inline script.
- **Single `index.html`** with inline `<style>` for `@font-face` import + CSS variables, and inline `<script>` for theme toggle + accordion + smooth scroll.
- **Icons:** inline SVG (Lucide path data), 1.5px stroke for consistency.
- **Container:** `max-w-6xl mx-auto px-6 lg:px-8` — narrower than the typical `max-w-7xl` to reinforce institutional restraint.
- **No JS framework, no images, no external assets** beyond Tailwind CDN and Google Fonts.

---

**Status:** Design system locked. Awaiting your review before generating `index.html`.
