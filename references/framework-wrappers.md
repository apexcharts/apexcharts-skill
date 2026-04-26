# Framework Integration — ApexCharts

## Official Wrappers

| Framework | Package | Install |
|---|---|---|
| React | `react-apexcharts` | `npm install react-apexcharts apexcharts` |
| Vue 3 | `vue3-apexcharts` | `npm install vue3-apexcharts apexcharts` |
| Angular | `ng-apexcharts` | `npm install ng-apexcharts apexcharts` |

**Important:** All wrappers require `apexcharts` as a peer dependency. Install both packages.

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

<!-- CDN -->
<script src="https://cdn.jsdelivr.net/npm/apexcharts"></script>

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

```
https://cdn.jsdelivr.net/npm/apexcharts
https://cdn.jsdelivr.net/npm/apexcharts@5/dist/apexcharts.min.js
https://unpkg.com/apexcharts
```

---

## Common Framework Pitfalls

1. **Missing peer dependency** — `react-apexcharts`, `vue3-apexcharts`, and `ng-apexcharts` all require `apexcharts` as a separate dependency.
2. **SSR with wrapper components** — most wrappers access `window`/`document` and crash in SSR. Use dynamic imports with `{ ssr: false }` or the native SSR API.
3. **Not destroying on unmount (vanilla API in React/Vue)** — causes memory leaks and duplicate charts. The official wrappers handle this automatically.
4. **Mutating config objects in place (Vue)** — deep mutations may not trigger reactivity. Replace the entire object or use `ref` at the right level.
5. **Rendering in hidden containers** — charts rendered in hidden tabs/modals have zero dimensions. Call `chart.updateOptions({})` or trigger a resize after showing the container.
