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
  private metaSystem: any;

  constructor() {
    super({ key: 'GameScene' });
  }

  create(): void {
    // Get meta system from registry
    this.metaSystem = this.registry.get('metaSystem');
    
    // Initialize systems
    this.stateManager = new StateManager();
    
    // Initialize run data with meta upgrades
    if (this.metaSystem) {
      const metaUpgrades = this.metaSystem.getMetaUpgrades();
      this.stateManager.runData.skipsRemaining = metaUpgrades.skipSlots;
      this.stateManager.runData.refreshesRemaining = metaUpgrades.refreshSlots;
    }
    
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
    
    // TAB tuşu - Stats ekranı
    this.input.keyboard!.on('keydown-TAB', (event: KeyboardEvent) => {
      event.preventDefault();
      this.stateManager.gameState.isPaused = true;
      this.scene.launch('StatsScene', { stateManager: this.stateManager });
    });
    
    // ESC tuşu - Pause
    this.input.keyboard!.on('keydown-ESC', () => {
      this.stateManager.gameState.isPaused = true;
      this.scene.launch('PauseScene', { stateManager: this.stateManager });
    });

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

    // Update HUD
    this.updateHUD();

    // Check for level up
    if (this.xpSystem.checkLevelUp()) {
      this.showLevelUpScreen();
    }

    // Check for game over
    if (this.stateManager.playerState.isDead) {
      this.gameOver();
    }
  }

  private updateHUD(): void {
    const player = this.stateManager.playerState;
    const game = this.stateManager.gameState;

    // Update HP bar
    const hpBar = this.registry.get('hpBar') as Phaser.GameObjects.Rectangle;
    const hpText = this.registry.get('hpText') as Phaser.GameObjects.Text;
    if (hpBar && hpText) {
      const hpPercent = player.health / player.maxHealth;
      hpBar.width = 246 * hpPercent;
      hpText.setText(`${Math.ceil(player.health)} / ${player.maxHealth}`);
      
      // Color based on HP percentage
      if (hpPercent > 0.6) {
        hpBar.setFillStyle(0x00FF00); // Green
      } else if (hpPercent > 0.3) {
        hpBar.setFillStyle(0xFFAA00); // Orange
      } else {
        hpBar.setFillStyle(0xFF0000); // Red
      }
    }

    // Update XP bar
    const xpBar = this.registry.get('xpBar') as Phaser.GameObjects.Rectangle;
    const xpText = this.registry.get('xpText') as Phaser.GameObjects.Text;
    if (xpBar && xpText) {
      const xpPercent = player.xp / player.xpToNextLevel;
      xpBar.width = 246 * xpPercent;
      xpText.setText(`${Math.floor(player.xp)} / ${player.xpToNextLevel}`);
    }

    // Update level text
    const levelText = this.registry.get('levelText') as Phaser.GameObjects.Text;
    if (levelText) {
      levelText.setText(`LEVEL ${player.level}`);
    }

    // Update wave text
    const waveText = this.registry.get('waveText') as Phaser.GameObjects.Text;
    if (waveText) {
      waveText.setText(`Wave: ${game.wave}`);
    }

    // Update kills text
    const killsText = this.registry.get('killsText') as Phaser.GameObjects.Text;
    if (killsText) {
      killsText.setText(`Kills: ${game.kills}`);
    }
    
    // Update tokens text
    const tokensText = this.registry.get('tokensText') as Phaser.GameObjects.Text;
    if (tokensText) {
      tokensText.setText(`🥚 ${Math.floor(this.stateManager.runData.tokensEarned)}`);
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
    const { width } = this.cameras.main;

    // HP Bar Background
    const hpBarBg = this.add.rectangle(20, 30, 250, 25, 0x1a1a1a).setScrollFactor(0);
    hpBarBg.setOrigin(0, 0.5);
    hpBarBg.setStrokeStyle(2, 0x444444);

    // HP Bar Fill
    const hpBar = this.add.rectangle(22, 30, 246, 21, 0xFF0000).setScrollFactor(0);
    hpBar.setOrigin(0, 0.5);

    // HP Text
    const hpText = this.add.text(145, 30, '100 / 100', {
      fontSize: '14px',
      color: '#FFFFFF',
      fontStyle: 'bold'
    }).setScrollFactor(0).setOrigin(0.5);

    // HP Label
    this.add.text(20, 12, '❤️ HEALTH', {
      fontSize: '12px',
      color: '#FF6B6B',
      fontStyle: 'bold'
    }).setScrollFactor(0);

    // XP Bar Background
    const xpBarBg = this.add.rectangle(20, 70, 250, 20, 0x1a1a1a).setScrollFactor(0);
    xpBarBg.setOrigin(0, 0.5);
    xpBarBg.setStrokeStyle(2, 0x444444);

    // XP Bar Fill (starts at 0 width)
    const xpBar = this.add.rectangle(22, 70, 0, 16, 0x00D9FF).setScrollFactor(0);
    xpBar.setOrigin(0, 0.5);

    // XP Text
    const xpText = this.add.text(145, 70, '0 / 100', {
      fontSize: '14px',
      color: '#FFFFFF',
      fontStyle: 'bold'
    }).setScrollFactor(0).setOrigin(0.5);

    // XP Label
    this.add.text(20, 52, '⭐ EXPERIENCE', {
      fontSize: '12px',
      color: '#00D9FF',
      fontStyle: 'bold'
    }).setScrollFactor(0);

    // Level display
    const levelText = this.add.text(width - 20, 20, 'LEVEL 1', {
      fontSize: '28px',
      color: '#FFD700',
      fontStyle: 'bold'
    }).setScrollFactor(0).setOrigin(1, 0);

    // Wave display
    const waveText = this.add.text(width - 20, 55, 'Wave: 1', {
      fontSize: '20px',
      color: '#FFFFFF'
    }).setScrollFactor(0).setOrigin(1, 0);

    // Kills counter
    const killsText = this.add.text(width - 20, 85, 'Kills: 0', {
      fontSize: '16px',
      color: '#FF6B6B'
    }).setScrollFactor(0).setOrigin(1, 0);
    
    // Egg Tokens counter - YENİ!
    const tokensText = this.add.text(width - 20, 110, '🥚 0', {
      fontSize: '18px',
      color: '#FFD700',
      fontStyle: 'bold'
    }).setScrollFactor(0).setOrigin(1, 0);

    // Store references for updates
    this.registry.set('hpBar', hpBar);
    this.registry.set('hpText', hpText);
    this.registry.set('xpBar', xpBar);
    this.registry.set('xpText', xpText);
    this.registry.set('levelText', levelText);
    this.registry.set('waveText', waveText);
    this.registry.set('killsText', killsText);
    this.registry.set('tokensText', tokensText);
  }

  private showLevelUpScreen(): void {
    this.stateManager.gameState.isPaused = true;
    this.scene.launch('LevelUpScene', { 
      stateManager: this.stateManager,
      metaSystem: this.metaSystem 
    });
  }

  private gameOver(): void {
    this.stateManager.gameState.isGameOver = true;
    
    // Tokenları kaydet
    if (this.metaSystem) {
      const tokensEarned = this.stateManager.runData.tokensEarned;
      this.metaSystem.addTokens(tokensEarned);
      console.log(`🪙 Earned ${tokensEarned} tokens this run!`);
    }
    
    this.scene.start('GameOverScene', {
      wave: this.stateManager.gameState.wave,
      time: Math.floor(this.stateManager.gameState.timeElapsed / 1000),
      kills: this.stateManager.gameState.kills,
      tokens: this.stateManager.runData.tokensEarned
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
