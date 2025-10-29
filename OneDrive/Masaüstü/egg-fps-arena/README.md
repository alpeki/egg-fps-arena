# 🥚 Egg-FPS Arena

Fast-paced multiplayer .io FPS game with egg characters. Built with TypeScript, Phaser 3, and Colyseus.

## ✨ Features

- **Authoritative Server**: Server-side physics and validation
- **Client-Side Prediction**: Smooth, responsive controls
- **Server Reconciliation**: Automatic correction of client predictions
- **Snapshot Interpolation**: Smooth rendering of other players
- **Lag Compensation**: Fair hit detection with circular buffer
- **Binary Protocol**: <120 byte packets for efficiency
- **Bot Fill**: Auto-fill empty slots with AI bots
- **Cross-Platform**: Web (desktop + mobile) ready
- **🆕 Load Testing**: 50-bot stress testing tool
- **🆕 Ads Mock System**: Rewarded video + interstitial simulation
- **🆕 Region Optimization**: Auto-select best region (TR-optimized)

## 🚀 Quick Start

### Prerequisites

- Node.js >= 20
- pnpm >= 8

### Installation

```bash
# Install pnpm if you don't have it
npm install -g pnpm

# Clone and install dependencies
git clone <your-repo-url>
cd egg-fps-arena
pnpm install
```

### Development

```bash
# Run both server and client concurrently
pnpm dev

# Or run separately:
pnpm dev:server  # Server at ws://localhost:2567
pnpm dev:client  # Client at http://localhost:5173
```

Visit `http://localhost:5173` to play!

### Production Build

```bash
# Build all packages
pnpm build

# Start production server
cd packages/server && pnpm start
```

## 📦 Project Structure

```
egg-fps-arena/
├── packages/
│   ├── shared/          # Shared types, protocol, constants
│   │   ├── src/
│   │   │   ├── types.ts      # Game types (PlayerState, etc.)
│   │   │   ├── protocol.ts   # Binary serialization
│   │   │   ├── constants.ts  # Game constants
│   │   │   └── math.ts       # Utilities (lerp, etc.)
│   │   └── package.json
│   │
│   ├── server/          # Node.js + Colyseus server
│   │   ├── src/
│   │   │   ├── index.ts           # Entry point
│   │   │   ├── config.ts          # Configuration
│   │   │   ├── rooms/
│   │   │   │   └── ArenaRoom.ts   # Main game room
│   │   │   ├── sim/
│   │   │   │   ├── GameLoop.ts    # Physics & game logic
│   │   │   │   └── Bot.ts         # AI bots
│   │   │   └── utils/
│   │   │       └── logger.ts      # Logging utility
│   │   ├── Dockerfile
│   │   └── package.json
│   │
│   └── client/          # Phaser 3 client
│       ├── src/
│       │   ├── main.ts            # Entry point
│       │   ├── config/
│       │   │   └── config.ts      # Client config
│       │   ├── game/
│       │   │   └── scenes/
│       │   │       ├── BootScene.ts   # Loading
│       │   │       ├── GameScene.ts   # Main game
│       │   │       └── UIScene.ts     # HUD overlay
│       │   └── net/
│       │       └── Client.ts      # Network client
│       ├── index.html
│       ├── vite.config.ts
│       └── package.json
│
├── docker-compose.yml
├── .env.example
├── pnpm-workspace.yaml
└── package.json
```

## 🎮 Game Controls

- **WASD / Arrow Keys**: Move
- **Mouse**: Aim
- **Left Click**: Fire
- **Space**: Dash (7s cooldown)

## 🚀 Advanced Features

New tools for testing, monetization, and optimization:

- **Load Testing**: `pnpm tsx packages/server/src/tools/loadTest.ts`
- **Ads System**: Rewarded video + interstitial mock
- **Region Selection**: Auto-select best region (Turkey-optimized)

📖 See [ADVANCED_FEATURES.md](ADVANCED_FEATURES.md) for details.

## 🔧 Configuration

### Environment Variables

Copy `.env.example` to `.env` and configure:

```env
# Server
PORT=2567
TICK_RATE=20
ROOM_CAPACITY=16
REGION=eu-tr

# Client (build time)
VITE_WS_URL=ws://localhost:2567
```

### Game Constants

Edit `packages/shared/src/constants.ts` to tweak game parameters:

- Match duration
- Player speed
- Weapon damage
- Tick rate
- And more...

## 🏗️ Architecture

### Network Model

1. **Client-Side Prediction**: Client immediately applies input locally
2. **Server Authority**: Server validates and simulates physics
3. **Server Reconciliation**: Client corrects prediction errors
4. **Snapshot Interpolation**: Other players rendered with 100ms delay

### Binary Protocol

Efficient binary encoding keeps packets <120 bytes:
- Position quantized to 16 bits
- Velocity quantized to 8 bits
- Angles quantized to 10 bits

Example: Full player state = 24 bytes

## 🐳 Docker Deployment

### Build and Run

```bash
# Development
docker-compose up

# Production
docker-compose -f docker-compose.prod.yml up
```

### Server Dockerfile

See `packages/server/Dockerfile` for multi-stage build

## 🚀 Deployment Guide

### Server (Render / Railway)

1. Connect GitHub repo
2. Set environment variables
3. Deploy from `packages/server`
4. Note WebSocket URL

### Client (Vercel / Netlify)

1. Connect GitHub repo
2. Set `VITE_WS_URL` environment variable
3. Build command: `cd packages/client && pnpm build`
4. Publish directory: `packages/client/dist`

## 📊 Performance Targets

- Server tick: 20 Hz (50ms)
- Client render: 60 FPS
- Packet size: <120 bytes
- Latency target: <200ms p95

## 🧪 Testing

```bash
# Run tests
pnpm test

# Lint
pnpm lint

# Format
pnpm format
```

## 🔍 Debugging

Enable debug mode in `packages/client/src/config/config.ts`:

```ts
SHOW_DEBUG: true
```

This shows:
- Physics debug shapes
- Network stats
- FPS counter

## 📈 Monitoring

Add telemetry in production:

- Ping distribution (p50, p95, p99)
- Match duration
- Player retention
- Crash rate

Recommended tools:
- Sentry for error tracking
- Mixpanel for analytics

## 🎯 Roadmap

- [x] Core netcode (prediction, reconciliation, interpolation)
- [x] Basic FPS gameplay
- [x] Bot fill system
- [ ] Multiple weapon types
- [ ] Power-ups
- [ ] Multiple game modes
- [ ] Cosmetics system
- [ ] Battle pass
- [ ] Mobile controls
- [ ] Sound effects
- [ ] Particle effects
- [ ] Leaderboard

## 🤝 Contributing

1. Fork the repo
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📝 License

MIT License - see LICENSE file

## 💬 Support

- Issues: GitHub Issues
- Questions: GitHub Discussions

---

**Made with ❤️ for the .io game community**