# Circular Charts Reference — ApexCharts

## Chart Types Covered

- **Pie** (`'pie'`) — Standard pie chart
- **Donut** (`'donut'`) — Pie chart with hollow center
- **Polar Area** (`'polarArea'`) — Radial segments with equal angles, varying radius
- **Radial Bar** (`'radialBar'`): Circular progress chart (one or more concentric tracks)
- **Gauge** (`'gauge'`, **new in v6**): Single-value gauge with arc/needle shapes, colored bands, and ticks
- **Sunburst** (`'sunburst'`, **new in v6.7, free**): Hierarchical nested pie/donut; concentric rings, one per level
- **Unit / Waffle** (`'unit'` / `'waffle'`, **new in v6.6, premium**): One mark per unit of value (dot clusters, pictograms, waffles, beeswarms, parliament, custom layouts and the v6.10 shape kit)

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

import { heart, outlined, glyphs, preview } from 'apexcharts/unit-shapes'
// Unit-chart shape kit (v6.10), named exports tree-shaken per shape. See "Unit shapes" below.

import { person, registerMarks } from 'apexcharts/pictograms'
// Pictogram glyph collection (v7.0), one drawn mark per unit. See "Pictograms" below.
```

All of these are **Tier 1** (in the default `apexcharts` bundle). Nothing in the circular family is Tier 2.

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

A `unit` chart renders one discrete mark for every unit of value instead of a single bar or slice, so "37 of 200" reads as a countable quantity. It is a **non-axis** chart (dispatched like pie or treemap) and is **premium**: it renders fully in trial mode with an `APEXCHARTS` watermark until an entitled license is set (see `references/feature-platform.md`). On every update each mark tweens from its old position to its new one, so re-grouping, filtering, or a changing count re-forms the marks.

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
- `scatter`: a beeswarm on real value axes (`scatter.y: 'lanes'` default, or `'value'` for a 2D value-value plot; `scatter.sizeRange` for area-scaled bubbles). Since **v6.7.1** `scatter.orientation: 'horizontal' | 'vertical'` picks the beeswarm axis (lanes mode only): `'horizontal'` (default) puts the value on X with category lanes on Y; `'vertical'` puts the value on Y with lanes as columns. The value-axis keys (`xMin`/`xMax`/`xTitle`/`xFormatter`/`tickAmount`) describe the value axis in both orientations.
- `arc` (**v6.7**): a parliament / hemicycle, seats in concentric arced rows across an annulus, filled in category order.
- `custom` (**v6.9**): positions come from you. `plotOptions.unit.positions` is either a function `(objects, rect) => [{ id, x, y, r? }]` or the name of a layout registered with `ApexCharts.registerUnitLayout(name, fn)`. `objects` carries identity and data per mark (`{ id, index, seriesIndex, dataPointIndex, label, value, datum, r }`), `rect` is the plot area in pixels. A layout is objects in, positions out; the engine already tweens position, radius, and colour and keeps mark identity across a relayout. Marks whose id the provider omits animate out; unknown ids are ignored.

**Also available:** `shape` (`'circle'` | `'square'` | `'image'` pictogram with `image.tint`); per-mark object data `series: [{ name, data: [{ value, x, z, name, fillColor, id }] }]`; `transition` (`'group'` default | `'flow'` crowd migration | `'identity'` keyed by `id`/`name`); numeric or `'auto'` dot `size`; `sizeByValue` bubbles; `unitValue` (1 mark = N units); `maxUnits` cap; per-cluster `clusterLabels`; and per-mark `tooltip.formatter`.

**Motion (v6.9):** marks travel on a damped spring by default, so an update landing mid-flight retargets with the marks' velocity instead of restarting them (a dragged slider reads as continuous motion, not stutter). Configure via `plotOptions.unit.gather`: `motion: 'auto' | 'spring' | 'tween'`, `spring: 'crisp' | 'gentle' | 'snappy'`, `easing: 'outCubic' | 'inOutCubic' | 'outBack'` (setting `easing` implies tween), and `enter: 'burst' | 'fade' | 'rise'`.

### Unit shapes (`apexcharts/unit-shapes`, v6.10)

A companion kit of **39 shapes** a count can take (a heart, a house, a globe, the figure 1,024 drawn in 1,024 dots). Each shape is a plain callable layout, so it plugs straight into `plotOptions.unit.positions` with `layout: 'custom'`; no registration step. The entry point is tree-shaken per shape (about 4 KB gzipped each). Dots are packed to fill the outline, so one shape serves 40 dots in a sparkline and 3,000 in a poster.

```js
import ApexCharts from 'apexcharts'
import { heart } from 'apexcharts/unit-shapes'

new ApexCharts(el, {
  chart: { type: 'unit' },
  series: [57600, 16800, 4200, 3400],
  labels: ['Repeat donors', 'First-time', 'Workplace drives', 'Emergency call-ups'],
  plotOptions: {
    unit: { layout: 'custom', positions: heart, unitValue: 100 },
  },
}).render()
```

Three kinds:

- **Silhouettes** (29, filled outlines): `heart`, `house`, `tree`, `leaf`, `flame`, `droplet`, `fish`, `sun`, `human`, `group`, `star`, `crown`, `trophy`, `moneybag`, `funnel`, `shield`, `gear`, `robot`, `bulb`, `flask`, `car`, `plane`, `rocket`, `battery`, `pin`, `mountain`, `cross`, `bolt`, `arrow`.
- **Strokes** (7, packed centrelines for things with no interior): `check`, `wifi`, `pulse`, `xmark`, `percent`, `question`, `spiral`.
- **Generated** (3, positions from maths, no outline): `globe`, `target`, `pyramid`.

Composition helpers (also exported from `apexcharts/unit-shapes`):

```js
outlined(heart)                  // hollow twin: trace the outline instead of filling it (silhouettes only)
heart.with({ order: 'cols' })    // variant: where each series band lands ('rows' | 'rowsUp' | 'cols' |
                                 // 'colsRev' | 'centerOut' | 'centerIn'); battery fills like a charge
                                 // meter because its order is 'cols'
glyphs('1,024')                  // a number, drawn in that many dots (digits plus '-', '.', ',', ':')
preview(heart, { series })       // render to a standalone SVG string, no chart and no DOM (build-time galleries)
shapeFrom(path, opts?)           // your own outline, packed like the catalog's
strokeFrom(path, opts?)          // your own centreline
registerShapes([...])            // register so positions: '<name>' resolves by string
```

Every shape carries metadata on `shape` (category, kind, and `minUnits`: the count below which it stops being recognisable; asking for fewer logs a console warning naming the shape). From a script tag, `dist/unit-shapes.js` exposes the kit as the global `ApexUnitShapes` with every shape pre-registered, so `positions: 'heart'` works by name.

### Pictograms (`apexcharts/pictograms`, v7.0)

A **shape** is where the units go; a **pictogram** is what one unit looks like. They are independent, so `positions: heart` with `shape: 'pictogram'` arranges glyphs into a heart, and every other pairing is equally valid.

```js
import ApexCharts from 'apexcharts'
import { person, registerMarks } from 'apexcharts/pictograms'

registerMarks([person])   // so pictogram.mark: 'person' resolves by name

const options = {
  chart: { type: 'unit' },
  series: [120, 80],
  labels: ['Employed', 'Unemployed'],
  plotOptions: {
    unit: {
      shape: 'pictogram',
      pictogram: {
        mark: 'person',      // a registered name, a { path, viewBox?, fillRule? } object,
                             // raw path data, or an array (one per series).
                             // A datum's own `mark` overrides all of it, so one crowd can mix glyphs.
        fit: 'contain',      // which side of the glyph binds to the dot's box: 'contain' | 'width' | 'height'
        scale: 1,            // nudge for glyphs that read light
        padding: 0,          // 0..0.9 of the pitch, opening the lattice up
        fallback: 'circle',  // drawn when a mark cannot be resolved
      },
    },
  },
}
```

A glyph is drawn as one `<path>` per unit, filled in that unit's own colour: no request, no decode, no recolour filter, which is why `'pictogram'` is the shape that scales to thousands of units. There is deliberately **no size**: a glyph is fitted to the box the dot itself would have occupied, so `plotOptions.unit.size` and `spacing` size a pictogram exactly as they size a dot.

**Shipped glyphs** (each a named export, so import the one you use): `person`, `house`, `heart`, `tree`, `droplet`, `star`, `car`, `bag`, `book`, `cup`, `bulb`, `plane`. `catalog` is every glyph and ships all of them, so avoid it in an app bundle.

**Custom glyphs:** `definePictogram({ name, path, viewBox?, fillRule?, category?, source? })` builds one, `registerMarks(defs)` registers them by name, `unregisterMarks(names)` removes them, and `registeredMarkNames()` lists what resolves. Any glyph also has `.with(overrides)` for a variant with some metadata replaced.

**Versus `shape: 'image'`:** `'image'` fetches a raster or multi-colour icon (`plotOptions.unit.image.src`, with `tint: true` to recolour a monochrome icon to the category colour). Use it for multi-colour marks that should keep their own colours; use `'pictogram'` for anything that has to scale or follow the palette.

**Outer name labels (v6.10):** a shape packed with several categories can name them in the margin with a leader line to their own dots (the pie/donut outer-label mechanism), instead of needing a legend:

```js
plotOptions: {
  unit: { clusterLabels: { external: { show: true } } },
}
```

`clusterLabels.external` also takes `connector: { show, width, color, gap, length }`, `offsetX`, `offsetY`. It applies to `layout: 'custom'` only and reads best on silhouettes whose category bands stack vertically. The gutter is reserved before the dot size is chosen, so the shape stays centred but renders slightly smaller.

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
    expandOnClick: true,       // react to a slice click at all
    expandOffset: 10,          // (v6.9) how far the clicked slice slides out (px) along its mid-angle.
                               // The slice is translated, not redrawn bigger, so the quantity it
                               // encodes is unchanged. 0 keeps it in place. Ignored for polarArea.
    hoverOutline: {            // (v6.9) hover traces a translucent band outside the slice rim
      show: true,              // instead of lightening the fill
      size: 8,                 // band thickness (px)
      gap: 0,                  // clearance between slice rim and band (px)
      opacity: 0.3,
      color: undefined         // defaults to the hovered slice's own color
    },
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
11. **Slice click behavior changed (v6.9)**: clicking a pie/donut slice now slides it out along its own mid-angle (`plotOptions.pie.expandOffset`, default 10 px) instead of darkening it and redrawing it at a larger radius, and hover traces an outline band (`plotOptions.pie.hoverOutline`) instead of lightening the fill. Set `expandOffset: 0` to keep slices in place; set `states.hover.filter.type: 'none'` to suppress the hover band.
12. **Unit shapes below `minUnits`**: each `apexcharts/unit-shapes` shape declares the minimum dot count at which it still reads. Feeding fewer units logs a console warning naming the shape; pick a simpler shape or raise `unitValue` so the count lands above the threshold.
13. **Confusing a shape with a pictogram** *(v7.0)*: `plotOptions.unit.positions` (from `apexcharts/unit-shapes`) is **where** the units go; `plotOptions.unit.shape: 'pictogram'` + `pictogram.mark` (from `apexcharts/pictograms`) is **what one unit looks like**. They compose freely.
14. **Setting a size on a pictogram** *(v7.0)*: there is no `pictogram.size`. A glyph is fitted to the box the dot would have occupied, so use `plotOptions.unit.size` and `spacing`. Use `pictogram.scale` only to nudge a glyph that reads light.
15. **Pie / radial charts pinned to the top of a tall container** *(fixed v7.1)*: the centre came from `min(width, height)`, so a tall, narrow container put the circle at the top with the leftover space below it. The circle now centres in the height it actually has. If you carried a manual `offsetY` to work around this, remove it.
