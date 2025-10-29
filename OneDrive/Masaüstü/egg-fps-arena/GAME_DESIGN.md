# 🎮 EGG ARENA - ROGUELIKE WAVE SHOOTER

**Genre**: Top-down Roguelike Wave-based Shooter  
**Inspiration**: Vampire Survivors, Brotato, 20 Minutes Till Dawn

---

## 🎯 CORE CONCEPT

Player controls an egg character fighting endless waves of enemies. Each wave gets progressively harder. Defeat enemies to gain XP, level up to unlock upgrades, and survive as long as possible. Every 10 waves features a boss fight.

---

## 🎮 GAMEPLAY LOOP

### Wave Structure
```
Wave 1-9:   Normal enemies, increasing difficulty
Wave 10:    BOSS FIGHT + Permanent Upgrade
Wave 11-19: Harder enemies
Wave 20:    BOSS FIGHT + Permanent Upgrade
...continues infinitely
```

### Player Progression
1. Kill enemies → Gain XP
2. Level up → Choose 1 of 3 upgrades
3. Collect drops → Heal/Power-up
4. Beat boss → Permanent upgrade
5. Repeat with harder enemies

---

## 👤 PLAYER CHARACTER

### Stats
- **Health**: 100 HP (visual bar)
- **Speed**: 200 base
- **Damage**: Weapon-dependent
- **XP**: Levels 1-99+

### Movement
- **WASD**: 8-directional movement
- **Mouse**: Auto-aim to nearest enemy
- **Auto-fire**: Shoots automatically

### Visual
- Green egg sprite (32x32)
- Health bar above character
- XP bar at bottom of screen
- Level indicator

---

## 🔫 WEAPON SYSTEM

### Weapon Progression
```
Level 1:  Pistol (unlocked)
Level 3:  Shotgun (unlocked)
Level 6:  SMG (unlocked)
Level 10: Rifle (unlocked)
Level 15: Sniper (unlocked)
```

### Weapon Stats

| Weapon | Damage | Fire Rate | Range | Sound |
|--------|--------|-----------|-------|-------|
| **Pistol** | 15 | 500ms | 300 | Pop |
| **Shotgun** | 10×6 | 1000ms | 150 | Boom |
| **SMG** | 8 | 100ms | 250 | Rapid |
| **Rifle** | 20 | 300ms | 400 | Crack |
| **Sniper** | 60 | 1500ms | 600 | Bang |

### Weapon Upgrades (via level-up)
- Damage +10%
- Fire Rate +15%
- Range +20%
- Projectile Count +1
- Pierce +1 enemy

---

## 👾 ENEMY SYSTEM

### Enemy Types

#### Basic Enemies
1. **Slime** (Green)
   - HP: 20
   - Speed: 80
   - Damage: 5
   - XP: 5

2. **Fast Bug** (Red)
   - HP: 10
   - Speed: 150
   - Damage: 3
   - XP: 8

3. **Tank** (Blue)
   - HP: 50
   - Speed: 50
   - Damage: 10
   - XP: 15

4. **Shooter** (Yellow)
   - HP: 15
   - Speed: 60
   - Damage: 8 (ranged)
   - XP: 12

#### Boss Enemies (Every 10 waves)
1. **Wave 10: Giant Slime**
   - HP: 500
   - Spawns mini slimes
   - XP: 200

2. **Wave 20: Mega Tank**
   - HP: 1000
   - Charge attack
   - XP: 400

3. **Wave 30: Swarm Queen**
   - HP: 800
   - Spawns bugs
   - XP: 600

### Enemy Scaling
```javascript
waveNumber = currentWave
enemyHP = baseHP * (1 + waveNumber * 0.15)
enemyDamage = baseDamage * (1 + waveNumber * 0.1)
enemySpeed = baseSpeed * (1 + waveNumber * 0.05)
spawnCount = 5 + (waveNumber * 2)
```

---

## 📊 PROGRESSION SYSTEM

### XP & Leveling
- Kill enemy → Gain XP
- XP bar fills → Level up
- Level up → Choose upgrade
- XP required = level * 100

### Upgrade Categories

#### 1. Weapon Upgrades
- Damage +10%
- Fire Rate +15%
- Range +20%
- Projectile Count +1
- Pierce Enemies +1

#### 2. Player Upgrades
- Max HP +20
- Movement Speed +10%
- HP Regeneration +1/sec
- Pickup Range +20%
- Dash Cooldown -20%

#### 3. Special Upgrades
- Critical Hit Chance +5%
- Lifesteal +2%
- Explosion on Kill
- Shield (absorb 1 hit)
- Double XP for 30 sec

### Boss Rewards (Permanent)
- Unlock new weapon
- +50 Max HP
- +20% All Damage
- New Ability (Dash, Shield, etc.)
- Weapon Evolution

---

## 💎 ITEM DROPS

### Drop Types
1. **Health Orb** (Green)
   - Heals 25 HP
   - Drop rate: 10%

2. **XP Gem** (Blue)
   - Instant XP boost
   - Drop rate: 15%

3. **Magnet** (Yellow)
   - Attracts all pickups
   - Duration: 10 sec
   - Drop rate: 5%

4. **Shield** (Purple)
   - Absorbs next hit
   - Duration: 15 sec
   - Drop rate: 3%

5. **Nuke** (Red)
   - Kills all enemies on screen
   - Drop rate: 1%

---

## 🗺️ MAP DESIGN

### Arena Layout
- **Size**: 1200x800 pixels
- **Obstacles**: Increase each wave
- **Safe Zones**: Decrease each wave

### Wave-based Changes
```
Wave 1-5:   Open arena, few obstacles
Wave 6-10:  More walls, less space
Wave 11-15: Narrow corridors
Wave 16-20: Maze-like, very tight
Wave 20+:   Randomized layouts
```

### Obstacles
- Walls (block movement & bullets)
- Pillars (partial cover)
- Destructible crates
- Lava pools (damage over time)

---

## 🎨 UI/UX DESIGN

### HUD Layout
```
┌─────────────────────────────────────┐
│ Wave: 5/10    HP: ████████░░ 80/100 │
│ Level: 7      Weapon: Shotgun       │
├─────────────────────────────────────┤
│                                     │
│         [GAME AREA]                 │
│                                     │
├─────────────────────────────────────┤
│ XP: ████████████░░░░░░░ 450/500    │
│ Kills: 47     Time: 5:23           │
└─────────────────────────────────────┘
```

### Screens

#### 1. Main Menu
- Start Game
- Tutorial
- Settings
- Quit

#### 2. Level-Up Screen (Pause game)
- 3 random upgrades
- Show stats
- Choose 1

#### 3. Boss Victory Screen
- Boss defeated!
- Choose permanent upgrade
- Continue

#### 4. Game Over Screen
- Final stats
- Wave reached
- Kills/Time
- Retry/Menu

---

## 🔊 AUDIO DESIGN

### Weapon Sounds
- **Pistol**: Sharp "pew"
- **Shotgun**: Deep "boom" with echo
- **SMG**: Rapid "tat-tat-tat"
- **Rifle**: Crisp "crack"
- **Sniper**: Loud "bang" with reverb

### Enemy Sounds
- Hit: Squish
- Death: Pop
- Boss roar: Deep growl

### UI Sounds
- Level up: Chime
- Upgrade select: Click
- Wave start: Horn
- Boss warning: Siren

### Music
- Main menu: Calm
- Gameplay: Intense electronic
- Boss fight: Epic orchestral

---

## 🎯 DIFFICULTY CURVE

### Early Game (Waves 1-10)
- Few enemies
- Slow movement
- Easy to dodge
- Learn mechanics

### Mid Game (Waves 11-30)
- More enemies
- Mixed types
- Requires strategy
- Upgrade synergies matter

### Late Game (Waves 31+)
- Screen full of enemies
- Fast and deadly
- Tight spaces
- Perfect build required

---

## 🏆 WIN CONDITIONS

### Survival Goals
- Wave 10: First boss
- Wave 30: Third boss
- Wave 50: Elite player
- Wave 100: Legendary

### Achievements
- Survive 10 waves
- Kill 1000 enemies
- Reach level 50
- Beat all bosses
- Unlock all weapons

---

## 📱 TECHNICAL SPECS

### Performance Targets
- 60 FPS constant
- Max 200 enemies on screen
- Smooth particle effects
- No lag on level-up

### Controls
- WASD: Movement
- Mouse: Auto-aim
- Space: Dash (cooldown)
- ESC: Pause
- Auto-fire: Always on

---

## 🚀 IMPLEMENTATION PRIORITY

### Phase 1: Core Gameplay (Critical)
1. Player character with movement
2. Basic enemy spawning
3. Shooting mechanics
4. Health system
5. Wave system

### Phase 2: Progression (High)
6. XP and leveling
7. Upgrade system
8. Enemy scaling
9. Item drops
10. Boss fights

### Phase 3: Polish (Medium)
11. Weapon-specific sounds
12. Visual effects
13. UI improvements
14. Map obstacles
15. Particle effects

### Phase 4: Content (Low)
16. More enemy types
17. More weapons
18. More upgrades
19. More bosses
20. Achievements

---

## 🎮 GAME FEEL

### Juice Elements
- Screen shake on hit
- Particle explosions
- Damage numbers
- Slow-mo on level up
- Flash on damage
- Satisfying sounds
- Smooth animations

### Feedback Loop
1. See enemy
2. Shoot (satisfying sound)
3. Hit (particle effect)
4. Kill (explosion + XP)
5. Level up (power fantasy)
6. Repeat (addictive)

---

## 📊 BALANCE PHILOSOPHY

### Power Curve
- Player power: Exponential
- Enemy difficulty: Linear+
- Result: Feels powerful but challenging

### Upgrade Balance
- No useless upgrades
- Synergies encouraged
- Build variety
- RNG mitigation

---

This design creates an addictive, replayable roguelike shooter with clear progression and satisfying gameplay!
