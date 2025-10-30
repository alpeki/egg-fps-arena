import Phaser from 'phaser';
import { StateManager } from '../core/StateManager';
import { EnemyType } from '../../../shared/types';
import { WAVE_BASE_ENEMY_COUNT, WAVE_SCALING_FACTOR, WAVE_BOSS_INTERVAL, WAVE_HORDE_MULTIPLIER, ENEMY_SPAWN_DISTANCE, TOKENS_PER_WAVE } from '../../../shared/constants';
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
    const isHordeWave = wave % WAVE_BOSS_INTERVAL === 0;
    
    // Calculate base enemy count with exponential scaling
    let baseCount = Math.floor(WAVE_BASE_ENEMY_COUNT + (wave - 1) * 3);
    
    // Apply horde multiplier every 10 waves
    if (isHordeWave) {
      baseCount = Math.floor(baseCount * WAVE_HORDE_MULTIPLIER);
      console.log(`🔥 HORDE WAVE ${wave}! Prepare for ${baseCount} enemies!`);
    }
    
    this.enemiesThisWave = baseCount;
    this.enemiesSpawned = 0;
    this.spawnTimer = 0;
    
    // Award tokens for completing previous wave
    if (wave > 1) {
      this.stateManager.runData.tokensEarned += TOKENS_PER_WAVE;
    }

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
    const isHordeWave = wave % WAVE_BOSS_INTERVAL === 0;
    
    // Determine enemy type based on wave
    let enemyType: EnemyType;
    
    // On horde waves, spawn more variety and tougher enemies
    if (isHordeWave) {
      // Spawn a mix of all available enemy types
      enemyType = this.getRandomEnemyType(wave, true);
    } else {
      enemyType = this.getRandomEnemyType(wave, false);
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

  private getRandomEnemyType(wave: number, isHordeWave: boolean = false): EnemyType {
    const types: EnemyType[] = [EnemyType.RUSHER];
    
    // Gradually unlock enemy types
    if (wave >= 2) types.push(EnemyType.SHOOTER);
    if (wave >= 3) types.push(EnemyType.EXPLODER, EnemyType.TANK);
    if (wave >= 4) types.push(EnemyType.SPLITTER);
    if (wave >= 5) types.push(EnemyType.TELEPORTER, EnemyType.CHARGER);
    if (wave >= 6) types.push(EnemyType.HEALER);
    if (wave >= 7) types.push(EnemyType.SHIELDER, EnemyType.SNIPER);
    if (wave >= 8) types.push(EnemyType.SPAWNER);
    if (wave >= 9) types.push(EnemyType.GHOST);
    
    // On horde waves, increase chance of tougher enemies
    if (isHordeWave) {
      // Add extra weight to tanks and special enemies
      types.push(EnemyType.TANK, EnemyType.TANK);
      if (wave >= 5) types.push(EnemyType.CHARGER, EnemyType.TELEPORTER);
      if (wave >= 7) types.push(EnemyType.SNIPER);
    }

    return types[Math.floor(Math.random() * types.length)];
  }

  private nextWave(): void {
    this.stateManager.gameState.wave++;
    this.startWave();
  }
}
