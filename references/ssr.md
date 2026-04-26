# Server-Side Rendering (SSR) — ApexCharts

## Overview

ApexCharts supports SSR for generating chart SVGs on the server (Node.js) and hydrating them on the client for interactivity.

## Import Paths

```js
// Server (Node.js) — includes renderToString, renderToHTML
import ApexCharts from 'apexcharts/ssr'

// Client (Browser) — for hydration after SSR
import ApexCharts from 'apexcharts'          // auto-detects browser
// or explicitly:
import ApexCharts from 'apexcharts/client'
```

**Important:** The default `import ApexCharts from 'apexcharts'` uses Node.js conditional exports. In Node.js, it automatically resolves to the SSR bundle. In browsers (bundlers), it resolves to the client bundle.

---

## Server-Side API

### renderToString(options)

Returns a raw SVG string suitable for embedding:

```js
import ApexCharts from 'apexcharts/ssr'

const svgString = await ApexCharts.renderToString({
  chart: { type: 'line', height: 350, width: 600 },
  series: [{ name: 'Sales', data: [30, 40, 35, 50] }],
  xaxis: { categories: ['Q1', 'Q2', 'Q3', 'Q4'] }
})

// svgString is raw <svg>...</svg> markup
```

### renderToHTML(options)

Returns an HTML string with a wrapper `<div>` containing the SVG, ready for hydration:

```js
const htmlString = await ApexCharts.renderToHTML({
  chart: {
    type: 'bar',
    height: 350,
    width: 600,
    id: 'my-chart'   // id is important for hydration targeting
  },
  series: [{ data: [44, 55, 41, 67] }],
  xaxis: { categories: ['A', 'B', 'C', 'D'] }
})

// htmlString is <div id="my-chart" data-apexcharts>...<svg>...</svg></div>
```

---

## Client-Side Hydration

After the server-rendered HTML is in the DOM, hydrate it to make it interactive:

### hydrate(element)

```js
import ApexCharts from 'apexcharts'

// Hydrate a specific chart element
const chart = ApexCharts.hydrate(document.querySelector('#my-chart'))
```

### hydrateAll()

```js
// Hydrate all server-rendered charts on the page
ApexCharts.hydrateAll()
```

### isHydrated(element)

```js
// Check if an element has already been hydrated
if (!ApexCharts.isHydrated(el)) {
  ApexCharts.hydrate(el)
}
```

---

## Full SSR + Hydration Example

### Server (Node.js / Express)

```js
import express from 'express'
import ApexCharts from 'apexcharts/ssr'

const app = express()

app.get('/', async (req, res) => {
  const chartHTML = await ApexCharts.renderToHTML({
    chart: { type: 'line', height: 350, width: 600, id: 'sales-chart' },
    series: [{ name: 'Sales', data: [30, 40, 35, 50, 49, 60] }],
    xaxis: { categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'] }
  })

  res.send(`
    <!DOCTYPE html>
    <html>
    <head><title>Chart</title></head>
    <body>
      ${chartHTML}
      <script type="module">
        import ApexCharts from '/node_modules/apexcharts/dist/apexcharts.esm.js'
        ApexCharts.hydrateAll()
      </script>
    </body>
    </html>
  `)
})

app.listen(3000)
```

---

## SSR with Frameworks

### Next.js (React)

```jsx
// app/page.js (Server Component)
import ApexCharts from 'apexcharts/ssr'

export default async function Page() {
  const chartHTML = await ApexCharts.renderToHTML({
    chart: { type: 'line', height: 350, id: 'my-chart' },
    series: [{ data: [10, 20, 30] }],
    xaxis: { categories: ['A', 'B', 'C'] }
  })

  return (
    <>
      <div dangerouslySetInnerHTML={{ __html: chartHTML }} />
      <HydrateCharts />
    </>
  )
}

// components/HydrateCharts.js (Client Component)
'use client'
import { useEffect } from 'react'

export default function HydrateCharts() {
  useEffect(() => {
    import('apexcharts').then(({ default: ApexCharts }) => {
      ApexCharts.hydrateAll()
    })
  }, [])
  return null
}
```

### Nuxt 3 (Vue)

```vue
<!-- pages/index.vue -->
<template>
  <div v-html="chartHTML" />
</template>

<script setup>
// Server-side
const chartHTML = await useAsyncData('chart', async () => {
  const ApexCharts = (await import('apexcharts/ssr')).default
  return await ApexCharts.renderToHTML({
    chart: { type: 'bar', height: 350, id: 'my-chart' },
    series: [{ data: [44, 55, 41] }],
    xaxis: { categories: ['A', 'B', 'C'] }
  })
})

// Client-side hydration
onMounted(async () => {
  const ApexCharts = (await import('apexcharts')).default
  ApexCharts.hydrateAll()
})
</script>
```

---

## Common Pitfalls

1. **Using `apexcharts` in Node.js without SSR methods** — the default export auto-resolves based on environment, but `renderToString` is only available via `apexcharts/ssr`.
2. **Forgetting to hydrate on the client** — server-rendered charts are static SVGs. Without `hydrate()`, they have no interactivity (no tooltips, zoom, click events).
3. **Missing `chart.width`** — SSR has no DOM to measure container width. Always provide explicit `width` for server rendering.
4. **Hydrating before DOM is ready** — call `hydrate()` after the server-rendered HTML is in the DOM (use `onMounted`, `useEffect`, or `DOMContentLoaded`).
