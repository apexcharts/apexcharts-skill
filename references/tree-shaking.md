# Tree-Shaking & Bundle Optimization — ApexCharts

## Overview

ApexCharts supports three import strategies with different bundle sizes:

| Strategy | Import | Includes |
|---|---|---|
| Full bundle | `import ApexCharts from 'apexcharts'` | All 16 chart types + all features |
| Per-type entry | `import ApexCharts from 'apexcharts/line'` | Specific chart family + core (no optional features) |
| Bare core | `import ApexCharts from 'apexcharts/core'` | Core class only — must manually register everything |

---

## Per-Type Entry Points

Each entry point registers a family of related chart types:

| Entry Point | Chart Types Registered |
|---|---|
| `apexcharts/line` | line, area, scatter, bubble, rangeArea |
| `apexcharts/area` | same as /line |
| `apexcharts/scatter` | same as /line |
| `apexcharts/bubble` | same as /line |
| `apexcharts/rangeArea` | same as /line |
| `apexcharts/bar` | bar, column, rangeBar |
| `apexcharts/column` | same as /bar |
| `apexcharts/rangeBar` | same as /bar |
| `apexcharts/candlestick` | candlestick, boxPlot |
| `apexcharts/boxPlot` | same as /candlestick |
| `apexcharts/pie` | pie, donut, polarArea |
| `apexcharts/donut` | same as /pie |
| `apexcharts/polarArea` | same as /pie |
| `apexcharts/radialBar` | radialBar |
| `apexcharts/radar` | radar |
| `apexcharts/heatmap` | heatmap |
| `apexcharts/treemap` | treemap |

### Using Multiple Chart Types

```js
// Import multiple entry points for a mixed chart
import ApexCharts from 'apexcharts/line'
import 'apexcharts/bar'   // side-effect: registers bar types onto the same class
```

---

## Optional Features

Features are optional modules that add functionality. When using per-type entries or core, features must be explicitly imported.

| Feature | Import | What It Adds |
|---|---|---|
| Legend | `import 'apexcharts/features/legend'` | Interactive legend component |
| Toolbar | `import 'apexcharts/features/toolbar'` | Zoom, pan, download buttons |
| Annotations | `import 'apexcharts/features/annotations'` | X/Y/point/text/image annotations |
| Exports | `import 'apexcharts/features/exports'` | `dataURI()`, `getSvgString()`, `exportToCSV()` |
| Keyboard | `import 'apexcharts/features/keyboard'` | Keyboard navigation (accessibility) |
| All | `import 'apexcharts/features/all'` | All of the above |

**Important:** Tooltip is always included in core — it cannot be tree-shaken.

### What Happens If You Forget a Feature

Features fail **silently**. If you use a per-type entry without importing legend:
- No legend appears, no error thrown
- `chart.toolbar` is undefined, toolbar doesn't render
- `addXaxisAnnotation()` does nothing
- `dataURI()` / `exportToCSV()` throw because the feature isn't registered

---

## Bare Core Usage

For maximum control, import core and register everything manually:

```js
import ApexCharts from 'apexcharts/core'

// Register chart types manually
import { Line } from 'apexcharts/src/charts/Line.js'
ApexCharts.use({ line: Line, area: Line })

// Register features manually
import { Legend } from 'apexcharts/src/modules/legend/Legend.js'
ApexCharts.registerFeatures({ legend: Legend })
```

This approach is rarely needed — per-type entries with feature imports cover most use cases.

---

## Example: Minimal Line Chart Bundle

```js
import ApexCharts from 'apexcharts/line'
import 'apexcharts/features/legend'
import 'apexcharts/features/toolbar'

const chart = new ApexCharts(el, {
  chart: { type: 'line', height: 350 },
  series: [{ data: [10, 20, 30] }],
  xaxis: { categories: ['A', 'B', 'C'] }
})
await chart.render()
```

## Example: Mixed Chart (Line + Bar)

```js
import ApexCharts from 'apexcharts/line'
import 'apexcharts/bar'
import 'apexcharts/features/legend'

const chart = new ApexCharts(el, {
  chart: { type: 'line', height: 350 },
  series: [
    { name: 'Revenue', type: 'column', data: [44, 55, 57] },
    { name: 'Profit', type: 'line', data: [15, 25, 35] }
  ],
  xaxis: { categories: ['Q1', 'Q2', 'Q3'] }
})
await chart.render()
```

---

## Vite Configuration

When using Vite with tree-shaking entries, configure `optimizeDeps` to prevent duplicate bundles:

```js
// vite.config.js
export default {
  optimizeDeps: {
    include: [
      'apexcharts/line',
      'apexcharts/features/legend',
      'apexcharts/features/toolbar'
      // Add all apexcharts entries you use
    ]
  }
}
```

---

## Common Pitfalls

1. **Missing feature imports** — features fail silently. If legend/toolbar/annotations don't appear, check imports.
2. **Importing `apexcharts` AND `apexcharts/line`** — creates duplicate bundles. Use one strategy.
3. **Vite duplicate bundle issue** — without `optimizeDeps.include`, Vite may bundle ApexCharts twice.
4. **Calling `dataURI()` without exports feature** — throws an error. Import `apexcharts/features/exports` first.
