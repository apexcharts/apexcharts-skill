# Bundle Tiers, Tree-Shaking & Optimization: ApexCharts

## ⚠️ What changed in v7.0

**In v6, the default bundle contained every feature. In v7 it does not.** Nine features are **Tier 2**: shipped in the package, absent from every bundle, and reachable only through an explicit import. This applies to the default `apexcharts` bundle, not just to tree-shaken builds, and it is the most common v6 → v7 upgrade failure.

```js
import ApexCharts from 'apexcharts'
import 'apexcharts/features/trellis'   // Tier 2: required even on the default bundle
```

| | gzip |
|---|---|
| 6.10.0 default bundle | 291,654 B |
| 7.0.0 default bundle | 252,005 B (**-13.6%**) |
| 7.1.0 default bundle | 264,326 B (three new chart types) |

If you use none of the nine, upgrading is `npm install apexcharts@7` and nothing else.

## Overview

ApexCharts supports four import strategies with different bundle sizes:

| Strategy | Import | Includes |
|---|---|---|
| Default bundle | `import ApexCharts from 'apexcharts'` | Every chart type except `raincloud`, plus the **Tier 1** features. **Not** the nine Tier 2 features. |
| Per-type entry | `import ApexCharts from 'apexcharts/line'` | Specific chart family + core (no optional features at all) |
| Bare core | `import ApexCharts from 'apexcharts/core'` | Core class only — must manually register everything |
| Lean core, no bundler *(v7.0)* | `<script src=".../dist/apexcharts.core.js">` | Script-tag equivalent of bare core, assembled from separate tags. See below. |

---

## Per-Type Entry Points

Each entry point registers a family of related chart types:

| Entry Point | Chart Types Registered |
|---|---|
| `apexcharts/line` | line, area, scatter, bubble, rangeArea |
| `apexcharts/area` | same as /line |
| `apexcharts/scatter` | same as /line |
| `apexcharts/bubble` | same as /line |
| `apexcharts/rangeArea` | same as /line |
| `apexcharts/bar` | bar, column, rangeBar |
| `apexcharts/column` | same as /bar |
| `apexcharts/rangeBar` | same as /bar |
| `apexcharts/waterfall` | waterfall *(new in v7.1)*: the bar engine plus the waterfall feature |
| `apexcharts/dumbbell` | dumbbell *(new in v7.1)*: the bar engine plus the dumbbell feature |
| `apexcharts/streamgraph` | streamgraph *(new in v7.1)*: the rangeArea engine plus the streamgraph feature |
| `apexcharts/candlestick` | candlestick, boxPlot |
| `apexcharts/boxPlot` | same as /candlestick |
| `apexcharts/violin` | violin *(new in v6)* |
| `apexcharts/raincloud` | raincloud *(new in v7.1, premium)*: the violin engine plus the raincloud feature. **Tier 2**: the only chart type absent from the default bundle. |
| `apexcharts/histogram` | histogram *(new in v6.9)*: the bar engine plus the stats feature |
| `apexcharts/pie` | pie, donut, polarArea |
| `apexcharts/donut` | same as /pie |
| `apexcharts/polarArea` | same as /pie |
| `apexcharts/radialBar` | radialBar, **gauge** *(v6 alias)* |
| `apexcharts/radar` | radar |
| `apexcharts/heatmap` | heatmap |
| `apexcharts/treemap` | treemap |
| `apexcharts/sunburst` | sunburst *(new in v6.7, free)* |
| `apexcharts/unit` | unit, **waffle** *(new in v6.6, premium: watermarked until licensed)* |
| `apexcharts/unit-shapes` | *(new in v6.10)* not a chart entry: named shape exports for the unit chart (`heart`, `house`, ... plus `outlined`, `glyphs`, `preview`), tree-shaken per shape (~4 KB gzipped each). See `references/circular-charts.md`. |
| `apexcharts/pictograms` | *(new in v7.0)* not a chart entry: a drawn glyph per unit for the unit chart (`person`, `house`, `heart`, `tree`, `droplet`, `star`, `car`, `bag`, `book`, `cup`, `bulb`, `plane`), plus `definePictogram` / `registerMarks` / `catalog`. Import the glyph you use, not `catalog`, which ships all of them. |

**First-class aliases:** `funnel` and `pyramid` render through the bar engine, so `apexcharts/bar` covers them. `gauge` renders through radialBar, so `apexcharts/radialBar` covers it. There is no separate `apexcharts/funnel`, `apexcharts/pyramid`, or `apexcharts/gauge` entry.

**Entries that bundle a feature.** Four types render through an existing engine but have their own entry because that entry also pulls in a feature module. Each is equivalent to the engine entry plus the feature:

| Entry | Equivalent to |
|---|---|
| `apexcharts/histogram` | `apexcharts/bar` + `import 'apexcharts/features/stats'` |
| `apexcharts/waterfall` | `apexcharts/bar` + `import 'apexcharts/features/waterfall'` |
| `apexcharts/dumbbell` | `apexcharts/bar` + `import 'apexcharts/features/dumbbell'` |
| `apexcharts/streamgraph` | `apexcharts/rangeArea` + `import 'apexcharts/features/streamgraph'` |
| `apexcharts/raincloud` | `apexcharts/violin` + `import 'apexcharts/features/raincloud'` |

### Using Multiple Chart Types

```js
// Import multiple entry points for a mixed chart
import ApexCharts from 'apexcharts/line'
import 'apexcharts/bar'   // side-effect: registers bar types onto the same class
```

---

## Optional Features: Tier 1 vs Tier 2

Two questions decide whether you need a `features/*` import:

1. **Which entry point did you start from?** `apexcharts/core` and the per-type entries carry no optional features at all, so every feature you want needs its import.
2. **Which tier is the feature?** Tier 1 is in the default `apexcharts` bundle. **Tier 2 is in no bundle**, so it needs its import even there.

### Tier 1: in the default `apexcharts` bundle

Import these only when you started from `/core` or a per-type entry.

| Feature | Import | What It Adds |
|---|---|---|
| Legend | `import 'apexcharts/features/legend'` | Interactive legend component |
| Toolbar | `import 'apexcharts/features/toolbar'` | Zoom, pan, download buttons |
| Annotations | `import 'apexcharts/features/annotations'` | X/Y/point/text/image annotations |
| Exports | `import 'apexcharts/features/exports'` | `dataURI()`, `getSvgString()`, `exportToCSV()` |
| Keyboard | `import 'apexcharts/features/keyboard'` | Keyboard navigation (accessibility) |
| Stats *(v6.9)* | `import 'apexcharts/features/stats'` | Histogram binning, boxPlot/violin raw-sample summaries, `rowSeries()` |
| Morph | `import 'apexcharts/features/morph'` | Animated chart-type morphs |
| Drilldown | `import 'apexcharts/features/drilldown'` | Hierarchical drill-down |
| Facet | `import 'apexcharts/features/facet'` | Design tokens + OS-aware themes |
| Weave | `import 'apexcharts/features/weave'` | Public plugin platform |
| Marks | `import 'apexcharts/features/marks'` | Custom series types (`registerSeriesType`) |
| Waterfall *(v7.1)* | `import 'apexcharts/features/waterfall'` | The `waterfall` chart type |
| Dumbbell *(v7.1)* | `import 'apexcharts/features/dumbbell'` | The `dumbbell` chart type |
| Streamgraph *(v7.1)* | `import 'apexcharts/features/streamgraph'` | The `streamgraph` chart type |
| All Tier 1 | `import 'apexcharts/features/all'` | Every row above, and **only** those |

Tier 1 is a **budget, not an index**: upstream, a module earns a place only if it is under ~5 KB gzipped on top of core, needs no peer dependency or separate asset, and is useful to a majority of charts. The first seven predate the budget and are grandfathered.

### Tier 2: in NO bundle; always an explicit import

Required whatever entry point you used, the default `apexcharts` bundle included.

| Feature | Import | gzip | Premium | What It Adds |
|---|---|---|---|---|
| Trellis *(v7.0)* | `import 'apexcharts/features/trellis'` | 25.7 KB | yes | Small multiples: a grid of real charts sharing scale, legend, toolbar, crosshair |
| Storyboard | `import 'apexcharts/features/storyboard'` | 8.0 KB | yes | Scrollytelling (registers Perspectives too) |
| Perspectives | `import 'apexcharts/features/perspectives'` | 6.7 KB | yes | Shareable view state |
| Ink | `import 'apexcharts/features/ink'` | 6.2 KB | yes | On-chart annotation authoring |
| Renderer / Strata | `import 'apexcharts/features/renderer-canvas'` | 6.0 KB | no | Hybrid SVG + canvas renderer |
| Link | `import 'apexcharts/features/link'` | 5.3 KB | yes | Crossfilter / linked views |
| Measure | `import 'apexcharts/features/measure'` | 4.6 KB | yes | Measure / delta ruler |
| History / Rewind | `import 'apexcharts/features/history'` | 3.2 KB | yes | Undo/redo (`chart.history`) |
| Context menu | `import 'apexcharts/features/context-menu'` | 2.3 KB | yes | Right-click / long-press context menu |
| Raincloud *(v7.1)* | `import 'apexcharts/features/raincloud'` | n/a | yes | The `raincloud` chart type (or use the `apexcharts/raincloud` entry) |

Storyboard registers Perspectives, so importing both costs no more than Storyboard alone.

**`apexcharts/features/all` does not include Tier 2**, by design: upstream has a tier-budget test that fails the build if a Tier 2 feature reappears in it.

**Nothing fails silently on Tier 2.** Each module warns in the console when its configuration is present but the module is not, and the warning names both the ESM and script-tag route. Where the chart can still draw something sensible it does and says what it did instead: a trellis renders as a single chart, `renderer: 'canvas'` falls back to SVG.

---

## Script tags: the lean core channel (v7.0)

Tree-shaking only ever helped people with a build step. A page using a `<script>` tag had one artifact and no way to decline any of it. `dist/apexcharts.core.js` is the chart class with no chart types and no optional features, assembled from separate tags:

```html
<script src=".../dist/apexcharts.core.js"></script>
<script src=".../dist/line.js"></script>
<script src=".../dist/features/legend.js"></script>
```

**136,921 B gzipped**, against 252,005 for the full bundle. Purely additive: `apexcharts.js` is unchanged, and a page that wants everything should keep loading it rather than assembling it from parts.

Every Tier 2 feature has a `dist/features/<name>.js` artifact for this channel too, and a full-bundle page still needs it:

```html
<script src=".../dist/apexcharts.js"></script>
<script src=".../dist/features/trellis.js"></script>
```

**Important:** Tooltip is always included in core (it cannot be tree-shaken). Easing (Cadence) and real-time streaming are also core, so they need no feature import. See `feature-platform.md` for the config and API of each feature.

**Runtime dependency (v6.9):** ApexCharts is no longer dependency-free: it depends on `apex-commons` at runtime (license manager, crossfilter engine, spring primitives shared across the ApexCharts family). npm resolves it automatically, and the browser (script-tag) bundles inline it, so no configuration is needed; bundlers just see one more resolvable package. The `apexcharts/unit` and `apexcharts/unit-shapes` sub-entry points resolve for bundlers and script tags alike (from a script tag, `dist/unit-shapes.js` exposes the global `ApexUnitShapes`).

### What Happens If You Forget a Feature

It depends on the tier.

**Tier 1 features fail silently.** If you use a per-type entry without importing legend:
- No legend appears, no error thrown
- `chart.toolbar` is undefined, toolbar doesn't render
- `addXaxisAnnotation()` does nothing
- `dataURI()` / `exportToCSV()` throw because the feature isn't registered

**Tier 2 features announce themselves.** Each warns in the console when its configuration is present but the module is not, naming both the ESM and the script-tag route, and degrades predictably where it can: a `trellis` config renders as one ordinary chart, `renderer: 'canvas'` falls back to SVG. If a v7 chart is quietly missing a feature you configured, **check the console before the config**.

---

## Bare Core Usage

For maximum control, import core and register everything manually:

```js
import ApexCharts from 'apexcharts/core'

// Register chart types manually
import { Line } from 'apexcharts/src/charts/Line.js'
ApexCharts.use({ line: Line, area: Line })

// Register features manually
import { Legend } from 'apexcharts/src/modules/legend/Legend.js'
ApexCharts.registerFeatures({ legend: Legend })
```

This approach is rarely needed — per-type entries with feature imports cover most use cases.

---

## Example: Minimal Line Chart Bundle

```js
import ApexCharts from 'apexcharts/line'
import 'apexcharts/features/legend'
import 'apexcharts/features/toolbar'

const chart = new ApexCharts(el, {
  chart: { type: 'line', height: 350 },
  series: [{ data: [10, 20, 30] }],
  xaxis: { categories: ['A', 'B', 'C'] }
})
await chart.render()
```

## Example: Mixed Chart (Line + Bar)

```js
import ApexCharts from 'apexcharts/line'
import 'apexcharts/bar'
import 'apexcharts/features/legend'

const chart = new ApexCharts(el, {
  chart: { type: 'line', height: 350 },
  series: [
    { name: 'Revenue', type: 'column', data: [44, 55, 57] },
    { name: 'Profit', type: 'line', data: [15, 25, 35] }
  ],
  xaxis: { categories: ['Q1', 'Q2', 'Q3'] }
})
await chart.render()
```

---

## Vite Configuration

When using Vite with tree-shaking entries, configure `optimizeDeps` to prevent duplicate bundles:

```js
// vite.config.js
export default {
  optimizeDeps: {
    include: [
      'apexcharts/line',
      'apexcharts/features/legend',
      'apexcharts/features/toolbar'
      // Add all apexcharts entries you use
    ]
  }
}
```

---

## Common Pitfalls

1. **Assuming the default bundle still has everything *(v7)***: the nine Tier 2 features and the `raincloud` type need their own import on top of `import ApexCharts from 'apexcharts'`. This is the most common v6 → v7 upgrade failure.
2. **Reaching for `apexcharts/features/all` to fix it**: that is the Tier 1 set by design and pulls in no Tier 2 module.
3. **Missing feature imports on a tree-shaken build**: Tier 1 features fail silently. If legend/toolbar/annotations don't appear, check imports.
4. **Importing `apexcharts` AND `apexcharts/line`**: creates duplicate bundles. Use one strategy. *(v7.0 fixed the related internal bug where the default bundle inlined its own core copy while add-ons resolved `apexcharts/core`, so an app importing both got two classes, ~130 KB gzipped of duplicate core, and a feature that never registered. They now share one core.)*
5. **Vite duplicate bundle issue**: without `optimizeDeps.include`, Vite may bundle ApexCharts twice.
6. **Calling `dataURI()` without exports feature**: throws an error. Import `apexcharts/features/exports` first.
7. **`require('apexcharts/line')` used to throw** `h.use is not a function` in every published version with sub-path entries, because rollup's default CJS interop assumes `require()` returns the export itself. Fixed in **7.0.0**; below that, use ESM `import` for sub-path entries.
