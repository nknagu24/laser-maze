# Laser Maze

An optics puzzle game: steer a laser beam into detectors using mirrors,
beam splitters, polarizers and wave plates. Each level teaches one idea
about how light behaves.

Built with plain JavaScript and Vite, and embedded on nskamath.netlify.app.

## Run it locally

    npm install
    npm run dev

## Build for the website

    npm run build

This produces `dist/laser-maze.js`, a single self-contained file.

## Where things live

- `src/data/levels.js` — all levels
- `src/physics/` — how light behaves
- `src/drawing/` — everything drawn on the board
- `src/styles/` — how the game looks