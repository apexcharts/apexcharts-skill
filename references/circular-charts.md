# Circular Charts Reference — ApexCharts

## Chart Types Covered

- **Pie** (`'pie'`) — Standard pie chart
- **Donut** (`'donut'`) — Pie chart with hollow center
- **Polar Area** (`'polarArea'`) — Radial segments with equal angles, varying radius
- **Radial Bar** (`'radialBar'`): Circular progress chart (one or more concentric tracks)
- **Gauge** (`'gauge'`, **new in v6**): Single-value gauge with arc/needle shapes, colored bands, and ticks
- **Sunburst** (`'sunburst'`, **new in v6.7, free**): Hierarchical nested pie/donut; concentric rings, one per level
- **Unit / Waffle** (`'unit'` / `'waffle'`, **new in v6.6, premium**): One mark per unit of value (dot clusters, pictograms, waffles, beeswarms, parliament)

## Tree-Shakeable Import

```js
import ApexCharts from 'apexcharts/pie'
// Registers: pie, donut, polarArea
// Aliases: apexcharts/donut, apexcharts/polarArea

import ApexCharts from 'apexcharts/radialBar'
// Registers: radialBar (separate entry point)
// Also covers gauge (it normalizes to the radialBar engine in v6)

import ApexCharts from 'apexcharts/sunburst'
// Registers: sunburst (v6.7, hierarchical). Free, not gated.

import ApexCharts from 'apexcharts/unit'
// Registers: unit + waffle (v6.6). Premium: watermarked until a license is set.
```

---

## Data Format

**The canonical format for circular charts is a flat number array for `series` paired with a `labels` array.** The x/y object format used by axis charts also works (ApexCharts normalizes it by extracting `y` as the value and `x` as the label), but it is not recommended — prefer the flat array form for clarity and predictability.

### Pie / Donut / Polar Area

```js
{
  chart: { type: 'pie', height: 350 },  // or 'donut' or 'polarArea'
  series: [44, 55, 13, 43, 22],
  labels: ['Team A', 'Team B', 'Team C', 'Team D', 'Team E']
}
```

### Radial Bar (values 0–100)

```js
{
  chart: { type: 'radialBar', height: 350 },
  series: [76, 67, 61, 90],
  labels: ['Apples', 'Oranges', 'Bananas', 'Berries']
}
```

**Important:** RadialBar values represent percentages (0–100). Values above 100 will overflow the track.

### Gauge (v6)

A gauge is a single-value `radialBar` alias. Series is a flat one-element array; the value maps to the `min..max` domain (defaults 0-100). All configuration lives under `plotOptions.radialBar`; there is **no `plotOptions.gauge`**.

```js
// Minimal gauge:
{
  chart: { type: 'gauge', height: 350 },
  series: [72],
  labels: ['Progress']
}
```

```js
// Needle gauge with colored bands and ticks:
{
  chart: { type: 'gauge', height: 360 },
  series: [68],
  labels: ['Speed'],
  plotOptions: {
    radialBar: {
      shape: 'needle',          // 'arc' (default, filled value-arc) | 'needle' (rotating pointer)
      startAngle: -135, endAngle: 135,
      min: 0, max: 100,          // value-to-angle domain
      bands: [                   // colored threshold segments in the min..max domain
        { from: 0, to: 30, color: '#FF4560' },
        { from: 30, to: 70, color: '#FEB019' },
        { from: 70, to: 100, color: '#00E396' }
      ],
      bandsStyle: { strokeWidth: '50%', gap: 1 },
      ticks: {
        show: true,
        major: { count: 11, length: 8, width: 2, color: '#334155', placement: 'outside' },
        minor: { count: 1, length: 4, width: 1, color: '#94A3B8', placement: 'outside' },
        labels: { show: true, offset: 6, fontSize: '11px' }
      },
      needle: { color: '#0F172A', length: '60%', baseWidth: 6, tipWidth: 1 },
      hollow: { size: '70%' },
      dataLabels: { name: { show: false }, value: { offsetY: 32, fontSize: '28px', fontWeight: 700 } }
    }
  }
}
```

A plain radialBar is effectively a gauge with `shape: 'arc'`. A semi-circle gauge is `startAngle: -90, endAngle: 90`.

### Sunburst (v6.7)

A sunburst draws a hierarchy as concentric rings: the first level fills a donut around the centre hole, and each deeper level stacks outward, with every child arc constrained to its parent's angular wedge. It is a **free** chart type (not gated). Data uses the axis-style `[{ data: [...] }]` wrapper, but each datum is an `{ x, y, children }` node nested to any depth. A leaf node omits `children`.

```js
{
  chart: { type: 'sunburst', height: 380 },
  series: [{
    data: [
      { x: 'Mobile', y: 55, children: [
        { x: 'iOS', y: 30, children: [
          { x: 'iOS 17', y: 18 },
          { x: 'iOS 16', y: 9 }
        ] },
        { x: 'Android', y: 23 }
      ] },
      { x: 'Desktop', y: 33, children: [
        { x: 'Windows', y: 20 },
        { x: 'macOS', y: 10 }
      ] }
    ]
  }],
  plotOptions: {
    sunburst: {
      innerSize: '25%',      // centre hole radius as a % of max radius (or px)
      borderRadius: 5,       // round the arc corners (px), same semantics as pie.borderRadius
      spacing: 1,            // gap between adjacent arcs (px), same semantics as pie.spacing
      startAngle: 0,
      endAngle: 360,
      leaf: 'extend',        // 'extend' draws a shallow branch's leaf to the rim | 'stop'
      partition: 'normalize', // angular partition of a parent's wedge among children: 'normalize' | 'strict'
      tint: 0,               // per-depth lightening of the parent colour (0 = same, 1 = white)
      zoomOnClick: true,     // click a wedge to zoom into its branch (breadcrumb to go back). Default true
      dataLabels: {
        show: true,
        minAngleToShow: 5,   // hide the label on any arc narrower than this (degrees)
        style: { fontSize: '12px', colors: ['#fff'] }
      }
    }
  }
}
```

Colours, `stroke`, `legend`, and `title` behave as they do on pie and donut. A sunburst can also adapt an existing `drilldown` config instead of a native `children` hierarchy.

### Unit / Waffle (v6.6, premium)

A `unit` chart renders one discrete mark for every unit of value instead of a single bar or slice, so "37 of 200" reads as a countable quantity. It is a **non-axis** chart (dispatched like pie or treemap) and is **premium**: it renders fully in trial mode with an `APEXCHARTS` watermark until an entitled license is set (see `references/v6-features.md`). On every update each mark tweens from its old position to its new one, so re-grouping, filtering, or a changing count re-forms the marks.

Data is the same flat number array + `labels` shape as pie:

```js
{
  chart: { type: 'unit', height: 360 },
  series: [276, 266, 3],
  labels: ['For', 'Against', 'Abstain'],
  plotOptions: { unit: { layout: 'grouped' } }
}
```

**Layouts** via `plotOptions.unit.layout`:

- `grouped` (default): one phyllotaxis blob per category, laid out in a row.
- `packed`: one shared blob, coloured by group (`sortByGroup: true` nests the minority in the centre).
- `columns`: each category is a vertical bar built from stacked dots (a waffle column).
- `grid`: one waffle lattice, a part-to-whole square "pie" (`grid.total: 100` rounds it to a fixed cell budget for a percentage waffle; `grid.split: true` makes small-multiple mini-waffles).
- `scatter`: a beeswarm on real value axes (`scatter.y: 'lanes'` default, or `'value'` for a 2D value-value plot; `scatter.sizeRange` for area-scaled bubbles).
- `arc` (**v6.7**): a parliament / hemicycle, seats in concentric arced rows across an annulus, filled in category order.

**Also available:** `shape` (`'circle'` | `'square'` | `'image'` pictogram with `image.tint`); per-mark object data `series: [{ name, data: [{ value, x, z, name, fillColor, id }] }]`; `transition` (`'group'` default | `'flow'` crowd migration | `'identity'` keyed by `id`/`name`); numeric or `'auto'` dot `size`; `sizeByValue` bubbles; `unitValue` (1 mark = N units); `maxUnits` cap; per-cluster `clusterLabels`; and per-mark `tooltip.formatter`.

`waffle` is a thin alias of `unit` that presets the `grid` layout with square cells. With `grid.total: 100` the values are largest-remainder rounded to exactly 100 cells, so the grid reads as percentages. The original alias is preserved on the read-only `chart.requestedType`; an explicit `layout` or `shape` still wins.

```js
{
  chart: { type: 'waffle', height: 360 },
  series: [35, 23, 15, 9, 8, 6, 4],
  labels: ['Coal', 'Gas', 'Hydro', 'Nuclear', 'Wind', 'Solar', 'Other'],
  plotOptions: { unit: { grid: { columns: 10, total: 100 } } }
}
```

A parliament (hemicycle) seat chart:

```js
{
  chart: { type: 'unit', height: 320 },
  series: [120, 95, 60, 25],
  labels: ['Party A', 'Party B', 'Party C', 'Party D'],
  plotOptions: {
    unit: {
      layout: 'arc',
      arc: { startAngle: -90, endAngle: 90, innerRadiusRatio: 0.4, rows: 'auto' }
    }
  }
}
```

---

## Key plotOptions

### Pie / Donut

```js
plotOptions: {
  pie: {
    startAngle: 0,
    endAngle: 360,
    expandOnClick: true,       // expand slice on click
    offsetX: 0,
    offsetY: 0,

    customScale: 1,            // scale the pie (0.5 = half size)

    borderRadius: 0,           // (v6.7) round each slice's corners (px). Applies to pie, donut, polarArea
    spacing: 0,                // (v6.7) gap between adjacent slices (px). Applies to pie, donut, polarArea

    dataLabels: {
      offset: 0,               // move labels away from center
      minAngleToShowLabel: 10   // hide labels on tiny slices
    },

    donut: {
      size: '65%',              // donut hole size (percentage string)
      background: 'transparent',

      labels: {
        show: true,             // show center labels
        name: {
          show: true,
          fontSize: '22px',
          fontWeight: 600,
          offsetY: -10
        },
        value: {
          show: true,
          fontSize: '16px',
          formatter: (val) => val   // format the numeric value
        },
        total: {
          show: true,
          label: 'Total',
          formatter: (w) => {
            // w.globals.seriesTotals is array of values
            return w.globals.seriesTotals.reduce((a, b) => a + b, 0)
          }
        }
      }
    }
  }
}
```

### Radial Bar

```js
plotOptions: {
  radialBar: {
    startAngle: -135,
    endAngle: 135,

    hollow: {
      size: '70%',              // size of the hollow center
      background: 'transparent'
    },

    track: {
      show: true,
      background: '#f2f2f2',    // track background color
      strokeWidth: '97%',
      margin: 5                 // margin between tracks
    },

    dataLabels: {
      name: {
        show: true,
        fontSize: '16px'
      },
      value: {
        show: true,
        fontSize: '14px',
        formatter: (val) => `${val}%`
      },
      total: {
        show: true,
        label: 'Total',
        formatter: (w) => {
          const total = w.globals.seriesTotals.reduce((a, b) => a + b, 0)
          return `${(total / w.globals.series.length).toFixed(1)}%`
        }
      }
    }
  }
}
```

### Polar Area

```js
plotOptions: {
  polarArea: {
    rings: {
      strokeWidth: 1,
      strokeColor: '#e8e8e8'
    },
    spokes: {
      strokeWidth: 1,
      connectorColors: '#e8e8e8'
    }
  }
}
```

---

## Complete Working Example — Donut with Center Label

```html
<div id="chart"></div>
<script type="module">
  import ApexCharts from 'apexcharts'

  const options = {
    chart: {
      type: 'donut',
      height: 350
    },
    series: [44, 55, 41, 17, 15],
    labels: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    plotOptions: {
      pie: {
        donut: {
          size: '65%',
          labels: {
            show: true,
            name: { show: true },
            value: {
              show: true,
              formatter: (val) => `${val} tasks`
            },
            total: {
              show: true,
              label: 'Total',
              formatter: (w) => {
                return w.globals.seriesTotals.reduce((a, b) => a + b, 0) + ' tasks'
              }
            }
          }
        }
      }
    },
    legend: { position: 'bottom' },
    title: { text: 'Tasks by Day', align: 'center' }
  }

  const chart = new ApexCharts(document.querySelector('#chart'), options)
  await chart.render()
</script>
```

---

## Family-Specific Pitfalls

1. **Using axis-chart series format** — `series: [{ name: 'A', data: [44, 55] }]` is WRONG for pie/donut. The x/y object form `series: [{ data: [{ x: 'A', y: 44 }] }]` works (ApexCharts normalizes it), but the canonical form is preferred: `series: [44, 55]` (flat array) + `labels: ['A', 'B']`.
2. **RadialBar values above 100** — values represent percentages and will overflow. If you have raw values, calculate percentages first: `(value / max) * 100`.
3. **Missing `labels` array** — without `labels`, pie/donut slices show as "undefined" in tooltips and legend.
4. **Donut center labels not showing** — must set `plotOptions.pie.donut.labels.show: true` explicitly.
5. **`total.formatter` signature** — receives `w` (the full chart config object), NOT a simple value. Access `w.globals.seriesTotals` for the array of current values.
6. **Polar Area confused with Radar** — polar area uses `series: [num]` (flat), radar uses `series: [{ data: [num] }]` (axis format). They look similar but have different data shapes.
7. **Looking for `plotOptions.gauge`**: it does not exist. Gauge is a `radialBar` alias; configure `shape`, `bands`, `ticks`, `needle`, and `min`/`max` under `plotOptions.radialBar`.
8. **Gauge value outside `min`/`max`**: unlike a plain radialBar (fixed 0-100), a gauge maps its value to the `min..max` domain you set. A value beyond that domain saturates at the arc ends.
9. **Legend click now toggles the slice (v6.7 behavior change)**: on pie, donut, and polarArea a legend click hides and shows the slice (like other chart types). Previously it darkened and expanded the slice. If your app relied on the old darken-and-expand behavior, review this.
10. **Expecting `unit` / `waffle` without a license to be watermark-free**: they are premium and render an `APEXCHARTS` watermark until an entitled `premium`/`enterprise` license is set. Sunburst, by contrast, is free.
