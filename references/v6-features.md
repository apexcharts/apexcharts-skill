# v6 Feature Platform: ApexCharts

ApexCharts v6 adds an opt-in, tree-shakeable feature platform on top of the v5 core. **Every v5 config keeps working unchanged.** Each feature below is off by default and ships as its own `apexcharts/features/*` entry, so it only enters your bundle when you import it. When using the full `apexcharts` bundle, all features are already present.

Two behaviors changed *on by default* (both respect `prefers-reduced-motion`):

1. **Coherent variable-length data transitions**: updates that add/remove data points animate as one coordinated motion instead of popping. Appended bars grow from the baseline, removed bars shrink and fade, line/area fills reshape over the union of old and new points, and markers/bubbles/axis labels ride along. Scatter and bubble now animate on dynamic updates for the first time. Disable per chart with `chart.animations.dynamicAnimation.enabled: false`; auto-skipped above `chart.animations.largeDatasetThreshold` (default 1000) and under `prefers-reduced-motion`.
2. **Native-feeling mobile gestures**: two-finger pinch-zoom, two-finger pan, and kinetic inertia after a flick, with axis rails so a vertical swipe still scrolls the page. Configure via `chart.zoom.pinch` (default `true`) and `chart.pan.inertia` (default `true`, `friction` default `0.92`).

Also new by default: **`render()` is idempotent**: a repeated `render()` (e.g. a framework double-invoking an effect) returns the same promise instead of building a duplicate chart. `destroy()` clears it so an instance can render fresh.

---

## Weave: public plugin platform

`import 'apexcharts/features/weave'`

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

`import 'apexcharts/features/renderer-canvas'`

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

`import 'apexcharts/features/marks'`

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

`import 'apexcharts/features/history'`

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

`import 'apexcharts/features/perspectives'`

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

`import 'apexcharts/features/facet'`

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

`import 'apexcharts/features/link'`

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

`import 'apexcharts/features/ink'`

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

`import 'apexcharts/features/measure'`

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

`import 'apexcharts/features/context-menu'`

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

`import 'apexcharts/features/storyboard'` (includes Perspectives)

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

`import 'apexcharts/features/drilldown'` (add `import 'apexcharts/features/morph'` for animated cross-type transitions)

Data points reference a child level via a `drilldown` id; clicking drills in, with an optional breadcrumb.

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
    // or resolve lazily:
    onDrillDown: (ctx) => ({ id: ctx.point.drilldown, name: '...', data: [] }),
  },
  chart: {
    events: {
      drillDownStart: (info, chart, options) => {},
      drillDownEnd: (info, chart, options) => {},
      drillUp: (info, chart, options) => {},
    },
  },
}

chart.drillDown(id)   // Promise
chart.drillUp()
chart.drillToRoot()
```

---

## Common Pitfalls

1. **Forgetting the feature import**: every v6 feature is off until you `import 'apexcharts/features/<name>'` (or use the full `apexcharts` bundle). Enabling the config alone does nothing if the feature isn't in the bundle.
2. **Using `api.zeroY` in a custom mark**: it does not exist. Use `ctx.scales.y(0)` for the baseline.
3. **Expecting `mode: 'filter'` on `chart.link` without records**: highlight mode needs `chart.selection.enabled: true`; the crossfilter engine needs `ApexCharts.crossfilter({ id, records })` or a `dimension` extractor.
4. **`largeDatasetThreshold` is under `chart.animations`**, not `chart` directly.
5. **Assuming the canvas renderer supports everything**: pattern/image fills and per-point selection visuals fall back to (or stay) SVG.
