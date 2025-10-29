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
}

// Enemy types
export enum EnemyType {
  RUSHER = 'rusher',
  SHOOTER = 'shooter',
  EXPLODER = 'exploder',
  TANK = 'tank',
  BOSS = 'boss'
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
}

export interface SaveData {
  metaUpgrades: MetaUpgrades;
  totalCoins: number;
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
