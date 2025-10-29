import Phaser from 'phaser';
import { StateManager } from '../core/StateManager';
import { WaveManager } from '../systems/WaveManager';
import { XPSystem } from '../systems/XPSystem';
import { CombatSystem } from '../systems/CombatSystem';
import { Player } from '../entities/Player';
import { PLAYER_SPEED, MAP_SIZE } from '../../../shared/constants';

export class GameScene extends Phaser.Scene {
  private stateManager!: StateManager;
  private waveManager!: WaveManager;
  private xpSystem!: XPSystem;
  private combatSystem!: CombatSystem;
  private player!: Player;
  private enemies!: Phaser.GameObjects.Group;
  private projectiles!: Phaser.GameObjects.Group;
  private xpOrbs!: Phaser.GameObjects.Group;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: any;

  constructor() {
    super({ key: 'GameScene' });
  }

  create(): void {
    // Initialize systems
    this.stateManager = new StateManager();
    this.waveManager = new WaveManager(this, this.stateManager);
    this.xpSystem = new XPSystem(this.stateManager);
    this.combatSystem = new CombatSystem(this.stateManager);

    // Create groups
    this.enemies = this.add.group();
    this.projectiles = this.add.group();
    this.xpOrbs = this.add.group();

    // Create player
    this.player = new Player(this, 0, 0);
    this.add.existing(this.player);

    // Setup camera
    this.cameras.main.startFollow(this.player);
    this.cameras.main.setBounds(-MAP_SIZE / 2, -MAP_SIZE / 2, MAP_SIZE, MAP_SIZE);

    // Setup input
    this.cursors = this.input.keyboard!.createCursorKeys();
    this.wasd = this.input.keyboard!.addKeys('W,A,S,D');

    // Setup HUD
    this.createHUD();

    // Start first wave
    this.waveManager.startWave();
  }

  update(time: number, delta: number): void {
    if (this.stateManager.gameState.isPaused || this.stateManager.gameState.isGameOver) {
      return;
    }

    // Update state manager
    this.stateManager.update(delta);

    // Handle player input
    this.handlePlayerInput(delta);

    // Update player
    this.player.update(time, delta);

    // Update wave manager
    this.waveManager.update(time, delta);

    // Update XP system
    this.xpSystem.update(this.player, this.xpOrbs.getChildren() as any[]);

    // Update combat
    this.combatSystem.update(
      this.player,
      this.enemies.getChildren() as any[],
      this.projectiles.getChildren() as any[]
    );

    // Check for level up
    if (this.xpSystem.checkLevelUp()) {
      this.showLevelUpScreen();
    }

    // Check for game over
    if (this.stateManager.playerState.isDead) {
      this.gameOver();
    }
  }

  private handlePlayerInput(delta: number): void {
    const speed = PLAYER_SPEED;
    let vx = 0;
    let vy = 0;

    // Movement
    if (this.cursors.left.isDown || this.wasd.A.isDown) vx -= 1;
    if (this.cursors.right.isDown || this.wasd.D.isDown) vx += 1;
    if (this.cursors.up.isDown || this.wasd.W.isDown) vy -= 1;
    if (this.cursors.down.isDown || this.wasd.S.isDown) vy += 1;

    // Normalize diagonal movement
    if (vx !== 0 && vy !== 0) {
      vx *= 0.707;
      vy *= 0.707;
    }

    this.stateManager.playerState.vx = vx * speed;
    this.stateManager.playerState.vy = vy * speed;

    // Aim angle (mouse)
    const pointer = this.input.activePointer;
    const worldPoint = this.cameras.main.getWorldPoint(pointer.x, pointer.y);
    this.stateManager.playerState.aimAngle = Phaser.Math.Angle.Between(
      this.player.x,
      this.player.y,
      worldPoint.x,
      worldPoint.y
    );

    // Shooting
    if (pointer.isDown) {
      this.player.shoot();
    }
  }

  private createHUD(): void {
    // HP Bar
    const hpBarBg = this.add.rectangle(100, 30, 200, 20, 0x333333).setScrollFactor(0);
    const hpBar = this.add.rectangle(100, 30, 200, 20, 0xFF0000).setScrollFactor(0);
    hpBar.setOrigin(0, 0.5);
    hpBarBg.setOrigin(0, 0.5);

    // XP Bar
    const xpBarBg = this.add.rectangle(100, 60, 200, 15, 0x333333).setScrollFactor(0);
    const xpBar = this.add.rectangle(100, 60, 200, 15, 0x00FF00).setScrollFactor(0);
    xpBar.setOrigin(0, 0.5);
    xpBarBg.setOrigin(0, 0.5);

    // Wave text
    const waveText = this.add.text(this.cameras.main.width - 20, 20, 'Wave: 1', {
      fontSize: '24px',
      color: '#FFFFFF'
    }).setScrollFactor(0).setOrigin(1, 0);

    // Store references for updates
    this.registry.set('hpBar', hpBar);
    this.registry.set('xpBar', xpBar);
    this.registry.set('waveText', waveText);
  }

  private showLevelUpScreen(): void {
    this.stateManager.gameState.isPaused = true;
    this.scene.launch('LevelUpScene', { stateManager: this.stateManager });
  }

  private gameOver(): void {
    this.stateManager.gameState.isGameOver = true;
    this.scene.start('GameOverScene', {
      wave: this.stateManager.gameState.wave,
      time: Math.floor(this.stateManager.gameState.timeElapsed / 1000),
      kills: this.stateManager.gameState.kills
    });
  }

  getProjectilesGroup(): Phaser.GameObjects.Group {
    return this.projectiles;
  }

  getEnemiesGroup(): Phaser.GameObjects.Group {
    return this.enemies;
  }

  getXPOrbsGroup(): Phaser.GameObjects.Group {
    return this.xpOrbs;
  }
}
