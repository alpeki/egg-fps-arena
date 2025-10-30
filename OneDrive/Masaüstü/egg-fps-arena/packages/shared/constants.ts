// Game constants
export const GAME_WIDTH = 1280;
export const GAME_HEIGHT = 720;
export const MAP_SIZE = 3000;

// Player constants
export const PLAYER_RADIUS = 20;
export const PLAYER_SPEED = 200;
export const PLAYER_DASH_SPEED = 600;
export const PLAYER_DASH_DURATION = 200;
export const PLAYER_DASH_COOLDOWN = 7000;
export const PLAYER_BASE_HP = 100;

// XP constants
export const XP_BASE_REQUIREMENT = 100;
export const XP_SCALING_FACTOR = 1.4;        // Reduced from 1.5 for smoother curve
export const XP_MAGNET_RANGE = 100;
export const XP_WAVE_BONUS = 1.1;            // XP increases 10% per wave

// Enemy constants
export const ENEMY_SPAWN_DISTANCE = 800;
export const ENEMY_DESPAWN_DISTANCE = 1500;
export const ENEMY_HP_SCALE_PER_WAVE = 0.15; // 15% HP increase per wave
export const ENEMY_DMG_SCALE_PER_WAVE = 0.12; // 12% damage increase per wave

// Wave constants
export const WAVE_BASE_ENEMY_COUNT = 10;     // Starting enemy count
export const WAVE_SCALING_FACTOR = 1.35;     // Enemy count growth per wave
export const WAVE_BOSS_INTERVAL = 10;        // Boss every 10 waves
export const WAVE_HORDE_MULTIPLIER = 4;      // 4x enemies on horde waves
export const WAVE_SPAWN_INTERVAL_BASE = 2000; // ms
export const WAVE_SPAWN_INTERVAL_MIN = 500;   // Minimum spawn interval

// Token system (balanced for permanent upgrades)
export const TOKENS_PER_WAVE = 2;
export const TOKENS_PER_KILL = 0.2;
export const TOKENS_PER_MINUTE = 5;

// Weapon constants
export const WEAPON_PROJECTILE_SPEED = 800;
export const WEAPON_PROJECTILE_LIFETIME = 2000;
