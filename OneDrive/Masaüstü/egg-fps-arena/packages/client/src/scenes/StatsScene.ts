import Phaser from 'phaser';
import { StateManager } from '../core/StateManager';

export class StatsScene extends Phaser.Scene {
  private stateManager!: StateManager;
  private scrollY: number = 0;
  private contentContainer!: Phaser.GameObjects.Container;

  constructor() {
    super({ key: 'StatsScene' });
  }

  init(data: { stateManager: StateManager }): void {
    this.stateManager = data.stateManager;
  }

  create(): void {
    const { width, height } = this.cameras.main;

    // Semi-transparent overlay
    const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.7);
    overlay.setInteractive();

    // Background panel
    const panelWidth = 600;
    const panelHeight = height - 100;
    const panel = this.add.rectangle(width / 2, height / 2, panelWidth, panelHeight, 0x1a1a1a);
    panel.setStrokeStyle(3, 0xffd700);

    // Title
    const title = this.add.text(width / 2, 80, '📊 PLAYER STATS', {
      fontSize: '36px',
      color: '#ffd700',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    
    // Create scrollable content container
    this.contentContainer = this.add.container(0, 0);

    // Stats content
    const player = this.stateManager.playerState;
    const upgrades = this.stateManager.activeUpgrades;
    
    const statsText = this.add.text(width / 2 - 250, 140, this.createStatsText(player, upgrades), {
      fontSize: '18px',
      color: '#ffffff',
      lineSpacing: 8
    });
    this.contentContainer.add(statsText);
    
    // Enable mouse wheel scrolling
    this.input.on('wheel', (_pointer: any, _gameObjects: any, _deltaX: number, deltaY: number) => {
      this.scrollY += deltaY * 0.5;
      const maxScroll = Math.max(0, statsText.height - panelHeight + 200);
      this.scrollY = Phaser.Math.Clamp(this.scrollY, -maxScroll, 0);
      this.contentContainer.y = this.scrollY;
    });

    // Close button (not in container, always visible)
    const closeBtn = this.add.rectangle(width / 2, height - 80, 200, 50, 0xff4444);
    closeBtn.setStrokeStyle(2, 0xffffff);
    closeBtn.setInteractive({ useHandCursor: true });

    const closeText = this.add.text(width / 2, height - 80, 'CLOSE (TAB)', {
      fontSize: '20px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    closeBtn.on('pointerover', () => closeBtn.setFillStyle(0xff6666));
    closeBtn.on('pointerout', () => closeBtn.setFillStyle(0xff4444));
    closeBtn.on('pointerdown', () => this.closeStats());

    // TAB key to close
    this.input.keyboard?.on('keydown-TAB', (event: KeyboardEvent) => {
      event.preventDefault();
      this.closeStats();
    });
  }

  private createStatsText(player: any, upgrades: Map<string, number>): string {
    const lines: string[] = [];

    // Core Stats
    lines.push('═══ CORE STATS ═══');
    lines.push(`Level: ${player.level}`);
    lines.push(`Health: ${Math.ceil(player.health)} / ${player.maxHealth}`);
    lines.push(`XP: ${Math.floor(player.xp)} / ${player.xpToNextLevel}`);
    lines.push('');

    // Offensive Stats
    lines.push('═══ OFFENSE ═══');
    lines.push(`Damage: ${(player.damageMultiplier * 100).toFixed(0)}%`);
    lines.push(`Fire Rate: ${(player.fireRateMultiplier * 100).toFixed(0)}%`);
    lines.push(`Projectiles: ${player.projectileCount}`);
    lines.push(`Pierce: ${player.pierceCount}`);
    lines.push(`Crit Chance: ${(player.critChance * 100).toFixed(1)}%`);
    lines.push(`Crit Damage: ${(player.critDamage * 100).toFixed(0)}%`);
    lines.push('');

    // Defensive Stats
    lines.push('═══ DEFENSE ═══');
    lines.push(`Armor: ${(player.armor * 100).toFixed(0)}%`);
    lines.push(`HP Regen: ${player.regenPerSecond.toFixed(1)}/s`);
    lines.push(`Lifesteal: ${(player.lifesteal * 100).toFixed(1)}%`);
    lines.push('');

    // Utility Stats
    lines.push('═══ UTILITY ═══');
    lines.push(`Move Speed: ${(player.moveSpeedMultiplier * 100).toFixed(0)}%`);
    lines.push(`Pickup Range: ${player.pickupRange}`);
    lines.push(`XP Gain: ${(player.xpMultiplier * 100).toFixed(0)}%`);
    lines.push(`Luck: ${player.luck}`);
    lines.push('');

    // Active Upgrades
    lines.push('═══ ACTIVE UPGRADES ═══');
    if (upgrades.size === 0) {
      lines.push('No upgrades yet');
    } else {
      upgrades.forEach((stacks, upgradeId) => {
        lines.push(`${upgradeId}: Level ${stacks}`);
      });
    }

    return lines.join('\n');
  }

  private closeStats(): void {
    this.stateManager.gameState.isPaused = false;
    this.scene.stop();
  }
}
