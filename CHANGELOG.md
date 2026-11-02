# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.2.0] — 2026-11-03

### Added

- Pistol weapon with hitscan shooting (left click)
- Limited magazine (12 rounds) with reload (R key)
- Fire delay and empty-magazine blocking
- Muzzle flash (light + mesh) and camera recoil
- Colored target dummies (4 in room) that flash on hit and destroy after N hits
- HTML/CSS HUD overlay: crosshair, ammo counter, hit counter, reload bar, empty-mag warning
- Procedural audio via Web Audio API (gunshot, hit, reload sounds)
- Unit tests for AmmoSystem (9 tests)
- Updated README and CHANGELOG with Stage 2 features

### Known Limitations

- Single test room, no level system yet
- No enemies or AI
- No health system or pickups
- No music
- Procedural textures not yet implemented
- No multiple weapons

