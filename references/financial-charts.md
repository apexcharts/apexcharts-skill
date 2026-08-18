# Financial & Statistical Charts Reference — ApexCharts

## Chart Types Covered

- **Candlestick** (`'candlestick'`) — OHLC (Open, High, Low, Close) financial chart
- **Box Plot** (`'boxPlot'`) — Statistical distribution chart showing min, Q1, median, Q3, max
- **Violin** (`'violin'`, **new in v6**): Statistical distribution chart showing a density curve per category, optionally with the raw sample points overlaid as jitter
- **Histogram** (`'histogram'`, **new in v6.9**): Bins raw observations into columns; the series carries the sample, the chart does the aggregating

## Tree-Shakeable Import

```js
import ApexCharts from 'apexcharts/candlestick'
// Registers: candlestick, boxPlot
// Alias: apexcharts/boxPlot

import ApexCharts from 'apexcharts/violin'
// Registers: violin (separate entry point, new in v6)

import ApexCharts from 'apexcharts/histogram'
// Registers: histogram (v6.9), the bar engine plus the stats feature

// The statistics (histogram binning, boxPlot/violin raw-sample summaries,
// rowSeries()) live behind one optional feature. apexcharts/histogram already
// includes it; boxPlot/violin raw samples need it explicitly when tree-shaking:
import 'apexcharts/features/stats'
```

**Raw samples (v6.9):** boxPlot, violin, and histogram can all take the raw observations and compute the statistics themselves (quartiles for boxPlot, KDE density for violin, bin counts for histogram). Precomputed summaries keep working exactly as before. With the full `apexcharts` bundle the stats feature is always present; with tree-shaking entries it must be imported (without it, a raw-sample boxPlot/violin datum has nothing to summarize and a histogram warns and draws nothing).

---

## Data Formats

### Candlestick — OHLC

The `y` value must be an array of exactly 4 numbers: `[Open, High, Low, Close]`

```js
{
  chart: { type: 'candlestick', height: 350 },
  series: [{
    data: [
      { x: new Date('2024-01-01').getTime(), y: [51.98, 56.29, 51.59, 53.85] },
      { x: new Date('2024-01-02').getTime(), y: [53.66, 54.99, 51.35, 52.95] },
      { x: new Date('2024-01-03').getTime(), y: [52.76, 57.35, 52.15, 57.03] }
    ]
  }],
  xaxis: { type: 'datetime' }
}
```

**Alternative 2D array formats:**

```js
// Nested: [x, [O, H, L, C]]
data: [
  [new Date('2024-01-01').getTime(), [51.98, 56.29, 51.59, 53.85]],
  [new Date('2024-01-02').getTime(), [53.66, 54.99, 51.35, 52.95]]
]

// Flat: [x, O, H, L, C] (5 elements)
data: [
  [new Date('2024-01-01').getTime(), 51.98, 56.29, 51.59, 53.85],
  [new Date('2024-01-02').getTime(), 53.66, 54.99, 51.35, 52.95]
]
```

### Box Plot — Five-Number Summary

The `y` value must be an array of exactly 5 numbers: `[min, Q1, median, Q3, max]`

```js
{
  chart: { type: 'boxPlot', height: 350 },
  series: [{
    data: [
      { x: 'Jan 2024', y: [54, 66, 69, 75, 88] },
      { x: 'Feb 2024', y: [43, 65, 69, 76, 81] },
      { x: 'Mar 2024', y: [31, 39, 45, 51, 59] }
    ]
  }]
}
```

### Box Plot: Raw Sample (v6.9)

Instead of a five-number `y`, a datum may supply the raw observations in `points` and the library computes the summary (quartiles interpolate between ranks, R type 7). Requires `apexcharts/features/stats` when tree-shaking. `points` is the same field used for the jitter-dot overlay, so the sample lives in one place whether you summarize it or the library does.

```js
{
  chart: { type: 'boxPlot', height: 350 },
  series: [{
    data: [
      { x: 'Phone', points: [1.2, 1.9, 3.4, 2.2, 2.8, 4.1, 1.7] },
      { x: 'Tablet', points: [2.4, 3.1, 3.9, 2.9, 4.6, 3.3] }
    ]
  }],
  plotOptions: {
    boxPlot: {
      whiskers: 'minmax',           // 'minmax' (default): whiskers reach the extremes, nothing hidden
                                    // 'tukey': stop at the last observation within 1.5 × IQR of each quartile
      points: { show: true }        // overlay the observations as jitter dots
    }
  }
}
```

- `whiskers` only applies when the summary is **derived** from `points`; a precomputed five-number `y` is drawn exactly as given.
- With `whiskers: 'tukey'`, observations beyond the fence fall outside the whisker, so pair it with `points: { show: true }` or they become invisible.
- `plotOptions.boxPlot.points` also takes `shape` (`'circle'` | `'square'`), `size`, `jitter` (0..1 fraction of the box half-width), `maxPoints` (cap per box, stride-thinned beyond), `opacity`, `fillColor` (`'series-dark'` default | `'series'` | any color), `strokeColor`, `strokeWidth`, and a value-driven `colorScale: { colors, min, max, steps }`.
- A datum with both `y` and `points` draws the given summary and overlays the points as jitter.

### Violin: Density Profile (v6)

Each point is `{ x, y: { density, points } }`:

- `density`: an array of `[value, weight]` pairs describing the precomputed density/KDE profile. Drawn exactly as given.
- `points` (optional): a flat array of raw observations, rendered as jitter dots.

```js
{
  chart: { type: 'violin', height: 420 },
  series: [{
    name: 'Session duration',
    data: [
      {
        x: 'Direct',
        y: {
          density: [[20, 0.02], [30, 0.08], [40, 0.18], [50, 0.10], [60, 0.03]], // [value, weight]
          points: [22, 31, 38, 41, 47, 52, 58]                                    // raw observations
        }
      },
      {
        x: 'Referral',
        y: {
          density: [[25, 0.03], [35, 0.12], [45, 0.20], [55, 0.09], [65, 0.02]],
          points: [27, 34, 44, 48, 53, 61]
        }
      }
    ]
  }],
  plotOptions: {
    violin: {
      bandwidthScale: 1,          // multiplies the density-derived half-width
      normalize: 'individual',     // 'individual' (each violin to its own peak) | 'group' (shared scale)
      points: { show: false }      // set show:true to overlay the raw points as jitter
    }
  }
}
```

### Violin: Raw Sample (v6.9)

A datum may instead supply only the raw observations (in `points`, no `y`) and the library derives the density itself via kernel density estimation. Requires `apexcharts/features/stats` when tree-shaking. `plotOptions.violin.kde` tunes the estimation; it is ignored when a precomputed `density` profile is given.

```js
{
  chart: { type: 'violin', height: 420 },
  series: [{
    name: 'Session duration',
    data: [
      { x: 'Direct', points: [22, 31, 38, 41, 47, 52, 58, 33, 40] },
      { x: 'Referral', points: [27, 34, 44, 48, 53, 61, 39] }
    ]
  }],
  plotOptions: {
    violin: {
      kde: {
        bandwidth: undefined,   // kernel width in value units; unset = Silverman's rule of thumb
        resolution: 64          // density samples per violin (default 64)
      },
      points: { show: true }    // the same sample doubles as the jitter overlay
    }
  }
}
```

**Orientation and per-category color come from `plotOptions.bar`** (violin reuses the bar renderer):

```js
plotOptions: {
  bar: { horizontal: true, distributed: true },  // horizontal violins, one color each
  violin: {
    normalize: 'group',
    points: { show: true, shape: 'circle', size: 3, jitter: 0.9, strokeWidth: 0 }
  }
}
```

### Histogram (v6.9)

The series carries **raw observations** (a flat number array, or `{ y }` objects), one number per event; the chart chooses the bin width and counts them. It renders through the bar pathway (like funnel, pyramid, gauge, and waffle), so stacking, zoom, export, and animation all work on the bins. Import from `apexcharts/histogram`, or add `import 'apexcharts/features/stats'` alongside `apexcharts/bar`; the full `apexcharts` bundle already includes it. Without the stats feature the chart warns and draws nothing.

```js
{
  chart: { type: 'histogram', height: 350 },
  series: [{ name: 'Latency', data: [102, 87, 143, 91, 118, 95, 132, 88, 107] }],
  plotOptions: {
    histogram: {
      bins: 'auto',        // 'auto' | 'fd' | 'sturges' | 'scott' | 'rice' | 'sqrt' | number (fixed count)
                           // 'auto' takes the narrower of Freedman-Diaconis and Sturges
      binWidth: undefined, // explicit bin width in value units; wins over `bins` when the
                           // boundaries carry meaning (decades, 5-minute buckets)
      range: undefined,    // [min, max] to bin over instead of the data's own extent
      normalize: 'count',  // 'count' | 'relative' (percent of series total) | 'density' (total area = 1)
      cumulative: false,   // running total across bins (a CDF)
      overlap: true        // multi-series: draw each series across the full bin (overlay).
                           // false = side-by-side grouped bars per bin
    }
  }
}
```

- **All series share one set of bin edges** derived from their combined extent, so two distributions stay comparable instead of putting different bars at the same x.
- `overlap: true` (the default with multiple series) also softens the fill and drops the bin separator stroke so the overlapping region reads; both remain overridable. A single series is unaffected either way.
- Do NOT pass pre-aggregated counts; that is a plain `bar` chart. The histogram's job is the binning.

### `rowSeries()`: the rows behind a summary mark (v6.9)

A histogram bin, a box, and a violin all stand for rows the chart is already holding. `chart.rowSeries()` returns them as a unit-chart series (one cluster per mark, one datum per row), so a summary can be opened into its observations:

```js
chart.updateOptions({ chart: { type: 'unit' }, series: chart.rowSeries() })
```

Returns `null` when the current type has no row source or the stats feature is not loaded. `chart.rowSeries({ maxRows })` caps the dots produced (default 3000); past the cap every cluster is thinned by one shared stride so relative sizes survive. With the `morph` feature loaded, each dot animates out of the part of the mark that stood for it.

---

## Key plotOptions

### Candlestick Colors

```js
plotOptions: {
  candlestick: {
    colors: {
      upward: '#00B746',     // color when Close > Open (bullish)
      downward: '#EF403C'    // color when Close < Open (bearish)
    },
    wick: {
      useFillColor: true     // wick color matches candle body
    }
  }
}
```

### Box Plot Colors

```js
plotOptions: {
  boxPlot: {
    colors: {
      upper: '#00E396',      // color for upper quartile
      lower: '#008FFB'       // color for lower quartile
    }
  }
}
```

---

## Complete Working Example — Candlestick Chart

```html
<div id="chart"></div>
<script type="module">
  import ApexCharts from 'apexcharts'

  const options = {
    chart: {
      type: 'candlestick',
      height: 350
    },
    series: [{
      name: 'AAPL',
      data: [
        { x: new Date('2024-01-02').getTime(), y: [185.09, 185.60, 183.66, 185.56] },
        { x: new Date('2024-01-03').getTime(), y: [184.22, 185.88, 183.43, 184.25] },
        { x: new Date('2024-01-04').getTime(), y: [182.15, 183.09, 180.88, 181.91] },
        { x: new Date('2024-01-05').getTime(), y: [181.99, 182.76, 180.17, 181.18] },
        { x: new Date('2024-01-08').getTime(), y: [181.79, 185.60, 181.32, 185.56] }
      ]
    }],
    xaxis: { type: 'datetime' },
    yaxis: {
      tooltip: { enabled: true },
      labels: { formatter: (val) => `$${val.toFixed(2)}` }
    },
    plotOptions: {
      candlestick: {
        colors: {
          upward: '#26a69a',
          downward: '#ef5350'
        }
      }
    },
    title: { text: 'AAPL Stock Price', align: 'left' }
  }

  const chart = new ApexCharts(document.querySelector('#chart'), options)
  await chart.render()
</script>
```

---

## Family-Specific Pitfalls

1. **Wrong OHLC order** — must be `[Open, High, Low, Close]`, not `[High, Low, Open, Close]` or any other order.
2. **Box Plot with wrong array length** — a summary `y` must be exactly 5 values `[min, Q1, median, Q3, max]`. Fewer or more values cause rendering errors. (Since v6.9 the alternative is no `y` at all: put the raw sample in `points` and the summary is computed.)
3. **Using simple numeric array** — `data: [10, 20, 30]` does NOT work for candlestick/boxPlot. Each point requires an array in `y` (or, for boxPlot since v6.9, a raw sample in `points`). For a distribution of a flat number array, use `chart.type: 'histogram'` instead.
4. **Missing `xaxis.type: 'datetime'`** — candlestick charts with date x-values need `xaxis: { type: 'datetime' }` to format dates correctly.
5. **Confusing candlestick with boxPlot** — candlestick is 4 values (OHLC), boxPlot is 5 values (five-number summary). They share the same entry point but have different data shapes.
6. **Violin with a plain numeric `y`**: violin points need `y: { density: [[value, weight], ...] }` or (v6.9) raw observations in `points`, not a single number. With a precomputed `density` profile it is drawn exactly as given; with raw `points` the KDE runs for you (stats feature required when tree-shaking).
7. **Violin orientation set on the wrong namespace**: horizontal violins and per-violin colors come from `plotOptions.bar` (`horizontal`, `distributed`), while `bandwidthScale`, `kde`, `normalize`, and `points` live under `plotOptions.violin`.
8. **Feeding a histogram pre-binned counts**: the series must carry raw observations. If you already have counts per bucket, use a `bar` chart; a histogram would bin your counts as if they were measurements.
9. **`whiskers: 'tukey'` on a precomputed boxPlot summary**: `plotOptions.boxPlot.whiskers` only applies when the summary is derived from `points`. A five-number `y` is drawn exactly as given.
10. **Raw samples with tree-shaking but no stats feature**: `apexcharts/candlestick` and `apexcharts/violin` alone cannot summarize `points`. Add `import 'apexcharts/features/stats'` (the `apexcharts/histogram` entry and the full bundle already include it).
