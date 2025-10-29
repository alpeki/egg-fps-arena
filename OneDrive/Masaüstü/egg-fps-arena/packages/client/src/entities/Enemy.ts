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
    // Balanced scaling: HP and damage increase with waves
    const hpScale = 1 + (wave - 1) * 0.15;      // 15% per wave
    const dmgScale = 1 + (wave - 1) * 0.12;     // 12% per wave

    switch (type) {
      // BASIC ENEMIES
      case EnemyType.RUSHER:
        return {
          health: Math.floor(40 * hpScale),
          damage: Math.floor(8 * dmgScale),
          speed: 180,
          radius: 14,
          color: 0xFF6B6B,
          xpValue: 8
        };
      
      case EnemyType.TANK:
        return {
          health: Math.floor(150 * hpScale),
          damage: Math.floor(25 * dmgScale),
          speed: 50,
          radius: 28,
          color: 0x8338EC,
          xpValue: 25
        };
      
      case EnemyType.SHOOTER:
        return {
          health: Math.floor(60 * hpScale),
          damage: Math.floor(12 * dmgScale),
          speed: 90,
          radius: 13,
          color: 0x4ECDC4,
          xpValue: 12
        };

      // SPECIAL ENEMIES
      case EnemyType.EXPLODER:
        return {
          health: Math.floor(30 * hpScale),
          damage: Math.floor(40 * dmgScale),
          speed: 130,
          radius: 11,
          color: 0xFFBE0B,
          xpValue: 15
        };
      
      case EnemyType.SPLITTER:
        return {
          health: Math.floor(80 * hpScale),
          damage: Math.floor(10 * dmgScale),
          speed: 100,
          radius: 16,
          color: 0x06FFA5,
          xpValue: 20
        };
      
      case EnemyType.TELEPORTER:
        return {
          health: Math.floor(50 * hpScale),
          damage: Math.floor(15 * dmgScale),
          speed: 120,
          radius: 12,
          color: 0xA855F7,
          xpValue: 18
        };
      
      case EnemyType.HEALER:
        return {
          health: Math.floor(70 * hpScale),
          damage: Math.floor(5 * dmgScale),
          speed: 70,
          radius: 15,
          color: 0x10B981,
          xpValue: 30
        };
      
      case EnemyType.SHIELDER:
        return {
          health: Math.floor(90 * hpScale),
          damage: Math.floor(8 * dmgScale),
          speed: 75,
          radius: 17,
          color: 0x3B82F6,
          xpValue: 25
        };

      // ADVANCED ENEMIES
      case EnemyType.SNIPER:
        return {
          health: Math.floor(45 * hpScale),
          damage: Math.floor(35 * dmgScale),
          speed: 60,
          radius: 10,
          color: 0xDC2626,
          xpValue: 22
        };
      
      case EnemyType.SPAWNER:
        return {
          health: Math.floor(120 * hpScale),
          damage: Math.floor(5 * dmgScale),
          speed: 40,
          radius: 20,
          color: 0x7C3AED,
          xpValue: 35
        };
      
      case EnemyType.CHARGER:
        return {
          health: Math.floor(100 * hpScale),
          damage: Math.floor(30 * dmgScale),
          speed: 200,
          radius: 18,
          color: 0xF59E0B,
          xpValue: 28
        };
      
      case EnemyType.GHOST:
        return {
          health: Math.floor(55 * hpScale),
          damage: Math.floor(18 * dmgScale),
          speed: 110,
          radius: 13,
          color: 0x64748B,
          xpValue: 20
        };

      // BOSS TYPES
      case EnemyType.BOSS_TANK:
        return {
          health: Math.floor(800 * hpScale),
          damage: Math.floor(50 * dmgScale),
          speed: 70,
          radius: 45,
          color: 0xFF006E,
          xpValue: 150
        };
      
      case EnemyType.BOSS_SWARM:
        return {
          health: Math.floor(600 * hpScale),
          damage: Math.floor(30 * dmgScale),
          speed: 90,
          radius: 38,
          color: 0xEC4899,
          xpValue: 120
        };
      
      case EnemyType.BOSS_HYBRID:
        return {
          health: Math.floor(1000 * hpScale),
          damage: Math.floor(45 * dmgScale),
          speed: 100,
          radius: 42,
          color: 0x8B5CF6,
          xpValue: 200
        };

      default:
        return {
          health: 50,
          damage: 10,
          speed: 100,
          radius: 15,
          color: 0xFFFFFF,
          xpValue: 10
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
    // Spawn XP based on enemy type
    const gameScene = this.scene as any;
    if (gameScene.xpSystem) {
      const stats = Enemy.getStats(this.enemyType, 1);
      const xpValue = stats.xpValue || 10;
      gameScene.xpSystem.spawnXPOrb(this.scene, this.x, this.y, xpValue);
    }

    this.destroy();
  }
}
