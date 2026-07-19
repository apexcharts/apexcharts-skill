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

### renderToString(options, ssrOptions?)

Returns a raw SVG string suitable for embedding. Pass width/height in the **second** argument (SSR has no DOM to measure).

```js
import ApexCharts from 'apexcharts/ssr'

// renderToString(options, { width?, height?, scale? })
const svgString = await ApexCharts.renderToString(
  {
    chart: { type: 'line' },
    series: [{ name: 'Sales', data: [30, 40, 35, 50] }],
    xaxis: { categories: ['Q1', 'Q2', 'Q3', 'Q4'] }
  },
  { width: 600, height: 350 }
)

// svgString is raw <svg>...</svg> markup
```

### renderToHTML(options, ssrOptions?)

Returns an HTML string with a wrapper `<div>` containing the SVG, ready for hydration:

```js
// renderToHTML(options, { width?, height?, scale?, className? })
const htmlString = await ApexCharts.renderToHTML(
  {
    chart: {
      type: 'bar',
      id: 'my-chart'   // id is important for hydration targeting
    },
    series: [{ data: [44, 55, 41, 67] }],
    xaxis: { categories: ['A', 'B', 'C', 'D'] }
  },
  { width: 600, height: 350 }
)

// htmlString is <div id="my-chart" data-apexcharts>...<svg>...</svg></div>
```

---

## Client-Side Hydration

After the server-rendered HTML is in the DOM, hydrate it to make it interactive:

### hydrate(element, clientOptions?)

```js
import ApexCharts from 'apexcharts'

// Hydrate a specific chart element (optionally merge client-only options)
const chart = ApexCharts.hydrate(document.querySelector('#my-chart'))
```

### hydrateAll(selector?, clientOptions?)

```js
// Hydrate all server-rendered charts on the page (optionally scope by selector)
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
  const chartHTML = await ApexCharts.renderToHTML(
    {
      chart: { type: 'line', id: 'sales-chart' },
      series: [{ name: 'Sales', data: [30, 40, 35, 50, 49, 60] }],
      xaxis: { categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'] }
    },
    { width: 600, height: 350 }
  )

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
  const chartHTML = await ApexCharts.renderToHTML(
    {
      chart: { type: 'line', id: 'my-chart' },
      series: [{ data: [10, 20, 30] }],
      xaxis: { categories: ['A', 'B', 'C'] }
    },
    { width: 600, height: 350 }
  )

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
  return await ApexCharts.renderToHTML(
    {
      chart: { type: 'bar', id: 'my-chart' },
      series: [{ data: [44, 55, 41] }],
      xaxis: { categories: ['A', 'B', 'C'] }
    },
    { width: 600, height: 350 }
  )
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
3. **Missing width/height**: SSR has no DOM to measure. Pass explicit dimensions in the **second** argument: `renderToString(options, { width, height })` / `renderToHTML(options, { width, height })`.
4. **Hydrating before DOM is ready** — call `hydrate()` after the server-rendered HTML is in the DOM (use `onMounted`, `useEffect`, or `DOMContentLoaded`).
