import { GameState, PlayerState, EnemyState, XPOrb } from '../../../shared/types';
import { PLAYER_BASE_HP } from '../../../shared/constants';

export class StateManager {
  public gameState: GameState;
  public playerState: PlayerState;
  public enemies: Map<string, EnemyState>;
  public xpOrbs: Map<string, XPOrb>;
  public activeUpgrades: Map<string, number>; // upgradeId -> stack count

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
      dashCooldown: 0
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
  }

  update(delta: number): void {
    if (!this.gameState.isPaused && !this.gameState.isGameOver) {
      this.gameState.timeElapsed += delta;
    }
  }
}
