import { useEffect, useMemo, useRef, useState } from "react";
import { Pause, Play, Shuffle, SkipForward, Trash2 } from "lucide-react";
import "./App.css";

type Cell = boolean;
type Grid = Cell[][];
type Offset = [number, number];
type PatternCell = [number, number];

type Pattern = {
  id: string;
  name: string;
  description: string;
  width: number;
  height: number;
  cells: PatternCell[];
};

type PatternCategory = {
  id: string;
  name: string;
  patterns: Pattern[];
};

const ROWS = 36;
const COLS = 52;
const DEFAULT_SPEED = 120;
const ALIVE_CHANCE = 0.28;
const DEFAULT_CATEGORY_ID = "guns";
const DEFAULT_PATTERN_ID = "gosper-gun";
const NEIGHBORS: Offset[] = [
  [-1, -1],
  [-1, 0],
  [-1, 1],
  [0, -1],
  [0, 1],
  [1, -1],
  [1, 0],
  [1, 1],
];

function createPattern(lines: string[]): Pick<Pattern, "width" | "height" | "cells"> {
  const width = lines.reduce((max, line) => Math.max(max, line.length), 0);
  const cells: PatternCell[] = [];

  lines.forEach((line, row) => {
    line.split("").forEach((char, col) => {
      if (char === "O") {
        cells.push([row, col]);
      }
    });
  });

  return {
    width,
    height: lines.length,
    cells,
  };
}

const PATTERN_CATEGORIES: PatternCategory[] = [
  {
    id: "spaceships",
    name: "Spaceships",
    patterns: [
      {
        id: "glider",
        name: "Glider",
        description: "Classic 5-cell moving pattern.",
        ...createPattern([".O.", "..O", "OOO"]),
      },
      {
        id: "lwss",
        name: "LWSS",
        description: "Lightweight spaceship moving horizontally.",
        ...createPattern([".O..O", "O....", "O...O", "OOOO."]),
      },
    ],
  },
  {
    id: "oscillators",
    name: "Oscillators",
    patterns: [
      {
        id: "blinker",
        name: "Blinker",
        description: "The simplest period-2 oscillator.",
        ...createPattern(["OOO"]),
      },
      {
        id: "toad",
        name: "Toad",
        description: "A period-2 oscillator made from two rows.",
        ...createPattern([".OOO", "OOO."]),
      },
      {
        id: "pulsar",
        name: "Pulsar",
        description: "A large period-3 oscillator.",
        ...createPattern([
          "..OOO...OOO..",
          ".............",
          "O....O.O....O",
          "O....O.O....O",
          "O....O.O....O",
          "..OOO...OOO..",
          ".............",
          "..OOO...OOO..",
          "O....O.O....O",
          "O....O.O....O",
          "O....O.O....O",
          ".............",
          "..OOO...OOO..",
        ]),
      },
    ],
  },
  {
    id: "guns",
    name: "Guns",
    patterns: [
      {
        id: "gosper-gun",
        name: "Gosper Glider Gun",
        description: "The first known pattern with infinite growth.",
        ...createPattern([
          "........................O...........",
          "......................O.O...........",
          "............OO......OO............OO",
          "...........O...O....OO............OO",
          "OO........O.....O...OO..............",
          "OO........O...O.OO....O.O...........",
          "..........O.....O.......O...........",
          "...........O...O....................",
          "............OO......................",
        ]),
      },
    ],
  },
  {
    id: "methuselahs",
    name: "Methuselahs",
    patterns: [
      {
        id: "r-pentomino",
        name: "R-pentomino",
        description: "Small seed with a long chaotic evolution.",
        ...createPattern([".OO", "OO.", ".O."]),
      },
      {
        id: "acorn",
        name: "Acorn",
        description: "7-cell seed that grows large structures.",
        ...createPattern([".O.....", "...O...", "OO..OOO"]),
      },
      {
        id: "diehard",
        name: "Diehard",
        description: "A long-lived pattern that eventually dies out.",
        ...createPattern(["......O.", "OO......", ".O...OOO"]),
      },
    ],
  },
];

function createEmptyGrid(): Grid {
  return Array.from({ length: ROWS }, () => Array(COLS).fill(false));
}

function getPatternById(patternId: string): Pattern {
  for (const category of PATTERN_CATEGORIES) {
    const found = category.patterns.find((pattern) => pattern.id === patternId);
    if (found) {
      return found;
    }
  }
  return PATTERN_CATEGORIES[0].patterns[0];
}

function createRandomGrid(chance = ALIVE_CHANCE): Grid {
  return Array.from({ length: ROWS }, () =>
    Array.from({ length: COLS }, () => Math.random() < chance)
  );
}

function nextGeneration(grid: Grid, isToroidal: boolean): Grid {
  return grid.map((row, y) =>
    row.map((isAlive, x) => {
      let aliveNeighbors = 0;

      for (const [dy, dx] of NEIGHBORS) {
        let newY = y + dy;
        let newX = x + dx;

        if (isToroidal) {
          newY = (newY + ROWS) % ROWS;
          newX = (newX + COLS) % COLS;
        } else if (newY < 0 || newY >= ROWS || newX < 0 || newX >= COLS) {
          continue;
        }

        aliveNeighbors += grid[newY][newX] ? 1 : 0;
      }

      if (isAlive && (aliveNeighbors < 2 || aliveNeighbors > 3)) {
        return false;
      }

      if (!isAlive && aliveNeighbors === 3) {
        return true;
      }

      return isAlive;
    })
  );
}

function countAlive(grid: Grid): number {
  return grid.reduce(
    (sum, row) => sum + row.reduce((rowSum, cell) => rowSum + (cell ? 1 : 0), 0),
    0
  );
}

function stampPattern(
  baseGrid: Grid,
  pattern: Pattern,
  startRow: number,
  startCol: number,
  isToroidal: boolean
): Grid {
  const nextGrid = baseGrid.map((row) => [...row]);

  pattern.cells.forEach(([dy, dx]) => {
    let row = startRow + dy;
    let col = startCol + dx;

    if (isToroidal) {
      row = (row + ROWS) % ROWS;
      col = (col + COLS) % COLS;
    } else if (row < 0 || row >= ROWS || col < 0 || col >= COLS) {
      return;
    }

    nextGrid[row][col] = true;
  });

  return nextGrid;
}

function createDefaultGrid(): Grid {
  const pattern = getPatternById(DEFAULT_PATTERN_ID);
  const startRow = Math.floor((ROWS - pattern.height) / 2);
  const startCol = Math.floor((COLS - pattern.width) / 2);
  return stampPattern(createEmptyGrid(), pattern, startRow, startCol, true);
}

function App() {
  const [grid, setGrid] = useState<Grid>(() => createDefaultGrid());
  const [isRunning, setIsRunning] = useState(false);
  const [speed, setSpeed] = useState(DEFAULT_SPEED);
  const [generation, setGeneration] = useState(0);
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const [isToroidal, setIsToroidal] = useState(true);
  const [activeCategoryId, setActiveCategoryId] = useState(DEFAULT_CATEGORY_ID);
  const [activePatternId, setActivePatternId] = useState(DEFAULT_PATTERN_ID);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const aliveCount = useMemo(() => countAlive(grid), [grid]);
  const density = useMemo(() => Math.round((aliveCount / (ROWS * COLS)) * 100), [aliveCount]);
  const activeCategory = useMemo(
    () =>
      PATTERN_CATEGORIES.find((category) => category.id === activeCategoryId) ??
      PATTERN_CATEGORIES[0],
    [activeCategoryId]
  );
  const activePattern = useMemo(
    () =>
      activeCategory.patterns.find((pattern) => pattern.id === activePatternId) ??
      activeCategory.patterns[0],
    [activeCategory, activePatternId]
  );

  const clearLoop = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  useEffect(() => {
    if (!isRunning) {
      clearLoop();
      return undefined;
    }

    timerRef.current = setTimeout(() => {
      setGrid((prev) => nextGeneration(prev, isToroidal));
      setGeneration((prev) => prev + 1);
    }, speed);

    return clearLoop;
  }, [grid, isRunning, speed, isToroidal]);

  useEffect(() => () => clearLoop(), []);

  const toggleCell = (row: number, col: number) => {
    setGrid((prev) =>
      prev.map((line, y) => line.map((cell, x) => (x === col && y === row ? !cell : cell)))
    );
  };

  const handleClear = () => {
    setIsRunning(false);
    setGeneration(0);
    setGrid(createEmptyGrid());
  };

  const handleRandom = () => {
    setGeneration(0);
    setGrid(createRandomGrid());
  };

  const handleStep = () => {
    setGrid((prev) => nextGeneration(prev, isToroidal));
    setGeneration((prev) => prev + 1);
  };

  const applyPatternAsScene = (pattern: Pattern) => {
    setIsRunning(false);
    setGeneration(0);
    const startRow = Math.floor((ROWS - pattern.height) / 2);
    const startCol = Math.floor((COLS - pattern.width) / 2);

    setGrid(() => stampPattern(createEmptyGrid(), pattern, startRow, startCol, isToroidal));
  };

  return (
    <main className={`page ${theme === "dark" ? "theme-dark" : "theme-light"}`}>
      <section className="panel">
        <header className="panel-header">
          <p className="eyebrow">Cellular Automata</p>
          <h1>Game of Life</h1>
          <p className="description">
            Click cells, run the simulation, and watch the colony evolve.
          </p>
        </header>

        <div className="controls">
          <button
            className={`btn ${isRunning ? "btn-pause" : "btn-start"}`}
            onClick={() => setIsRunning((prev) => !prev)}
          >
            <span className="btn-content">
              {isRunning ? <Pause size={16} /> : <Play size={16} />}
              {isRunning ? "Pause" : "Start"}
            </span>
          </button>
          <button className="btn btn-step" onClick={handleStep} disabled={isRunning}>
            <span className="btn-content">
              <SkipForward size={16} />
              Step
            </span>
          </button>
          <button className="btn btn-random" onClick={handleRandom}>
            <span className="btn-content">
              <Shuffle size={16} />
              Random
            </span>
          </button>
          <button className="btn btn-clear" onClick={handleClear}>
            <span className="btn-content">
              <Trash2 size={16} />
              Clear
            </span>
          </button>
        </div>

        <section className="toggles">
          <label className="switch-row" htmlFor="theme-toggle">
            <span>Dark theme</span>
            <input
              id="theme-toggle"
              type="checkbox"
              checked={theme === "dark"}
              onChange={(event) => setTheme(event.target.checked ? "dark" : "light")}
            />
          </label>

          <label className="switch-row" htmlFor="toroidal-toggle">
            <span>Wrap edges (toroidal)</span>
            <input
              id="toroidal-toggle"
              type="checkbox"
              checked={isToroidal}
              onChange={(event) => setIsToroidal(event.target.checked)}
            />
          </label>
        </section>

        <label className="range-control" htmlFor="speed">
          <span>Speed: {speed} ms</span>
          <input
            id="speed"
            type="range"
            min="40"
            max="450"
            value={speed}
            onChange={(event) => setSpeed(Number(event.target.value))}
          />
        </label>

        <section className="pattern-library">
          <div className="pattern-library-head">
            <h2>Pattern Library</h2>
            <p>Select a pattern to place it as the initial scene.</p>
          </div>

          <div className="category-tabs">
            {PATTERN_CATEGORIES.map((category) => (
              <button
                key={category.id}
                type="button"
                className={`chip ${activeCategory.id === category.id ? "chip-active" : ""}`}
                onClick={() => {
                  setActiveCategoryId(category.id);
                  const nextPattern = category.patterns[0];
                  setActivePatternId(nextPattern.id);
                  applyPatternAsScene(nextPattern);
                }}
              >
                {category.name}
              </button>
            ))}
          </div>

          <div className="pattern-list">
            {activeCategory.patterns.map((pattern) => (
              <button
                key={pattern.id}
                type="button"
                className={`pattern-card ${
                  activePattern.id === pattern.id ? "pattern-card-active" : ""
                }`}
                onClick={() => {
                  setActivePatternId(pattern.id);
                  applyPatternAsScene(pattern);
                }}
              >
                <span className="pattern-title">{pattern.name}</span>
                <span className="pattern-meta">
                  {pattern.width}x{pattern.height}, {pattern.cells.length} cells
                </span>
                <span className="pattern-description">{pattern.description}</span>
              </button>
            ))}
          </div>
        </section>

        <div className="stats">
          <p>Generation: {generation}</p>
          <p>Alive cells: {aliveCount}</p>
          <p>Density: {density}%</p>
          <p>Edges: {isToroidal ? "Toroidal" : "Bounded"}</p>
          <p>
            Grid: {ROWS} x {COLS}
          </p>
        </div>
      </section>

      <section className="board-wrap">
        <div
          className="board"
          style={{
            gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))`,
          }}
        >
          {grid.map((row, y) =>
            row.map((isAlive, x) => (
              <button
                key={`${y}-${x}`}
                type="button"
                className={`cell ${isAlive ? "cell-alive" : ""}`}
                onClick={() => toggleCell(y, x)}
                aria-label={`cell ${y} ${x}`}
              />
            ))
          )}
        </div>
      </section>

      <footer className="site-credit">Developed by Azamat Altymyshev</footer>
    </main>
  );
}

export default App;
