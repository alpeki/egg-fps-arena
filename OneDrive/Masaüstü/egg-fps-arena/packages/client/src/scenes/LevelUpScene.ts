import Phaser from 'phaser';
import { StateManager } from '../core/StateManager';
import { UpgradeSystem } from '../systems/UpgradeSystem';

export class LevelUpScene extends Phaser.Scene {
  private stateManager!: StateManager;
  private upgradeSystem!: UpgradeSystem;

  constructor() {
    super({ key: 'LevelUpScene' });
  }

  init(data: { stateManager: StateManager }): void {
    this.stateManager = data.stateManager;
    this.upgradeSystem = new UpgradeSystem(this.stateManager);
  }

  create(): void {
    const { width, height } = this.cameras.main;

    // Semi-transparent overlay
    this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.8);

    // Title
    const title = this.add.text(width / 2, 100, 'LEVEL UP!', {
      fontSize: '48px',
      color: '#FFD700',
      fontStyle: 'bold'
    });
    title.setOrigin(0.5);

    // Level text
    const levelText = this.add.text(width / 2, 160, `Level ${this.stateManager.playerState.level}`, {
      fontSize: '24px',
      color: '#FFFFFF'
    });
    levelText.setOrigin(0.5);

    // Get 3 random upgrades
    const upgrades = this.upgradeSystem.getRandomUpgrades(3);

    // Create upgrade cards
    const cardWidth = 250;
    const cardHeight = 350;
    const spacing = 30;
    const startX = (width - (cardWidth * 3 + spacing * 2)) / 2;

    upgrades.forEach((upgrade, index) => {
      const x = startX + (cardWidth + spacing) * index + cardWidth / 2;
      const y = height / 2 + 50;

      this.createUpgradeCard(x, y, cardWidth, cardHeight, upgrade, () => {
        this.selectUpgrade(upgrade.id);
      });
    });

    // Instructions
    const instructions = this.add.text(width / 2, height - 50, 'Click to choose an upgrade', {
      fontSize: '18px',
      color: '#AAAAAA'
    });
    instructions.setOrigin(0.5);
  }

  private createUpgradeCard(
    x: number,
    y: number,
    width: number,
    height: number,
    upgrade: any,
    callback: () => void
  ): void {
    const card = this.add.container(x, y);

    // Background
    const bg = this.add.rectangle(0, 0, width, height, 0x2C3E50);
    bg.setStrokeStyle(3, 0x3498DB);
    bg.setInteractive({ useHandCursor: true });

    // Icon (placeholder)
    const icon = this.add.text(0, -height / 2 + 60, upgrade.icon, {
      fontSize: '48px'
    });
    icon.setOrigin(0.5);

    // Name
    const name = this.add.text(0, -height / 2 + 130, upgrade.name, {
      fontSize: '20px',
      color: '#FFFFFF',
      fontStyle: 'bold',
      wordWrap: { width: width - 20 }
    });
    name.setOrigin(0.5);

    // Description
    const description = this.add.text(0, -height / 2 + 180, upgrade.description, {
      fontSize: '16px',
      color: '#CCCCCC',
      wordWrap: { width: width - 30 },
      align: 'center'
    });
    description.setOrigin(0.5, 0);

    // Stack count (if applicable)
    const currentStacks = this.stateManager.activeUpgrades.get(upgrade.id) || 0;
    if (currentStacks > 0) {
      const stackText = this.add.text(0, height / 2 - 30, `Current: ${currentStacks}/${upgrade.maxStacks}`, {
        fontSize: '14px',
        color: '#FFD700'
      });
      stackText.setOrigin(0.5);
      card.add(stackText);
    }

    card.add([bg, icon, name, description]);

    // Hover effects
    bg.on('pointerover', () => {
      bg.setStrokeStyle(4, 0x52B788);
      this.tweens.add({
        targets: card,
        scaleX: 1.05,
        scaleY: 1.05,
        duration: 200,
        ease: 'Power2'
      });
    });

    bg.on('pointerout', () => {
      bg.setStrokeStyle(3, 0x3498DB);
      this.tweens.add({
        targets: card,
        scaleX: 1,
        scaleY: 1,
        duration: 200,
        ease: 'Power2'
      });
    });

    bg.on('pointerdown', () => {
      callback();
    });
  }

  private selectUpgrade(upgradeId: string): void {
    // Apply upgrade
    this.upgradeSystem.applyUpgrade(upgradeId);

    // Resume game
    this.stateManager.gameState.isPaused = false;
    this.scene.stop();
  }
}
