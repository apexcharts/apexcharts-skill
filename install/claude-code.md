# Installing ApexCharts Skill for Claude Code

## Installation

```bash
# Navigate to your project's Claude config
mkdir -p .claude/skills
cd .claude/skills

# Clone the skill
git clone https://github.com/apexcharts/apexcharts-skill.git
```

Claude Code will automatically detect and use the skill files when working on ApexCharts code.

## Verification

Ask Claude to create a simple chart:

> Create a line chart with ApexCharts showing monthly sales data

Claude should generate code that:
- Calls `new ApexCharts(el, options)` followed by `chart.render()`
- Uses the correct series data format
- Includes proper cleanup patterns for your framework
