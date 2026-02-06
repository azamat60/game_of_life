# Game of Life

An interactive implementation of **Conway's Game of Life** built with React + TypeScript.

## Why This Project Exists

This project is personal for me.

I became deeply interested in the core idea of Game of Life a long time ago: how very simple rules can produce complex, almost "alive" behavior. I always wanted to build **my own implementation** to understand it end-to-end, not just watch examples.

The main idea of this project is to show that minimal rules can generate rich dynamics, motion, and unexpected structures.

## What Is Happening Here

This is a cellular automaton:

- the world is a grid of cells (alive/dead);
- each next generation is computed from neighboring cells;
- you can run, pause, step, change speed, pick known patterns, and explore emergent behavior.

## Features

- Conway's Game of Life rules.
- Famous pattern library by categories:
- `Spaceships` (e.g., `Glider`, `LWSS`)
- `Oscillators` (`Blinker`, `Toad`, `Pulsar`)
- `Guns` (`Gosper Glider Gun`)
- `Methuselahs` (`R-pentomino`, `Acorn`, `Diehard`)
- Pattern is applied instantly on click.
- Interface themes: `Light` / `Dark`.
- Edge mode:
- `Toroidal` (Pac-Man style wraparound)
- `Bounded` (normal finite borders)
- Simulation controls: `Start/Pause`, `Step`, `Random`, `Clear`.
- Real-time stats: generation, alive cells, density.

## Tech Stack

- React
- TypeScript
- Vite
- ESLint
- Prettier
- Husky + lint-staged (pre-commit)

## Getting Started

```bash
npm install
npm run dev
```

The app will run locally on the Vite dev server.

## Available Scripts

```bash
npm run dev          # local development
npm run build        # production build
npm run preview      # preview production build
npm run typecheck    # TypeScript check
npm run lint         # ESLint
npm run lint:fix     # ESLint autofix
npm run format       # Prettier write
npm run format:check # Prettier check
```

## Pre-commit Quality Gate

Before each commit, `lint-staged` runs automatically:

- for `*.ts, *.tsx`: `eslint --fix` + `prettier --write`
- for `*.css, *.md, *.json, *.html`: `prettier --write`

This keeps code style consistent and reduces accidental issues in commit history.

## Future Ideas

- Place patterns by clicking any point on the board.
- Pattern import/export.
- Save and load custom scenes.
- Deeper evolution analytics and insights.
