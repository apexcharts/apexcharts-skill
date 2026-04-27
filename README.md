# ApexCharts AI Skill

AI coding skill for building [ApexCharts.js](https://apexcharts.com/) charts and data visualizations. Works with Claude Code, Cursor, GitHub Copilot, and any AI coding assistant.

## What This Does

AI models frequently generate incorrect ApexCharts code — wrong series data formats, missing `render()` calls, broken formatter signatures, etc. This skill provides structured reference files that help AI assistants generate correct ApexCharts code on the first try.

### Coverage

- **16 chart types**: line, area, bar, pie, donut, radialBar, scatter, bubble, heatmap, candlestick, boxPlot, radar, polarArea, rangeBar, rangeArea, treemap
- **Correct data formats** for every chart type
- **16 common pitfalls** with wrong/correct code examples
- **Tree-shaking** and bundle optimization patterns
- **SSR** (server-side rendering) and hydration
- **Framework integration**: React, Vue 3, Angular

## Installation

### Claude Code

```bash
mkdir -p .claude/skills
cd .claude/skills
git clone https://github.com/apexcharts/apexcharts-skill.git
```

### Cursor / Windsurf

Copy `.cursorrules` to your project root:

```bash
curl -o .cursorrules https://raw.githubusercontent.com/apexcharts/apexcharts-skill/main/.cursorrules
```

### GitHub Copilot

Reference `SKILL.md` in Copilot Chat: `@workspace #file:SKILL.md`

Or paste the contents of `.cursorrules` into Copilot's custom instructions.

### Generic AI Assistant

Paste the contents of `SKILL.md` into the system prompt or attach it as context.

### As an npm dependency

Tools that build on top of this skill (e.g. MCP servers, custom AI agents) can install it from npm and resolve absolute paths to the bundled markdown:

```bash
npm install apexcharts-skill
```

```js
import { skillFile, referencesDir, referencePath } from 'apexcharts-skill';
import { readFile } from 'node:fs/promises';

const skill = await readFile(skillFile, 'utf8');
const barCharts = await readFile(referencePath('bar-charts.md'), 'utf8');
```

## Repository Structure

```
├── SKILL.md                    # Main entry point — read this first
├── .cursorrules                # Self-contained version for Cursor/Windsurf
├── references/
│   ├── cartesian-charts.md     # line, area, scatter, bubble, rangeArea
│   ├── bar-charts.md           # bar, column, rangeBar, timeline/Gantt
│   ├── financial-charts.md     # candlestick, boxPlot
│   ├── circular-charts.md      # pie, donut, polarArea, radialBar
│   ├── grid-charts.md          # heatmap, treemap
│   ├── radar-charts.md         # radar
│   ├── tree-shaking.md         # bundle optimization
│   ├── ssr.md                  # server-side rendering
│   └── framework-wrappers.md   # React, Vue, Angular
└── install/
    ├── claude-code.md
    ├── cursor.md
    └── copilot.md
```

## How It Works

- **`SKILL.md`** is the main entry point containing critical rules, data format tables, formatter signatures, and all 16 pitfalls. An AI agent reading this file alone can generate correct code for any chart type.
- **`references/`** files provide deeper detail per chart family — full working examples, plotOptions, and family-specific pitfalls. AI agents load these on demand when the user needs a specific chart type.
- **`.cursorrules`** is a self-contained version for editors that don't support multi-file skills.

## Links

- [ApexCharts Documentation](https://apexcharts.com/docs/)
- [ApexCharts GitHub](https://github.com/apexcharts/apexcharts.js)
- [NPM Package](https://www.npmjs.com/package/apexcharts)
- [react-apexcharts](https://www.npmjs.com/package/react-apexcharts)
- [vue3-apexcharts](https://www.npmjs.com/package/vue3-apexcharts)
- [ng-apexcharts](https://www.npmjs.com/package/ng-apexcharts)

## License

MIT
