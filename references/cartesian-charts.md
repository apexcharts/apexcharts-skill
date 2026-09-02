# Cartesian Charts Reference — ApexCharts

## Chart Types Covered

- **Line** (`'line'`) — Standard line chart connecting data points
- **Area** (`'area'`) — Line chart with filled area below
- **Scatter** (`'scatter'`) — Individual data points plotted by X/Y coordinates
- **Bubble** (`'bubble'`) — Scatter with variable-size bubbles (requires z value)
- **Range Area** (`'rangeArea'`) — Area chart showing a range between two values
- **Streamgraph** (`'streamgraph'`, **new in v7.1**): Series stacked as flowing bands around a chosen baseline

## Tree-Shakeable Import

```js
import ApexCharts from 'apexcharts/line'
// Registers: line, area, scatter, bubble, rangeArea
// Aliases: apexcharts/area, apexcharts/scatter, apexcharts/bubble, apexcharts/rangeArea

// streamgraph (v7.1) adds a feature module on top of the rangeArea engine:
import ApexCharts from 'apexcharts/streamgraph'  // == apexcharts/rangeArea + features/streamgraph
```

Streamgraph is **Tier 1**, so the default `apexcharts` bundle already has it and no import is needed there.

---

## Data Formats (Detailed)

### Simple Array (categories on x-axis)

```js
{
  chart: { type: 'line', height: 350 },
  series: [{
    name: 'Sales',
    data: [30, 40, 35, 50, 49, 60, 70]
  }],
  xaxis: {
    categories: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  }
}
```

### XY Object Format (numeric or datetime x-axis)

```js
{
  chart: { type: 'line', height: 350 },
  series: [{
    name: 'Sales',
    data: [
      { x: new Date('2024-01-01').getTime(), y: 30 },
      { x: new Date('2024-02-01').getTime(), y: 40 },
      { x: new Date('2024-03-01').getTime(), y: 35 }
    ]
  }],
  xaxis: { type: 'datetime' }
  // Do NOT use xaxis.categories with {x, y} data — categories are ignored
}
```

### 2D Array Format (alternative to object format)

```js
series: [{
  name: 'Sales',
  data: [
    [1704067200000, 30],  // [timestamp, value]
    [1706745600000, 40],
    [1709251200000, 35]
  ]
}]
```

### Missing Data Points

Use `null` to create gaps in the line:
```js
series: [{ data: [10, 25, null, null, 50, 60] }]
```

### Scatter Chart

Always use XY format:
```js
{
  chart: { type: 'scatter', height: 350 },
  series: [{
    name: 'Sample A',
    data: [
      { x: 16.4, y: 5.4 },
      { x: 21.7, y: 2 },
      { x: 25.4, y: 3 }
    ]
  }],
  xaxis: { type: 'numeric' }
}
```

### Bubble Chart (z is required)

```js
{
  chart: { type: 'bubble', height: 350 },
  series: [{
    name: 'Product A',
    data: [
      { x: 2020, y: 30, z: 10 },   // z = bubble size
      { x: 2021, y: 40, z: 25 },
      { x: 2022, y: 35, z: 15 }
    ]
  }],
  xaxis: { type: 'numeric' }
}
```

### Range Area

```js
{
  chart: { type: 'rangeArea', height: 350 },
  series: [{
    name: 'Temperature Range',
    data: [
      { x: 'Jan', y: [-2, 10] },   // [low, high]
      { x: 'Feb', y: [0, 12] },
      { x: 'Mar', y: [3, 16] }
    ]
  }]
}
```

### Streamgraph (v7.1)

`chart.type: 'streamgraph'` stacks the series as flowing bands around a baseline chosen to keep the whole picture readable. Series format is the same as area; **the stacking is the chart's job, so do not set `chart.stacked`**.

```js
{
  chart: { type: 'streamgraph', height: 350 },
  series: [
    { name: 'Drama',  data: [{ x: '2024-01-01', y: 32 }, { x: '2024-02-01', y: 41 }] },
    { name: 'Comedy', data: [{ x: '2024-01-01', y: 18 }, { x: '2024-02-01', y: 26 }] },
  ],
}
```

Curves are `monotoneCubic` by default so a band never overshoots its data, each band's name is drawn inside it sized to the room that band actually has, and hovering a band fades the others. The legend and tooltip work as on any axis chart.

**`plotOptions.streamgraph`:**

```js
plotOptions: {
  streamgraph: {
    offset: 'wiggle',      // where the baseline goes:
                           //   'wiggle'     (default) minimizes total weighted slope, so thick bands stay level
                           //   'silhouette' centres the stack on one horizontal line
                           //   'zero'       an ordinary stacked area, on the zero line
                           //   'expand'     normalizes each column to its own total (composition, not volume)

    order: 'inside-out',   // stacking order, bottom first:
                           //   'inside-out' (default) puts early-peaking series in the middle and fans
                           //                later peaks outward, each to whichever side is thinner
                           //   'inverse'    the series order, reversed
                           //   'none'       the series order as given

    hover: { show: true, opacity: 0.35 },  // what the OTHER bands drop to; much above ~0.5 and the
                                           // hovered band stops reading as picked out

    labels: {
      show: true,
      minWidth: 24,        // a band narrower than this many px is left unlabelled rather than
                           // given a name truncated past the point of being a name
      minFontSize: 9,
      maxFontSize: 30,
      style: {
        fontSize: 'auto',  // sizes each name to its band, bounded by min/maxFontSize.
                           // Give a literal ('12px') to draw every name at the same size.
        fontWeight: 600,
        colors: undefined, // per-series override; by default each label takes black or white,
                           // whichever reads on its own band
      },
    },
  },
}
```

`offset: 'wiggle'` with `order: 'inside-out'` is the classic streamgraph, and the pair is what keeps it readable: the middle of the stack moves least under a wiggle baseline. A faded band's name is recoloured to `chart.foreColor` rather than faded with it, because the name takes black or white by the contrast of the band at full strength.

---

## Key Options

### Stroke / Curve Types

```js
stroke: {
  curve: 'smooth',       // 'smooth' | 'straight' | 'stepline' | 'linestep' | 'monotoneCubic'
  width: 2,              // line thickness (number or array per series)
  dashArray: 0            // 0 = solid, number = dashed (or array per series)
}
```

### Markers

```js
markers: {
  size: 5,                // 0 = hidden (default for line/area)
  shape: 'circle',        // 'circle' | 'square' | 'diamond' | etc.
  hover: { sizeOffset: 3 }
}
```

### Area Fill

```js
fill: {
  type: 'gradient',
  gradient: {
    shadeIntensity: 1,
    opacityFrom: 0.7,
    opacityTo: 0.2,
    stops: [0, 90, 100]
  }
}
```

### Datetime X-Axis

```js
xaxis: {
  type: 'datetime',
  labels: {
    datetimeUTC: false,    // false = local time, true = UTC
    datetimeFormatter: {
      year: 'yyyy',
      month: "MMM 'yy",
      day: 'dd MMM',
      hour: 'HH:mm'
    }
  }
}
```

### Forecast Data Points

```js
{
  forecastDataPoints: {
    count: 3,              // last N data points shown as forecast
    fillOpacity: 0.5,
    strokeWidth: 1,
    dashArray: 4
  }
}
```

---

## Complete Working Example — Line Chart with Datetime

```html
<div id="chart"></div>
<script type="module">
  import ApexCharts from 'apexcharts'

  const options = {
    chart: {
      type: 'line',
      height: 350,
      zoom: { enabled: true }
    },
    series: [{
      name: 'Page Views',
      data: [
        { x: new Date('2024-01-01').getTime(), y: 4500 },
        { x: new Date('2024-02-01').getTime(), y: 5200 },
        { x: new Date('2024-03-01').getTime(), y: 4800 },
        { x: new Date('2024-04-01').getTime(), y: 6100 },
        { x: new Date('2024-05-01').getTime(), y: 5900 },
        { x: new Date('2024-06-01').getTime(), y: 7200 }
      ]
    }],
    xaxis: { type: 'datetime' },
    yaxis: {
      title: { text: 'Views' },
      labels: { formatter: (val) => val.toFixed(0) }
    },
    stroke: { curve: 'smooth', width: 3 },
    title: { text: 'Monthly Page Views', align: 'left' },
    tooltip: {
      x: { format: 'MMM yyyy' },
      y: { formatter: (val) => `${val.toLocaleString()} views` }
    }
  }

  const chart = new ApexCharts(document.querySelector('#chart'), options)
  await chart.render()
</script>
```

---

## Family-Specific Pitfalls

1. **Bubble chart without z value** — renders with zero-size bubbles. Always provide `z` in data.
2. **Using `xaxis.categories` with `{ x, y }` data** — categories are silently ignored when data contains x values. Choose one approach.
3. **Datetime axis with string dates**: pass timestamps (`new Date(...).getTime()`) or `Date` objects, not raw strings like `'January 2024'`. Since v6.10 a `Date` object `x` is accepted by the types and keeps millisecond resolution (previously milliseconds were truncated, collapsing points within the same second). **Since v7.1 a `Date` x also works on a non-datetime axis**; before that it only worked when the axis was `datetime` and stringified into garbage anywhere else, and an invalid `Date` slipped through unnoticed. Both are handled now.
4. **`stroke.curve: 'smooth'` on sparse data** — can produce visual artifacts. Use `'monotoneCubic'` for mathematically smoother interpolation.
5. **Range Area with single value instead of array** — `y` must be `[low, high]`, not a single number.
6. **Setting `chart.stacked` on a streamgraph** *(v7.1)*: the chart owns its own stacking, baseline and band order through `plotOptions.streamgraph`. Reach for `offset: 'zero'` if what you actually want is a plain stacked area.
7. **A series that starts with nulls used to mis-target the tooltip**: the hovered index resolved against the drawn points rather than the data, so the tooltip read the wrong point. Fixed in v7.1.
8. **`autoScaleYaxis` scaling to points nobody can see**: before v7.1, zooming let one point just outside the window size the whole axis, and a series with nothing in the window still contributed. Fixed in v7.1; stacked charts now also scale to the stacked totals inside the window rather than to individual series.

## Axis and layout fixes worth knowing (v7.0 / v7.1)

These need no config change; they matter because a workaround you carried from an earlier version may now be unnecessary.

- **Logarithmic axis geometry, and `tickAmount` on a log scale** *(v7.0)*. Log-scale positions were computed against the wrong domain, and `tickAmount` was ignored outright on a log axis. Both fixed, so `yaxis: { logarithmic: true, tickAmount: n }` now does what it says.
- **Bar width came from the smallest gap inside one series** *(fixed v7.1)*. A single series with one tight pair of x values shrank every bar on the chart. A bar's slot now comes from the axis, the union of gaps across all series.
- **Stacked baselines resolve by x, not by position in the array** *(fixed v7.0)*. Two series stacked on ragged data lined up by ordinal, so a series with a missing point stacked onto the wrong neighbour.
- **A container resize arriving mid-animation was lost for good** *(fixed v7.1)*. The ResizeObserver fires once per resize and the handler dropped that callback while an animation ran, so a chart in a collapsing sidebar kept its old size.
- **Annotations on a chart with no data** *(fixed v7.0)*. Placement was gated chart-wide on `dataPoints`, so an empty chart dropped every annotation including y-axis ones that are always placeable. Gating is now per annotation.
- **A tooltip inside Shadow DOM followed the wrong element** *(fixed v7.0)*. Reading `e.target` after a deferred hover gets the shadow host, not the hovered mark.
