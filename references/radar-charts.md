# Radar Charts Reference — ApexCharts

## Chart Types Covered

- **Radar** (`'radar'`) — Spider/web chart comparing multiple variables across categories

## Tree-Shakeable Import

```js
import ApexCharts from 'apexcharts/radar'
// Registers: radar only
```

---

## Data Format

Radar charts use the axis-chart series format with simple numeric arrays. Categories define the spoke labels.

```js
{
  chart: { type: 'radar', height: 350 },
  series: [
    { name: 'Player A', data: [80, 50, 30, 40, 100, 20] },
    { name: 'Player B', data: [60, 70, 90, 50, 40, 60] }
  ],
  xaxis: {
    categories: ['Speed', 'Strength', 'Agility', 'Endurance', 'Accuracy', 'Teamwork']
  }
}
```

**Important:** The number of values in each `data` array must match the number of `categories`.

---

## Key plotOptions

```js
plotOptions: {
  radar: {
    size: undefined,            // radar chart radius (auto-calculated if undefined)
    offsetX: 0,
    offsetY: 0,

    polygons: {
      strokeColors: '#e8e8e8',  // polygon border color
      strokeWidth: 1,
      connectorColors: '#e8e8e8', // spoke line color

      fill: {
        colors: undefined        // alternating fill colors for concentric rings
        // e.g., ['#f8f8f8', '#fff'] for zebra striping
      }
    }
  }
}
```

---

## Complete Working Example

```html
<div id="chart"></div>
<script type="module">
  import ApexCharts from 'apexcharts'

  const options = {
    chart: { type: 'radar', height: 400 },
    series: [
      { name: 'Budget', data: [80, 50, 30, 40, 100, 20] },
      { name: 'Actual', data: [60, 70, 90, 50, 40, 60] }
    ],
    xaxis: {
      categories: ['Marketing', 'Engineering', 'Sales', 'Support', 'R&D', 'Operations']
    },
    stroke: { width: 2 },
    fill: { opacity: 0.2 },
    markers: { size: 4 },
    yaxis: { stepSize: 20 },
    title: { text: 'Budget vs Actual Spend', align: 'center' }
  }

  const chart = new ApexCharts(document.querySelector('#chart'), options)
  await chart.render()
</script>
```

---

## Family-Specific Pitfalls

1. **Missing `xaxis.categories`** — without categories, spokes have no labels. Always provide category names.
2. **Data length mismatch** — each series `data` array must have exactly as many values as there are categories.
3. **Confusing with polar area** — radar uses `series: [{ data: [...] }]` (axis format), polar area uses `series: [num]` (flat array). They look similar but have completely different data shapes.
4. **Using `{ x, y }` format** — radar charts expect simple number arrays, NOT `{ x, y }` objects.
