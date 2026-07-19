# Circular Charts Reference — ApexCharts

## Chart Types Covered

- **Pie** (`'pie'`) — Standard pie chart
- **Donut** (`'donut'`) — Pie chart with hollow center
- **Polar Area** (`'polarArea'`) — Radial segments with equal angles, varying radius
- **Radial Bar** (`'radialBar'`): Circular progress chart (one or more concentric tracks)
- **Gauge** (`'gauge'`, **new in v6**): Single-value gauge with arc/needle shapes, colored bands, and ticks

## Tree-Shakeable Import

```js
import ApexCharts from 'apexcharts/pie'
// Registers: pie, donut, polarArea
// Aliases: apexcharts/donut, apexcharts/polarArea

import ApexCharts from 'apexcharts/radialBar'
// Registers: radialBar (separate entry point)
// Also covers gauge (it normalizes to the radialBar engine in v6)
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
