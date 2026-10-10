# Bundle Tiers, Tree-Shaking & Optimization: ApexCharts

## ⚠️ What changed in v8.0

**8.0 took three chart types and four features out of the default bundle, and added a full bundle that has everything.** If a chart stops drawing after the upgrade, the console names the import to add.

| Moved out of the default bundle | Kind | Import next to `import ApexCharts from 'apexcharts'` | Script tag |
|---|---|---|---|
| `unit` (with its `waffle` alias) | chart type | `import 'apexcharts/unit'` | `dist/unit.js` |
| `sunburst` | chart type | `import 'apexcharts/sunburst'` | `dist/sunburst.js` |
| `violin` | chart type | `import 'apexcharts/violin'` | `dist/violin.js` |
| drilldown | feature | `import 'apexcharts/features/drilldown'` | `dist/features/drilldown.js` |
| `waterfall`, `dumbbell`, `streamgraph` | chart types drawn by a feature | `import 'apexcharts/features/<name>'` | `dist/features/<name>.js` |

For the last three the default bundle still has the bar and rangeArea renderers, so add only the feature. `raincloud` and `icicle` were already opt-in. A raincloud draws through violin, which is no longer in the default bundle, so it needs `import 'apexcharts/raincloud'` (violin plus the feature), or `dist/violin.js` then `dist/features/raincloud.js`. Add-on tags may load before or after the ApexCharts script.

Or load everything at once. Premium types and features in it stay licence-gated, as they are when loaded as add-ons:

```js
import ApexCharts from 'apexcharts/full'   // script tag: dist/apexcharts.full.min.js
```

| | gzip |
|---|---|
| 7.9.1 default bundle | 291,763 B |
| 8.0.0 default bundle | 263,188 B (**-9.8%**) |
| 8.0.0 full bundle | 381,135 B |

Unversioned CDN URLs serve 8.0. Pin `apexcharts@7` to stay on 7.

## ⚠️ What changed in v7.0

**In v6, the default bundle contained every feature. In v7 it does not.** Nine features are **Tier 2**: shipped in the package, absent from every 7.x bundle, and reachable only through an explicit import. This applies to the default `apexcharts` bundle, not just to tree-shaken builds, and it is the most common v6 → v7 upgrade failure.

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

ApexCharts supports five import strategies with different bundle sizes:

| Strategy | Import | Includes |
|---|---|---|
| Default bundle | `import ApexCharts from 'apexcharts'` | line, area, scatter, bubble, rangeArea, bar, column, rangeBar, candlestick, boxPlot, pie, donut, polarArea, radialBar, radar, heatmap, treemap (plus the funnel, pyramid, histogram and gauge aliases), and the **Tier 1** features. **Not** the Tier 2 chart types or features *(v8.0)*. |
| Full bundle *(v8.0)* | `import ApexCharts from 'apexcharts/full'` / `dist/apexcharts.full.min.js` | Every chart type and every feature, Tier 2 included, plus the unit-shapes and pictograms catalogs. Premium items stay licence-gated. |
| Per-type entry | `import ApexCharts from 'apexcharts/line'` | Specific chart family + core, plus any feature the type needs (no legend, toolbar, exports or other optional features) |
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
| `apexcharts/violin` | violin *(new in v6)*. **Opt-in since v8.0**: add it next to `import ApexCharts from 'apexcharts'` (script tag: `dist/violin.js`), or use `apexcharts/full`. Violin draws on the bar renderer and does not bundle one: on `apexcharts/core` also import `apexcharts/bar` (script tag: `dist/bar.js`). |
| `apexcharts/raincloud` | raincloud *(new in v7.1, premium)*: the violin engine plus the raincloud feature. **Opt-in**: not in the default bundle. Script tags: `dist/violin.js` then `dist/features/raincloud.js` *(v8.0)*. On `apexcharts/core` also import `apexcharts/bar`, as for violin. |
| `apexcharts/histogram` | histogram *(new in v6.9)*: the bar engine plus the stats feature |
| `apexcharts/pie` | pie, donut, polarArea |
| `apexcharts/donut` | same as /pie |
| `apexcharts/polarArea` | same as /pie |
| `apexcharts/radialBar` | radialBar, **gauge** *(v6 alias)* |
| `apexcharts/radar` | radar |
| `apexcharts/heatmap` | heatmap |
| `apexcharts/treemap` | treemap |
| `apexcharts/sunburst` | sunburst *(new in v6.7, free)*. **Opt-in since v8.0**: add it next to `import ApexCharts from 'apexcharts'` (script tag: `dist/sunburst.js`), or use `apexcharts/full`. |
| `apexcharts/icicle` | icicle *(new in v7.6, free)*: the sunburst's partition in cartesian coordinates. **Opt-in**: the default bundle carries no icicle class, only the settings literals and a few string branches, so a `chart.type: 'icicle'` chart's `render()` rejects until this entry, or a `dist/icicle.js` script tag, has registered it. `dist/apexcharts.js` (the default bundle) does not carry it; `apexcharts/full` and `dist/apexcharts.full.min.js` do *(v8.0)*. The entry contains no other chart class. |
| `apexcharts/unit` | unit, **waffle** *(new in v6.6, premium: watermarked until licensed)*. **Opt-in since v8.0**: add it next to `import ApexCharts from 'apexcharts'` (script tag: `dist/unit.js`), or use `apexcharts/full`. |
| `apexcharts/unit-shapes` | *(new in v6.10)* not a chart entry: named shape exports for the unit chart (`heart`, `house`, ... plus `outlined`, `glyphs`, `preview`), tree-shaken per shape (~4 KB gzipped each). See `references/circular-charts.md`. |
| `apexcharts/pictograms` | *(new in v7.0)* not a chart entry: a drawn glyph per unit for the unit chart (`person`, `house`, `heart`, `tree`, `droplet`, `star`, `car`, `bag`, `book`, `cup`, `bulb`, `plane`), plus `definePictogram` / `registerMarks` / `catalog`. Import the glyph you use, not `catalog`, which ships all of them. |

**First-class aliases:** `funnel` and `pyramid` render through the bar engine, so `apexcharts/bar` covers them. `gauge` renders through radialBar, so `apexcharts/radialBar` covers it. There is no separate `apexcharts/funnel`, `apexcharts/pyramid`, or `apexcharts/gauge` entry.

**Entries that bundle a feature.** Five types render through an existing engine but have their own entry because that entry also pulls in a feature module. Each is equivalent to the engine entry plus the feature:

| Entry | Equivalent to |
|---|---|
| `apexcharts/histogram` | `apexcharts/bar` + `import 'apexcharts/features/stats'` |
| `apexcharts/waterfall` | `apexcharts/bar` + `import 'apexcharts/features/waterfall'` |
| `apexcharts/dumbbell` | `apexcharts/bar` + `import 'apexcharts/features/dumbbell'` |
| `apexcharts/streamgraph` | `apexcharts/rangeArea` + `import 'apexcharts/features/streamgraph'` |
| `apexcharts/raincloud` | `apexcharts/violin` + `import 'apexcharts/features/raincloud'` |

**Next to the default bundle, add the feature, not the entry *(v8.0)*.** The default bundle already has the bar and rangeArea renderers and the stats feature, so a waterfall there needs only `import 'apexcharts/features/waterfall'` (about 3 KB gzipped), while `apexcharts/waterfall` would add a second copy of the bar renderer (about 38 KB). The same goes for dumbbell and streamgraph, and a histogram needs nothing. These entries are for the lean core and per-type builds. Raincloud is the exception: violin is not in the default bundle, so `apexcharts/raincloud` is the import there.

### Using Multiple Chart Types

```js
// Import multiple entry points for a mixed chart
import ApexCharts from 'apexcharts/line'
import 'apexcharts/bar'   // side-effect: registers bar types onto the same class
```

---

## Optional Features: Tier 1 vs Tier 2

Two questions decide whether you need a `features/*` import:

1. **Which entry point did you start from?** `apexcharts/core` and the per-type entries carry no optional features (a per-type entry brings only the feature its own type needs), so every feature you want needs its import.
2. **Which tier is the feature?** Tier 1 is in the default `apexcharts` bundle. **Tier 2 is not**, so it needs its import there too. Only the full bundle (`apexcharts/full`, *v8.0*) has every feature.

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
| Facet | `import 'apexcharts/features/facet'` | Design tokens + OS-aware themes |
| Weave | `import 'apexcharts/features/weave'` | Public plugin platform |
| Marks | `import 'apexcharts/features/marks'` | Custom series types (`registerSeriesType`) |
| All Tier 1 | `import 'apexcharts/features/all'` | Every row above, and **only** those |

Tier 1 is a **budget, not an index**: upstream, a module earns a place only if it is under ~5 KB gzipped on top of core, needs no peer dependency or separate asset, and is useful to a majority of charts. Six (legend, toolbar, annotations, exports, keyboard, morph) predate the budget and are grandfathered; drilldown was a seventh until 8.0 moved it to Tier 2.

### Tier 2: not in the default bundle; its own import or `apexcharts/full`

Required whatever entry point you used, the default `apexcharts` bundle included. Only the full bundle (`apexcharts/full`, `dist/apexcharts.full.min.js`, *v8.0*) already has them. The gzip column is the script-tag file `dist/features/<name>.js` at 8.0.0 (gzip -9).

| Feature | Import | gzip | Premium | What It Adds |
|---|---|---|---|---|
| Highlight filter *(v7.9)* | `import 'apexcharts/features/highlight-filter'` | 29.7 KB | yes | `highlightFilter`: a part of each value drawn solid over its faded whole |
| Trellis *(v7.0)* | `import 'apexcharts/features/trellis'` | 28.4 KB | yes | Small multiples: a grid of real charts sharing scale, legend, toolbar, crosshair |
| Renderer / Strata | `import 'apexcharts/features/renderer-canvas'` | 8.7 KB | no | Hybrid SVG + canvas renderer |
| Storyboard | `import 'apexcharts/features/storyboard'` | 8.7 KB | yes | Scrollytelling (registers Perspectives too) |
| Perspectives | `import 'apexcharts/features/perspectives'` | 7.4 KB | yes | Shareable view state |
| Ink | `import 'apexcharts/features/ink'` | 6.9 KB | yes | On-chart annotation authoring |
| Drilldown *(Tier 2 since v8.0)* | `import 'apexcharts/features/drilldown'` | 6.6 KB | no | Hierarchical drill-down |
| Link | `import 'apexcharts/features/link'` | 6.0 KB | yes | Crossfilter / linked views |
| Streamgraph *(v7.1; Tier 2 since v8.0)* | `import 'apexcharts/features/streamgraph'` | 5.7 KB | no | The `streamgraph` chart type |
| Measure | `import 'apexcharts/features/measure'` | 5.3 KB | yes | Measure / delta ruler |
| History / Rewind | `import 'apexcharts/features/history'` | 3.8 KB | yes | Undo/redo (`chart.history`) |
| Context menu | `import 'apexcharts/features/context-menu'` | 3.0 KB | yes | Right-click / long-press context menu |
| Waterfall *(v7.1; Tier 2 since v8.0)* | `import 'apexcharts/features/waterfall'` | 2.8 KB | no | The `waterfall` chart type |
| Dumbbell *(v7.1; Tier 2 since v8.0)* | `import 'apexcharts/features/dumbbell'` | 2.1 KB | no | The `dumbbell` chart type |
| Raincloud *(v7.1)* | `import 'apexcharts/raincloud'` | 2.4 KB + violin 6.4 KB | yes | The `raincloud` chart type. The entry brings violin and the feature; `apexcharts/features/raincloud` alone works only where violin is already registered *(v8.0)* |

Storyboard registers Perspectives, so importing both costs no more than Storyboard alone.

**`apexcharts/features/all` does not include Tier 2**, by design: upstream has a tier-budget test that fails the build if a Tier 2 feature reappears in it.

**Nothing fails silently on Tier 2.** Each module warns in the console when its configuration is present but the module is not, and the warning names the ESM import, the script-tag file and `apexcharts.full.min.js`. Where the chart can still draw something sensible it does and says what it did instead: a trellis renders as a single chart, `renderer: 'canvas'` falls back to SVG.

---

## Script tags: the lean core channel (v7.0)

Tree-shaking only ever helped people with a build step. A page using a `<script>` tag had one artifact and no way to decline any of it. `dist/apexcharts.core.js` is the chart class with no chart types and no optional features, assembled from separate tags:

```html
<script src=".../dist/apexcharts.core.js"></script>
<script src=".../dist/line.js"></script>
<script src=".../dist/features/legend.js"></script>
```

**About 156 KB gzipped**, against about 262 KB for the default bundle and about 379 KB for the full bundle (`dist/apexcharts.core.min.js`, `dist/apexcharts.min.js` and `dist/apexcharts.full.min.js` at 8.0.0, gzip -9). Treat these as approximate: the upstream build report gzips at a different level and prints slightly larger figures (263,188 B and 381,135 B for the two bundles), and the numbers move every release. Purely additive: nobody has to migrate to it, and a page that wants everything should load `dist/apexcharts.full.min.js` rather than assemble it from parts.

The opt-in chart types have their own files rather than `features/*` ones: `dist/unit.js`, `dist/sunburst.js`, `dist/violin.js` and `dist/icicle.js`, and a raincloud page loads `dist/violin.js` then `dist/features/raincloud.js`. On `apexcharts.core.js`, violin (and so raincloud) also needs `dist/bar.js`.

Every Tier 2 feature has a `dist/features/<name>.js` artifact for this channel too, and a default-bundle page still needs it. Add-on tags may load before or after the ApexCharts script *(v8.0)*. `dist/apexcharts.full.min.js` needs none of them.

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

**Tier 2 features announce themselves.** Each warns in the console when its configuration is present but the module is not, naming the ESM import, the script-tag file and `apexcharts.full.min.js`, and degrades predictably where it can: a `trellis` config renders as one ordinary chart, `renderer: 'canvas'` falls back to SVG. If a chart is quietly missing a feature you configured, **check the console before the config**. Since 7.9.1 the minified `apexcharts.min.js` prints these warnings too.

**Opt-in chart types throw *(v8.0)*.** `unit`, `waffle`, `sunburst`, `violin`, `icicle` and `raincloud` without their entry make `render()` reject, and the console prints one error naming the import, the script tag and the full bundle. An `updateOptions()` that switches to an unloaded type keeps the current chart.

**Feature-backed chart types draw nothing *(v8.0)*.** `waterfall`, `dumbbell` and `streamgraph` without `apexcharts/features/<name>` leave the plot empty and log one warning naming the import, because drawn as given their values would be wrong.

---

## Bare Core Usage

For maximum control, start from the bare core and add each chart type and feature through its entry:

```js
import ApexCharts from 'apexcharts/core'
import 'apexcharts/line'              // registers line, area, scatter, bubble, rangeArea
import 'apexcharts/features/legend'   // one import per optional feature
```

Each entry registers its types or feature with the core. `ApexCharts.use()` and `ApexCharts.registerFeatures()` are the hooks they call: use them for your own chart class or plugin, not to rebuild a shipped one from `apexcharts/src/*`. Those raw modules have default exports only (`import { Line } from 'apexcharts/src/charts/Line.js'` fails), and imported next to the built entries they load a second copy of the internals.

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

1. **Assuming the default bundle still has everything *(v7, v8)***: the Tier 2 chart types (`unit`/`waffle`, `sunburst`, `violin`, `icicle`, `raincloud`) and Tier 2 features (the nine since 7.0, highlight-filter since 7.9, and drilldown, waterfall, dumbbell and streamgraph since 8.0) need their own import on top of `import ApexCharts from 'apexcharts'`, or the full bundle. This is the most common upgrade failure, v6 to v7 and v7 to v8.
2. **Reaching for `apexcharts/features/all` to fix it**: that is the Tier 1 set by design and pulls in no Tier 2 module.
3. **Missing feature imports on a tree-shaken build**: Tier 1 features fail silently. If legend/toolbar/annotations don't appear, check imports.
4. **Adding a per-type entry for a type the default bundle already has** (`apexcharts/line`, `apexcharts/bar`, `apexcharts/waterfall` next to `apexcharts`): that is a second copy of the renderer. Next to `apexcharts`, add only the opt-in entries (`apexcharts/unit`, `/sunburst`, `/violin`, `/icicle`, `/raincloud`) and `apexcharts/features/*`. *(v7.0 fixed the related internal bug where the default bundle inlined its own core copy while add-ons resolved `apexcharts/core`, so an app importing both got two classes, ~130 KB gzipped of duplicate core, and a feature that never registered. They now share one core.)*
5. **Vite duplicate bundle issue**: without `optimizeDeps.include`, Vite may bundle ApexCharts twice.
6. **Calling `dataURI()` without exports feature**: throws an error. Import `apexcharts/features/exports` first.
7. **`require('apexcharts/line')` used to throw** `h.use is not a function` in every published version with sub-path entries, because rollup's default CJS interop assumes `require()` returns the export itself. Fixed in **7.0.0**; below that, use ESM `import` for sub-path entries.
