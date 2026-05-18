# ApexCharts.js — AI Coding Rules

You are working with ApexCharts.js, a JavaScript charting library.
Documentation: https://apexcharts.com/docs/
NPM: apexcharts
GitHub: https://github.com/apexcharts/apexcharts.js

## Framework wrapper detection — check `package.json` first

- `react` → use **`react-apexcharts`** instead of the core API.
- `vue` (Vue 3) → use **`vue3-apexcharts`**. Vue 2 → **`vue-apexcharts`**.
- `@angular/core` → use **`ng-apexcharts`**.

Wrappers handle `destroy()` automatically on unmount, accept reactive props, and forward events idiomatically. Use the core API directly only when no framework is detected, or when the user explicitly asks for vanilla.

## Critical Rules

1. **Always call `chart.render()`** after `new ApexCharts(el, options)`. The constructor does not render.
2. **Always call `chart.destroy()`** before creating a new chart on the same element.
3. **Series data format is chart-type-specific.** See the Data Format Table below.
4. **`yaxis` must be an array** when using multiple y-axes. Each entry needs `seriesName`.
5. **`tooltip.shared` and `tooltip.intersect` are mutually exclusive.**
6. **Use `null` (not `undefined`)** for missing data points.
7. **`chart.stacked: true`** only works with `bar` and `area` chart types.
8. **Responsive breakpoints** must be in ascending order.
9. **For mixed/combo charts**, set `type` on each series object.
10. **RadialBar values must be 0–100** (percentages).
11. **Color hex values must include `#`** (e.g., `'#FF5733'`).
12. **Tree-shaking**: `apexcharts/core` requires separate chart-type + feature imports.

---

## Series Data Format Table

### Axis Charts

| Chart Type | `chart.type` | Series Format | Example |
|---|---|---|---|
| Line | `'line'` | `[{ name, data: [num\|null] }]` or `[{ name, data: [{ x, y }] }]` | `[{ data: [30, 40, null, 50] }]` |
| Area | `'area'` | Same as line | `[{ data: [10, 20, 30] }]` |
| Bar/Column | `'bar'` | Same as line. `plotOptions.bar.horizontal: false` for columns. | `[{ data: [44, 55, 41] }]` |
| Scatter | `'scatter'` | `[{ name, data: [{ x, y }] }]` | `[{ data: [{ x: 1, y: 5 }] }]` |
| Bubble | `'bubble'` | `[{ name, data: [{ x, y, z }] }]` — z required | `[{ data: [{ x: 1, y: 30, z: 10 }] }]` |
| Range Area | `'rangeArea'` | `[{ data: [{ x, y: [low, high] }] }]` | `[{ data: [{ x: 'Jan', y: [5, 15] }] }]` |
| Range Bar | `'rangeBar'` | `[{ data: [{ x, y: [start, end] }] }]` | `[{ data: [{ x: 'Task', y: [1, 5] }] }]` |
| Candlestick | `'candlestick'` | `[{ data: [{ x, y: [O,H,L,C] }] }]` — 4 values | `[{ data: [{ x: new Date(), y: [51,56,48,53] }] }]` |
| Box Plot | `'boxPlot'` | `[{ data: [{ x, y: [min,Q1,med,Q3,max] }] }]` — 5 values | `[{ data: [{ x: 'A', y: [10,20,30,40,50] }] }]` |
| Heatmap | `'heatmap'` | `[{ name, data: [{ x, y: number }] }]` — y is intensity | `[{ name: 'Mon', data: [{ x: '10am', y: 45 }] }]` |
| Treemap | `'treemap'` | `[{ data: [{ x, y: number }] }]` — y is area value | `[{ data: [{ x: 'Item', y: 100 }] }]` |
| Radar | `'radar'` | `[{ name, data: [num] }]` + `xaxis.categories` | `[{ data: [80, 50, 30] }]` |

### Non-Axis Charts (flat number array — NOT object format)

```js
// Pie, Donut, Polar Area
{ chart: { type: 'pie' }, series: [44, 55, 13], labels: ['A', 'B', 'C'] }

// Radial Bar (values 0–100)
{ chart: { type: 'radialBar' }, series: [76, 67, 61], labels: ['X', 'Y', 'Z'] }
```

---

## Core Lifecycle

```js
import ApexCharts from 'apexcharts'

const chart = new ApexCharts(document.querySelector('#chart'), {
  chart: { type: 'line', height: 350 },
  series: [{ name: 'Sales', data: [30, 40, 35, 50] }],
  xaxis: { categories: ['Q1', 'Q2', 'Q3', 'Q4'] }
})

await chart.render()                                    // REQUIRED
await chart.updateSeries([{ data: [10, 20, 30, 40] }]) // update data
await chart.updateOptions({ title: { text: 'New' } })  // update config
chart.destroy()                                         // cleanup
```

---

## Import Paths

```
apexcharts              # Full bundle (all types + features)
apexcharts/core         # Bare core (must register types + features manually)
apexcharts/line         # line, area, scatter, bubble, rangeArea
apexcharts/bar          # bar, column, rangeBar
apexcharts/candlestick  # candlestick, boxPlot
apexcharts/pie          # pie, donut, polarArea
apexcharts/radialBar    # radialBar
apexcharts/radar        # radar
apexcharts/heatmap      # heatmap
apexcharts/treemap      # treemap
apexcharts/ssr          # Server-side rendering (Node.js)
apexcharts/client       # Explicit browser import

# Optional features (side-effect imports)
apexcharts/features/exports      # dataURI(), exportToCSV()
apexcharts/features/legend       # Legend component
apexcharts/features/toolbar      # Zoom, pan, download
apexcharts/features/annotations  # X/Y/point annotations
apexcharts/features/keyboard     # Keyboard navigation
apexcharts/features/all          # All features
```

---

## Formatter Signatures

| Config Path | Signature |
|---|---|
| `xaxis.labels.formatter` | `(value, timestamp?, opts?) => string` |
| `yaxis.labels.formatter` | `(value, opts?) => string` |
| `tooltip.x.formatter` | `(value, opts?) => string` |
| `tooltip.y.formatter` | `(value, opts?) => string` |
| `tooltip.y.title.formatter` | `(seriesName, opts?) => string` |
| `dataLabels.formatter` | `(value, opts?) => string \| number` |
| `legend.formatter` | `(legendName, opts?) => string` |
| `plotOptions.pie.donut.labels.total.formatter` | `(w) => string` |
| `plotOptions.radialBar.dataLabels.value.formatter` | `(val) => string` |

---

## Pitfalls — ❌ Wrong vs ✅ Correct

### 1. Pie/donut data format
❌ `{ chart: { type: 'pie' }, series: [{ name: 'A', data: [44, 55] }] }`
✅ `{ chart: { type: 'pie' }, series: [44, 55], labels: ['A', 'B'] }`

### 2. Missing render()
❌ `const chart = new ApexCharts(el, opts)` — nothing displays
✅ `const chart = new ApexCharts(el, opts); await chart.render()`

### 3. React/Vue memory leak
❌ No cleanup on unmount
✅ `useEffect(() => { const c = new ApexCharts(el, opts); c.render(); return () => c.destroy() }, [])`

### 4. Datetime axis with strings
❌ `xaxis: { type: 'datetime' }, data: [{ x: 'January 2024', y: 30 }]`
✅ `xaxis: { type: 'datetime' }, data: [{ x: new Date('2024-01-01').getTime(), y: 30 }]`

### 5. Multiple y-axes as object
❌ `yaxis: { title: { text: 'Value' } }`
✅ `yaxis: [{ seriesName: 'Revenue', title: {...} }, { seriesName: 'Profit', opposite: true }]`

### 6. Both shared and intersect tooltips
❌ `tooltip: { shared: true, intersect: true }`
✅ `tooltip: { shared: true, intersect: false }` or `{ shared: false, intersect: true }`

### 7. undefined for missing data
❌ `data: [10, undefined, 30]`
✅ `data: [10, null, 30]`

### 8. Stacking on unsupported types
❌ `chart: { type: 'scatter', stacked: true }`
✅ `chart: { type: 'bar', stacked: true }` (or area)

### 9. Mixed chart without per-series type
❌ `series: [{ name: 'A', data: [...] }, { name: 'B', data: [...] }]` — all same type
✅ `series: [{ name: 'A', type: 'column', data: [...] }, { name: 'B', type: 'line', data: [...] }]`

### 10. RadialBar > 100
❌ `series: [340, 520]`
✅ `series: [76, 67]` (percentages 0–100)

### 11. Colors without #
❌ `colors: ['FF5733']`
✅ `colors: ['#FF5733']`

### 12. Tree-shaking without features
❌ `import ApexCharts from 'apexcharts/line'` — no legend/toolbar
✅ `import ApexCharts from 'apexcharts/line'; import 'apexcharts/features/legend'`

### 13. SSR with wrong import
❌ Server: `import ApexCharts from 'apexcharts'; ApexCharts.renderToString(opts)` — method missing
✅ Server: `import ApexCharts from 'apexcharts/ssr'; await ApexCharts.renderToString(opts)`

### 14. updateOptions just to change data
❌ `chart.updateOptions({ series: [{ data: newData }] })`
✅ `chart.updateSeries([{ name: 'Sales', data: newData }])`

### 15. Bar chart defaults to horizontal
❌ Expecting vertical columns with just `type: 'bar'`
✅ `plotOptions: { bar: { horizontal: false } }` for vertical columns

### 16. Categories with {x,y} data
❌ `xaxis: { categories: ['A','B'] }, series: [{ data: [{ x: 'A', y: 10 }] }]` — categories ignored
✅ Either use categories + simple array, OR use {x,y} without categories

---

## API Methods

| Method | Description |
|---|---|
| `render()` | Render chart. Returns Promise. |
| `destroy()` | Destroy and clean up. |
| `updateOptions(opts)` | Merge options and re-render. |
| `updateSeries(series)` | Replace series data. |
| `appendSeries(series)` | Add new series. |
| `appendData(data)` | Append data points. |
| `toggleSeries(name)` | Show/hide series. |
| `resetSeries()` | Reset to initial data. |
| `zoomX(min, max)` | Programmatic zoom. |
| `addXaxisAnnotation(opts)` | Dynamic annotation. |
| `addYaxisAnnotation(opts)` | Dynamic annotation. |
| `addPointAnnotation(opts)` | Dynamic annotation. |
| `removeAnnotation(id)` | Remove by id. |
| `clearAnnotations()` | Remove all. |
| `dataURI()` | Export as image (needs features/exports). |
| `exportToCSV()` | Export as CSV (needs features/exports). |

### Static Methods

| Method | Description |
|---|---|
| `ApexCharts.exec(id, fn, ...args)` | Call method on chart by id. |
| `ApexCharts.getChartByID(id)` | Get instance by id. |

### SSR Methods (apexcharts/ssr only)

| Method | Description |
|---|---|
| `ApexCharts.renderToString(opts)` | SVG string (server). |
| `ApexCharts.renderToHTML(opts)` | HTML wrapper + SVG (server). |
| `ApexCharts.hydrate(el)` | Hydrate SSR chart (client). |
| `ApexCharts.hydrateAll()` | Hydrate all SSR charts. |

---

## Framework Wrappers

```
npm install react-apexcharts apexcharts    # React
npm install vue3-apexcharts apexcharts     # Vue 3
npm install ng-apexcharts apexcharts       # Angular
```

React: `<Chart options={opts} series={series} type="line" height={350} />`
Vue 3: `<apexchart type="bar" :options="opts" :series="series" height="350" />`
Angular: `<apx-chart [series]="series" [chart]="chart" [xaxis]="xaxis" />`

All wrappers handle destroy() on unmount automatically.
