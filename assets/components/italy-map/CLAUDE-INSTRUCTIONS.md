# Крок 37 — Інтерактивна мапа Italy на /demo/map

## Контекст
Будуємо інтерактивну SVG-мапу 20 italian regioni для майбутньої інтеграції в Landing. Зараз — окрема демо-сторінка `/demo/map`, не Landing. Інтегруємо в Landing пізніше окремим кроком.

Stack як завжди: Vite 8 + React 19 + TS strict + MUI v9 + react-router v7. Italian formal Lei тон. Читай CLAUDE.md.

## Вхідні файли (у тому самому каталозі що цей бриф)

- **`italy-regions.svg`** — професійна SVG-мапа з simplemaps.com, 20 path з id ангійською (Lombardy, Sicily, Aosta Valley...). viewBox 1000×1000.
- **`italian-regions.json`** — дані 20 регіонів. Структура у полі `_meta`. Ключ `regions` — об'єкт slug → дані. Slug-и italian (lombardia, sicilia, valle-d-aosta).

## Mapping англ→italian (для id-resolving)

SVG використовує **англійські id**, дані — **italian slug**. Треба mapping:

```ts
const SVG_ID_TO_SLUG: Record<string, string> = {
  "Aosta Valley": "valle-d-aosta",
  "Piedmont": "piemonte",
  "Liguria": "liguria",
  "Lombardy": "lombardia",
  "Trentino-South Tyrol": "trentino-alto-adige",
  "Veneto": "veneto",
  "Friuli Venezia Giulia": "friuli-venezia-giulia",
  "Emilia Romagna": "emilia-romagna",
  "Tuscany": "toscana",
  "Marche": "marche",
  "Umbria": "umbria",
  "Lazio": "lazio",
  "Abruzzo": "abruzzo",
  "Molise": "molise",
  "Campania": "campania",
  "Apulia": "puglia",
  "Basilicata": "basilicata",
  "Calabria": "calabria",
  "Sicily": "sicilia",
  "Sardinia": "sardegna",
};
```

## Що зробити

### 1. Структура файлів

```
src/
├── lib/mock/italianRegions.ts       — типи + дані з JSON
├── features/landing/InteractiveItalyMap/
│   ├── InteractiveItalyMap.tsx       — головний компонент
│   ├── RegionInfoPanel.tsx           — ліва панель
│   ├── RegionTooltip.tsx             — hover tooltip
│   ├── ItalySvg.tsx                  — inline SVG (вміст з italy-regions.svg)
│   ├── index.ts
│   └── README.md                     — як інтегрувати в Landing пізніше
├── pages/MapDemoPage.tsx             — сторінка /demo/map
└── routes.tsx (додати route)
```

### 2. Типи

```ts
type Region = {
  tier: 1 | 2;
  name: string;
  capital: string;
  tagline: string;
  stats: {
    companies: string;
    employed: string;
    gdpShare: string;
    exports2023: string;  // є у ВСІХ 20 регіонів
  };
  keyIndustries: string[];          // у ВСІХ 20
  industrialDistricts: Array<{
    name: string;
    description: string;
  }>;                                // у ВСІХ 20
  // Tier 1 only:
  facts?: {
    provinces: number;
    areaKm2: number;
    universities: string;
    innovationHubs: string;
  };
  whyChoose?: string;
};
```

### 3. SVG — як вмонтувати

**INLINE JSX**, не `<img src=...>`. Скопіюй вміст `italy-regions.svg` у `ItalySvg.tsx` як JSX-розмітку (атрибути kebab-case → camelCase: `stroke-width` → `strokeWidth`, etc).

Для кожного `<path>`:
- `key={svgIdToSlug[originalId]}` 
- Замість id="..." англ. → встав `data-region={slug}`
- onMouseEnter / onMouseMove / onMouseLeave / onClick → пробрось у callback parent з id регіону + event

### 4. Інтерактив

**State у InteractiveItalyMap:**
- `selectedId: string` — default `"emilia-romagna"` (як на референсі)
- `hoveredId: string | null`
- `tooltipPos: {x, y} | null`

**Hover:**
- Заливка path → primary з 0.6 opacity
- Stroke → primary, ширина 1.5
- Показати tooltip біля курсора (offset +12, +12)
- Tooltip містить: name + 2 stats (companies + gdpShare) + hint
  - Tier 1: "Clicchi per i dettagli"
  - Tier 2: "Dati di base"

**Click:**
- `setSelectedId(slug)` — info panel оновлюється

**ВАЖЛИВО:** НЕ перебудовувати SVG-DOM при hover. Стилі path-елементів оновлюй через React-стилі (style prop або className), не через `innerHTML = ""`. Інакше click ламається (mousedown і mouseup на різних DOM-нодах).

### 5. Стилі через theme tokens

```ts
// Default fill
light: theme.palette.corporateBlue?.[100]  // або theme.palette.action.hover
dark:  theme.palette.corporateBlue?.[800]  // або theme.palette.action.hover

// Stroke
theme.palette.divider, strokeWidth 1

// Hover fill
alpha(theme.palette.primary.main, 0.6)
stroke: theme.palette.primary.main, strokeWidth 1.5

// Selected
fill: theme.palette.primary.main
stroke: theme.palette.primary.dark, strokeWidth 2
```

### 6. Layout

```
Grid container spacing 4:
  Grid item xs=12 md=5:
    <RegionInfoPanel region={REGIONS[selectedId]} />  (sticky top на md+)
  Grid item xs=12 md=7:
    <ItalySvg ... /> + <RegionTooltip ... />  (tooltip absolute всередині)
```

Mobile (xs): стек, панель зверху, мапа знизу.

### 7. RegionInfoPanel — структура

```
- Breadcrumb: "← 20 regioni d'Italia" (без actual navigation)
- h3 fontWeight 800: {region.name}
- Capital row: pin icon + "Capoluogo: <strong>{capital}</strong>"
- body1 text.secondary: {tagline}
- Stats grid 2x2: 4 stat cards (Aziende, Occupati, del PIL, Export 2023)
  Bgcolor 'action.hover', borderRadius 1, padding 2
  Кожна: icon → value (h5 fontWeight 700) → label (caption text.secondary)
- Section "Settori chiave": chips outlined
- Section "Distretti industriali": List dense, CheckCircle icon, name + description
- IF tier === 1:
  - Facts box (action.hover, padding 2): Province, Area, Università, Hub innovazione
  - Callout (primary.main alpha 0.05, borderLeft primary): Insights icon + "Perché scegliere {name}" + whyChoose
- IF tier === 2: нічого додатково (без facts/whyChoose)
```

### 8. MapDemoPage

```tsx
<PublicLayout>  {/* той же Header як на Landing */}
  <Container maxWidth="xl" sx={{ py: 6 }}>
    <Stack spacing={2} mb={5}>
      <Typography overline color="primary" fontWeight={700}>
        DEMO · SPERIMENTALE
      </Typography>
      <Typography variant="h2" fontWeight={800}>
        Le PMI italiane, regione per regione
      </Typography>
      <Typography variant="body1" color="text.secondary" maxWidth={620}>
        Esplori le 20 regioni d'Italia. Ogni territorio ha la sua specializzazione,
        i suoi distretti, le sue eccellenze.
      </Typography>
    </Stack>
    <InteractiveItalyMap />
  </Container>
</PublicLayout>
```

### 9. Перевірки

- npm run dev → /demo/map відкривається
- Дефолт — Emilia-Romagna вибрана, її дані у панелі ліворуч
- Hover на регіон → підсвічення + tooltip біля курсора
- Click на регіон → панель оновлюється
- Tier 1 регіон (наприклад Lombardia): повна панель включно з Facts + whyChoose callout
- Tier 2 регіон (наприклад Sicilia): без Facts і whyChoose, лише stats + settori + distretti
- Light + Dark теми обидві чисті, контрасти видно
- Mobile: панель зверху, мапа знизу, скрол нормальний
- npm run build чистий
- Закомить: `feat(landing): add interactive Italy map demo at /demo/map`

## Важливі нагадування

- **Tooltip pointerEvents: 'none'** — щоб не блокував hover на path
- **State окремо для selected і hovered** — не зливай
- **Items italian Lei тоном** — у RegionInfoPanel: "La Sua azienda", "Capoluogo", "Distretti industriali"
- **JSON містить _meta** — ігноруй при імпорті, бери лише `regions`
- **SVG viewBox 1000×1000** — preserveAspectRatio="xMidYMid meet", width 100% height auto

## Покажи після завершення

- `src/lib/mock/italianRegions.ts`
- `src/features/landing/InteractiveItalyMap/InteractiveItalyMap.tsx`
- `src/features/landing/InteractiveItalyMap/RegionInfoPanel.tsx`
- `src/pages/MapDemoPage.tsx`
- Скріншоти `/demo/map`:
  - Default (Emilia-Romagna)
  - Hover на Lombardia з tooltip
  - Click на Lombardia (повна панель)
  - Click на Sicilia (без Facts/whyChoose)
- git log --oneline
