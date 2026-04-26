# Grid Charts Reference — ApexCharts

## Chart Types Covered

- **Heatmap** (`'heatmap'`) — Color-coded grid cells representing data intensity
- **Treemap** (`'treemap'`) — Nested rectangles with area proportional to value

## Tree-Shakeable Import

```js
import ApexCharts from 'apexcharts/heatmap'   # heatmap only
import ApexCharts from 'apexcharts/treemap'    # treemap only
```

---

## Data Formats

### Heatmap

Each series is a row; each data point is a cell. The `y` value determines the color intensity.

```js
{
  chart: { type: 'heatmap', height: 350 },
  series: [
    {
      name: 'Monday',
      data: [
        { x: '9am', y: 20 },
        { x: '10am', y: 45 },
        { x: '11am', y: 80 },
        { x: '12pm', y: 65 }
      ]
    },
    {
      name: 'Tuesday',
      data: [
        { x: '9am', y: 35 },
        { x: '10am', y: 60 },
        { x: '11am', y: 40 },
        { x: '12pm', y: 55 }
      ]
    }
  ]
}
```

### Treemap

Flat list of `{ x, y }` where `x` is the label and `y` is the value (determines area).

```js
{
  chart: { type: 'treemap', height: 350 },
  series: [{
    data: [
      { x: 'New York', y: 218 },
      { x: 'Los Angeles', y: 149 },
      { x: 'Chicago', y: 106 },
      { x: 'Houston', y: 92 },
      { x: 'Phoenix', y: 65 }
    ]
  }]
}
```

### Treemap with Groups (multiple series)

```js
{
  chart: { type: 'treemap', height: 350 },
  series: [
    {
      name: 'Fruits',
      data: [
        { x: 'Apple', y: 100 },
        { x: 'Banana', y: 80 },
        { x: 'Orange', y: 60 }
      ]
    },
    {
      name: 'Vegetables',
      data: [
        { x: 'Carrot', y: 70 },
        { x: 'Potato', y: 90 }
      ]
    }
  ]
}
```

---

## Key plotOptions

### Heatmap

```js
plotOptions: {
  heatmap: {
    radius: 0,                    // border radius of cells
    enableShades: true,           // shade intensity based on value
    shadeIntensity: 0.5,          // shade range (0-1)
    distributed: false,           // different color per series

    colorScale: {
      ranges: [
        { from: 0, to: 30, color: '#00A100', name: 'Low' },
        { from: 31, to: 60, color: '#128FD9', name: 'Medium' },
        { from: 61, to: 100, color: '#FFB200', name: 'High' }
      ],
      inverse: false,
      min: undefined,             // override auto-detected min
      max: undefined              // override auto-detected max
    },

    useFillColorAsStroke: false
  }
}
```

### Treemap

```js
plotOptions: {
  treemap: {
    enableShades: true,
    shadeIntensity: 0.5,
    distributed: false,            // true = different color per cell

    colorScale: {
      ranges: [
        { from: 0, to: 50, color: '#CD363A' },
        { from: 51, to: 100, color: '#52B12C' }
      ]
    },

    useFillColorAsStroke: false
  }
}
```

---

## Complete Working Example — Heatmap

```html
<div id="chart"></div>
<script type="module">
  import ApexCharts from 'apexcharts'

  // Generate sample heatmap data
  function generateData(count, range) {
    const hours = ['9am', '10am', '11am', '12pm', '1pm', '2pm', '3pm', '4pm', '5pm']
    return hours.slice(0, count).map(hour => ({
      x: hour,
      y: Math.floor(Math.random() * (range.max - range.min + 1)) + range.min
    }))
  }

  const options = {
    chart: { type: 'heatmap', height: 350 },
    series: [
      { name: 'Monday', data: generateData(9, { min: 0, max: 90 }) },
      { name: 'Tuesday', data: generateData(9, { min: 0, max: 90 }) },
      { name: 'Wednesday', data: generateData(9, { min: 0, max: 90 }) },
      { name: 'Thursday', data: generateData(9, { min: 0, max: 90 }) },
      { name: 'Friday', data: generateData(9, { min: 0, max: 90 }) }
    ],
    plotOptions: {
      heatmap: {
        colorScale: {
          ranges: [
            { from: 0, to: 30, color: '#00A100', name: 'Low' },
            { from: 31, to: 60, color: '#128FD9', name: 'Medium' },
            { from: 61, to: 90, color: '#FFB200', name: 'High' }
          ]
        }
      }
    },
    dataLabels: { enabled: true },
    title: { text: 'Office Activity Heatmap' }
  }

  const chart = new ApexCharts(document.querySelector('#chart'), options)
  await chart.render()
</script>
```

---

## Family-Specific Pitfalls

1. **Heatmap with simple numeric arrays** — `data: [10, 20, 30]` does NOT work. Each point must be `{ x, y }` where `y` is the intensity value.
2. **Inconsistent x-values across heatmap series** — all series should have the same set of x-values to form a proper grid. Missing cells show as gaps.
3. **Treemap with negative values** — treemap `y` values must be positive (they represent area). Negative values cause rendering issues.
4. **Confusing heatmap `y` with position** — in heatmap data `{ x, y }`, the `y` is the VALUE (color intensity), NOT the y-axis position. The series `name` determines the row.
