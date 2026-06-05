# CardStack — auto-rotating card stack

An interactive element: a stack of cards that rotate automatically every
3.5 seconds. The front card disappears, the rest of the stack springs forward,
and the disappeared card moves to the back of the queue. There is no manual
navigation — rotation is fully automatic.

The component is built with React + TypeScript + Framer Motion and reproduces
the Figma "Frame 289" design (card 311 × 82.61 px).

---

## Package contents

```
handoff/
├── components/
│   ├── ui/
│   │   └── card-stack.tsx          ← component (copy into /components/ui)
│   └── examples/
│       └── card-stack-demo.tsx     ← usage example
├── preview/
│   └── card-stack-preview.html     ← static preview (open in a browser)
└── README.md                       ← this file
```

`preview/card-stack-preview.html` is a self-contained HTML file with no
dependencies. Open it in a browser to immediately see the reference animation
behavior.

---

## Project requirements

The project must support: a **shadcn structure**, **Tailwind CSS**, and
**TypeScript**. If something is missing, see "Setting up a project from
scratch" below.

### External dependency

One npm dependency is required:

```bash
npm install framer-motion
```

`lucide-react` is **not needed** in the final version — there is no manual
navigation and no icons, so none of the buttons from the original prototype
remain.

---

## Integration (project already on shadcn + Tailwind + TS)

1. Install the dependency:

   ```bash
   npm install framer-motion
   ```

2. Copy `components/ui/card-stack.tsx` into your project's UI components folder.

3. (Optional) Copy `components/examples/card-stack-demo.tsx` as an example.

4. Use the component:

   ```tsx
   import CardStack, { type CardStackItem } from "@/components/ui/card-stack";

   const items: CardStackItem[] = [
     { id: "1", title: "Terrazza Ramè Experience",
       tags: ["Restaurant", "Mediterranean", "Italian"] },
     // ...
   ];

   <CardStack items={items} intervalMs={3500} />
   ```

### Why `/components/ui`

shadcn reads `components.json` and uses the `aliases.ui` value to determine
where to place UI components. By default this is `@/components/ui`. Keeping the
component there matters because:

- the demo and other files import it via the alias `@/components/ui/card-stack`;
- the shadcn CLI expects UI primitives in this folder — otherwise future CLI
  commands (updates, adding components) will not work correctly;
- it is a project convention: all reusable UI elements live in one place.

If the `ui` alias in your `components.json` points to a different folder, place
the file there and update the import path in the demo accordingly.

---

## Setting up a project from scratch

If the project does not yet have shadcn / Tailwind / TypeScript:

1. **Create a project (Vite + React + TS):**

   ```bash
   npm create vite@latest my-app -- --template react-ts
   cd my-app
   ```

2. **Install and configure Tailwind CSS** following the current guide at
   https://tailwindcss.com/docs/installation (for Tailwind v4, leave the
   `tailwind.config` field in `components.json` empty).

3. **Initialize shadcn:**

   ```bash
   npx shadcn@latest init
   ```

   The CLI creates `components.json` and configures the aliases (`components`,
   `ui`, `lib`, `utils`). Make sure `tsconfig.json` contains the matching
   `paths` for the `@/*` alias.

4. Then proceed with the "Integration" steps above.

---

## Component API

| Prop           | Type              | Default  | Description                                       |
|----------------|-------------------|----------|---------------------------------------------------|
| `items`        | `CardStackItem[]` | —        | Array of cards (required)                         |
| `intervalMs`   | `number`          | `3500`   | Auto-advance interval, ms                         |
| `visibleCount` | `number`          | `3`      | How many cards are visible in the stack           |
| `offset`       | `number`          | `11`     | Vertical offset of cards behind, px               |
| `scaleStep`    | `number`          | `0.05`   | Scale-down step for cards behind                  |
| `dimStep`      | `number`          | `0.06`   | Dimming step for cards behind                     |
| `pauseOnHover` | `boolean`         | `true`   | Pause auto-advance on cursor hover                |
| `className`    | `string`          | `""`     | Extra class names for the outer container         |

### `CardStackItem`

| Field       | Type               | Description                                          |
|-------------|--------------------|------------------------------------------------------|
| `id`        | `string \| number` | Unique, stable identifier                            |
| `title`     | `string`           | Venue title                                          |
| `tags`      | `string[]`         | Category tags (pills)                                |
| `imageSrc`  | `string?`          | Preview URL. If omitted — grey placeholder #D4D4D4   |

---

## Disappear animation

The animation is ported 1:1 from the original React prototype
(`AnimatePresence` / Framer Motion):

- **Front card exit** — `opacity → 0`, `scale → 0.8`, duration `0.2s`.
  The card gently scales down and dissolves in place, without flying off to a side.
- **Stack movement** — spring transition `spring`, `stiffness: 170`,
  `damping: 26`. The cards behind spring forward one step.

Both values are extracted into the `EXIT_TRANSITION` and `SPRING_TRANSITION`
constants at the top of `card-stack.tsx`, so they are easy to tweak.

---

## Images

In the demo, `imageSrc` is intentionally left unset — the component renders a
grey placeholder `#D4D4D4` as per the design. To show real photos, add an
`imageSrc` field to the `items` array elements.

---

## Expected behavior and responsiveness

- The component has a fixed card width of **311 px** (Frame 289 design). For
  responsiveness, wrap it in your own container or expose the dimensions as props.
- The animation pauses on cursor hover (`pauseOnHover`, enabled by default).
- A recommended place to use it is a venue showcase section on a landing page,
  or a "featured places" block within a profile card.
