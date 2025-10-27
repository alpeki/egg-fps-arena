# Changelog

All notable changes to Egg-FPS Arena will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Planned
- Multiple game modes (Team Deathmatch, King of the Yolk)
- Additional weapon types (shotgun, sniper)
- Power-ups system
- Turkish cuisine cosmetics
- Battle Pass Season 1
- Real AdMob integration

## [0.1.0] - 2025-10-27

### Added - Core MVP

#### Game Features
- Free-for-all game mode (90s matches)
- 2 weapon types: Hitscan "Pew" and Projectile "Egg Bomb"
- Dash mechanic with cooldown
- Health and respawn system
- Score tracking
- Bot fill system for empty slots

#### Netcode
- Authoritative server with Colyseus
- Client-side prediction
- Server reconciliation
- Snapshot interpolation (100ms buffer)
- Lag compensation with circular buffer
- Binary protocol (<120 bytes per player state)
- 20Hz server tick, 60 FPS client rendering

#### Infrastructure
- Monorepo with pnpm workspaces
- TypeScript everywhere
- Phaser 3 game engine
- Docker support with multi-stage builds
- GitHub Actions CI/CD
- Comprehensive documentation

### Added - Advanced Features

#### Load Testing
- 50-bot stress testing tool (`packages/server/src/tools/loadTest.ts`)
- Latency metrics (average, P50, P95, P99)
- Throughput measurement
- Connection success rate tracking
- Error rate monitoring

#### Ads Mock System
- Rewarded video simulation (`packages/server/src/net/adsMock.ts`)
- Interstitial ads (match end)
- Cooldown system (3 minutes between ads)
- Beautiful UI notifications
- Multiple reward types: XP, cosmetics, currency
- Client integration (`packages/client/src/ads/AdsClient.ts`)
- Ready for real AdMob/IronSource integration

#### Region Optimization
- Auto-region selection based on ping tests
- 4 regions: Turkey, Central EU, West EU, Middle East
- Turkey (Istanbul) prioritized (30ms target)
- Geolocation fallback
- localStorage caching of selected region
- Region health monitoring
- Client-side region selector (`packages/client/src/region/RegionSelector.ts`)

### Documentation
- Main README with quick start guide
- DEPLOYMENT.md with step-by-step deploy instructions
- TODO.md with roadmap and sprint planning
- ADVANCED_FEATURES.md for load testing, ads, and regions
- GITHUB_PUSH.md for repository setup
- Inline code comments and JSDoc

### Technical Details
- Package versions:
  - Node.js: 20+
  - TypeScript: 5.3
  - Phaser: 3.70
  - Colyseus: 0.15
  - Vite: 5.0
  - pnpm: 8+

## [0.0.1] - 2025-10-27

### Initial Commit
- Project structure setup
- Basic monorepo configuration
- License (MIT)

---

## Version History

### Version Format
`MAJOR.MINOR.PATCH`

- **MAJOR**: Breaking changes
- **MINOR**: New features (backwards compatible)
- **PATCH**: Bug fixes and improvements

### Current Version
**v0.1.0** - MVP with advanced features

### Next Version Target
**v0.2.0** - Mobile controls + analytics + soft launch preparation

---

## Upgrade Guide

### From 0.0.1 to 0.1.0

1. Install new dependencies:
   ```bash
   pnpm install
   ```

2. Update environment variables:
   ```env
   # Add new region variables
   REGION_EU_TR_HOST=wss://tr-arena.example.com
   REGION_EU_CENTRAL_HOST=wss://eu-arena.example.com
   ```

3. Run load test to verify:
   ```bash
   pnpm tsx packages/server/src/tools/loadTest.ts
   ```

---

## Contributors

- Initial development: [@your-username]
- Special thanks to the .io game community

---

**[Unreleased]**: https://github.com/your-username/egg-fps-arena/compare/v0.1.0...HEAD  
**[0.1.0]**: https://github.com/your-username/egg-fps-arena/releases/tag/v0.1.0