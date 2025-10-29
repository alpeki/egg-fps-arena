# 🥚 Egg Survivor - Architecture Documentation

## 🎮 Game Vision

**Egg Survivor** is a single-player roguelite FPS survivor game inspired by Vampire Survivors, 20 Minutes Till Dawn, and similar wave-based games.

### Core Concept
- **Genre**: Roguelite FPS Survivor
- **Perspective**: First-person shooter (FPS)
- **Players**: Single-player only
- **Gameplay**: Survive endless waves of enemies, level up, choose upgrades

## 🏗️ New Architecture

### Project Structure

```
egg-fps-arena/
├── packages/
│   ├── client/                 # Main game (client-only)
│   │   ├── src/
│   │   │   ├── core/          # Core game systems
│   │   │   │   ├── Game.ts           # Main game class
│   │   │   │   ├── GameLoop.ts       # Game loop manager
│   │   │   │   └── StateManager.ts   # Game state
│   │   │   │
│   │   │   ├── entities/      # Game entities
│   │   │   │   ├── Player.ts         # Player character
│   │   │   │   ├── Enemy.ts          # Base enemy class
│   │   │   │   ├── EnemyTypes.ts     # Enemy variants
│   │   │   │   ├── Projectile.ts     # Bullets/projectiles
│   │   │   │   └── XPOrb.ts          # Experience orbs
│   │   │   │
│   │   │   ├── systems/       # Game systems
│   │   │   │   ├── WaveManager.ts    # Wave spawning
│   │   │   │   ├── XPSystem.ts       # XP & leveling
│   │   │   │   ├── UpgradeSystem.ts  # Power-ups
│   │   │   │   ├── CombatSystem.ts   # Damage/collision
│   │   │   │   └── MetaProgression.ts # Persistent upgrades
│   │   │   │
│   │   │   ├── ui/            # User interface
│   │   │   │   ├── MainMenu.ts       # Main menu
│   │   │   │   ├── HUD.ts            # In-game HUD
│   │   │   │   ├── LevelUpScreen.ts  # Upgrade selection
│   │   │   │   ├── GameOverScreen.ts # Game over
│   │   │   │   └── MetaUpgradeTree.ts # Meta progression UI
│   │   │   │
│   │   │   ├── data/          # Game data
│   │   │   │   ├── upgrades.ts       # Upgrade definitions
│   │   │   │   ├── enemies.ts        # Enemy definitions
│   │   │   │   ├── weapons.ts        # Weapon stats
│   │   │   │   └── arenas.ts         # Arena/map data
│   │   │   │
│   │   │   ├── audio/         # Audio system
│   │   │   │   └── AudioManager.ts
│   │   │   │
│   │   │   └── utils/         # Utilities
│   │   │       ├── Storage.ts        # localStorage wrapper
│   │   │       └── Math.ts           # Math helpers
│   │   │
│   │   └── index.html
│   │
│   └── shared/                # Shared utilities (minimal)
│       └── src/
│           ├── types.ts       # TypeScript types
│           ├── constants.ts   # Game constants
│           └── math.ts        # Math utilities
│
├── README.md
└── package.json
```

## 🎯 Core Systems

### 1. Wave System
- **Purpose**: Spawn increasingly difficult enemy waves
- **Features**:
  - Progressive difficulty scaling
  - Multiple enemy types per wave
  - Boss waves every 5 waves
  - Dynamic spawn positioning

### 2. XP & Leveling System
- **XP Sources**: Killing enemies
- **Level Up**: Choose 1 of 3 random upgrades
- **Progression**: Exponential XP curve

### 3. Upgrade System
**Upgrade Categories**:
- **Damage**: +10% damage, +1 projectile, piercing shots
- **Defense**: +20 max HP, HP regeneration, damage reduction
- **Mobility**: +10% move speed, dash cooldown reduction
- **Utility**: +10% XP gain, magnet range, luck

### 4. Meta Progression
- **Currency**: Coins earned per run
- **Persistent Upgrades**:
  - Starting HP +10
  - Starting damage +5%
  - XP gain +10%
  - Unlock new weapons
  - Unlock new characters

### 5. Enemy Types

| Type | Behavior | HP | Damage | Speed |
|------|----------|-----|--------|-------|
| **Rusher** | Chases player | 50 | 10 | Fast |
| **Shooter** | Ranged attacks | 30 | 15 | Slow |
| **Exploder** | Suicide bomber | 20 | 30 | Medium |
| **Tank** | High HP, slow | 200 | 20 | Very Slow |
| **Boss** | Special abilities | 1000 | 40 | Medium |

### 6. Arena System
**3 Arenas**:
1. **Training Yard** - Grassland, easy
2. **Toxic Forest** - Poison hazards, medium
3. **Lava Core** - Fire hazards, hard

## 🔄 Game Flow

```
Main Menu
    ↓
Meta Upgrade Tree (optional)
    ↓
Arena Selection
    ↓
Game Start
    ↓
Wave Loop:
  - Spawn enemies
  - Player fights
  - Collect XP
  - Level up → Choose upgrade
  - Repeat
    ↓
Player Death
    ↓
Game Over Screen
  - Final stats
  - Coins earned
  - Return to menu
```

## 💾 Data Persistence

**localStorage Schema**:
```typescript
{
  metaUpgrades: {
    maxHPBonus: number,
    damageBonus: number,
    xpBonus: number,
    unlockedWeapons: string[],
    unlockedCharacters: string[]
  },
  totalCoins: number,
  highScores: {
    [arenaId: string]: {
      wave: number,
      time: number,
      kills: number
    }
  },
  settings: {
    volume: number,
    sfxVolume: number,
    musicVolume: number
  }
}
```

## 🎨 UI/UX Flow

### Main Menu
- Play button
- Meta upgrades button
- Settings button
- Credits

### HUD (In-Game)
- HP bar
- XP bar with level
- Wave number
- Time survived
- Kills count
- Current weapon
- Active buffs

### Level Up Screen
- Pauses game
- Shows 3 random upgrades
- Click to select
- Resume game

### Game Over Screen
- Final stats (wave, time, kills)
- Coins earned
- High score comparison
- Retry / Main Menu buttons

## 🔧 Technical Stack

- **Engine**: Phaser 3
- **Language**: TypeScript
- **Build**: Vite
- **Storage**: localStorage
- **Audio**: Phaser Audio System
- **Deployment**: Netlify / Itch.io

## 📊 Performance Targets

- **60 FPS** stable gameplay
- **100+ enemies** on screen
- **<100ms** input latency
- **<50MB** total bundle size

## 🎵 Audio Requirements

**Sound Effects**:
- XP pickup
- Level up
- Enemy hit
- Enemy death
- Player hit
- Player death
- Weapon fire
- Upgrade select

**Music**:
- Menu theme
- Game theme (looping)
- Boss theme

## 🚀 Development Phases

### Phase 1: Core Gameplay (Week 1)
- [ ] Remove multiplayer code
- [ ] Implement game loop
- [ ] Player movement & shooting
- [ ] Basic enemy spawning
- [ ] Collision detection

### Phase 2: Progression Systems (Week 1-2)
- [ ] XP system
- [ ] Level up screen
- [ ] Upgrade system
- [ ] Wave manager

### Phase 3: Content (Week 2)
- [ ] 5 enemy types
- [ ] 15+ upgrades
- [ ] 3 arenas
- [ ] Audio integration

### Phase 4: Meta Progression (Week 3)
- [ ] localStorage integration
- [ ] Meta upgrade tree
- [ ] Coin system
- [ ] High scores

### Phase 5: Polish (Week 3-4)
- [ ] UI/UX refinement
- [ ] Visual effects
- [ ] Balance tuning
- [ ] Bug fixes

## 🎮 Controls

- **WASD**: Move
- **Mouse**: Aim
- **Left Click**: Fire
- **Space**: Dash (if unlocked)
- **ESC**: Pause menu

## 📝 Notes

- All game logic runs client-side
- No server required
- Deterministic RNG for fairness
- Save data in localStorage
- Export/import save feature for backup
