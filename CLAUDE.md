# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start Vite dev server
npm run build     # Type-check (tsc) then build
npm run preview   # Preview production build
npm run deploy    # Deploy to GitHub Pages
```

No test runner is configured.

## Architecture

**json-toolbox** is a React 19 + TypeScript single-page app for working with JSON. It deploys to GitHub Pages at `/json-toolbox/`. The entire app is bounded to `h-screen` — no page-level scrolling; each panel manages its own overflow.

### State & data flow

All application state lives in one hook: `src/features/app/useJsonToolboxApp.tsx`. It manages:
- `docs` — editor tabs (each is a `Doc` with `text` and optional `diffText`)
- Mode flags: `showDiff`, `showAnalyze`, `showVisualize`, `showJsonToString` — exactly one active at a time; toggling one turns off the others
- Format options: indent size, key sorting, minification
- Per-feature result state (diff tree, inspect tree, error strings)

`App.tsx` wires together `TopBar`, `LeftEditors` (left half), and `RightPane` (right half), passing down state and handlers from `useJsonToolboxApp`.

### Feature modules

Business logic is in `src/features/`, UI in `src/components/`, mirroring each other:

| Feature | Logic | Component |
|---------|-------|-----------|
| Diff | `src/features/diff/` — `computeDifferences()`, `computeDiffTree()` | `src/components/diff/` |
| Analyze | `src/features/analyze/` — `buildInspectTree()` | `src/components/analyze/` |
| Visualize | `src/features/visualize/` — `buildContainerGraph()` | `src/components/visualize/` |
| JSON → String | `src/lib/jsonToString.ts` — `jsonToStringLiteral()` | `src/components/app/JsonStringOutputCard.tsx` |

- Visualization uses Reactflow + ELK (`elkjs`) for graph layout. `buildContainerGraph` walks the JSON tree and emits `ContainerNode`/`ContainerEdge` objects; primitive arrays emit one row per element with index, value, and type.
- JSON → String conversion is reactive via `useMemo` in the hook — no separate trigger needed. Errors appear inline in the output card without blocking the editor.

### Editor

The left pane uses CodeMirror 6 (`@uiw/react-codemirror`) via `src/components/app/JsonEditor.tsx`. It includes:
- `@codemirror/lang-json` with `jsonParseLinter()` — underlines syntax errors in place
- `lintGutter()` — red dot in the line-number gutter on error lines
- Fixed height with internal scrolling (no page scroll)

### Types

- `src/types/json.ts` — `JSONValue`, `JSONObject`, `JSONArray`
- `src/types/doc.ts` — `Doc` (editor tab), `FlatDiff`, `DiffNode`, `InspectNode`

### Utilities

- `src/lib/json.ts` — JSON parsing, formatting, sorting
- `src/lib/jsonToString.ts` — JSON → JS string literal conversion

### Conventions

- Import paths use `@/` alias (maps to `src/`)
- UI components from shadcn/ui (New York style) with Radix primitives and Lucide icons
- No external state management — React hooks only
- Mode exclusivity is enforced at the toggle site (in `TopBar` and `toggleJsonToString`), not in the render logic
