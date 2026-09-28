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
      id: 'my-chart'   // for chart.exec() targeting; NOT what hydration looks for
    },
    series: [{ data: [44, 55, 41, 67] }],
    xaxis: { categories: ['A', 'B', 'C', 'D'] }
  },
  { width: 600, height: 350 }
)

// htmlString is:
//   <div class="apexcharts-ssr-wrapper" data-apexcharts-hydrate data-apexcharts-config="...">
//     <svg>...</svg>
//   </div>
// The wrapper carries NO id. `chart.id` is not copied onto it, and the config
// travels in data-apexcharts-config, which is what hydration reads.
```

---

## Client-Side Hydration

After the server-rendered HTML is in the DOM, hydrate it to make it interactive:

### hydrate(element, clientOptions?)

```js
import ApexCharts from 'apexcharts'

// Hydrate a specific chart element (optionally merge client-only options).
// Select the emitted wrapper, not a chart id: `#my-chart` matches nothing.
const chart = ApexCharts.hydrate(document.querySelector('[data-apexcharts-hydrate]'))
```

### hydrateAll(selector?, clientOptions?)

```js
// Hydrate all server-rendered charts on the page (optionally scope by selector).
// The selector defaults to '[data-apexcharts-hydrate]', which is why this works
// with no argument and a #id selector does not.
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

1. **Assuming `apexcharts` has no SSR methods in Node** — it does: the `"."` export's `node` condition resolves to the SSR bundle, so `renderToString` and `renderToHTML` are there. Import `apexcharts/ssr` explicitly anyway, because a bundler told to target Node can still resolve the `browser` condition, and then they really are missing.
2. **Hydrating by chart id** — `renderToHTML` emits `<div class="apexcharts-ssr-wrapper" data-apexcharts-hydrate data-apexcharts-config="...">` with no `id`, so `querySelector('#my-chart')` returns null. Use `hydrateAll()`, or select `[data-apexcharts-hydrate]`.
3. **Forgetting to hydrate on the client** — server-rendered charts are static SVGs. Without `hydrate()`, they have no interactivity (no tooltips, zoom, click events).
4. **Missing width/height**: SSR has no DOM to measure. Pass explicit dimensions in the **second** argument: `renderToString(options, { width, height })` / `renderToHTML(options, { width, height })`.
5. **Hydrating before DOM is ready** — call `hydrate()` after the server-rendered HTML is in the DOM (use `onMounted`, `useEffect`, or `DOMContentLoaded`).
