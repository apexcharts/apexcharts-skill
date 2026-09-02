---
name: apexcharts
description: >
  AI skill for building ApexCharts.js charts and data visualizations (targets v7).
  Use when the user asks to create, configure, or troubleshoot any chart using ApexCharts
  (line, area, bar, pie, donut, radialBar, scatter, bubble, heatmap, candlestick, boxPlot,
  violin, histogram, radar, polarArea, rangeBar, rangeArea, treemap, funnel, pyramid, gauge,
  sunburst, unit, waffle, waterfall, dumbbell, streamgraph, raincloud). Covers
  correct data formats, lifecycle, formatters, tree-shaking, SSR, and the feature
  platform (plugins, canvas renderer, custom series, small multiples, undo/redo,
  shareable views, themes, crossfilter, annotation authoring, storyboard, streaming,
  drilldown). Knows which features ship in the default v7 bundle and which are an
  explicit import. In React /
  Vue / Angular projects, prefer the framework wrapper packages
  (`react-apexcharts`, `vue3-apexcharts`, `ng-apexcharts`) over the core API.
metadata:
  author: ApexCharts
  version: "3.0.0"
  library_version: "7.1.0"
  category: data-visualization
  tags: [charts, visualization, javascript, typescript, svg, apexcharts]
  docs: https://apexcharts.com/docs/
  npm: apexcharts
  github: https://github.com/apexcharts/apexcharts.js
---

# ApexCharts AI Skill

> **Framework wrapper detection — check `package.json` before generating code.**
> - `react` → use **`react-apexcharts`** instead of the core API.
> - `vue` (Vue 3) → use **`vue3-apexcharts`**. Vue 2 → **`vue-apexcharts`**.
> - `@angular/core` → use **`ng-apexcharts`**.
>
> Wrappers handle `destroy()` automatically on unmount, accept reactive props, and forward events as idiomatic framework events. Use the core API directly only when no framework is detected, or when the user explicitly asks for vanilla. See `references/framework-wrappers.md`.

> **Targets ApexCharts v7.** Read the next box before writing any feature code: v7's headline change is that the default bundle no longer contains every feature.
>
> **⚠️ v7.0 breaking change: nine features left the default bundle.** In v6, `import ApexCharts from 'apexcharts'` gave you every feature. In v7 it does not. These nine are **Tier 2**: present in the package, absent from the default bundle, and reachable only through an explicit import.
>
> ```js
> import ApexCharts from 'apexcharts'
> import 'apexcharts/features/trellis'      // ESM
> ```
> ```html
> <script src=".../dist/apexcharts.js"></script>
> <script src=".../dist/features/trellis.js"></script>  <!-- script tag -->
> ```
>
> | Tier 2 feature | Import | gzip |
> |---|---|---|
> | Trellis (small multiples) | `apexcharts/features/trellis` | 25.7 KB |
> | Storyboard (scrollytelling) | `apexcharts/features/storyboard` | 8.0 KB |
> | Perspectives (shareable views) | `apexcharts/features/perspectives` | 6.7 KB |
> | Ink (annotation authoring) | `apexcharts/features/ink` | 6.2 KB |
> | Canvas renderer (Strata) | `apexcharts/features/renderer-canvas` | 6.0 KB |
> | Linked views & crossfilter | `apexcharts/features/link` | 5.3 KB |
> | Measure ruler | `apexcharts/features/measure` | 4.6 KB |
> | Rewind (undo / redo) | `apexcharts/features/history` | 3.2 KB |
> | Context menu | `apexcharts/features/context-menu` | 2.3 KB |
>
> The `raincloud` chart type (7.1) is Tier 2 on the same terms: `import 'apexcharts/raincloud'`. Storyboard registers Perspectives, so importing both costs no more than Storyboard alone. **Nothing fails silently**: each warns in the console when its config is present but the module is not, and degrades where it can (a trellis renders as one chart; `renderer: 'canvas'` falls back to SVG). Default bundle: 291,654 B gzipped in 6.10, 252,005 B in 7.0, 264,326 B in 7.1.
>
> Everything else stays in the default bundle: **all chart types except raincloud**, axes, tooltips, legend, toolbar, exports, annotations, keyboard navigation, stats, morph, drilldown, themes (Facet), plugins (Weave) and custom series (Marks). See `references/tree-shaking.md` for the full tier table and `references/feature-platform.md` for each feature's API.
>
> **Other v7.0 breaking changes.** (1) `plotOptions.bar.borderRadiusWhenStacked` is **removed**; corner ownership now follows the stack's outer edge automatically. An unknown option is ignored, so leaving it in a config is harmless but does nothing. (2) `dataLabels.animate.enabled` now defaults to `true` (bar/column only): labels ride to their new position on a data update instead of snapping. Set `dataLabels: { animate: { enabled: false } }` for the old behavior. Everything else from v5 and v6 keeps working unchanged.
>
> **Behaviors that are on by default** (both respect `prefers-reduced-motion`): data updates that add/remove points animate coherently, and mobile pinch-zoom / two-finger pan gestures are enabled.
>
> **Premium features and licensing.** Eight features are premium: `trellis` (small multiples, 7.0), `storyboard`, `link` (crossfilter / linked views), `ink` (annotation authoring), `measure`, `context-menu`, `perspectives` (shareable views), and `history` (undo/redo). Two chart types are premium: `unit` / `waffle`, and `raincloud` (7.1). These still function fully, but render an `APEXCHARTS` trial watermark until an entitled license is set via `ApexCharts.setLicense(key)` (static) or per-chart `chart.license`. They require a `premium` or `enterprise` plan; a `pro` key or the free tier keeps the watermark. Every other chart type and free module is never gated. Note that premium and Tier 2 are independent axes: `waterfall`, `dumbbell` and `streamgraph` are free *and* in the default bundle, while `trellis` is both premium *and* an explicit import. See the Licensing section in `references/feature-platform.md`.

## 1. Critical Rules

1. **Always call `chart.render()`** after `new ApexCharts(el, options)`. The constructor does not render.
2. **Always call `chart.destroy()`** before creating a new chart on the same element. Failing to do so causes memory leaks and duplicate charts (especially in React/Vue).
3. **Series data format is chart-type-specific.** Refer to the Data Format Table below. This is the #1 source of AI mistakes.
4. **`yaxis` must be an array** when using multiple y-axes. Each entry needs a `seriesName` to map to the correct series.
5. **`tooltip.shared` and `tooltip.intersect` are mutually exclusive.** `shared: true` shows all series at an x-position. `intersect: true` shows only the hovered point.
6. **Use `null` (not `undefined` or empty string)** for missing data points. `undefined` is silently ignored and breaks the chart.
7. **`chart.stacked: true`** only works with `bar` and `area` chart types.
8. **Responsive breakpoints** must be in ascending order in the `responsive` array.
9. **For mixed/combo charts**, set `type` on each individual series object, not just on `chart.type`.
10. **RadialBar values must be 0–100** (they represent percentages).
11. **Color hex values must include the `#` prefix** (e.g., `'#FF5733'`, not `'FF5733'`).
12. **Nine features are NOT in the v7 default bundle.** Before writing config for `trellis`, `storyboard`, `perspectives`, `ink`, `renderer: 'canvas'`, `link`, `measure`, `history` or the context menu, add its `apexcharts/features/*` import. Same for the `raincloud` chart type. Full-bundle users need this too, not just tree-shakers. See the box above.
13. **Tree-shaking**: importing `apexcharts/core` gives you a bare class, and you must also import chart-type entries and feature entries separately.
14. **First-class aliases**: `funnel` and `pyramid` render through the bar engine; `gauge` renders through radialBar. Use them as `chart.type` directly (no `plotOptions.bar.isFunnel` needed). They are covered by the `apexcharts/bar` and `apexcharts/radialBar` tree-shaking entries respectively.
15. **`violin` (statistical)** uses a per-point density profile: `data: [{ x, y: { density: [[value, weight], ...], points?: [number] } }]`, not a plain number. Since v6.9 a datum may instead supply only raw observations (`points: [number]`, no `y`) and the library derives the density via KDE (needs `apexcharts/features/stats` when tree-shaking).
16. **`render()` is idempotent**: calling `render()` twice on the same instance returns the same promise instead of building a duplicate chart. You still must `destroy()` before creating a *new* instance on the same element.
17. **`histogram` (v6.9)** series carry **raw observations** (one number per event), not pre-aggregated counts; the chart chooses bin edges and counts them. Binning ships behind the stats feature: use the `apexcharts/histogram` entry, or `import 'apexcharts/features/stats'` alongside `apexcharts/bar` (the full `apexcharts` bundle already includes it).
18. **`waterfall` (v7.1) accumulates for you.** The series carries the **deltas**, not the running total. A row that should show the running total carries `isSubtotal` or `isTotal` and **no `y`**; the library measures it. Do not pre-compute cumulative values.
19. **`dumbbell` (v7.1) takes one series per measure**, each with the same `x` categories: `[{ name: '2020', data: [{ x, y }] }, { name: '2025', data: [{ x, y }] }]`. Do **not** zip the values into `y: [low, high]` pairs; that is the older `plotOptions.bar.isDumbbell` range-bar form, which still works but is a different chart.
20. **`raincloud` (v7.1) takes the raw sample**, one datum per category: `data: [{ x, points: [number] }]`. It is a premium Tier 2 type, so it needs `import 'apexcharts/raincloud'` on top of the default bundle.

---

## 2. Series Data Format Table

This is the most critical reference. Using the wrong data format is the #1 cause of broken charts.

### Axis Charts (line, area, bar, scatter, etc.)

| Chart Type | `chart.type` | Series Format | Minimal Example |
|---|---|---|---|
| Line | `'line'` | `[{ name, data: [number \| null] }]` or `[{ name, data: [{ x, y }] }]` | `series: [{ name: 'Sales', data: [30, 40, null, 50] }]` |
| Area | `'area'` | Same as line | `series: [{ name: 'Views', data: [10, 20, 30] }]` |
| Bar / Column | `'bar'` | Same as line. Defaults to **vertical columns**; set `plotOptions.bar.horizontal: true` for horizontal bars. | `series: [{ name: 'Revenue', data: [44, 55, 41] }]` |
| Scatter | `'scatter'` | `[{ name, data: [{ x, y }] }]` — always use XY format | `series: [{ name: 'Points', data: [{ x: 1, y: 5 }, { x: 2, y: 10 }] }]` |
| Bubble | `'bubble'` | `[{ name, data: [{ x, y, z }] }]` — **z is required** (bubble size) | `series: [{ name: 'Data', data: [{ x: 1, y: 30, z: 10 }] }]` |
| Range Area | `'rangeArea'` | `[{ name, data: [{ x, y: [low, high] }] }]` | `series: [{ name: 'Temp', data: [{ x: 'Jan', y: [5, 15] }] }]` |
| Range Bar | `'rangeBar'` | `[{ name, data: [{ x, y: [start, end] }] }]` — for timeline/Gantt, use timestamps | `series: [{ name: 'Tasks', data: [{ x: 'Design', y: [1, 5] }] }]` |
| Candlestick | `'candlestick'` | `[{ data: [{ x, y: [O, H, L, C] }] }]` — array of 4: Open, High, Low, Close | `series: [{ data: [{ x: new Date('2024-01-01'), y: [51, 56, 48, 53] }] }]` |
| Box Plot | `'boxPlot'` | `[{ data: [{ x, y: [min, Q1, median, Q3, max] }] }]` — array of 5. *(v6.9)* Or supply the raw sample instead: `[{ data: [{ x, points: [number] }] }]` and the quartiles are computed (R type 7; needs the stats feature). | `series: [{ data: [{ x: 'Group A', y: [10, 20, 30, 40, 50] }] }]` |
| Violin *(v6)* | `'violin'` | `[{ name, data: [{ x, y: { density: [[value, weight], ...], points?: [number] } }] }]`. *(v6.9)* Or supply the raw sample instead: `[{ name, data: [{ x, points: [number] }] }]` and the density is derived via KDE (needs the stats feature). | `series: [{ name: 'Sessions', data: [{ x: 'A', y: { density: [[20, 0.1], [30, 0.2]], points: [21, 29] } }] }]` |
| Histogram *(v6.9)* | `'histogram'` | `[{ name, data: [number] }]`: **raw observations**, one number per event, NOT pre-binned counts. The chart bins them (needs the stats feature). | `series: [{ name: 'Latency', data: [102, 87, 143, 91] }]` |
| Heatmap | `'heatmap'` | `[{ name, data: [{ x, y: number }] }]` — y is the intensity value | `series: [{ name: 'Mon', data: [{ x: '10am', y: 45 }] }]` |
| Treemap | `'treemap'` | `[{ data: [{ x, y: number }] }]` — y is the area/value. *(v6.9)* A datum may carry `children` to any depth for a nested treemap (see `references/grid-charts.md`). | `series: [{ data: [{ x: 'Item A', y: 100 }, { x: 'Item B', y: 60 }] }]` |
| Radar | `'radar'` | `[{ name, data: [number] }]` + `xaxis: { categories: [...] }` | `series: [{ name: 'Skill', data: [80, 50, 30, 40, 100] }]` |
| Funnel *(v6)* | `'funnel'` | `[{ name, data: [number] }]` + `xaxis: { categories: [...] }`. Order values **largest→smallest**. | `series: [{ data: [1380, 990, 548, 200] }]` |
| Pyramid *(v6)* | `'pyramid'` | Same as funnel; order values **smallest→largest** (wide base at bottom). | `series: [{ data: [200, 548, 990, 1380] }]` |
| Waterfall *(v7.1)* | `'waterfall'` | `[{ name, data: [{ x, y }] }]` where **`y` is the signed delta**, not a running total. A running-total row carries `isSubtotal` (sum since the last cut) or `isTotal` (sum from zero) and **omits `y`**. | `series: [{ data: [{ x: 'Revenue', y: 8786 }, { x: 'Costs', y: -2786 }, { x: 'Gross', isSubtotal: true }] }]` |
| Dumbbell *(v7.1)* | `'dumbbell'` | **One series per measure**, sharing x categories: `[{ name, data: [{ x, y }] }, ...]`. Not `[low, high]` pairs. | `series: [{ name: '2020', data: [{ x: 'Backend', y: 92 }] }, { name: '2025', data: [{ x: 'Backend', y: 118 }] }]` |
| Streamgraph *(v7.1)* | `'streamgraph'` | Same as area: `[{ name, data: [{ x, y }] }]`. Stacking, baseline and band order are the chart's job, so do **not** set `chart.stacked`. | `series: [{ name: 'Drama', data: [{ x: '2024-01-01', y: 32 }] }]` |
| Raincloud *(v7.1, premium, Tier 2)* | `'raincloud'` | `[{ name, data: [{ x, points: [number] }] }]`: the **raw sample** per category; the density, box and rain are derived. Needs `import 'apexcharts/raincloud'`. | `series: [{ name: 'Weight gain', data: [{ x: 'Control', points: [3.1, 4.7, 2.9] }] }]` |

### Non-Axis Charts (pie, donut, radialBar, polarArea, gauge, unit, waffle)

These use a **flat number array** for `series`, NOT the object format:

```js
// CORRECT — flat number array + labels
{
  chart: { type: 'pie' },  // or 'donut', 'polarArea', 'radialBar', 'gauge', 'unit', 'waffle'
  series: [44, 55, 13, 43, 22],
  labels: ['Team A', 'Team B', 'Team C', 'Team D', 'Team E']
}
```

**Gauge *(v6)*** is a single-value radialBar alias: `series: [72]`, `labels: ['Progress']`. Configure the arc/needle, colored bands, ticks, and `min`/`max` domain through `plotOptions.radialBar` (see `references/circular-charts.md`).

**Unit / Waffle *(v6.6, premium)*** render one mark per unit of value (dot clusters, pictograms, waffles, beeswarms). Same flat-array + `labels` shape as pie; layout is chosen through `plotOptions.unit.layout`. A per-mark object form (`series: [{ name, data: [{ value, x, z, name, fillColor, id }] }]`) gives each mark its own color, position, size, and tooltip. `waffle` is a preset alias of `unit` (grid layout). Both render an `APEXCHARTS` watermark until an entitled license is set. See `references/circular-charts.md`.

### Hierarchical Charts (sunburst)

**Sunburst *(v6.7, free)*** draws tree-structured data as concentric rings (a nested pie / donut). It uses the axis-style `[{ data: [...] }]` wrapper, but each datum is an `{ x, y, children }` node nested to any depth:

```js
{
  chart: { type: 'sunburst' },
  series: [{
    data: [
      { x: 'Mobile', y: 55, children: [
        { x: 'iOS', y: 30, children: [{ x: 'iOS 17', y: 18 }, { x: 'iOS 16', y: 9 }] },
        { x: 'Android', y: 23 }
      ] },
      { x: 'Desktop', y: 33, children: [{ x: 'Windows', y: 20 }, { x: 'macOS', y: 10 }] }
    ]
  }]
}
```

Configure the centre hole, corner rounding, and inter-arc gap through `plotOptions.sunburst` (see `references/circular-charts.md`).

---

## 3. Package / Module Map

```
# Default bundle (every chart type except raincloud, plus the Tier 1 features)
import ApexCharts from 'apexcharts'

# Bare core (no chart types, no optional features — must register manually)
import ApexCharts from 'apexcharts/core'

# Per-type entry points (registers specific chart types + core)
import ApexCharts from 'apexcharts/line'         # line, area, scatter, bubble, rangeArea
import ApexCharts from 'apexcharts/area'          # same as /line
import ApexCharts from 'apexcharts/scatter'       # same as /line
import ApexCharts from 'apexcharts/bubble'        # same as /line
import ApexCharts from 'apexcharts/rangeArea'     # same as /line
import ApexCharts from 'apexcharts/bar'           # bar, column, rangeBar
import ApexCharts from 'apexcharts/column'        # same as /bar
import ApexCharts from 'apexcharts/rangeBar'      # same as /bar
import ApexCharts from 'apexcharts/waterfall'     # waterfall (v7.1): bar engine + the waterfall feature
import ApexCharts from 'apexcharts/dumbbell'      # dumbbell (v7.1): bar engine + the dumbbell feature
import ApexCharts from 'apexcharts/streamgraph'   # streamgraph (v7.1): rangeArea engine + the streamgraph feature
import ApexCharts from 'apexcharts/candlestick'   # candlestick, boxPlot
import ApexCharts from 'apexcharts/boxPlot'       # same as /candlestick
import ApexCharts from 'apexcharts/violin'        # violin
import ApexCharts from 'apexcharts/raincloud'     # raincloud (v7.1, premium): violin engine + the raincloud feature
import ApexCharts from 'apexcharts/histogram'     # histogram (v6.9): bar engine + the stats feature
import ApexCharts from 'apexcharts/pie'           # pie, donut, polarArea
import ApexCharts from 'apexcharts/donut'         # same as /pie
import ApexCharts from 'apexcharts/polarArea'     # same as /pie
import ApexCharts from 'apexcharts/radialBar'     # radialBar + gauge
import ApexCharts from 'apexcharts/radar'         # radar only
import ApexCharts from 'apexcharts/heatmap'       # heatmap only
import ApexCharts from 'apexcharts/treemap'       # treemap only
import ApexCharts from 'apexcharts/sunburst'      # sunburst (v6.7, hierarchical)
import ApexCharts from 'apexcharts/unit'          # unit + waffle (v6.6, premium)
# funnel + pyramid render through the bar engine; use apexcharts/bar

# Unit-chart shape kit (v6.10): named exports, tree-shaken per shape (~4 KB gzipped each)
import { heart, outlined, glyphs, preview } from 'apexcharts/unit-shapes'

# Pictogram glyphs (v7.0): one drawn mark per unit, independent of the layout
import { person, registerMarks } from 'apexcharts/pictograms'

# TIER 1 features: already in the default `apexcharts` bundle.
# Import these only when you started from /core or a per-type entry.
import 'apexcharts/features/exports'         # PNG/SVG/CSV export methods
import 'apexcharts/features/legend'          # Interactive legend component
import 'apexcharts/features/toolbar'         # Toolbar (zoom, pan, download buttons)
import 'apexcharts/features/annotations'     # X/Y/point/text/image annotations
import 'apexcharts/features/keyboard'        # Keyboard navigation (accessibility)
import 'apexcharts/features/stats'           # Statistics (v6.9): histogram binning, boxPlot/violin raw samples, rowSeries()
import 'apexcharts/features/morph'           # Animated chart-type morphs
import 'apexcharts/features/drilldown'       # Hierarchical drill-down
import 'apexcharts/features/facet'           # Design tokens + OS-aware themes
import 'apexcharts/features/weave'           # Public plugin platform
import 'apexcharts/features/marks'           # Custom series types (registerSeriesType)
import 'apexcharts/features/waterfall'       # (v7.1) waterfall chart type
import 'apexcharts/features/dumbbell'        # (v7.1) dumbbell chart type
import 'apexcharts/features/streamgraph'     # (v7.1) streamgraph chart type

# TIER 2 features: NOT in the default bundle. Required even on the full bundle.
import 'apexcharts/features/trellis'         # (v7.0) Small multiples (premium)
import 'apexcharts/features/storyboard'      # Scrollytelling (premium; registers perspectives)
import 'apexcharts/features/perspectives'    # Shareable view state (premium)
import 'apexcharts/features/ink'             # On-chart annotation authoring (premium)
import 'apexcharts/features/renderer-canvas' # Hybrid SVG + canvas renderer (Strata)
import 'apexcharts/features/link'            # Crossfilter / linked views (premium)
import 'apexcharts/features/measure'         # Measure / delta ruler (premium)
import 'apexcharts/features/history'         # Undo/redo (Rewind, premium)
import 'apexcharts/features/context-menu'    # Right-click / long-press context menu (premium)
import 'apexcharts/features/raincloud'       # (v7.1) raincloud chart type (premium)

import 'apexcharts/features/all'             # Tier 1 only. Does NOT pull in Tier 2.

# SSR (server-side rendering)
import ApexCharts from 'apexcharts/ssr'    # Node.js: renderToString, renderToHTML
import ApexCharts from 'apexcharts/client' # Browser: explicit client import for hydration
```

**Note (v7):** `apexcharts` gives you every chart type except `raincloud`, plus the Tier 1 features. The nine Tier 2 features and `raincloud` need their own import **whatever entry point you started from**. `apexcharts/features/all` is the Tier 1 set, so it is not a shortcut past this. Tree-shaking entries (`/core`, `/line`, etc.) are for reducing bundle size below the default.

**Note (v6.9):** ApexCharts is no longer dependency-free: it depends on `apex-commons` at runtime. npm resolves it automatically and the browser (script-tag) bundles inline it, so no action is needed; it only matters for tooling that assumed zero dependencies.

---

## 4. Core Lifecycle Pattern

```js
import ApexCharts from 'apexcharts'

// 1. Define options
const options = {
  chart: {
    type: 'line',
    height: 350
  },
  series: [{
    name: 'Sales',
    data: [30, 40, 35, 50, 49, 60, 70]
  }],
  xaxis: {
    categories: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  }
}

// 2. Create chart instance
const chart = new ApexCharts(document.querySelector('#chart'), options)

// 3. Render (REQUIRED — constructor alone does not display the chart)
await chart.render()

// 4. Update data or options later
await chart.updateSeries([{
  name: 'Sales',
  data: [10, 20, 15, 30, 29, 40, 50]
}])

// Or merge new config options
await chart.updateOptions({
  title: { text: 'Updated Chart' }
})

// 5. Destroy when done (REQUIRED before unmounting in SPA frameworks)
chart.destroy()
```

---

## 5. Formatter Function Signatures

| Config Path | Signature | Returns |
|---|---|---|
| `xaxis.labels.formatter` | `(value: string \| number, timestamp?: number, opts?) => string` | Formatted x-axis tick label |
| `yaxis.labels.formatter` | `(value: number, opts?) => string` | Formatted y-axis tick label |
| `tooltip.x.formatter` | `(value: number, opts?) => string` | Tooltip x-value text |
| `tooltip.y.formatter` | `(value: number, opts?) => string` | Tooltip y-value text |
| `tooltip.y.title.formatter` | `(seriesName: string, opts?) => string` | Tooltip series title |
| `tooltip.z.formatter` | `(value: number) => string` | Tooltip z-value (bubble) |
| `dataLabels.formatter` | `(value: number \| string \| number[], opts?) => string \| number` | Data label text |
| `legend.formatter` | `(legendName: string, opts?) => string` | Legend item text |
| `plotOptions.pie.donut.labels.value.formatter` | `(val: string) => string` | Donut center value |
| `plotOptions.pie.donut.labels.total.formatter` | `(w: { globals, config }) => string` | Donut center total |
| `plotOptions.radialBar.dataLabels.value.formatter` | `(val: number) => string` | RadialBar center value |

**Important:** All formatters must return a `string` (or `number` for `dataLabels.formatter`). Never return `undefined`.

**Per-point data label offsets (v6.8):** `dataLabels.offsetX` and `dataLabels.offsetY` accept `number | ((opts) => number)`. The function receives `{ series, seriesIndex, dataPointIndex, w }` (same signature as `dataLabels.style.colors` functions), so colliding labels from two series at the same x can be pushed apart, e.g. `offsetY: ({ seriesIndex }) => (seriesIndex === 0 ? -12 : 12)`. Keep it pure; it may be called more than once per label.

---

## 6. Pitfalls & Anti-Patterns

### Pitfall 1: Wrong series data format for chart type

❌ **WRONG** — pie chart with axis-chart series format:
```js
{ chart: { type: 'pie' }, series: [{ name: 'A', data: [44, 55] }] }
```

✅ **CORRECT** — pie chart uses flat number array + labels:
```js
{ chart: { type: 'pie' }, series: [44, 55, 13], labels: ['A', 'B', 'C'] }
```

### Pitfall 2: Not calling render()

❌ **WRONG** — chart never appears:
```js
const chart = new ApexCharts(el, options)
// Missing render() call!
```

✅ **CORRECT**:
```js
const chart = new ApexCharts(el, options)
await chart.render()
```

### Pitfall 3: Not destroying before re-creating (React/Vue memory leak)

❌ **WRONG** — creates duplicate charts:
```js
useEffect(() => {
  const chart = new ApexCharts(ref.current, options)
  chart.render()
}, [options])
```

✅ **CORRECT** — destroy on cleanup:
```js
useEffect(() => {
  const chart = new ApexCharts(ref.current, options)
  chart.render()
  return () => chart.destroy()
}, [options])
```

### Pitfall 4: Mixing xaxis.type with wrong data format

❌ **WRONG** — datetime axis with string dates (not timestamps):
```js
{
  xaxis: { type: 'datetime' },
  series: [{ data: [{ x: 'January 2024', y: 30 }] }]
}
```

✅ **CORRECT** — datetime axis with timestamps or Date objects:
```js
{
  xaxis: { type: 'datetime' },
  series: [{ data: [{ x: new Date('2024-01-01').getTime(), y: 30 }] }]
}
```

Also: do NOT use `xaxis.categories` when your data already has `{ x, y }` format — categories are ignored.

### Pitfall 5: Multiple y-axes not as array

❌ **WRONG** — yaxis as single object:
```js
{
  series: [{ name: 'Revenue', data: [...] }, { name: 'Profit', data: [...] }],
  yaxis: { title: { text: 'Revenue' } }
}
```

✅ **CORRECT** — yaxis as array with seriesName mapping:
```js
{
  series: [{ name: 'Revenue', data: [...] }, { name: 'Profit', data: [...] }],
  yaxis: [
    { seriesName: 'Revenue', title: { text: 'Revenue ($)' } },
    { seriesName: 'Profit', opposite: true, title: { text: 'Profit (%)' } }
  ]
}
```

### Pitfall 6: tooltip.shared vs tooltip.intersect

❌ **WRONG** — both enabled (conflicting):
```js
{ tooltip: { shared: true, intersect: true } }
```

✅ **CORRECT** — pick one mode:
```js
// Mode A: Show all series values at x-position (default for line/area)
{ tooltip: { shared: true, intersect: false } }

// Mode B: Show only hovered data point (better for scatter)
{ tooltip: { shared: false, intersect: true } }
```

### Pitfall 7: Wrong formatter signatures

❌ **WRONG** — using y-axis formatter signature for tooltip:
```js
{
  tooltip: { y: { formatter: (val, timestamp, opts) => `$${val}` } }
}
```

✅ **CORRECT** — tooltip.y.formatter only receives `(val, opts)`:
```js
{
  tooltip: { y: { formatter: (val, opts) => `$${val}` } },
  yaxis: { labels: { formatter: (val) => `$${val.toFixed(0)}` } }
}
```

### Pitfall 8: undefined instead of null for missing data

❌ **WRONG** — undefined breaks the chart:
```js
{ series: [{ data: [10, undefined, 30, undefined, 50] }] }
```

✅ **CORRECT** — use null:
```js
{ series: [{ data: [10, null, 30, null, 50] }] }
```

### Pitfall 9: Stacking on unsupported chart types

❌ **WRONG** — stacking on scatter chart:
```js
{ chart: { type: 'scatter', stacked: true } }
```

✅ **CORRECT** — stacking only works on bar and area:
```js
{ chart: { type: 'bar', stacked: true } }
// or
{ chart: { type: 'area', stacked: true } }
```

### Pitfall 10: Mixed/combo charts missing per-series type

❌ **WRONG** — no type on individual series:
```js
{
  chart: { type: 'line' },
  series: [
    { name: 'Sales', data: [10, 20, 30] },      // renders as line
    { name: 'Profit', data: [5, 12, 18] }        // also renders as line!
  ]
}
```

✅ **CORRECT** — set type per series:
```js
{
  chart: { type: 'line' },
  series: [
    { name: 'Sales', type: 'column', data: [10, 20, 30] },
    { name: 'Profit', type: 'line', data: [5, 12, 18] }
  ]
}
```

### Pitfall 11: RadialBar values > 100

❌ **WRONG** — raw values (renders incorrectly):
```js
{ chart: { type: 'radialBar' }, series: [340, 520, 190] }
```

✅ **CORRECT** — use percentages 0–100:
```js
{ chart: { type: 'radialBar' }, series: [76, 67, 61], labels: ['A', 'B', 'C'] }
```

### Pitfall 12: Colors without # prefix

❌ **WRONG**:
```js
{ colors: ['FF5733', '33FF57'] }
```

✅ **CORRECT**:
```js
{ colors: ['#FF5733', '#33FF57'] }
```

### Pitfall 13: Responsive breakpoints not ascending

❌ **WRONG** — descending order:
```js
{ responsive: [{ breakpoint: 1024, options: {...} }, { breakpoint: 480, options: {...} }] }
```

✅ **CORRECT** — ascending order:
```js
{ responsive: [{ breakpoint: 480, options: {...} }, { breakpoint: 1024, options: {...} }] }
```

### Pitfall 14: Missing feature imports

Two distinct versions of this. **(a) Per-type entries carry no features:**

❌ **WRONG** — toolbar/legend/annotations silently missing:
```js
import ApexCharts from 'apexcharts/line'
// No feature imports! Legend, toolbar, annotations won't appear.
```

✅ **CORRECT** — import needed features:
```js
import ApexCharts from 'apexcharts/line'
import 'apexcharts/features/legend'
import 'apexcharts/features/toolbar'
import 'apexcharts/features/annotations'
```

**(b) *(v7)* The full bundle no longer carries the nine Tier 2 features.** This one catches people who never tree-shook anything, and it is the most common v6 → v7 upgrade failure.

❌ **WRONG**: the config is right, the module is absent, so the chart renders as one plain chart and logs a warning:
```js
import ApexCharts from 'apexcharts'
new ApexCharts(el, { chart: { type: 'line' }, series, trellis: { by: 'region' } })
```

✅ **CORRECT**:
```js
import ApexCharts from 'apexcharts'
import 'apexcharts/features/trellis'
```

Same for `storyboard`, `perspectives`, `ink`, `renderer: 'canvas'`, `link`, `measure`, `history`, `contextMenu`, and the `raincloud` chart type. Check the console: each one names both import routes when its config is present without it.

### Pitfall 15: SSR — wrong import path

❌ **WRONG** — using browser bundle in Node.js:
```js
// On server:
import ApexCharts from 'apexcharts'
await ApexCharts.renderToString(options)  // renderToString doesn't exist!
```

✅ **CORRECT** — use SSR entry point:
```js
// On server:
import ApexCharts from 'apexcharts/ssr'
const svg = await ApexCharts.renderToString(options)

// On client (for hydration):
import ApexCharts from 'apexcharts'  // or 'apexcharts/client'
ApexCharts.hydrate(document.querySelector('#chart'))
```

### Pitfall 16: updateOptions vs updateSeries vs appendData

❌ **WRONG** — full updateOptions just to change data:
```js
chart.updateOptions({ series: [{ data: newData }] })
```

✅ **CORRECT** — use the right method:
```js
// Replace all series data (most common)
await chart.updateSeries([{ name: 'Sales', data: newData }])

// Add data points to existing series (real-time streaming)
await chart.appendData([{ data: [newPoint] }])

// Change config (title, colors, axis, etc.)
await chart.updateOptions({ title: { text: 'New Title' } })
```

---

## 7. API Methods Quick Reference

### Instance Methods

| Method | Description |
|---|---|
| `render()` | Renders the chart. Returns `Promise<ApexCharts>`. |
| `destroy()` | Destroys chart instance and removes DOM elements. |
| `updateOptions(options, redraw?, animate?, updateSyncedCharts?)` | Merges new options and re-renders. Returns `Promise`. |
| `updateSeries(newSeries, animate?)` | Replaces series data. Returns `Promise`. |
| `appendSeries(newSeries, animate?)` | Appends a new series to existing ones. Returns `Promise`. |
| `appendData(newData)` | Appends data points to each series. Returns `Promise`. |
| `toggleSeries(seriesName)` | Show/hide series by name. |
| `showSeries(seriesName)` | Show a hidden series. |
| `hideSeries(seriesName)` | Hide a visible series. |
| `resetSeries(shouldUpdateChart?, shouldResetZoom?)` | Resets to initial series data. |
| `zoomX(min, max)` | Programmatically zoom x-axis. |
| `addXaxisAnnotation(opts)` | Add x-axis annotation dynamically. |
| `addYaxisAnnotation(opts)` | Add y-axis annotation dynamically. |
| `addPointAnnotation(opts)` | Add point annotation dynamically. |
| `removeAnnotation(id)` | Remove annotation by id. |
| `clearAnnotations()` | Remove all annotations. |
| `dataURI(options?)` | Export chart as data URI. Returns `Promise`. |
| `getSvgString(scale?)` | Get chart SVG markup. Returns `Promise<string>`. |
| `exportToCSV(options?)` | Trigger CSV download. |
| `setLocale(localeName)` | Switch locale. |
| `toggleDataPointSelection(seriesIndex, dataPointIndex?)` | Select/deselect data point. |
| `rowSeries(opts?)` | *(v6.9)* Returns the raw rows behind this chart's marks as a unit-chart series (one cluster per mark), or `null` when the type has no row source (works for histogram / boxPlot / violin, needs `apexcharts/features/stats`). `opts.maxRows` caps the output (default 3000). |
| `getState()` | Returns snapshot of chart state. |
| `addEventListener(name, handler)` | Subscribe to chart event. |
| `removeEventListener(name, handler)` | Unsubscribe from chart event. |

### Feature Instance Methods (require the matching feature import)

| Method | Feature | Description |
|---|---|---|
| `chart.getPanels() / getPanel(key)` | trellis | *(v7.0)* The grid's panels, and one panel's own ApexCharts instance by facet key. Empty / `null` on a chart that is not a trellis host. |
| `chart.promotePanel(key) / restorePanels()` | trellis | *(v7.0)* Expand one panel to the grid's full width, and go back. |
| `chart.history.undo() / redo() / jump(id) / transaction(fn)` | history | Undo/redo over the command journal. |
| `chart.perspectives.capture() / toURL() / apply(token)` | perspectives | Serialize / restore the exact view. |
| `chart.getActiveRenderer()` | renderer-canvas | Returns `'svg' \| 'canvas'` currently in use. |
| `chart.refreshTokens()` | facet | Re-read `--apx-*` CSS custom properties. |
| `chart.startMeasure() / stopMeasure() / clearMeasures()` | measure | Drive the measure ruler from code. |
| `chart.storyboard.bind({ beats }) / goTo() / unbind()` | storyboard | Scroll-driven choreography. |
| `chart.drillDown(id) / drillUp() / drillToRoot()` | drilldown | Navigate the drill-down hierarchy. |
| `chart.clearCrossfilter()` | link | Clear active crossfilter selections. |

### Static Methods

| Method | Description |
|---|---|
| `ApexCharts.exec(chartID, fn, ...args)` | Call method on chart by its `chart.id`. |
| `ApexCharts.getChartByID(chartID)` | Get chart instance by id. |
| `ApexCharts.setLicense(key)` | *(v6.5)* Set the license key that clears the premium-feature trial watermark. Static, family-shared, offline, SSR-safe; call before `render()`. Per-chart override is `chart.license`. As of 6.7.0 requires a `premium`/`enterprise` plan. |
| `ApexCharts.merge(target, source)` | Deep-merge objects. |
| `ApexCharts.use(typeMap)` | Register chart type constructors (tree-shaking). |
| `ApexCharts.registerFeatures(featureMap)` | Register optional feature modules. |
| `ApexCharts.registerPlugin(def) / unregisterPlugin(name)` | *(v6, Weave)* Register a reusable plugin. |
| `ApexCharts.registerSeriesType(name, def) / unregisterSeriesType(name)` | *(v6, Marks)* Register a custom series type. |
| `ApexCharts.registerTheme(name, def) / unregisterTheme(name)` | *(v6, Facet)* Register a named brand theme. |
| `ApexCharts.registerEasing(name, fn)` | *(v6, Cadence)* Register a custom easing curve. |
| `ApexCharts.registerUnitLayout(name, fn) / unregisterUnitLayout(name)` | *(v6.9)* Register a named unit-chart layout, referenceable via `plotOptions.unit.positions: '<name>'` with `layout: 'custom'`. |
| `ApexCharts.crossfilter({ id, records }) / getCrossfilter(id)` | *(v6, Link)* Create / fetch a crossfilter engine. |
| `ApexCharts.perspectives.fromURL(href)` | *(v6)* Decode a perspective token from a URL. |
| `ApexCharts.trellis(el, options)` | *(v7.0, Trellis)* Imperative entry point: creates a trellis host (options must carry `trellis.by`). Throws if the trellis feature is not imported. |
| `registerMarks(defs) / definePictogram(meta)` from `apexcharts/pictograms` | *(v7.0)* Register glyphs so `plotOptions.unit.pictogram.mark: 'person'` resolves. |

### SSR Static Methods (available with `apexcharts/ssr`)

| Method | Description |
|---|---|
| `ApexCharts.renderToString(options, { width, height, scale })` | Render chart to raw SVG string (Node.js). |
| `ApexCharts.renderToHTML(options, { width, height, scale, className })` | Render hydration-ready HTML string (Node.js). |
| `ApexCharts.hydrate(element, clientOptions?)` | Hydrate a server-rendered chart (browser). |
| `ApexCharts.hydrateAll(selector?, clientOptions?)` | Hydrate all server-rendered charts on page. |
| `ApexCharts.isHydrated(element)` | Check if element is already hydrated. |

---

## 8. Chart Events

```js
{
  chart: {
    events: {
      // Lifecycle
      beforeMount: (chart, options) => {},
      mounted: (chart, options) => {},
      updated: (chart, options) => {},
      animationEnd: (chart, options) => {},

      // User interaction
      click: (event, chart, options) => {},
      mouseMove: (event, chart, options) => {},
      mouseLeave: (event, chart, options) => {},
      legendClick: (chart, seriesIndex, options) => {},
      markerClick: (event, chart, options) => {},
      xAxisLabelClick: (event, chart, options) => {},

      // Data point events
      dataPointSelection: (event, chart, options) => {},
      dataPointMouseEnter: (event, chart, options) => {},
      dataPointMouseLeave: (event, chart, options) => {},

      // Zoom & pan
      beforeZoom: (chart, { xaxis }) => {},      // return false to cancel
      zoomed: (chart, { xaxis }) => {},
      beforeResetZoom: (chart, options) => {},    // return false to cancel
      scrolled: (chart, { xaxis }) => {},
      selection: (chart, { xaxis, yaxis }) => {},

      // v6 feature events (fire only when the matching feature is enabled)
      annotationDragged: (chart, options) => {},  // ink
      annotationEdited: (chart, options) => {},    // ink
      annotationStyled: (chart, options) => {},    // ink
      annotationDeleted: (chart, options) => {},   // ink
      measured: (chart, { from, to, dx, dy, percentChange, slope }) => {}, // measure
      beatChange: (chart, beatInfo) => {},         // storyboard
      drillDownStart: (info, chart, options) => {},// drilldown
      drillDownEnd: (info, chart, options) => {},  // drilldown
      drillUp: (info, chart, options) => {},       // drilldown
      drillDownError: ({ id, error }, chart, options) => {}, // drilldown (v6.9): async level failed; view unchanged
    }
  }
}
```

---

## 9. Feature Platform

Every feature below is off by default in config terms. The **Tier** column is about the *bundle*: Tier 1 is already in `import ApexCharts from 'apexcharts'` and needs a `features/*` import only if you started from `/core` or a per-type entry; **Tier 2 needs its import no matter which entry point you used**. Full config shapes, APIs, and examples are in `references/feature-platform.md`.

| Feature | Tier | Import | One-liner |
|---|---|---|---|
| **Weave** (plugins) | 1 | `apexcharts/features/weave` | Publish reusable chart plugins against a stable `ApexCharts.registerPlugin({ name, setup })` API; activate per chart with `plugins: [{ name }]`. |
| **Marks** (custom series) | 1 | `apexcharts/features/marks` | `ApexCharts.registerSeriesType(name, { renderItem })` for first-class custom marks (lollipop, bullet). Baseline is `scales.y(0)`, **not** `api.zeroY`. |
| **Facet** (themes/tokens) | 1 | `apexcharts/features/facet` | `theme: { follow: 'os', name }`, `--apx-*` CSS custom props, `ApexCharts.registerTheme`. |
| **Drilldown** | 1 | `apexcharts/features/drilldown` | `drilldown: { enabled, series }` + a `drilldown` id on data points; `chart.drillDown()/drillUp()`. v6.9 adds line/area support, async levels (`onDrillDown` may return a Promise), a loading overlay, and the `drillDownError` event. |
| **Morph** | 1 | `apexcharts/features/morph` | Animated transitions between chart types. |
| **Stats** | 1 | `apexcharts/features/stats` | *(v6.9)* Statistics behind histogram binning, boxPlot/violin raw-sample summaries (R type 7 quartiles, KDE), and `chart.rowSeries()`. The `apexcharts/histogram` entry includes it. |
| **Cadence** (easing) | core | none | `chart.animations.easing` accepts a named curve, cubic-bezier array, or function; `ApexCharts.registerEasing`. |
| **Streaming** | core | none | `chart: { streaming: { enabled, maxPoints } }` for constant-velocity rolling-window scroll. |
| **Print layout** | core | none | *(v7.1)* `chart: { print: { enabled, width } }`. The paper box cannot be measured from JS (`clientWidth` and `matchMedia` both report the screen during `beforeprint`), so the chart is re-laid out at a known width for the sheet and restored after. **On by default** at `width: 700` (suits A4 / Letter portrait); a chart already narrower is left alone. `print: false` restores the pre-7.1 behavior. |
| **Marker batching** | core | none | *(v7.0)* `markers: { largeDatasetThreshold: n }`. Above `n` points, a series' markers are drawn as one path per marker size instead of one element per point. **Opt-in, default `0` (off)**, because merged marker paths are not pixel-identical: overlapping markers lose their individual outlines and dense clusters read flatter. Also covers the markers `showNullDataPoints` adds, which is what makes a null-heavy series slow even at `size: 0`. |
| **Trellis** (small multiples) | **2** | `apexcharts/features/trellis` | *(v7.0, premium)* `trellis: { by: 'region', minPanelWidth }` splits the series into a grid of real charts sharing one scale, legend, toolbar and crosshair. Also `row` × `column` for 2-D grids. |
| **Strata** (canvas) | **2** | `apexcharts/features/renderer-canvas` | `chart: { renderer: 'auto', rendererThreshold }` paints the dense series layer to canvas while axes/tooltips/exports stay SVG. Falls back to SVG if the module is missing. |
| **Rewind** (undo/redo) | **2** | `apexcharts/features/history` | *(premium)* `chart: { history: { enabled: true } }`, then `chart.history.undo()/redo()/jump()/transaction()`. |
| **Perspectives** (view state) | **2** | `apexcharts/features/perspectives` | *(premium)* `chart.perspectives.capture()/toURL()/apply()` to serialize and restore the exact view. |
| **Link** (crossfilter) | **2** | `apexcharts/features/link` | *(premium)* `chart: { group, link: { enabled, mode } }` for highlight linking; `ApexCharts.crossfilter({ id, records })` for a filter engine. |
| **Ink** (annotation authoring) | **2** | `apexcharts/features/ink` | *(premium)* `chart: { ink: { enabled: true } }` makes annotations draggable/resizable with a floating editor. |
| **Measure** (ruler) | **2** | `apexcharts/features/measure` | *(premium)* `chart: { measure: { enabled, mode } }`; hold a key and drag to read change/percent/slope. v6.1 adds a toolbar tool (`toolbar.tools.measure`, `toolbar.autoSelected: 'measure'`). |
| **Context menu** | **2** | `apexcharts/features/context-menu` | *(premium)* `chart: { contextMenu: { enabled, items } }` for point-specific right-click actions. |
| **Storyboard** (scrollytelling) | **2** | `apexcharts/features/storyboard` | *(premium)* `chart.storyboard.bind({ beats })` pairs prose sections with saved views. Registers Perspectives too. |

## 10. Reference Routing Table

For detailed chart-family-specific options, data format variants, and full working examples, refer to:

| Topic | Reference File |
|---|---|
| Line, Area, Scatter, Bubble, Range Area, Streamgraph | `references/cartesian-charts.md` |
| Bar, Column, Range Bar, Timeline/Gantt, Funnel, Pyramid, Waterfall, Dumbbell | `references/bar-charts.md` |
| Candlestick, Box Plot, Violin, Histogram, Raincloud | `references/financial-charts.md` |
| Pie, Donut, Polar Area, Radial Bar, Gauge, Sunburst, Unit, Waffle, Pictograms | `references/circular-charts.md` |
| Heatmap, Treemap | `references/grid-charts.md` |
| Radar | `references/radar-charts.md` |
| Feature platform (small multiples, plugins, canvas, undo/redo, themes, crossfilter, storyboard, ...) | `references/feature-platform.md` |
| Bundle tiers, Tree-shaking, Bundle optimization | `references/tree-shaking.md` |
| Server-side rendering, Hydration | `references/ssr.md` |
| React, Vue, Angular integration | `references/framework-wrappers.md` |
