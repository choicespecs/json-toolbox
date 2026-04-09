# JSON Toolbox

A fast, browser-based toolkit for working with JSON. No data leaves your machine.

**Live site:** https://choicespecs.github.io/json-toolbox/

## Features

### Difference
Compare two JSON documents side by side. Results are shown as a hierarchical tree or flat list, with added, removed, and changed keys clearly marked.

### Analyze
Inspect the structure of a JSON document as an expandable tree. Useful for exploring deeply nested or unfamiliar payloads.

### Visualize
Render a JSON document as an interactive node graph. Objects and arrays become connected cards; primitive values are shown inline with their type. Arrays of primitives list each element individually with its index and value.

### JSON → String
Convert a JSON document into an escaped string literal ready to paste into JavaScript, Java, or any language that needs JSON embedded as a string.

### Editor utilities
- **Prettify** — format with configurable indent (2 or 4 spaces) and optional key sorting
- **Minify** — collapse to a single line
- **Syntax error highlighting** — the editor underlines the exact location of JSON syntax errors and marks the line in the gutter

## Development

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # type-check + production build
npm run deploy   # build and push to GitHub Pages
```

### Force a GitHub Pages redeploy

```bash
git checkout gh-pages
echo "redeploy $(date)" > .redeploy
git add .redeploy
git commit -m "Force GitHub Pages redeploy"
git push origin gh-pages
git checkout main
```

**Stack:** React 19, TypeScript, Vite, Tailwind CSS 4, shadcn/ui, CodeMirror 6, Reactflow, ELK
