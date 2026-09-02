# Feature Platform: ApexCharts

ApexCharts ships an opt-in feature platform on top of the chart core. **Every v5 and v6 config keeps working unchanged in v7**, apart from the two v7.0 breaking changes noted below. Each feature is off by default in config terms and ships as its own `apexcharts/features/*` entry.

## ⚠️ Read first: two bundle tiers (v7.0)

Whether you need the `features/*` import depends on the feature's **tier**, and this changed in v7.0.

- **Tier 1** is in the default `import ApexCharts from 'apexcharts'` bundle: `exports`, `legend`, `toolbar`, `annotations`, `keyboard`, `morph`, `drilldown`, `weave`, `marks`, `facet`, `stats`, and the v7.1 `waterfall` / `dumbbell` / `streamgraph` chart types. Import these only if you started from `apexcharts/core` or a per-type entry.
- **Tier 2 is not in any bundle.** Nine features (`trellis`, `storyboard`, `perspectives`, `ink`, `renderer-canvas`, `link`, `measure`, `history`, `context-menu`) plus the `raincloud` chart type require an explicit import **whatever entry point you used**, the full bundle included.

```js
import ApexCharts from 'apexcharts'
import 'apexcharts/features/trellis'   // Tier 2: required even here
```
```html
<script src=".../dist/apexcharts.js"></script>
<script src=".../dist/features/trellis.js"></script>
```

Nothing fails silently: each Tier 2 module warns in the console when its configuration is present but the module is not, and names both import routes. Where the chart can still draw something sensible it does and says what it did: a trellis renders as a single chart, `renderer: 'canvas'` falls back to SVG. `apexcharts/features/all` is the **Tier 1** set and is not a shortcut past this.

Why: 24% of the 6.10.0 default bundle was licence-gated premium code that an unlicensed user could only run watermarked, and everybody downloaded it. The default bundle went 291,654 B gzipped (6.10.0) to 252,005 B (7.0.0), and 264,326 B in 7.1.0 with the three new free chart types. See `references/tree-shaking.md` for the full tier table and per-module sizes.

## Two v7.0 breaking changes

1. **`plotOptions.bar.borderRadiusWhenStacked` is removed.** Rounded corners on a stacked bar are no longer a setting: corner ownership follows the **outer edge** of the stack, which is what `'last'` approximated and what `'all'` got wrong on any stack whose last series was empty. An unknown option is ignored, so leaving it in place is harmless but does nothing.
2. **`dataLabels.animate.enabled` now defaults to `true`** (bar and column only). Labels ride to their new position on a data-change update instead of snapping there, so they reflow on the same clock as the bars, markers and axis ticks. Speed and easing follow `chart.animations.dynamicAnimation`. A label that has not moved is a per-label no-op. Set `dataLabels: { animate: { enabled: false } }` for the old behavior.

## Behaviors that are on by default

Carried over from v6, both respecting `prefers-reduced-motion`:

1. **Coherent variable-length data transitions**: updates that add/remove data points animate as one coordinated motion instead of popping. Appended bars grow from the baseline, removed bars shrink and fade, line/area fills reshape over the union of old and new points, and markers/bubbles/axis labels ride along. Scatter and bubble now animate on dynamic updates for the first time. Disable per chart with `chart.animations.dynamicAnimation.enabled: false`; auto-skipped above `chart.animations.largeDatasetThreshold` (default 1000) and under `prefers-reduced-motion`.
2. **Native-feeling mobile gestures**: two-finger pinch-zoom, two-finger pan, and kinetic inertia after a flick, with axis rails so a vertical swipe still scrolls the page. Configure via `chart.zoom.pinch` (default `true`) and `chart.pan.inertia` (default `true`, `friction` default `0.92`).

Also new by default: **`render()` is idempotent**: a repeated `render()` (e.g. a framework double-invoking an effect) returns the same promise instead of building a duplicate chart. `destroy()` clears it so an instance can render fresh.

Two update behaviors worth knowing (both 6.9/6.10):

- **Function-valued options are compared by identity (6.10)**: `update()` skips a redundant render by comparing the incoming options with the previous ones. Passing a *different* function (a new `dataLabels.formatter`, custom tooltip, `plotOptions.unit.positions`) gets the render it asked for; passing the *same* function twice still skips. Building a fresh closure on every update means a render every time.
- **A type change re-chooses type defaults (6.9)**: `updateOptions({ chart: { type } })` now re-picks the defaults that decide what a chart reads, says, hit-tests, or offers as interaction (e.g. a boxPlot-to-violin switch gets the right tooltip formatter). Deliberate paint choices and anything you set yourself are never re-chosen.

---

## Licensing: premium features and the trial watermark

Introduced in **6.5.0**, tightened in **6.7.0**. Not every feature is free. Eight feature modules plus two chart types are **premium** and run under a lightweight, offline license check. They keep working fully without a key (trial mode), but the chart shows an unobtrusive `APEXCHARTS` watermark until an entitled license is set.

**The premium set (watermarked until entitled):**

- `trellis` (small multiples, premium since **7.0.0**)
- `storyboard` (scrollytelling)
- `link` (crossfilter / linked views)
- `ink` (annotation authoring)
- `measure` (delta ruler)
- `context-menu` (`contextMenu`)
- `perspectives` (shareable view state)
- `history` (undo/redo, Rewind)
- the `unit` / `waffle` chart type (premium since **6.6.0**, the first premium chart type)
- the `raincloud` chart type (premium since **7.1.0**)

**Everything else is free and never gated**: every other chart type (`sunburst`, and the v7.1 `waterfall` / `dumbbell` / `streamgraph`), and every other module (Weave, Strata / canvas, Marks, Facet / themes, Cadence, drilldown, streaming, exports, legend, toolbar, annotations, keyboard, stats).

**Premium and Tier 2 are independent axes.** Premium is about the watermark; Tier 2 is about the bundle. `renderer-canvas` is Tier 2 and free. `waterfall`, `dumbbell` and `streamgraph` are Tier 1 and free. `unit` / `waffle` is premium but Tier 1 (it is a chart type in the default bundle). `trellis` and `raincloud` are both.

### Setting a license

```js
// Static: applies to every chart on the page. Call before render().
ApexCharts.setLicense('APEX-...')

// Per-chart: overrides the static key and window.Apex.license for this chart.
const options = { chart: { license: 'APEX-...' } }
```

Both are typed: `ApexCharts.setLicense(key: string)` (static) and `chart.license?: string`.

- **In use, not bundled.** Importing a premium module without actually enabling it does not watermark; only *using* it does.
- **Live.** A late `setLicense(validKey)` followed by an update clears an on-screen watermark; no full re-render needed. The watermark is re-evaluated on every render/update.
- **One key across the family.** The key format is shared across the ApexCharts family (apexgantt, apextree, apexsankey, apex-grid-enterprise, apexstock), validated offline with no network call. SSR-safe.

### Plan entitlement (6.7.0 behavior change)

As of **6.7.0** the premium features clear the watermark only on a `premium` or `enterprise` plan. A valid `pro` key, or the free tier, keeps them in trial mode with the watermark and logs a one-time upgrade notice (it is **not** treated as an invalid key). **Existing `pro`-plan customers using these features will now see the watermark.** No functionality is blocked in any case, the watermark is the only effect.

---

## Trellis: small multiples that agree to the pixel (7.0)

`import 'apexcharts/features/trellis'`: **Tier 2** (not in the default bundle) and **premium**.

One dataset split into a grid of real charts that share a scale, a legend, a toolbar and a crosshair. Setting `trellis.by` makes the chart a trellis **host**: the series array is split into one panel per facet-key value, every panel is a real chart of the host's `chart.type`, and the trellis owns everything shared.

```js
import ApexCharts from 'apexcharts'
import 'apexcharts/features/trellis'

new ApexCharts(el, {
  chart: { type: 'line' },
  series: [
    { name: 'Revenue', region: 'North', data: north },
    { name: 'Revenue', region: 'South', data: south },
  ],
  trellis: { by: 'region', minPanelWidth: 260 },
}).render()
```

`trellis.by` is the whole configuration. The grid owns the y domain (the union across panels), the x window, and a column count computed from `minPanelWidth` alone. **A series carrying no facet key repeats in every panel**, which is how you get a reference line.

**In TypeScript**, use the typed `facet` field rather than an arbitrary key, or the series objects will not typecheck:

```ts
series: [
  { name: 'Revenue', facet: 'North', data: north },
  { name: 'Revenue', facet: 'South', data: south },
],
trellis: { by: 'facet', minPanelWidth: 260 },
```

**Facet accessors.** `by` is a key name on each series object (`facet` is the blessed typed field; any other key name works from plain JS) or a function `(series, index) => key`, which works from either. For a 2-D grid use `row` × `column` instead of `by`: every (row, column) combination in row-major order at a fixed column count, column labels once across the top, row labels once down the left. A series carrying only the row key repeats across that row.

**Tidy-row input.** `trellis.data` takes a row table instead of `series`, pivoted by the `by` / `x` / `y` / `seriesBy` **column names**. Rows win over `series` when both are given; duplicate (panel, series, x) rows keep the last and warn, so aggregate first.

| Option | Default | Notes |
|---|---|---|
| `columns` | `'auto'` | `'auto'` fits `minPanelWidth` columns into the container. |
| `minPanelWidth` | `220` | Drives `'auto'` columns and the responsive collapse. |
| `gap` / `aspectRatio` / `panelHeight` | `12` / `1.6` / none | `panelHeight` wins over `aspectRatio` and `chart.height`. |
| `order` | `'first-seen'` | Also `'asc'`, `'desc'`, an explicit `string[]`, or a comparator. |
| `limit` | none | Render only the first N panels (warns about the rest). |
| `virtualize` | `'auto'` | Mounts only panels intersecting the viewport (plus one row) once the grid exceeds **64 panels**. An unmounted cell keeps its header and a fixed-height skeleton so page height never shifts; a remount restores its zoom window. **`getPanel(key)` returns `null` for an unmounted panel.** |
| `scales` | `{ x: 'shared', y: 'shared' }` | `y` also takes `'independent-row'` / `'independent-column'` in a 2-D grid. Non-shared `y` still renders pixel-aligned panels. |
| `emptyPanels` | `'placeholder'` | Missing (row, column) combos: a real empty panel with `noData.text`, or `'skip'` (tinted blank) or `'hide'`. |
| `axes.labels` | `'edges'` | y labels on the first column, x labels on each column's bottom panel. Label *space* is always reserved everywhere so panels stay aligned. Also `'all'` / `'none'`. |
| `legend` / `toolbar` | `'shared'` | One legend (toggles a series name in every panel) and one zoom/pan/reset toolbar. `'none'` to drop. |
| `tooltip` | `'panel'` | Card in the hovered panel while the crosshair sweeps all. `'sync'` = a card per panel; `'grid'` = one card near the cursor with a row per panel, composed from the panels' own tooltips so every formatter is honored. |
| `zoom` | `'sync'` | A zoom in any panel moves every panel. |
| `promote` | `true` | Clicking a header expands that panel to full width with an "All panels" breadcrumb. |
| `radiusByTotal` | `false` | Pie/donut/polarArea only: scale each panel's radius so its **area** is proportional to the panel's total. Equal-size pies cannot encode magnitude, so set this on a pie trellis. |
| `targetTicks` | `3` | Tick-interval target for the shared nice y scale, so a small panel wears few labels. |
| `header` | shown | `{ show, formatter(key, { dimension, index, count }), style }`. |
| `panel` | none | `(key, { index, seriesNames }) => ApexOptions`, a per-panel override applied last. |

**API.** `chart.getPanels()` returns the panels in grid order; `chart.getPanel(key)` returns one panel's own ApexCharts instance (the escape hatch to every per-chart API the trellis does not re-expose); `chart.promotePanel(key)` / `chart.restorePanels()` drive the promotion from code. `ApexCharts.trellis(el, options)` is the imperative constructor and throws if the feature is not imported.

**Annotations** take `scope`: absent or `'trellis'` draws in every panel through each panel's own scale, a key or array of keys restricts it.

**Per-type guardrails** keep a shared frame honest: histograms share a bin frame, violins a bandwidth, heatmaps one colour scale and a single gradient legend.

---

## Weave: public plugin platform

`import 'apexcharts/features/weave'`: Tier 1 (already in the default bundle).

Publish reusable chart plugins to npm against a stable, versioned API. A plugin draws into its own sandboxed layer and subscribes to lifecycle hooks; it never touches raw internal state.

```js
import ApexCharts from 'apexcharts'
import 'apexcharts/features/weave'

ApexCharts.registerPlugin({
  name: 'watermark',
  apiVersion: 1,
  setup(api) {
    api.on('draw', () => {
      const layer = api.layer({ z: 'front', className: 'wm' }) // z: 'front' | 'behind'
      layer.text({ x: 10, y: 20, text: 'ACME', size: '12px', color: '#999' })
    })
  },
  destroy(api) {},
})
// ApexCharts.unregisterPlugin('watermark')  // for tests / hot reload

// Activate per chart:
const options = { plugins: [{ name: 'watermark', options: { /* frozen, live */ }, order: 0 }] }
```

The `setup(api)` facade:

- `api.on(hook, fn)` / `api.off(hook, fn)`: hooks: `'afterParse' | 'afterScales' | 'draw' | 'afterUpdate' | 'destroy'`.
- `api.layer(opts?)`: a plugin-owned drawing surface (`path`, `line`, `rect`, `circle`, `text`, `clear`); call it inside draw handlers only, layers are wiped each pass.
- `api.scales` (readonly): `x(v)`, `y(v, axis?)`, `domainX`, `domainY(axis?)`, `gridWidth`, `gridHeight`, `ratios`.
- `api.data` (readonly): `[{ name?, hidden, color?, points: [{ x, y }] }]`.
- `api.theme`: `{ mode, foreColor, seriesColor(i), token(name) }`.
- `api.store`: per-instance mutable state bag.
- `api.emit(name, detail?)`: dispatches `plugin:<name>:<event>` on the chart; `api.chart`, `api.el`, `api.name`, `api.version`, `api.options` round out the facade.

`apiVersion` gates the contract so raw internals can keep changing safely.

---

## Strata: hybrid SVG + canvas renderer

`import 'apexcharts/features/renderer-canvas'`: **Tier 2** (not in the default bundle). Free.

Break the SVG node ceiling without leaving SVG behind. Below a threshold the output is identical SVG; above it, only the series layer becomes a `<canvas>` while axes, grid, tooltips, annotations, and exports stay SVG.

```js
import ApexCharts from 'apexcharts'
import 'apexcharts/features/renderer-canvas'

const options = {
  chart: {
    renderer: 'auto',        // 'svg' | 'canvas' | 'auto'
    rendererThreshold: 5000, // point count above which 'auto' picks canvas
  },
}
// chart.getActiveRenderer()  // => 'svg' | 'canvas'
```

Canvas is live for line, area, bar, column, scatter, and candlestick, with shared tooltip, crosshair, zoom, pan, hover/legend dimming, and PNG/SVG export all working. It falls back to SVG automatically for canvas-unsupported features (pattern/image fills, color-matrix filters). Per-point selection visuals and keyboard traversal on canvas remain SVG-only for now.

---

## Marks: composable custom series types

`import 'apexcharts/features/marks'`: Tier 1 (already in the default bundle).

Register a `renderItem(ctx)` function and get a first-class series: events, shared tooltip, legend, and keyboard navigation all work with no extra wiring. Dumbbell, lollipop, and bullet ship as samples.

```js
import ApexCharts from 'apexcharts'
import 'apexcharts/features/marks'

ApexCharts.registerSeriesType('lollipop', {
  // dataType?: 'xy' (default) | 'rangeXY' | 'custom'
  // yExtent?: (datum, i) => number | number[]   // folds extra values into the y-scale
  // tooltip?: (datum) => number | number[] | string
  renderItem(ctx) {
    const baseline = ctx.scales.y(0)               // IMPORTANT: baseline is scales.y(0), NOT api.zeroY
    ctx.api.line({ x1: ctx.x, y1: baseline, x2: ctx.x, y2: ctx.y, stroke: ctx.color, width: 2 })
    ctx.api.circle({ cx: ctx.x, cy: ctx.y, r: 6, fill: ctx.color })
  },
})

const options = {
  chart: { type: 'lollipop' },
  series: [{ name: 'Signups', data: [{ x: 'Jan', y: 41 }, { x: 'Feb', y: 58 }] }],
}
```

**`renderItem` context** (`ctx`): `{ datum, x, y, scales, api, seriesIndex, dataPointIndex, color }`: `x`/`y` are resolved pixels for the datum, `color` is the series palette color.

**`ctx.api` primitives**: `api.path({ d, stroke, width, fill, opacity, dash, lineCap })`, `api.line({ x1, y1, x2, y2, stroke, width, dash })`, `api.rect({ x, y, w, h, r, fill, stroke, strokeWidth, opacity })`, `api.circle({ cx, cy, r, fill, stroke, strokeWidth })`, `api.text({ x, y, text, anchor, size, color, weight })`.

**`ctx.scales`**: `scales.x(value)`, `scales.xAt(index, value)`, `scales.y(value, axis?)`, `scales.gridWidth`, `scales.gridHeight`, `scales.band` (pixel width of one x step / band). There is **no `api.zeroY`**: use `scales.y(0)` for the baseline.

Dumbbell uses `dataType: 'rangeXY'` (datum `y` is `[start, end]`, both bounds folded into the axis); bullet uses `yExtent` to fold `target`/top-band into the y-scale. Built-in type names are guarded against shadowing.

---

## Rewind: history and undo/redo

`import 'apexcharts/features/history'`: **Tier 2** (not in the default bundle) and **premium**.

**Premium** (watermarked in trial mode until an entitled license is set, see Licensing above).

Generic Ctrl-Z over a command journal. Zooms, series toggles, option changes, and annotation edits are recorded; high-frequency gestures coalesce into a single step.

```js
const options = {
  chart: { history: { enabled: true, maxDepth: 50, coalesceMs: 300, keyboard: true } },
}

chart.history.undo(animate?)   // and .redo(animate?)
chart.history.canUndo()        // and .canRedo()  -> boolean
chart.history.jump(id, animate?)
chart.history.clear()
await chart.history.transaction(() => { /* batched edits */ }, { label: 'batch' })
chart.history.entries()        // [{ id, label, at }]
```

---

## Perspectives: shareable view state

`import 'apexcharts/features/perspectives'`: **Tier 2** (not in the default bundle) and **premium**.

**Premium** (watermarked in trial mode until an entitled license is set, see Licensing above).

Serialize the exact view (zoom window, hidden series, selection, annotations, theme) into a compact token you can put in a URL and restore anywhere.

```js
const token = chart.perspectives.capture()             // { v, view, options? }
const str   = chart.perspectives.encode(token)
const url   = chart.perspectives.toURL()               // href with #apex=<token>
chart.perspectives.apply(token, { animate: true, mergeOptions: {} })
const id    = chart.perspectives.save('Q3 zoom')       // -> id
chart.perspectives.list()                              // [{ id, name, token }]
chart.perspectives.delete(id)

// static:
ApexCharts.perspectives.fromURL(location.href)         // -> token | null
ApexCharts.perspectives.decode(str)

// config: control which options travel with the token
const options = { chart: { perspectives: { serializeOptions: ['colors', 'title'] } } }
```

---

## Facet: design tokens and OS-aware themes

`import 'apexcharts/features/facet'`: Tier 1 (already in the default bundle).

Charts read `--apx-*` CSS custom properties from the cascade, follow the OS light/dark and contrast preferences with no JS, and can reference named brand themes.

```js
import ApexCharts from 'apexcharts'
import 'apexcharts/features/facet'

ApexCharts.registerTheme('brand', {
  mode: 'dark',                              // 'light' | 'dark'
  palette: ['#4f46e5', '#0ea5e9'],
  tokens: { accent: '#4f46e5', grid: '#333', surface: '#111' },
})
// ApexCharts.unregisterTheme('brand')

const options = {
  theme: {
    follow: 'os',   // 'os' | false: tracks prefers-color-scheme + prefers-contrast
    name: 'brand',  // a registered theme
    tokens: true,   // read --apx-* CSS vars (default true)
  },
}
```

```css
:root { --apx-accent: #4f46e5; --apx-grid: #e5e7eb; --apx-surface: #fff; --apx-series-1: #4f46e5; }
```

`await chart.refreshTokens()` re-reads the cascade after a runtime token change that does not itself trigger a render.

---

## Cadence: pluggable easing

Core (no feature import).

`chart.animations.easing` accepts a named curve, a cubic-bezier array, or a function. The default (`easeInOutSine`) is unchanged, so existing charts animate exactly as before.

```js
const options = {
  chart: {
    animations: {
      easing: 'easeOutBack',                 // or [0.34, 1.56, 0.64, 1], or (t) => t * t
      dynamicAnimation: { enabled: true, speed: 350, easing: 'linear' },
    },
  },
}

ApexCharts.registerEasing('myBounce', (t) => 1 - Math.pow(1 - t, 3))
```

Built-in curve names: `linear`, `easeInSine`, `easeOutSine`, `easeInOutSine`, `easeInQuad`, `easeOutQuad`, `easeInOutQuad`, `easeInCubic`, `easeOutCubic`, `easeInOutCubic`, `easeOutBack`, `easeInOutBack`. Anything else (elastic, bounce, ...) must be registered via `registerEasing`.

---

## Link: crossfilter and cross-chart coordination

`import 'apexcharts/features/link'`: **Tier 2** (not in the default bundle) and **premium**.

**Premium** (watermarked in trial mode until an entitled license is set, see Licensing above).

Coordinate a group of charts without wiring.

```js
// Highlight mode: brushing one chart dims non-matching marks in the others (no redraw):
const a = {
  chart: {
    group: 'sales',
    link: { enabled: true, mode: 'highlight', dimOpacity: 0.2 }, // mode: 'highlight' | 'filter'
    selection: { enabled: true },   // required for brushing
  },
}

// Crossfilter engine: categorical click-filters, range brushes, shared data table, 2D matrix target:
const cf = ApexCharts.crossfilter({ id: 'sales', records: rows })
// ApexCharts.getCrossfilter('sales'); chart.clearCrossfilter()

// Per-chart filter binding (presence of `dimension` selects filter mode):
const b = {
  chart: {
    link: {
      enabled: true,
      id: 'sales',
      dimension: (row) => row.region,   // key extractor; [xKey, yKey] for a matrix
      reduce: 'count',                  // 'count' | { sum, avg, min, max } | (rows) => number
      type: 'category',                 // 'category' | 'range' | 'matrix'
    },
  },
}
```

---

## Ink: direct-manipulation annotation authoring

`import 'apexcharts/features/ink'`: **Tier 2** (not in the default bundle) and **premium**.

**Premium** (watermarked in trial mode until an entitled license is set, see Licensing above).

Annotations become draggable and resizable, with click-to-create, snap to gridlines, and a floating editor card (rename, recolor, bold, font size, marker size/shape, delete). Every edit is undoable when Rewind is enabled.

```js
const options = {
  chart: {
    ink: {
      enabled: true,
      palette: true,                       // show the "add note" tool palette
      snap: true,                          // snap to gridlines
      noteColors: ['#e91e63', '#3f51b5'],  // optional palette override
    },
  },
}
// Fires: annotationDragged, annotationEdited, annotationStyled, annotationDeleted
```

---

## Measure: delta ruler

`import 'apexcharts/features/measure'`: **Tier 2** (not in the default bundle) and **premium**.

**Premium** (watermarked in trial mode until an entitled license is set, see Licensing above).

Hold a key and drag to read the change, percent, range, and slope between two points; on release the ruler pins as a data-anchored overlay that re-projects on zoom and resize.

```js
const options = {
  chart: {
    measure: {
      enabled: true,
      mode: 'span',         // 'span' = finance-style vertical band; 'free' = diagonal ruler
      key: 'm',
      pinOnRelease: true,
    },
    events: {
      measured: (chart, { from, to, dx, dy, percentChange, slope }) => {},
    },
  },
}
// Or drive from code: chart.startMeasure(), chart.stopMeasure(), chart.clearMeasures()
```

Styling resolves through `--apx-measure-*` tokens.

### Toolbar tool (v6.1)

Since 6.1 the ruler is also a built-in toolbar tool, so it can be armed with a click instead of holding the measure key. The button appears automatically whenever `chart.measure.enabled` is true and the `measure` feature is bundled.

```js
const options = {
  chart: {
    measure: { enabled: true },
    toolbar: {
      autoSelected: 'measure',   // pre-select the ruler on load (also accepts 'zoom' | 'pan' | 'selection')
      tools: { measure: true },  // default; false keeps it key-only; a string supplies a custom SVG icon
    },
  },
}
```

- `toolbar.tools.measure` is `boolean | string` (like the other tools). `toolbar.autoSelected` now also accepts `'measure'` so the plot loads armed with no key held and no click. The `m` key still works.
- Selecting the ruler is mutually exclusive with zoom / pan / selection. The `locale.toolbar.measure` string labels the button.
- **Behavior change (v6.1, on by default):** clicking an already-selected zoom / pan / selection / measure toolbar icon now toggles it *off*, leaving the chart with no active tool (previously those buttons were one-way).

---

## Context menu: Radial Actions

`import 'apexcharts/features/context-menu'`: **Tier 2** (not in the default bundle) and **premium**.

**Premium** (watermarked in trial mode until an entitled license is set, see Licensing above).

Right-click or long-press a data point for actions that operate at that exact point.

```js
const options = {
  chart: {
    contextMenu: {
      enabled: true,
      // built-in ids (default) + custom items:
      items: ['annotate', 'xline', 'yline', 'measure', {
        id: 'copy',
        label: 'Copy value',
        onClick: (chart, { x, y, seriesIndex, dataPointIndex, clientX, clientY }) => {},
      }],
    },
  },
}
```

Built-in `annotate` / `xline` / `yline` items are ink-managed when the ink feature is bundled (they open the floating editor and undo via Rewind).

---

## Storyboard: scroll-driven choreography (scrollytelling)

`import 'apexcharts/features/storyboard'` (registers Perspectives too): **Tier 2** (not in the default bundle) and **premium**.

**Premium** (watermarked in trial mode until an entitled license is set, see Licensing above).

Pair prose sections with saved views. Scrolling a beat past the viewport trigger applies its view; scrolling back reverses it. A beat can also merge an `options` payload to restyle or morph `chart.type` inside one animated transition.

```js
chart.storyboard.bind({
  beats: [
    { selector: '[data-apex-beat="1"]', view: { window: { xaxis: { min: 0, max: 10 } } } },
    { selector: '[data-apex-beat="2"]', view: { collapsed: [1] }, options: { chart: { type: 'area' } } },
  ],
  scroller: window,   // Element | selector; default viewport
  offset: 0.5,        // 0..1 trigger line
})
chart.storyboard.goTo('intro', { animate: true })  // beat index or key
chart.storyboard.current()                          // { index, key } | null
chart.storyboard.unbind()
// Fires: beatChange
```

---

## Real-time streaming: constant-velocity scroll

Core (the scroll animation needs no opt-in; `chart.streaming` bounds memory).

Rolling-window updates scroll at constant velocity instead of warping in place. Any update that continues the previous window (`appendData`, or a shifted fixed-length `updateSeries`) translates smoothly.

```js
const options = { chart: { streaming: { enabled: true, maxPoints: 100000 } } }
// appendData() trims each series to maxPoints (or the visible xaxis.range window)
```

---

## Drilldown: hierarchical drill-down

`import 'apexcharts/features/drilldown'` (add `import 'apexcharts/features/morph'` for animated cross-type transitions): both Tier 1 (already in the default bundle).

Data points reference a child level via a `drilldown` id; clicking drills in, with an optional breadcrumb. Since **v6.9** drilldown also works on **line and area** charts, and levels can be resolved **async** against a backend.

```js
import 'apexcharts/features/drilldown'
import 'apexcharts/features/morph'   // optional, animated type morphs

const options = {
  series: [{ data: [
    { x: '2021', y: 480, drilldown: '2021' },
    { x: '2022', y: 530, drilldown: '2022' },
  ] }],
  drilldown: {
    enabled: true,
    breadcrumb: { show: true, position: 'top-right', rootLabel: 'All Years' },
    animation: { enabled: true, zoomFromPoint: false, speed: 260 },
    series: [
      { id: '2021', name: '2021 by Channel', data: [/* ... */], chart: { type: 'bar' } },
    ],
    // or resolve lazily; may return a Promise (v6.9):
    onDrillDown: async (ctx) => ({ id: ctx.point.drilldown, name: '...', data: await fetchLevel(ctx) }),
    loading: { show: true, text: 'Loading' }, // (v6.9) overlay while an async level resolves;
                                              // false disables it. role="status", aria-live="polite",
                                              // spinner flattens to a pulse under prefers-reduced-motion
    cache: true,                              // (v6.9) cache onDrillDown results by id (default true);
                                              // clear with the drilldown module's clearCache()
    // (v6.9) line/area only: the dot marking a drillable point when the chart
    // draws no markers. Only drillable points get one, so it reads as "these open".
    marker: { show: true, size: 6, shape: 'circle', fillColor: undefined, strokeColor: '#fff' },
  },
  chart: {
    events: {
      drillDownStart: (info, chart, options) => {},
      drillDownEnd: (info, chart, options) => {},
      drillUp: (info, chart, options) => {},
      drillDownError: ({ id, error }, chart, options) => {}, // (v6.9) async level failed
    },
  },
}

chart.drillDown(id)   // Promise
chart.drillUp()
chart.drillToRoot()
```

**Async failure semantics (v6.9):** a failed fetch never strands the view. On a throw, a rejection, or a resolver returning something without a `data` array, the chart stays where it was, the breadcrumb is untouched, nothing is cached, and `drillDownError` fires. A second click while one resolve is in flight is ignored rather than starting a second request.

---

## Stats: raw-sample statistics (6.9.0)

`import 'apexcharts/features/stats'`: Tier 1 (already in the default bundle).

Free. The statistics behind three things, kept out of core so they cost nothing unless used:

- **Histogram binning**: `chart.type: 'histogram'` bins raw observations (the `apexcharts/histogram` entry includes this feature automatically).
- **Raw samples for boxPlot and violin**: a datum supplying `points: [number]` instead of a summary `y` gets its quartiles (R type 7) or KDE density computed.
- **`chart.rowSeries(opts?)`**: returns the rows behind the chart's marks as a unit-chart series (one cluster per mark), or `null` when the type has no row source. `chart.updateOptions({ chart: { type: 'unit' }, series: chart.rowSeries() })` opens a summary into its observations; with the `morph` feature loaded each dot leaves from the part of the mark that stood for it.

Full data shapes and options are in `references/financial-charts.md`. The full `apexcharts` bundle includes it.

---

## Point annotation tooltips (6.7.0)

`import 'apexcharts/features/annotations'` (free, part of the standard annotations module)

A point annotation can now show its own hover tooltip, so an annotated marker carries explanatory text without a separate custom element. Add `tooltip` to any entry in `annotations.points`:

```js
const options = {
  annotations: {
    points: [{
      x: 'Mar',
      y: 62,
      marker: { size: 6, fillColor: '#FF4560' },
      label: { text: 'Peak' },
      tooltip: {
        enabled: true,
        text: 'All-time high: 62',   // string, or an array joined with line breaks; falls back to label.text
        // formatter: (opts) => `<b>${opts.annotation.label.text}</b>`  // HTML, takes precedence over text
      },
    }],
  },
}
```

`tooltip.formatter` receives `{ annotation, seriesIndex, id, ... }` and returns HTML.

---

## Common Pitfalls

1. **Assuming the full bundle still carries everything *(the #1 v6 → v7 mistake)*.** In v6, `import ApexCharts from 'apexcharts'` was enough for every feature. In v7 the nine Tier 2 features and the `raincloud` type need their own import on top of it. Read the console: each one names both routes when its config is present without it.
2. **Forgetting the feature import on a tree-shaken build**: a Tier 1 feature is in the default bundle but not in `apexcharts/core` or a per-type entry, so those builds still need `import 'apexcharts/features/<name>'`.
3. **Reaching for `apexcharts/features/all` to fix either of the above**: it is the Tier 1 set only, by design (`tests/unit/feature-tier-budget.spec.js` upstream fails the build if a Tier 2 feature reappears in it).
4. **Using `api.zeroY` in a custom mark**: it does not exist. Use `ctx.scales.y(0)` for the baseline.
5. **Expecting `mode: 'filter'` on `chart.link` without records**: highlight mode needs `chart.selection.enabled: true`; the crossfilter engine needs `ApexCharts.crossfilter({ id, records })` or a `dimension` extractor.
6. **Two different `largeDatasetThreshold` options.** `chart.animations.largeDatasetThreshold` (default 1000) skips update animations; `markers.largeDatasetThreshold` *(v7.0, default 0 = off)* batches a series' markers into one path. Neither lives on `chart` directly.
7. **Assuming the canvas renderer supports everything**: pattern/image fills and per-point selection visuals fall back to (or stay) SVG.
8. **Calling `getPanel(key)` on a virtualized trellis**: it returns `null` for a panel that is not currently mounted (grids over 64 panels virtualize by default).
