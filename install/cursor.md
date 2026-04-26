# Installing ApexCharts Skill for Cursor

## Setup

1. Copy the `.cursorrules` file from this repository into the root of your project:

```bash
cp /path/to/apexcharts-skill/.cursorrules /path/to/your-project/.cursorrules
```

Or download it directly:

```bash
curl -o .cursorrules https://raw.githubusercontent.com/apexcharts/apexcharts-skill/main/.cursorrules
```

2. Restart Cursor or open a new Cursor window.

Cursor automatically reads `.cursorrules` files in the project root and uses them as context for AI-assisted coding.

## For Windsurf

Same approach — Windsurf also supports `.cursorrules` files in the project root.

## Verification

Ask Cursor to generate a chart. It should follow the correct data format patterns and lifecycle (render/destroy).
