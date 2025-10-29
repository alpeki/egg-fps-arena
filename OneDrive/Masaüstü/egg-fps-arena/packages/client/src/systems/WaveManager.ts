import Phaser from 'phaser';
import { StateManager } from '../core/StateManager';
import { EnemyType } from '../../../shared/types';
import { WAVE_BASE_ENEMY_COUNT, WAVE_SCALING_FACTOR, WAVE_BOSS_INTERVAL, ENEMY_SPAWN_DISTANCE } from '../../../shared/constants';
import { Enemy } from '../entities/Enemy';

export class WaveManager {
  private scene: Phaser.Scene;
  private stateManager: StateManager;
  private spawnTimer: number = 0;
  private spawnInterval: number = 2000; // ms between spawns
  private enemiesSpawned: number = 0;
  private enemiesThisWave: number = 0;

  constructor(scene: Phaser.Scene, stateManager: StateManager) {
    this.scene = scene;
    this.stateManager = stateManager;
  }

  startWave(): void {
    const wave = this.stateManager.gameState.wave;
    this.enemiesThisWave = Math.floor(WAVE_BASE_ENEMY_COUNT * Math.pow(WAVE_SCALING_FACTOR, wave - 1));
    this.enemiesSpawned = 0;
    this.spawnTimer = 0;

    console.log(`Wave ${wave} started! Enemies: ${this.enemiesThisWave}`);
  }

  update(time: number, delta: number): void {
    if (this.enemiesSpawned >= this.enemiesThisWave) {
      // Check if all enemies are dead
      if (this.stateManager.enemies.size === 0) {
        this.nextWave();
      }
      return;
    }

    this.spawnTimer += delta;
    if (this.spawnTimer >= this.spawnInterval) {
      this.spawnTimer = 0;
      this.spawnEnemy();
    }
  }

  private spawnEnemy(): void {
    const wave = this.stateManager.gameState.wave;
    const isBossWave = wave % WAVE_BOSS_INTERVAL === 0;
    
    // Determine enemy type based on wave
    let enemyType: EnemyType;
    if (isBossWave && this.enemiesSpawned === this.enemiesThisWave - 1) {
      enemyType = EnemyType.BOSS;
    } else {
      enemyType = this.getRandomEnemyType(wave);
    }

    // Spawn position (around player)
    const playerX = this.stateManager.playerState.x;
    const playerY = this.stateManager.playerState.y;
    const angle = Math.random() * Math.PI * 2;
    const x = playerX + Math.cos(angle) * ENEMY_SPAWN_DISTANCE;
    const y = playerY + Math.sin(angle) * ENEMY_SPAWN_DISTANCE;

    // Create enemy
    const gameScene = this.scene as any;
    if (gameScene.getEnemiesGroup) {
      const enemy = new Enemy(this.scene, x, y, enemyType, wave);
      gameScene.getEnemiesGroup().add(enemy);
      
      // Add to state
      this.stateManager.enemies.set(enemy.id, {
        id: enemy.id,
        type: enemyType,
        x,
        y,
        vx: 0,
        vy: 0,
        health: enemy.health,
        maxHealth: enemy.maxHealth,
        damage: enemy.damage,
        speed: enemy.speed,
        isDead: false
      });
    }

    this.enemiesSpawned++;
  }

  private getRandomEnemyType(wave: number): EnemyType {
    const types: EnemyType[] = [EnemyType.RUSHER];
    
    if (wave >= 2) types.push(EnemyType.SHOOTER);
    if (wave >= 3) types.push(EnemyType.EXPLODER);
    if (wave >= 5) types.push(EnemyType.TANK);

    return types[Math.floor(Math.random() * types.length)];
  }

  private nextWave(): void {
    this.stateManager.gameState.wave++;
    this.startWave();
  }
}
