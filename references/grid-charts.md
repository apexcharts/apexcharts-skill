# Grid Charts Reference — ApexCharts

## Chart Types Covered

- **Heatmap** (`'heatmap'`) — Color-coded grid cells representing data intensity
- **Treemap** (`'treemap'`) — Nested rectangles with area proportional to value
- **Icicle** (`'icicle'`) *(v7.6)* — A hierarchy as stacked bands, one per depth level

## Tree-Shakeable Import

```js
import ApexCharts from 'apexcharts/heatmap'   # heatmap only
import ApexCharts from 'apexcharts/treemap'    # treemap only
import ApexCharts from 'apexcharts/icicle'     # icicle (v7.6): opt-in, see below
```

`icicle` is **not in the default bundle**. Unlike every other type here, `import ApexCharts from 'apexcharts'` does not carry its class, so `chart.type: 'icicle'` throws until the sub-entry (or `dist/icicle.js` after the ApexCharts script) has registered it. Loading the full bundle is not a workaround, which is what the v7.6.1 error message was corrected to stop suggesting.

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

#### Continuous numeric / datetime x-axis (v6.4)

By default a heatmap tiles one cell per column by index. On a **numeric or datetime** x-axis (`xaxis.type: 'numeric'` or `'datetime'`), cells are instead placed at their real x value, so irregular spacing and gaps render as real empty space: a missing hour is a gap in the grid, not a squeezed column, and the axis shows sparse proportional ticks rather than one label per cell. Rows stay categorical (one series per row).

```js
{
  chart: { type: 'heatmap', height: 350 },
  xaxis: { type: 'datetime' },
  series: [{
    name: 'Server 1',
    data: [
      { x: new Date('2024-01-01T09:00').getTime(), y: 20 },
      { x: new Date('2024-01-01T11:00').getTime(), y: 80 }, // 10:00 is absent -> real gap
      { x: new Date('2024-01-01T12:00').getTime(), y: 65 }
    ]
  }]
}
```

#### Canvas rendering for large heatmaps (v6.4)

With `chart.renderer: 'canvas'` (or `'auto'` past `chart.rendererThreshold`) and the canvas feature imported, heatmap cells paint to a single canvas instead of one `<rect>` per cell, which is several times faster for large grids (roughly 3x at 50,000+ cells).

```js
import ApexCharts from 'apexcharts'
import 'apexcharts/features/renderer-canvas'

const options = {
  chart: {
    type: 'heatmap',
    renderer: 'canvas',   // 'svg' | 'canvas' | 'auto'
  },
}
```

#### Heatmap default changes (v6.4)

Three heatmap defaults changed in 6.4.0. Each is a default, not a removal:

- **Tooltip anchored above the cell.** The heatmap tooltip now sits centered above the hovered cell with a downward arrow pointing at it (flipping below when the cell is against the top edge), instead of following the cursor.
- **Zoom is off by default.** Re-enable with `chart.zoom: { enabled: true }` if you need it.
- **Y-axis label thinning.** Dense y-axis (row) labels are thinned to fit.

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

### Nested Treemap (v6.9)

A datum may carry `children` to any depth; every branch is drawn as a real container with a header strip and its children inset below it, and a container's area is exactly the sum of its children. A branch normally omits `y` and takes the sum of its children; a leaf supplies one. Flat inputs are untouched and render identically to before.

```js
{
  chart: { type: 'treemap', height: 400 },
  series: [{
    data: [
      { x: 'Technology', children: [
        { x: 'Software', children: [
          { x: 'Acme Corp', y: 120 },
          { x: 'Initech', y: 80 }
        ] },
        { x: 'Hardware', y: 95 }
      ] },
      { x: 'Energy', children: [
        { x: 'Solar Co', y: 60 },
        { x: 'Wind Ltd', y: 45 }
      ] }
    ]
  }]
}
```

Nested-specific options under `plotOptions.treemap`:

```js
plotOptions: {
  treemap: {
    nested: {
      enabled: true,           // 'auto' behavior: parents appear as soon as the data is nested;
                               // false forces the flat two-level layout
      drilldownAsLevels: false // read `drilldown: '<id>'` ids on data points as extra levels
                               // instead of as click targets for the drilldown feature.
                               // Default false ("descend on click" is the historical meaning)
    },
    parents: {                 // how branch containers are drawn once the data is nested
      show: 'auto'             // 'auto' (on when the data carries children) | true | false
      // plus header/label styling and a tooltip.formatter receiving
      // { name, value, depth, leafCount, percentOfParent, percentOfTotal, node, w }
    },
    levels: [ /* per-depth overrides of `parents`, indexed from the outermost drawn group */ ]
  }
}
```

The hierarchy resolver is shared with sunburst, including the `drilldown: '<id>'` adapter (opted into via `nested.drilldownAsLevels`).

### Icicle (v7.6)

Same hierarchy as the sunburst, drawn in cartesian coordinates: one band per depth level, each child sized inside its parent's extent along the value axis. Axis-style `[{ data: [...] }]` wrapper, `{ x, y, children }` nodes to any depth.

```js
import ApexCharts from 'apexcharts/icicle'   // required: not in the default bundle

const options = {
  chart: { type: 'icicle' },
  series: [{
    data: [
      { x: 'Mobile', y: 55, children: [
        { x: 'iOS', y: 30, children: [{ x: 'iOS 17', y: 18 }, { x: 'iOS 16', y: 9 }] },
        { x: 'Android', y: 23 }
      ] },
      { x: 'Desktop', y: 33, children: [{ x: 'Windows', y: 20 }, { x: 'macOS', y: 10 }] }
    ]
  }]
}
```

- A branch may **omit its own `y`** and be the sum of its children. This is the documented shape for both partition types, and it only started working in v7.6: before that the non-axis parser dropped any node carrying `children` without `x` and `y`, and the chart drew nothing at all while warning about pie data.
- A node may carry `drilldown: '<id>'` instead of `children`, and the matching `drilldown.series` entry is read as the next level. It is read as plain data, so no drilldown feature import is needed.
- Sibling order follows the array by default (`sort: 'none'`). Set `plotOptions.icicle.sort` to `'value'` or `'name'` to override it.

**Choosing between icicle and sunburst.** Both resolve the same tree. An icicle keeps labels horizontal at every depth and puts depth on a straight axis, so same-depth siblings line up across branches and deep trees stay readable; a sunburst spends its area radially and reads better for shallow, wide trees. `direction: 'up'` is the flame-graph orientation, for call stacks and path funnels.

---

## Key plotOptions

### Heatmap

```js
plotOptions: {
  heatmap: {
    shape: 'rect',                // 'rect' (default) | 'hexagon' | 'circle' | 'diamond' (v7.2)
    radius: 0,                    // border radius of cells ('rect' only)
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

#### Cell shapes (v7.2)

`shape` changes what a cell is drawn as, without changing the data format or anything else about the chart:

- `'circle'` and `'diamond'` are inscribed in the cell box the heatmap already lays out.
- `'hexagon'` is a real honeycomb tilemap: pointy-top hexagons, alternate rows offset half a cell so neighbours share a full edge, with the lattice's overhang reserved as extra grid padding so offset rows never cover the axis labels.

Three constraints worth knowing before choosing one:

- **`radius` applies to `'rect'` only.** Corner rounding is ignored by the other three.
- **`'hexagon'` is categorical-layout only.** On a numeric or datetime x axis it falls back to `'rect'` silently.
- **Non-rect shapes always render as SVG.** The canvas renderer declines them the same way it declines image fills, so a large heatmap that needs `renderer: 'canvas'` for its cell count has to stay on `'rect'`.

Shaped cells keep the `apexcharts-heatmap-rect` class and the same attribute contract, so tooltips, keyboard navigation, legend range highlighting and the color tween on a data update all behave unchanged.

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

### Icicle (v7.6)

```js
plotOptions: {
  icicle: {
    direction: 'down',        // 'down' (root on top, default) | 'up' (flame graph) | 'right' | 'left'
    levelSize: 'equal',       // 'equal' | px number | '%' string: thickness of one depth band
    maxDepth: 'auto',         // 'auto' (whole tree) | number of levels from the focused one
    spacing: 1,               // gap between adjacent cells (px)
    borderRadius: 0,          // corner rounding (px)
    leaf: 'stop',             // 'stop' (default): a shallow branch ends at its own band
                              // 'extend': it stretches to the far edge
    partition: 'normalize',   // 'normalize' | 'strict'
    sort: 'none',             // 'none' | 'value' | 'name'
    tint: 0,                  // per-depth lightening of the parent colour (0 = same, 1 = white)
    zoomOnClick: true,        // click a cell to zoom into its branch (breadcrumb to go back)
    zoomType: 'value',        // 'value' (default) | 'both'
    dataLabels: {
      show: true,
      minSizeToShow: 30,      // hide the label on cells shorter than this (px)
      align: 'center',        // 'left' | 'center' | 'right'; a flame graph wants 'left'
      rotate: 'auto',         // 'auto' | 'always' | 'never'
      showValue: false,
      style: { fontSize: '12px', fontFamily: undefined, fontWeight: 400, colors: undefined }
    }
  }
}
```

Four defaults differ from the sunburst's, each for a reason worth knowing before overriding it:

- **`leaf: 'stop'`** leaves the white space that shows how deep each branch goes. `'extend'` fills the plot, which is what a treemap does and makes an icicle stop reading as a hierarchy.
- **`tint: 0`** keeps one hue per branch, so the eye can follow a branch down the levels.
- **The palette lands on the shallowest level that branches.** A single-root tree is the normal shape here, and colouring by root would paint everything one hue.
- **The legend is off**, since every cell carries its own label.

**`zoomType` is the one to understand.** `'value'` (the default) rescales the value axis only: the clicked branch stretches to fill the width, its subtree stretches with it, and no level moves. The ancestors stay above it, clamped to the plot, which is what makes them read as context. `'both'` also re-bands the depth axis, promoting the branch to the top level, which spends the whole plot on it at the cost of the reader's place in the tree. The values are not called `'x'` and `'y'` because `direction` decides which screen axis the value axis is.

A click that would not change the view is refused rather than performed: clicking a lone root, or a leaf inside the focused branch, leaves the chart alone, and the cursor reads `pointer` only on cells where a zoom would actually move something.

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
5. **Nested treemap branch carrying its own `y` (v6.9)**: a branch node normally omits `y`; its area is the sum of its children. Only leaves supply values. Flattening a hierarchy by hand is no longer necessary; pass `children` instead.
6. **`chart.type: 'icicle'` on the default bundle (v7.6)** — icicle is opt-in and the default build carries no class for it, so this throws. Add `import ApexCharts from 'apexcharts/icicle'` (or load `dist/icicle.js` after the ApexCharts script). Loading the full `apexcharts.js` does **not** help: it does not carry the class either.
7. **Reaching for `zoomType: 'both'` to make a branch fill the plot** — `'value'` already stretches the branch across the full width; what `'both'` additionally does is move every level, which costs the reader their place in the tree. Change it only when the ancestors genuinely do not matter.
8. **Expecting `sort: 'value'` on a flame graph** — `'name'` is the flame-graph convention, because it holds a frame in the same place across profiles so two runs of one program can be compared by eye.
