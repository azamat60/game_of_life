# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev           # Start Vite dev server (http://localhost:5173)
npm run build         # Production build → dist/
npm run preview       # Serve production build locally
npm run typecheck     # TypeScript check (no emit)
npm run lint          # ESLint check
npm run lint:fix      # ESLint with autofix
npm run format        # Prettier write
npm run format:check  # Prettier check
```

No test framework is configured.

Pre-commit hook runs `lint-staged`: ESLint + Prettier on staged `.ts`/`.tsx`, Prettier on `.css`/`.md`/`.json`/`.html`.

## Architecture

Everything lives in a single component: [`src/App.tsx`](src/App.tsx). There are no sub-components, hooks files, or utilities — the full simulation logic, pattern library, and UI are co-located.

**Grid model**: A 2D boolean array (`Grid = boolean[][]`) of 36 rows × 52 columns. Each tick, `nextGeneration()` applies Conway's rules — birth at exactly 3 neighbors, survival at 2–3. The toroidal mode wraps edges; bounded mode treats out-of-bounds as dead.

**Pattern library**: Patterns are defined as ASCII art strings and parsed by `createPattern()` into `PatternCell[]` (relative offsets). `stampPattern()` writes them onto the grid at a target coordinate. Four categories: Spaceships, Oscillators, Guns, Methuselahs.

**Simulation loop**: Driven by `setInterval` in a `useEffect`, keyed on `isRunning` and `speed` (40–450 ms per tick, default 120 ms).

**Styling**: Tailwind-free — custom CSS in [`src/App.css`](src/App.css) with CSS variables for light/dark theming. Icons from `lucide-react`.
