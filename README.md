# IRON GUTS

An original retro-inspired first-person shooter built with TypeScript and Three.js.

**Status:** Early development — playable prototype available.

> [Русская версия документации](README.ru.md)

## Features

- First-person camera with mouse look (Pointer Lock API)
- WASD movement with diagonal normalization
- Delta-time based movement for frame-rate independence
- AABB wall collision with sliding along walls
- Corner collision handling
- Max delta-time cap to prevent teleporting after tab-switch
- Pistol with hitscan shooting
- Limited magazine with reload (R key)
- Muzzle flash and recoil
- Colored target dummies that react to hits
- HTML/CSS HUD overlay (crosshair, ammo counter, hit counter)
- Procedural audio (gunshot, hit, reload sounds via Web Audio API)
- TypeScript throughout for type safety
- Automated tests for physics and ammo logic

## Controls

| Key | Action |
|-----|--------|
| WASD / Arrow keys | Move |
| Mouse | Look around |
| Left Click | Shoot |
| R | Reload |
| Click | Capture mouse (start) |
| ESC | Release mouse |

## Requirements

- Node.js 22 LTS or later
- A modern browser (Chrome, Firefox, Edge, Safari)

## Installation

```bash
npm install
```

## Running

```bash
npm run dev
```

Open `http://localhost:5173` in your browser.

## Building

```bash
npm run build
```

Output is placed in `dist/`.

## Testing

```bash
npm run test
```

## Linting

```bash
npm run lint
```

## Project Structure

```
├── src/
│   ├── config/       # Game constants (room size, player params)
│   ├── core/         # Game loop, input, physics, audio
│   ├── entities/     # Player entity
│   ├── levels/       # Level data
│   ├── rendering/    # Three.js scene setup
│   ├── ui/           # HUD and menu (HTML/CSS overlay)
│   ├── weapons/      # Weapon implementations
│   └── utils/        # Math helpers
├── tests/            # Vitest unit tests
├── public/           # Static assets
├── index.html        # Entry HTML
├── vite.config.ts    # Vite configuration
├── tsconfig.json     # TypeScript configuration
├── eslint.config.js  # ESLint configuration
├── vitest.config.ts  # Vitest configuration
├── package.json      # Dependencies and scripts
└── .gitignore        # Excluded files
```

## Roadmap

| Stage | Description | Status |
|-------|-------------|--------|
| 0 | Project scaffold (Vite, TypeScript, Three.js, ESLint, Vitest) | Done |
| 1 | First 3D prototype — movement, mouse look, wall collision | Done |
| 2 | Pistol, ammo, reloading, targets, HUD, procedural audio | Done |
| 3 | Enemies and AI | Planned |
| 4 | Health and pickups | Planned |
| 5 | Multiple levels | Planned |
| 6 | Music and polish | Planned |

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.

## Repository

https://github.com/godOFslaves/iron-guts
