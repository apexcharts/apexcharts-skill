---
name: apexcharts
description: >
  AI skill for building ApexCharts.js charts and data visualizations (targets v6).
  Use when the user asks to create, configure, or troubleshoot any chart using ApexCharts
  (line, area, bar, pie, donut, radialBar, scatter, bubble, heatmap, candlestick, boxPlot,
  violin, radar, polarArea, rangeBar, rangeArea, treemap, funnel, pyramid, gauge). Covers
  correct data formats, lifecycle, formatters, tree-shaking, SSR, and the v6 feature
  platform (plugins, canvas renderer, custom series, undo/redo, shareable views, themes,
  crossfilter, annotation authoring, storyboard, streaming, drilldown). In React /
  Vue / Angular projects, prefer the framework wrapper packages
  (`react-apexcharts`, `vue3-apexcharts`, `ng-apexcharts`) over the core API.
metadata:
  author: ApexCharts
  version: "2.0.1"
  library_version: "6.2.0"
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

> **Targets ApexCharts v6.** v6 is backward compatible: existing v5 configs keep working unchanged. Everything new (the plugin platform, canvas renderer, custom series, undo/redo, shareable views, themes, crossfilter, annotation authoring, storyboard, streaming, drilldown) is opt-in and tree-shakeable. Two behaviors changed *on by default* (both respect `prefers-reduced-motion`): (1) data updates that add/remove points now animate coherently, and (2) mobile pinch-zoom / two-finger pan gestures are enabled. See `references/v6-features.md` for the full v6 surface.

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
12. **Tree-shaking**: importing `apexcharts/core` gives you a bare class — you must also import chart-type entries and feature entries separately.
13. **v6 first-class aliases**: `funnel` and `pyramid` render through the bar engine; `gauge` renders through radialBar. Use them as `chart.type` directly (no `plotOptions.bar.isFunnel` needed). They are covered by the `apexcharts/bar` and `apexcharts/radialBar` tree-shaking entries respectively.
14. **`violin` (v6, statistical)** uses a per-point density profile: `data: [{ x, y: { density: [[value, weight], ...], points?: [number] } }]`, not a plain number.
15. **`render()` is idempotent (v6)**: calling `render()` twice on the same instance returns the same promise instead of building a duplicate chart. You still must `destroy()` before creating a *new* instance on the same element.

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
| Box Plot | `'boxPlot'` | `[{ data: [{ x, y: [min, Q1, median, Q3, max] }] }]` — array of 5 | `series: [{ data: [{ x: 'Group A', y: [10, 20, 30, 40, 50] }] }]` |
| Violin *(v6)* | `'violin'` | `[{ name, data: [{ x, y: { density: [[value, weight], ...], points?: [number] } }] }]` | `series: [{ name: 'Sessions', data: [{ x: 'A', y: { density: [[20, 0.1], [30, 0.2]], points: [21, 29] } }] }]` |
| Heatmap | `'heatmap'` | `[{ name, data: [{ x, y: number }] }]` — y is the intensity value | `series: [{ name: 'Mon', data: [{ x: '10am', y: 45 }] }]` |
| Treemap | `'treemap'` | `[{ data: [{ x, y: number }] }]` — y is the area/value | `series: [{ data: [{ x: 'Item A', y: 100 }, { x: 'Item B', y: 60 }] }]` |
| Radar | `'radar'` | `[{ name, data: [number] }]` + `xaxis: { categories: [...] }` | `series: [{ name: 'Skill', data: [80, 50, 30, 40, 100] }]` |
| Funnel *(v6)* | `'funnel'` | `[{ name, data: [number] }]` + `xaxis: { categories: [...] }`. Order values **largest→smallest**. | `series: [{ data: [1380, 990, 548, 200] }]` |
| Pyramid *(v6)* | `'pyramid'` | Same as funnel; order values **smallest→largest** (wide base at bottom). | `series: [{ data: [200, 548, 990, 1380] }]` |

### Non-Axis Charts (pie, donut, radialBar, polarArea, gauge)

These use a **flat number array** for `series`, NOT the object format:

```js
// CORRECT — flat number array + labels
{
  chart: { type: 'pie' },  // or 'donut', 'polarArea', 'radialBar', 'gauge'
  series: [44, 55, 13, 43, 22],
  labels: ['Team A', 'Team B', 'Team C', 'Team D', 'Team E']
}
```

**Gauge *(v6)*** is a single-value radialBar alias: `series: [72]`, `labels: ['Progress']`. Configure the arc/needle, colored bands, ticks, and `min`/`max` domain through `plotOptions.radialBar` (see `references/circular-charts.md`).

---

## 3. Package / Module Map

```
# Full bundle (all chart types + all features)
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
import ApexCharts from 'apexcharts/candlestick'   # candlestick, boxPlot
import ApexCharts from 'apexcharts/boxPlot'       # same as /candlestick
import ApexCharts from 'apexcharts/violin'        # violin (v6)
import ApexCharts from 'apexcharts/pie'           # pie, donut, polarArea
import ApexCharts from 'apexcharts/donut'         # same as /pie
import ApexCharts from 'apexcharts/polarArea'     # same as /pie
import ApexCharts from 'apexcharts/radialBar'     # radialBar + gauge (v6)
import ApexCharts from 'apexcharts/radar'         # radar only
import ApexCharts from 'apexcharts/heatmap'       # heatmap only
import ApexCharts from 'apexcharts/treemap'       # treemap only
# funnel + pyramid (v6) render through the bar engine; use apexcharts/bar

# Optional features (side-effect imports — just import, no default export needed)
import 'apexcharts/features/exports'         # PNG/SVG/CSV export methods
import 'apexcharts/features/legend'          # Interactive legend component
import 'apexcharts/features/toolbar'         # Toolbar (zoom, pan, download buttons)
import 'apexcharts/features/annotations'     # X/Y/point/text/image annotations
import 'apexcharts/features/keyboard'        # Keyboard navigation (accessibility)
# v6 feature platform (all opt-in, all tree-shakeable)
import 'apexcharts/features/morph'           # Animated chart-type morphs
import 'apexcharts/features/drilldown'       # Hierarchical drill-down
import 'apexcharts/features/history'         # Undo/redo (Rewind)
import 'apexcharts/features/perspectives'    # Shareable view state
import 'apexcharts/features/storyboard'      # Scrollytelling (includes perspectives)
import 'apexcharts/features/facet'           # Design tokens + OS-aware themes
import 'apexcharts/features/weave'           # Public plugin platform
import 'apexcharts/features/renderer-canvas' # Hybrid SVG + canvas renderer (Strata)
import 'apexcharts/features/marks'           # Custom series types (registerSeriesType)
import 'apexcharts/features/link'            # Crossfilter / linked views
import 'apexcharts/features/ink'             # On-chart annotation authoring
import 'apexcharts/features/measure'         # Measure / delta ruler
import 'apexcharts/features/context-menu'    # Right-click / long-press context menu
import 'apexcharts/features/all'             # All features at once

# SSR (server-side rendering)
import ApexCharts from 'apexcharts/ssr'    # Node.js: renderToString, renderToHTML
import ApexCharts from 'apexcharts/client' # Browser: explicit client import for hydration
```

**Note:** When using `apexcharts` (full bundle), all chart types and features are included automatically. Tree-shaking entries (`/core`, `/line`, etc.) are for reducing bundle size.

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

### Pitfall 14: Tree-shaking — missing feature imports

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
| `getState()` | Returns snapshot of chart state. |
| `addEventListener(name, handler)` | Subscribe to chart event. |
| `removeEventListener(name, handler)` | Unsubscribe from chart event. |

### v6 Instance Methods (require the matching feature import)

| Method | Feature | Description |
|---|---|---|
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
| `ApexCharts.merge(target, source)` | Deep-merge objects. |
| `ApexCharts.use(typeMap)` | Register chart type constructors (tree-shaking). |
| `ApexCharts.registerFeatures(featureMap)` | Register optional feature modules. |
| `ApexCharts.registerPlugin(def) / unregisterPlugin(name)` | *(v6, Weave)* Register a reusable plugin. |
| `ApexCharts.registerSeriesType(name, def) / unregisterSeriesType(name)` | *(v6, Marks)* Register a custom series type. |
| `ApexCharts.registerTheme(name, def) / unregisterTheme(name)` | *(v6, Facet)* Register a named brand theme. |
| `ApexCharts.registerEasing(name, fn)` | *(v6, Cadence)* Register a custom easing curve. |
| `ApexCharts.crossfilter({ id, records }) / getCrossfilter(id)` | *(v6, Link)* Create / fetch a crossfilter engine. |
| `ApexCharts.perspectives.fromURL(href)` | *(v6)* Decode a perspective token from a URL. |

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
    }
  }
}
```

---

## 9. v6 Feature Platform (opt-in, tree-shakeable)

All of the following are new in v6, off by default, and each ships as a `apexcharts/features/*` entry. Full config shapes, APIs, and examples are in `references/v6-features.md`. Quick map:

| Feature | Opt-in | One-liner |
|---|---|---|
| **Weave** (plugins) | `apexcharts/features/weave` | Publish reusable chart plugins against a stable `ApexCharts.registerPlugin({ name, setup })` API; activate per chart with `plugins: [{ name }]`. |
| **Strata** (canvas) | `apexcharts/features/renderer-canvas` | `chart: { renderer: 'auto', rendererThreshold }` paints the dense series layer to canvas while axes/tooltips/exports stay SVG. |
| **Marks** (custom series) | `apexcharts/features/marks` | `ApexCharts.registerSeriesType(name, { renderItem })` for first-class custom marks (lollipop, dumbbell, bullet). Baseline is `scales.y(0)`, **not** `api.zeroY`. |
| **Rewind** (undo/redo) | `apexcharts/features/history` | `chart: { history: { enabled: true } }`, then `chart.history.undo()/redo()/jump()/transaction()`. |
| **Perspectives** (view state) | `apexcharts/features/perspectives` | `chart.perspectives.capture()/toURL()/apply()` to serialize and restore the exact view. |
| **Facet** (themes/tokens) | `apexcharts/features/facet` | `theme: { follow: 'os', name }`, `--apx-*` CSS custom props, `ApexCharts.registerTheme`. |
| **Cadence** (easing) | core | `chart.animations.easing` accepts a named curve, cubic-bezier array, or function; `ApexCharts.registerEasing`. |
| **Link** (crossfilter) | `apexcharts/features/link` | `chart: { group, link: { enabled, mode } }` for highlight linking; `ApexCharts.crossfilter({ id, records })` for a filter engine. |
| **Ink** (annotation authoring) | `apexcharts/features/ink` | `chart: { ink: { enabled: true } }` makes annotations draggable/resizable with a floating editor. |
| **Measure** (ruler) | `apexcharts/features/measure` | `chart: { measure: { enabled, mode } }`; hold a key and drag to read change/percent/slope. v6.1 adds a toolbar tool (`toolbar.tools.measure`, `toolbar.autoSelected: 'measure'`). |
| **Context menu** | `apexcharts/features/context-menu` | `chart: { contextMenu: { enabled, items } }` for point-specific right-click actions. |
| **Storyboard** (scrollytelling) | `apexcharts/features/storyboard` | `chart.storyboard.bind({ beats })` pairs prose sections with saved views. |
| **Streaming** | core | `chart: { streaming: { enabled, maxPoints } }` for constant-velocity rolling-window scroll. |
| **Drilldown** | `apexcharts/features/drilldown` | `drilldown: { enabled, series }` + a `drilldown` id on data points; `chart.drillDown()/drillUp()`. |

## 10. Reference Routing Table

For detailed chart-family-specific options, data format variants, and full working examples, refer to:

| Topic | Reference File |
|---|---|
| Line, Area, Scatter, Bubble, Range Area | `references/cartesian-charts.md` |
| Bar, Column, Range Bar, Timeline/Gantt, Funnel, Pyramid | `references/bar-charts.md` |
| Candlestick, Box Plot, Violin | `references/financial-charts.md` |
| Pie, Donut, Polar Area, Radial Bar, Gauge | `references/circular-charts.md` |
| Heatmap, Treemap | `references/grid-charts.md` |
| Radar | `references/radar-charts.md` |
| v6 feature platform (plugins, canvas, undo/redo, themes, crossfilter, storyboard, ...) | `references/v6-features.md` |
| Tree-shaking, Bundle optimization | `references/tree-shaking.md` |
| Server-side rendering, Hydration | `references/ssr.md` |
| React, Vue, Angular integration | `references/framework-wrappers.md` |
