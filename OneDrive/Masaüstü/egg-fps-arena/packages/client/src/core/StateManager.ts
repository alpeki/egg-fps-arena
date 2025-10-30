import { GameState, PlayerState, EnemyState, XPOrb, RunData } from '../../../shared/types';
import { PLAYER_BASE_HP } from '../../../shared/constants';

export class StateManager {
  public gameState: GameState;
  public playerState: PlayerState;
  public enemies: Map<string, EnemyState>;
  public xpOrbs: Map<string, XPOrb>;
  public activeUpgrades: Map<string, number>; // upgradeId -> stack count
  public runData: RunData;

  constructor() {
    this.gameState = {
      wave: 1,
      timeElapsed: 0,
      kills: 0,
      isPaused: false,
      isGameOver: false
    };

    this.playerState = this.createInitialPlayerState();
    this.enemies = new Map();
    this.xpOrbs = new Map();
    this.activeUpgrades = new Map();
    this.runData = {
      banishedUpgrades: new Set(),
      skipsRemaining: 1,
      refreshesRemaining: 1,
      tokensEarned: 0
    };
  }

  private createInitialPlayerState(): PlayerState {
    return {
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      aimAngle: 0,
      health: PLAYER_BASE_HP,
      maxHealth: PLAYER_BASE_HP,
      level: 1,
      xp: 0,
      xpToNextLevel: 100,
      weapon: 'pistol' as any,
      isDead: false,
      dashCooldown: 0,
      // Extended stats
      damageMultiplier: 1.0,
      fireRateMultiplier: 1.0,
      moveSpeedMultiplier: 1.0,
      critChance: 0,
      critDamage: 1.5,
      lifesteal: 0,
      armor: 0,
      regenPerSecond: 0,
      projectileCount: 1,
      pierceCount: 0,
      pickupRange: 100,
      xpMultiplier: 1.0,
      luck: 0
    };
  }

  reset(): void {
    this.gameState = {
      wave: 1,
      timeElapsed: 0,
      kills: 0,
      isPaused: false,
      isGameOver: false
    };
    this.playerState = this.createInitialPlayerState();
    this.enemies.clear();
    this.xpOrbs.clear();
    this.activeUpgrades.clear();
    this.runData = {
      banishedUpgrades: new Set(),
      skipsRemaining: 1,
      refreshesRemaining: 1,
      tokensEarned: 0
    };
  }

  update(delta: number): void {
    if (!this.gameState.isPaused && !this.gameState.isGameOver) {
      this.gameState.timeElapsed += delta;
    }
  }
}
