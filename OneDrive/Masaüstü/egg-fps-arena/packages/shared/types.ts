// Player state
export interface PlayerState {
  x: number;
  y: number;
  vx: number;
  vy: number;
  aimAngle: number;
  health: number;
  maxHealth: number;
  level: number;
  xp: number;
  xpToNextLevel: number;
  weapon: WeaponType;
  isDead: boolean;
  dashCooldown: number;
  // Extended stats for display
  damageMultiplier: number;
  fireRateMultiplier: number;
  moveSpeedMultiplier: number;
  critChance: number;
  critDamage: number;
  lifesteal: number;
  armor: number;
  regenPerSecond: number;
  projectileCount: number;
  pierceCount: number;
  pickupRange: number;
  xpMultiplier: number;
  luck: number;
}

// Enemy types
export enum EnemyType {
  // Basic enemies
  RUSHER = 'rusher',           // Fast, low HP, melee
  TANK = 'tank',               // Slow, high HP, high damage
  SHOOTER = 'shooter',         // Medium speed, ranged attacks
  
  // Special enemies
  EXPLODER = 'exploder',       // Suicide bomber, AOE damage
  SPLITTER = 'splitter',       // Splits into smaller enemies on death
  TELEPORTER = 'teleporter',   // Teleports near player
  HEALER = 'healer',           // Heals nearby enemies
  SHIELDER = 'shielder',       // Shields nearby enemies
  
  // Advanced enemies
  SNIPER = 'sniper',           // Long range, high damage, slow fire
  SPAWNER = 'spawner',         // Spawns minions
  CHARGER = 'charger',         // Charges at player with knockback
  GHOST = 'ghost',             // Phases through obstacles
  
  // Boss types
  BOSS_TANK = 'boss_tank',     // Massive HP, slow, devastating
  BOSS_SWARM = 'boss_swarm',   // Spawns many minions
  BOSS_HYBRID = 'boss_hybrid'  // Multiple attack patterns
}

export interface EnemyState {
  id: string;
  type: EnemyType;
  x: number;
  y: number;
  vx: number;
  vy: number;
  health: number;
  maxHealth: number;
  damage: number;
  speed: number;
  isDead: boolean;
}

// Weapon types
export enum WeaponType {
  PISTOL = 'pistol',
  SHOTGUN = 'shotgun',
  RIFLE = 'rifle',
  SMG = 'smg'
}

export interface WeaponStats {
  damage: number;
  fireRate: number;
  projectileCount: number;
  projectileSpeed: number;
  spread: number;
  piercing: boolean;
}

// XP Orb
export interface XPOrb {
  id: string;
  x: number;
  y: number;
  value: number;
}

// Upgrade types
export enum UpgradeCategory {
  DAMAGE = 'damage',
  DEFENSE = 'defense',
  MOBILITY = 'mobility',
  UTILITY = 'utility'
}

export interface Upgrade {
  id: string;
  name: string;
  description: string;
  category: UpgradeCategory;
  icon: string;
  maxStacks: number;
  effect: (player: PlayerState, stacks: number) => void;
}

// Game state
export interface GameState {
  wave: number;
  timeElapsed: number;
  kills: number;
  isPaused: boolean;
  isGameOver: boolean;
}

// Wave configuration
export interface WaveConfig {
  wave: number;
  enemyCount: number;
  enemyTypes: EnemyType[];
  spawnInterval: number;
  isBossWave: boolean;
}

// Meta progression
export interface MetaUpgrades {
  maxHPBonus: number;
  damageBonus: number;
  xpBonus: number;
  startingLevel: number;
  unlockedWeapons: WeaponType[];
  banishSlots: number;    // How many upgrades can be banished
  skipSlots: number;      // How many times can skip
  refreshSlots: number;   // How many times can refresh
}

export interface SaveData {
  metaUpgrades: MetaUpgrades;
  totalTokens: number;  // Changed from coins to tokens
  highScores: {
    [arenaId: string]: {
      wave: number;
      time: number;
      kills: number;
    };
  };
  settings: {
    volume: number;
    sfxVolume: number;
    musicVolume: number;
  };
}

// Run-specific data
export interface RunData {
  banishedUpgrades: Set<string>;  // Upgrades banished this run
  skipsRemaining: number;
  refreshesRemaining: number;
  tokensEarned: number;
}
