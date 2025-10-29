import Phaser from 'phaser';
import { EnemyType } from '../../../shared/types';

export class Enemy extends Phaser.GameObjects.Arc {
  public id: string;
  public enemyType: EnemyType;
  public health: number;
  public maxHealth: number;
  public damage: number;
  public speed: number;
  public radius: number;

  constructor(scene: Phaser.Scene, x: number, y: number, type: EnemyType, wave: number) {
    const stats = Enemy.getStats(type, wave);
    super(scene, x, y, stats.radius, 0, 360, false, stats.color);

    this.id = `enemy_${Date.now()}_${Math.random()}`;
    this.enemyType = type;
    this.health = stats.health;
    this.maxHealth = stats.health;
    this.damage = stats.damage;
    this.speed = stats.speed;
    this.radius = stats.radius;

    // Enable physics
    scene.physics.add.existing(this);
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setCircle(this.radius);

    scene.add.existing(this);
  }

  static getStats(type: EnemyType, wave: number) {
    const waveMultiplier = 1 + (wave - 1) * 0.2;

    switch (type) {
      case EnemyType.RUSHER:
        return {
          health: Math.floor(50 * waveMultiplier),
          damage: Math.floor(10 * waveMultiplier),
          speed: 150,
          radius: 15,
          color: 0xFF6B6B
        };
      case EnemyType.SHOOTER:
        return {
          health: Math.floor(30 * waveMultiplier),
          damage: Math.floor(15 * waveMultiplier),
          speed: 80,
          radius: 12,
          color: 0x4ECDC4
        };
      case EnemyType.EXPLODER:
        return {
          health: Math.floor(20 * waveMultiplier),
          damage: Math.floor(30 * waveMultiplier),
          speed: 120,
          radius: 10,
          color: 0xFFBE0B
        };
      case EnemyType.TANK:
        return {
          health: Math.floor(200 * waveMultiplier),
          damage: Math.floor(20 * waveMultiplier),
          speed: 60,
          radius: 25,
          color: 0x8338EC
        };
      case EnemyType.BOSS:
        return {
          health: Math.floor(1000 * waveMultiplier),
          damage: Math.floor(40 * waveMultiplier),
          speed: 100,
          radius: 40,
          color: 0xFF006E
        };
      default:
        return {
          health: 50,
          damage: 10,
          speed: 100,
          radius: 15,
          color: 0xFFFFFF
        };
    }
  }

  update(playerX: number, playerY: number): void {
    // Move towards player
    const dx = playerX - this.x;
    const dy = playerY - this.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance > 0) {
      const body = this.body as Phaser.Physics.Arcade.Body;
      body.setVelocity(
        (dx / distance) * this.speed,
        (dy / distance) * this.speed
      );
    }
  }

  takeDamage(amount: number): void {
    this.health -= amount;
    
    // Visual feedback
    this.setAlpha(0.5);
    this.scene.time.delayedCall(100, () => {
      this.setAlpha(1);
    });

    if (this.health <= 0) {
      this.die();
    }
  }

  private die(): void {
    // Spawn XP
    const gameScene = this.scene as any;
    if (gameScene.xpSystem) {
      const xpValue = this.enemyType === EnemyType.BOSS ? 100 : 10;
      gameScene.xpSystem.spawnXPOrb(this.scene, this.x, this.y, xpValue);
    }

    this.destroy();
  }
}
