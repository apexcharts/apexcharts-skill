# Framework Integration — ApexCharts

## Official Wrappers

| Framework | Package | Install |
|---|---|---|
| React | `react-apexcharts` | `npm install react-apexcharts apexcharts` |
| Vue 3 | `vue3-apexcharts` | `npm install vue3-apexcharts apexcharts` |
| Angular | `ng-apexcharts` | `npm install ng-apexcharts apexcharts` |

**Important:** All wrappers require `apexcharts` as a peer dependency. Install both packages.

**With apexcharts 8**, use ng-apexcharts 3.2.0 or later (Angular 20+): 3.1.x accepts apexcharts 6 or 7 only, so npm reports a peer conflict. react-apexcharts (2.1.1) and vue3-apexcharts (1.11.2) accept any apexcharts from 5.10 up, and vue-apexcharts (Vue 2) any from 4.0.

---

## Opt-in chart types and features (apexcharts 8)

The wrappers' standard components load the default ApexCharts bundle, which since 8.0 leaves out some chart types and features (see `references/tree-shaking.md`). Until the app imports the add-on, a wrapper chart of type `unit`, `waffle`, `sunburst`, `violin`, `icicle` or `raincloud` fails to render, and `waterfall`, `dumbbell` or `streamgraph` draws an empty plot. Import it once anywhere in the app (`main.ts`, or the component file): it registers on the ApexCharts the wrapper uses.

| You use | Add once |
|---|---|
| `unit`/`waffle`, `sunburst`, `violin`, `icicle` | `import 'apexcharts/unit'` (or `/sunburst`, `/violin`, `/icicle`) |
| `raincloud` | `import 'apexcharts/raincloud'` |
| `waterfall`, `dumbbell`, `streamgraph`, drilldown or another Tier 2 feature | `import 'apexcharts/features/<name>'` (`highlightFilter` is `features/highlight-filter`) |
| Everything | `import 'apexcharts/full'`, which reuses the default bundle the wrapper already loads |

```jsx
import Chart from 'react-apexcharts'
import 'apexcharts/sunburst'   // once per app

export default function Breakdown({ options, series }) {
  return <Chart type="sunburst" options={options} series={series} height={350} />
}
```

---

## React

### Basic Usage

```jsx
import React from 'react'
import Chart from 'react-apexcharts'

function MyChart() {
  const options = {
    chart: { type: 'line' },
    xaxis: { categories: ['Jan', 'Feb', 'Mar', 'Apr'] }
  }

  const series = [{
    name: 'Sales',
    data: [30, 40, 35, 50]
  }]

  return <Chart options={options} series={series} type="line" height={350} />
}
```

### Updating Data

Pass new `series` or `options` props — the wrapper handles `updateSeries` / `updateOptions` internally:

```jsx
function LiveChart() {
  const [series, setSeries] = useState([{ data: [30, 40, 35] }])

  const addData = () => {
    setSeries([{ data: [...series[0].data, Math.random() * 100] }])
  }

  return (
    <>
      <Chart options={options} series={series} type="line" height={350} />
      <button onClick={addData}>Add Point</button>
    </>
  )
}
```

### Common React Pitfall: Cleanup

The wrapper handles `destroy()` automatically on unmount. But if you use the vanilla API directly:

```jsx
// ❌ WRONG — no cleanup
useEffect(() => {
  const chart = new ApexCharts(ref.current, options)
  chart.render()
}, [])

// ✅ CORRECT — destroy on unmount
useEffect(() => {
  const chart = new ApexCharts(ref.current, options)
  chart.render()
  return () => chart.destroy()
}, [])
```

### SSR with Next.js

For Next.js, use dynamic import to avoid SSR issues with the wrapper:

```jsx
import dynamic from 'next/dynamic'

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false })

export default function Page() {
  return <Chart options={options} series={series} type="line" height={350} />
}
```

Or use the native SSR approach (see `references/ssr.md`).

---

## Vue 3

### Setup

```js
// main.js
import { createApp } from 'vue'
import VueApexCharts from 'vue3-apexcharts'
import App from './App.vue'

const app = createApp(App)
app.use(VueApexCharts)
app.mount('#app')
```

### Basic Usage

```vue
<template>
  <apexchart
    type="bar"
    height="350"
    :options="chartOptions"
    :series="series"
  />
</template>

<script setup>
import { ref } from 'vue'

const chartOptions = ref({
  chart: { type: 'bar' },
  xaxis: { categories: ['Jan', 'Feb', 'Mar'] },
  plotOptions: { bar: { horizontal: false } }
})

const series = ref([
  { name: 'Revenue', data: [44, 55, 41] }
])
</script>
```

### Updating Data

The wrapper watches for changes to `series` and `options` props and calls the appropriate update methods:

```vue
<script setup>
const series = ref([{ data: [44, 55, 41] }])

function updateData() {
  // Mutating the ref triggers re-render
  series.value = [{ data: [10, 20, 30] }]
}
</script>
```

### Common Vue Pitfall: Reactive Config Mutation

```js
// ❌ WRONG — directly mutating deep config can miss reactivity
chartOptions.value.xaxis.categories.push('Apr')

// ✅ CORRECT — replace the whole object
chartOptions.value = {
  ...chartOptions.value,
  xaxis: { categories: ['Jan', 'Feb', 'Mar', 'Apr'] }
}
```

---

## Angular

### Setup

```typescript
// app.module.ts
import { NgApexchartsModule } from 'ng-apexcharts'

@NgModule({
  imports: [NgApexchartsModule]
})
export class AppModule {}
```

### Basic Usage

```typescript
// chart.component.ts
import { Component } from '@angular/core'

@Component({
  selector: 'app-chart',
  template: `
    <apx-chart
      [series]="series"
      [chart]="chartOptions"
      [xaxis]="xaxis"
    ></apx-chart>
  `
})
export class ChartComponent {
  chartOptions = { type: 'line' as const, height: 350 }
  series = [{ name: 'Sales', data: [30, 40, 35, 50] }]
  xaxis = { categories: ['Jan', 'Feb', 'Mar', 'Apr'] }
}
```

### Updating Data

```typescript
updateChart() {
  this.series = [{ name: 'Sales', data: [10, 20, 30, 40] }]
}
```

---

## Vanilla JS (No Framework)

```html
<div id="chart"></div>

<!-- CDN, pinned to a release -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/apexcharts/8.2.0/apexcharts.min.js"></script>

<script>
  const options = {
    chart: { type: 'line', height: 350 },
    series: [{ name: 'Sales', data: [30, 40, 35, 50] }],
    xaxis: { categories: ['Q1', 'Q2', 'Q3', 'Q4'] }
  }

  const chart = new ApexCharts(document.querySelector('#chart'), options)
  chart.render()
</script>
```

### CDN Links

```html
<!-- default bundle -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/apexcharts/8.2.0/apexcharts.min.js"></script>
<!-- one add-on next to it: an opt-in chart type -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/apexcharts/8.2.0/sunburst.js"></script>

<!-- or the full bundle: every chart type and feature, no add-ons -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/apexcharts/8.2.0/apexcharts.full.min.js"></script>

<!-- the same files on jsDelivr keep the dist/ folder in the path -->
<script src="https://cdn.jsdelivr.net/npm/apexcharts@8.2.0/dist/apexcharts.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/apexcharts@8.2.0/dist/sunburst.js"></script>
```

**Always write an exact version**, as above, never a major channel (`apexcharts@<major>`) or the unversioned URL: sandboxes that host generated pages (artifacts, previews) commonly reject a URL without an exact version, and an exact pin keeps a page working when the next major changes what the default bundle holds. **Never write a 3.x or 4.x URL** (`.../apexcharts/3.54.1/...`): those are releases from 2024 and early 2025, and this skill does not describe them. If an environment only accepts an older release, use the newest one it accepts with the same major version as the URLs above, since this skill applies to that whole major. To stay on an older major, pin a release from it. The other add-ons are `unit.js`, `violin.js`, `icicle.js` and `features/<name>.js` beside `apexcharts.min.js`, and may load before or after the main script.

---

## Common Framework Pitfalls

1. **Missing peer dependency** — `react-apexcharts`, `vue3-apexcharts`, and `ng-apexcharts` all require `apexcharts` as a separate dependency.
2. **SSR with wrapper components**: the standard components access `window`/`document` and can crash in SSR. Use dynamic imports with `{ ssr: false }`, the native SSR API, or the wrapper's SSR components: `react-apexcharts/server`, vue3-apexcharts `<apexchart-server>` and `<apexchart-hydrate>` (1.11.2 or later, which render with your installed apexcharts), ng-apexcharts `<apx-chart-ssr>` and `<apx-chart-hydrate>`. They load `apexcharts/ssr`, so with apexcharts 8 a Tier 2 type needs its opt-in import on the server too. For React hydration call `apexcharts/ssr` directly: `react-apexcharts/hydrate` (2.1.1) loads `apexcharts/client`, which has no `hydrate()`.
3. **Not destroying on unmount (vanilla API in React/Vue)** — causes memory leaks and duplicate charts. The official wrappers handle this automatically.
4. **Mutating config objects in place (Vue)** — deep mutations may not trigger reactivity. Replace the entire object or use `ref` at the right level.
5. **Rendering in hidden containers** — charts rendered in hidden tabs/modals have zero dimensions. Call `chart.updateOptions({})` or trigger a resize after showing the container.
