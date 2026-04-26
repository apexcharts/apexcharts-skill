# Financial Charts Reference — ApexCharts

## Chart Types Covered

- **Candlestick** (`'candlestick'`) — OHLC (Open, High, Low, Close) financial chart
- **Box Plot** (`'boxPlot'`) — Statistical distribution chart showing min, Q1, median, Q3, max

## Tree-Shakeable Import

```js
import ApexCharts from 'apexcharts/candlestick'
// Registers: candlestick, boxPlot
// Alias: apexcharts/boxPlot
```

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
2. **Box Plot with wrong array length** — must be exactly 5 values `[min, Q1, median, Q3, max]`. Fewer or more values cause rendering errors.
3. **Using simple numeric array** — `data: [10, 20, 30]` does NOT work for candlestick/boxPlot. Each point requires an array in `y`.
4. **Missing `xaxis.type: 'datetime'`** — candlestick charts with date x-values need `xaxis: { type: 'datetime' }` to format dates correctly.
5. **Confusing candlestick with boxPlot** — candlestick is 4 values (OHLC), boxPlot is 5 values (five-number summary). They share the same entry point but have different data shapes.
