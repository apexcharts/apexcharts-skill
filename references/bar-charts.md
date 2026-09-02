# Bar Charts Reference — ApexCharts

## Chart Types Covered

- **Column** (`'bar'`) — Vertical column chart (the default for `type: 'bar'`)
- **Bar** (`'bar'` + `plotOptions.bar.horizontal: true`) — Horizontal bar chart
- **Range Bar** (`'rangeBar'`) — Bars with start/end values (used for timelines, Gantt charts)
- **Funnel** (`'funnel'`, **new in v6**): Stage-by-stage drop-off chart
- **Pyramid** (`'pyramid'`, **new in v6**): A funnel with the wide base at the bottom
- **Waterfall** (`'waterfall'`, **new in v7.1**): Deltas that accumulate into a running total
- **Dumbbell** (`'dumbbell'`, **new in v7.1**): Two or more measures per category, joined by a connector

## Tree-Shakeable Import

```js
import ApexCharts from 'apexcharts/bar'
// Registers: bar, column, rangeBar
// Aliases: apexcharts/column, apexcharts/rangeBar
// Also covers funnel + pyramid (they normalize to the bar engine)

// waterfall and dumbbell (v7.1) each add a feature module on top of the bar engine:
import ApexCharts from 'apexcharts/waterfall'  // == apexcharts/bar + features/waterfall
import ApexCharts from 'apexcharts/dumbbell'   // == apexcharts/bar + features/dumbbell
```

Both are **Tier 1**, so the default `apexcharts` bundle already has them and no import is needed there.

**Alias note:** `funnel` and `pyramid` are first-class `chart.type` aliases that render through the bar engine. Use them directly as `chart.type`; you do **not** need `plotOptions.bar.isFunnel`. `plotOptions.funnel` carries the funnel-specific shape options.

**Histogram (v6.9):** `chart.type: 'histogram'` also renders through the bar pathway, but its series carry raw observations that the chart bins itself, and the binning needs the stats feature (`apexcharts/histogram` entry, or `apexcharts/features/stats` alongside `apexcharts/bar`). It is documented with the other statistical charts in `references/financial-charts.md`.

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

### Waterfall (v7.1)

`chart.type: 'waterfall'` **accumulates the running total for you**. The series holds the **deltas**; a row flagged `isSubtotal` or `isTotal` draws the running total from zero at that position and carries **no `y` of its own**. Connectors bridge each bar's finish to the next one's start, and rising, falling and total bars take their own colors.

```js
{
  chart: { type: 'waterfall', height: 350 },
  series: [{
    name: 'Operating income',
    data: [
      { x: 'Net revenue',        y:  8786000 },
      { x: 'Cost of sales',      y: -2786000 },
      { x: 'Gross profit',       isSubtotal: true },   // no y: measured for you
      { x: 'Operating expenses', y: -1786000 },
      { x: 'Operating income',   isTotal: true },      // no y: sum from zero
    ],
  }],
}
```

**Row shape** (`ApexWaterfallPoint`, every field optional so a series can mix the two kinds freely):

| Field | Meaning |
|---|---|
| `x` | Category label, timestamp, or `Date` |
| `y` | The **step**: the signed amount it moves the running total by. Omit on a subtotal / total row. |
| `isSubtotal` | Sum of the steps since the previous subtotal / total bar |
| `isTotal` | Sum of every step from zero |
| `fillColor` | Overrides the semantic fill for this row |

**`plotOptions.waterfall`:**

```js
plotOptions: {
  waterfall: {
    colors: {
      positive: '#00A86F',   // a step that raises the running total
      negative: '#FF4560',   // a step that lowers it
      subtotal: undefined,   // defaults to the series color from the active palette
      total: undefined,      // same default, so running totals stay distinct from steps
    },
    connectors: {
      show: true,            // without them the floating columns read as unrelated bars
      color: undefined,      // defaults to grid.borderColor, so it is theme-aware
      strokeWidth: 1,
      strokeDashArray: 3,
    },
  },
}
```

A datum's own `fillColor` always wins over `plotOptions.waterfall.colors`.

### Dumbbell (v7.1)

`chart.type: 'dumbbell'` compares two or more measures per category. **Each series is one measure**, and the chart joins them with a connector per category. You do not zip the values into `[low, high]` pairs.

```js
{
  chart: { type: 'dumbbell', height: 350 },
  series: [
    { name: '2020', data: [{ x: 'Backend', y: 92 }, { x: 'Frontend', y: 78 }] },
    { name: '2025', data: [{ x: 'Backend', y: 118 }, { x: 'Frontend', y: 96 }] },
  ],
  plotOptions: { bar: { horizontal: true } },  // rows; omit for columns
}
```

The connector's thickness is `plotOptions.bar.barHeight` (rows) or `columnWidth` (columns), and the size of the marked ends is `markers.size`: they are the bar and its markers, so they are configured as such.

**`plotOptions.bar.dumbbell`:**

```js
plotOptions: {
  bar: {
    dumbbell: {
      connector: {
        color: undefined,   // undefined = a gradient between the two endpoint colours,
                            // resolved per row so a row where the measures cross runs the right way
        opacity: 0.55,      // the join is context for the marked ends, not a third mark
      },
      dataLabels: {
        enabled: true,      // default on for chart.type 'dumbbell', off for the bare isDumbbell flag
        offset: 6,          // px clear of the marked end, outward from the connector
        colorFromMarker: true,
        // formatter(value, { seriesIndex, dataPointIndex, endpointIndex, w })
        // NOTE: defaults to the value axis' label formatter, NOT dataLabels.formatter
        // (on a range bar that one reads out end - start, which is the gap, not the endpoint)
      },
      tooltip: { differenceLabel: 'Difference' },
    },
  },
}
```

With three or more measures only the two extremes are labelled: anything between them sits on the connector, where a label has nowhere to go that is not over the line or over its neighbour.

**Versus the older range-bar form.** `plotOptions.bar.isDumbbell` on a `rangeBar` with `y: [lo, hi]` pairs still works and is a different chart: one series, endpoint colours from `plotOptions.bar.dumbbellColors` (`[[startColor, endColor]]`). `chart.type: 'dumbbell'` takes one series per measure and colours each dot after the series it belongs to, from `colors`. Prefer the type unless you already have paired data.

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
    // borderRadiusWhenStacked was REMOVED in v7.0, see the note below

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

**⚠️ `borderRadiusWhenStacked` was removed in v7.0.** Rounded corners on a stacked bar are no longer a setting: corner ownership follows the **outer edge** of the stack, which is what `'last'` approximated and what `'all'` got wrong on any stack whose last series was empty. An unknown option is ignored, so leaving it in a config is harmless but does nothing. Delete it. Related v7.0 fixes: a stacked bar's bottom cap is now the top-rounded path mirrored (caps no longer invert or pop when a series collapses and rises again), and grouped stacked charts resolve caps per group rather than chart-wide, so every group gets its own bottom and top radius.

**⚠️ `dataLabels.animate.enabled` now defaults to `true` (v7.0), bar/column only.** Labels ride to their new position on a data-change update instead of snapping there, so they reflow on the same clock as the bars, markers and axis ticks. A label that has not moved is a per-label no-op; speed and easing follow `chart.animations.dynamicAnimation`. For the pre-v7 behavior:

```js
dataLabels: { animate: { enabled: false } }
```

### Bar Chart Race (v6.4)

A reorder update animates into a bar chart race: when you re-sort the data and update the chart, the bars slide to their new ranks and their category labels ride along automatically (whenever `dynamicAnimation` is on). Two opt-in `dataLabels` flags complete the effect. Both are off by default and apply to **bar / column only**; their speed and easing follow `chart.animations.dynamicAnimation`.

```js
const options = {
  chart: {
    type: 'bar',
    animations: { dynamicAnimation: { speed: 800 } },
  },
  plotOptions: { bar: { horizontal: true } },
  dataLabels: {
    enabled: true,
    animate: { enabled: true },  // value labels ride to the new rank instead of snapping
    countUp: { enabled: true },  // and count up/down from the previous value (formatter runs each frame)
  },
}
// On each frame, re-sort your data and call updateOptions (or updateSeries) with the
// new series and categories. Bars, category labels, and value labels animate together.
// Rotated axis labels ride correctly too.
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
7. **Reaching for `plotOptions.bar.isFunnel`**: unnecessary. Set `chart.type: 'funnel'` (or `'pyramid'`) and use `plotOptions.funnel` for shape options.
8. **Pre-computing the running total for a waterfall** *(v7.1)*: the series carries the **deltas**; the chart accumulates. Feeding it cumulative values draws each bar from zero to the total, which is a column chart with extra steps.
9. **Giving a waterfall subtotal row a `y`** *(v7.1)*: `isSubtotal` / `isTotal` rows are measured for you. Supply `x` and the flag, nothing else.
10. **Zipping dumbbell values into `y: [lo, hi]`** *(v7.1)*: that is the older `plotOptions.bar.isDumbbell` range-bar form. `chart.type: 'dumbbell'` wants one series per measure, each with plain `{ x, y }` points.
11. **Setting `borderRadiusWhenStacked`**: removed in v7.0. The option is ignored; stacked corner ownership follows the stack's outer edge automatically.
12. **Expecting data labels to snap on update** *(v7.0)*: `dataLabels.animate.enabled` now defaults to `true` on bar/column. Set it to `false` for the old behavior.
