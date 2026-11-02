# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] — 2026-11-03

### Added

- Project scaffold with Vite, TypeScript, Three.js, ESLint, Vitest
- First-person camera with mouse look (Pointer Lock API)
- WASD movement with diagonal normalization and delta-time
- AABB wall collision with axis-separated sliding
- Corner collision handling
- Max delta-time cap to prevent teleporting after tab-switch
- Minimal gray-box test room (10×10×3)
- HTML/CSS overlay for start hint
- Unit tests for physics functions (16 tests)
- ESLint configuration with TypeScript support
- `.gitignore` for node_modules, dist, .env
- MIT License
- README (EN and RU)
- CONTRIBUTING.md, CHANGELOG.md, SECURITY.md
- GitHub Actions CI workflow for lint, test, build
- GitHub Pages deployment workflow

### Known Limitations

- Single test room, no level system yet
- No weapons, enemies, or health system
- No audio (music or SFX)
- No HUD overlay
- Procedural textures not yet implemented
