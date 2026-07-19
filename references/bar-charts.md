# Bar Charts Reference — ApexCharts

## Chart Types Covered

- **Column** (`'bar'`) — Vertical column chart (the default for `type: 'bar'`)
- **Bar** (`'bar'` + `plotOptions.bar.horizontal: true`) — Horizontal bar chart
- **Range Bar** (`'rangeBar'`) — Bars with start/end values (used for timelines, Gantt charts)
- **Funnel** (`'funnel'`, **new in v6**): Stage-by-stage drop-off chart
- **Pyramid** (`'pyramid'`, **new in v6**): A funnel with the wide base at the bottom

## Tree-Shakeable Import

```js
import ApexCharts from 'apexcharts/bar'
// Registers: bar, column, rangeBar
// Aliases: apexcharts/column, apexcharts/rangeBar
// Also covers funnel + pyramid (they normalize to the bar engine in v6)
```

**v6 note:** `funnel` and `pyramid` are first-class `chart.type` aliases that render through the bar engine. Use them directly as `chart.type`; you do **not** need `plotOptions.bar.isFunnel`. `plotOptions.funnel` carries the funnel-specific shape options.

---

## Data Formats

### Basic Bar / Column

```js
{
  chart: { type: 'bar', height: 350 },
  series: [{
    name: 'Sales',
    data: [44, 55, 41, 67, 22, 43]
  }],
  xaxis: {
    categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']
  },
  plotOptions: {
    bar: {
      horizontal: true    // true = horizontal bars
                           // false = vertical columns (default)
    }
  }
}
```

### Grouped Bars (multiple series)

```js
{
  chart: { type: 'bar', height: 350 },
  series: [
    { name: '2023', data: [44, 55, 41] },
    { name: '2024', data: [53, 32, 33] }
  ],
  xaxis: { categories: ['Q1', 'Q2', 'Q3'] },
  plotOptions: { bar: { horizontal: false } }
}
```

### Stacked Bars

```js
{
  chart: { type: 'bar', height: 350, stacked: true },
  // stackType: '100%'  // uncomment for percentage stacking
  series: [
    { name: 'Product A', data: [44, 55, 41] },
    { name: 'Product B', data: [13, 23, 20] },
    { name: 'Product C', data: [11, 17, 15] }
  ],
  xaxis: { categories: ['2022', '2023', '2024'] },
  plotOptions: { bar: { horizontal: false } }
}
```

### Range Bar (start/end values)

```js
{
  chart: { type: 'rangeBar', height: 350 },
  series: [{
    name: 'Salary Range',
    data: [
      { x: 'Engineering', y: [80000, 150000] },   // [start, end]
      { x: 'Design', y: [60000, 120000] },
      { x: 'Marketing', y: [50000, 110000] }
    ]
  }],
  plotOptions: { bar: { horizontal: true } }
}
```

### Timeline / Gantt Chart (Range Bar with dates)

```js
{
  chart: { type: 'rangeBar', height: 350 },
  series: [{
    data: [
      {
        x: 'Design',
        y: [new Date('2024-01-01').getTime(), new Date('2024-03-15').getTime()]
      },
      {
        x: 'Development',
        y: [new Date('2024-02-15').getTime(), new Date('2024-07-01').getTime()]
      },
      {
        x: 'Testing',
        y: [new Date('2024-06-01').getTime(), new Date('2024-08-01').getTime()]
      }
    ]
  }],
  plotOptions: {
    bar: { horizontal: true }
  },
  xaxis: { type: 'datetime' }
}
```

### Multi-Series Timeline (color-coded tasks)

```js
{
  chart: { type: 'rangeBar', height: 350 },
  series: [
    {
      name: 'Team A',
      data: [
        { x: 'Design', y: [new Date('2024-01-01').getTime(), new Date('2024-03-01').getTime()] },
        { x: 'Code', y: [new Date('2024-03-01').getTime(), new Date('2024-06-01').getTime()] }
      ]
    },
    {
      name: 'Team B',
      data: [
        { x: 'Design', y: [new Date('2024-02-01').getTime(), new Date('2024-04-01').getTime()] },
        { x: 'Test', y: [new Date('2024-04-01').getTime(), new Date('2024-07-01').getTime()] }
      ]
    }
  ],
  plotOptions: { bar: { horizontal: true } },
  xaxis: { type: 'datetime' }
}
```

### Funnel (v6)

Values are a flat number array in the standard `[{ name, data }]` wrapper; stage labels go in `xaxis.categories`. Order values **largest → smallest**.

```js
{
  chart: { type: 'funnel', height: 350 },
  series: [{ name: 'Recruitment', data: [1380, 1100, 990, 880, 740, 548, 330, 200] }],
  xaxis: { categories: ['Sourced', 'Screened', 'Assessed', 'HR', 'Technical', 'Verify', 'Offered', 'Hired'] },
  plotOptions: {
    // shape: 'rectangle' (default, centered rectangles) | 'trapezoid' (continuous sloped sides)
    funnel: { shape: 'trapezoid', lastShape: 'flat' },  // lastShape: 'flat' | 'taper' (trapezoid only)
    bar: { borderRadius: 0, barHeight: '80%' }           // cosmetic bar props still apply
  },
  dataLabels: {
    enabled: true,
    formatter: (val, opt) => opt.w.globals.labels[opt.dataPointIndex] + ':  ' + val
  },
  legend: { show: false }
}
```

### Pyramid (v6)

Same shape as funnel, but order values **smallest → largest** so the wide base sits at the bottom.

```js
{
  chart: { type: 'pyramid', height: 350 },
  series: [{ name: '', data: [200, 330, 548, 740, 880, 990, 1100, 1380] }],
  xaxis: { categories: ['Sweets', 'Processed', 'Fats', 'Meat', 'Legumes', 'Dairy', 'Produce', 'Grains'] },
  plotOptions: { bar: { distributed: true } },  // one color per stage
  dataLabels: { enabled: true, formatter: (val, opt) => opt.w.globals.labels[opt.dataPointIndex] },
  legend: { show: false }
}
```

---

## Key plotOptions.bar Options

```js
plotOptions: {
  bar: {
    horizontal: true,         // true = horizontal bars, false = vertical columns
    columnWidth: '70%',       // width of each column (string percentage)
    barHeight: '70%',         // height of each bar when horizontal
    distributed: false,       // true = different color per data point
    borderRadius: 4,          // rounded corners (number or object)
    borderRadiusApplication: 'end',  // 'end' | 'around'
    borderRadiusWhenStacked: 'last', // 'all' | 'last'

    dataLabels: {
      position: 'top',        // 'top' | 'center' | 'bottom'
      orientation: 'horizontal'  // 'horizontal' | 'vertical'
    },

    colors: {
      ranges: [{
        from: 0,
        to: 50,
        color: '#F15B46'       // conditional coloring by value range
      }]
    }
  }
}
```

### Goals / Target Markers

```js
series: [{
  name: 'Actual',
  data: [
    {
      x: 'Q1',
      y: 400,
      goals: [{
        name: 'Target',
        value: 500,
        strokeWidth: 5,
        strokeColor: '#775DD0'
      }]
    }
  ]
}]
```

---

## Complete Working Example — Grouped Column Chart

```html
<div id="chart"></div>
<script type="module">
  import ApexCharts from 'apexcharts'

  const options = {
    chart: {
      type: 'bar',
      height: 350
    },
    series: [
      { name: '2023', data: [44, 55, 57, 56, 61] },
      { name: '2024', data: [76, 85, 101, 98, 87] }
    ],
    xaxis: {
      categories: ['Feb', 'Mar', 'Apr', 'May', 'Jun']
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: '55%',
        borderRadius: 4
      }
    },
    dataLabels: { enabled: false },
    stroke: { show: true, width: 2, colors: ['transparent'] },
    yaxis: { title: { text: 'Revenue ($K)' } },
    fill: { opacity: 1 },
    tooltip: {
      y: { formatter: (val) => `$${val}K` }
    }
  }

  const chart = new ApexCharts(document.querySelector('#chart'), options)
  await chart.render()
</script>
```

---

## Family-Specific Pitfalls

1. **Assuming `type: 'bar'` renders horizontal bars** — it defaults to **vertical columns** (`horizontal: false`). Set `plotOptions.bar.horizontal: true` when you actually want horizontal bars.
2. **Stacking with `chart.stacked: true` but missing on bar type** — stacking only works on `type: 'bar'` (and `'area'`). It does NOT work on line, scatter, etc.
3. **Range Bar with single value instead of array** — `y` must be `[start, end]`, not a single number.
4. **Timeline without `xaxis.type: 'datetime'`** — date-based range bars need `xaxis: { type: 'datetime' }` to render correctly.
5. **`distributed: true` with multiple series** — distributed coloring applies to each data point independently. With multiple series, each point gets a unique color which is usually not desired. Use `distributed: true` only with single-series charts.
6. **Funnel/pyramid value ordering**: funnel expects values ordered largest-to-smallest and pyramid smallest-to-largest. The renderer does not sort for you; unsorted data produces a jagged shape. Stage labels come from `xaxis.categories`, and per-stage labels in `dataLabels.formatter` are read via `opt.w.globals.labels[opt.dataPointIndex]`.
7. **Reaching for `plotOptions.bar.isFunnel` in v6**: unnecessary. Set `chart.type: 'funnel'` (or `'pyramid'`) and use `plotOptions.funnel` for shape options.
