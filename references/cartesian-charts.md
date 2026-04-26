# Cartesian Charts Reference — ApexCharts

## Chart Types Covered

- **Line** (`'line'`) — Standard line chart connecting data points
- **Area** (`'area'`) — Line chart with filled area below
- **Scatter** (`'scatter'`) — Individual data points plotted by X/Y coordinates
- **Bubble** (`'bubble'`) — Scatter with variable-size bubbles (requires z value)
- **Range Area** (`'rangeArea'`) — Area chart showing a range between two values

## Tree-Shakeable Import

```js
import ApexCharts from 'apexcharts/line'
// Registers: line, area, scatter, bubble, rangeArea
// Aliases: apexcharts/area, apexcharts/scatter, apexcharts/bubble, apexcharts/rangeArea
```

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
3. **Datetime axis with string dates** — pass timestamps (`new Date(...).getTime()`) or `Date` objects, not raw strings like `'January 2024'`.
4. **`stroke.curve: 'smooth'` on sparse data** — can produce visual artifacts. Use `'monotoneCubic'` for mathematically smoother interpolation.
5. **Range Area with single value instead of array** — `y` must be `[low, high]`, not a single number.
