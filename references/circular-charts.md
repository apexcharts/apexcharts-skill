# Circular Charts Reference — ApexCharts

## Chart Types Covered

- **Pie** (`'pie'`) — Standard pie chart
- **Donut** (`'donut'`) — Pie chart with hollow center
- **Polar Area** (`'polarArea'`) — Radial segments with equal angles, varying radius
- **Radial Bar** (`'radialBar'`) — Circular progress/gauge chart

## Tree-Shakeable Import

```js
import ApexCharts from 'apexcharts/pie'
// Registers: pie, donut, polarArea
// Aliases: apexcharts/donut, apexcharts/polarArea

import ApexCharts from 'apexcharts/radialBar'
// Registers: radialBar (separate entry point)
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
