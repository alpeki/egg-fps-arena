import Phaser from 'phaser';
import { StateManager } from '../core/StateManager';
import { UpgradeSystem } from '../systems/UpgradeSystem';
import { MetaProgressionSystem } from '../systems/MetaProgressionSystem';

export class LevelUpScene extends Phaser.Scene {
  private stateManager!: StateManager;
  private upgradeSystem!: UpgradeSystem;
  private metaSystem!: MetaProgressionSystem;
  private currentUpgrades: any[] = [];

  constructor() {
    super({ key: 'LevelUpScene' });
  }

  init(data: { stateManager: StateManager; metaSystem: MetaProgressionSystem }): void {
    this.stateManager = data.stateManager;
    this.metaSystem = data.metaSystem;
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
    this.currentUpgrades = this.upgradeSystem.getRandomUpgrades(3);
    this.displayUpgrades();

    // Action buttons (Banish, Skip, Refresh)
    this.createActionButtons(width, height);

    // Instructions
    const instructions = this.add.text(width / 2, height - 50, 'Click to choose an upgrade or use actions below', {
      fontSize: '18px',
      color: '#AAAAAA'
    });
    instructions.setOrigin(0.5);
  }

  private displayUpgrades(): void {
    const { width, height } = this.cameras.main;

    // Clear existing upgrade cards
    this.children.list.forEach(child => {
      if ((child as any).isUpgradeCard) {
        child.destroy();
      }
    });

    // Create upgrade cards
    const cardWidth = 250;
    const cardHeight = 350;
    const spacing = 30;
    const startX = (width - (cardWidth * 3 + spacing * 2)) / 2;

    this.currentUpgrades.forEach((upgrade, index) => {
      const x = startX + (cardWidth + spacing) * index + cardWidth / 2;
      const y = height / 2 + 20;

      this.createUpgradeCard(x, y, cardWidth, cardHeight, upgrade, () => {
        this.selectUpgrade(upgrade.id);
      });
    });
  }

  private createActionButtons(width: number, height: number): void {
    const buttonY = height - 120;
    const buttonWidth = 150;
    const buttonHeight = 50;
    const spacing = 20;

    const metaUpgrades = this.metaSystem.getMetaUpgrades();
    const runData = this.stateManager.runData;

    // Banish button
    const banishX = width / 2 - buttonWidth - spacing;
    this.createActionButton(
      banishX,
      buttonY,
      buttonWidth,
      buttonHeight,
      `🚫 Banish (${runData.banishedUpgrades.size}/${metaUpgrades.banishSlots})`,
      0xff4444,
      () => this.showBanishMode(),
      runData.banishedUpgrades.size >= metaUpgrades.banishSlots
    );

    // Skip button
    const skipX = width / 2;
    this.createActionButton(
      skipX,
      buttonY,
      buttonWidth,
      buttonHeight,
      `⏭️ Skip (${runData.skipsRemaining})`,
      0x4444ff,
      () => this.skipUpgrade(),
      runData.skipsRemaining <= 0
    );

    // Refresh button
    const refreshX = width / 2 + buttonWidth + spacing;
    this.createActionButton(
      refreshX,
      buttonY,
      buttonWidth,
      buttonHeight,
      `🔄 Refresh (${runData.refreshesRemaining})`,
      0x44ff44,
      () => this.refreshUpgrades(),
      runData.refreshesRemaining <= 0
    );
  }

  private createActionButton(
    x: number,
    y: number,
    width: number,
    height: number,
    text: string,
    color: number,
    callback: () => void,
    disabled: boolean
  ): void {
    const button = this.add.rectangle(x, y, width, height, disabled ? 0x333333 : color);
    button.setStrokeStyle(2, disabled ? 0x666666 : 0xffffff);
    if (!disabled) {
      button.setInteractive({ useHandCursor: true });
    }

    const buttonText = this.add.text(x, y, text, {
      fontSize: '14px',
      color: disabled ? '#666666' : '#ffffff',
      fontStyle: 'bold',
      align: 'center'
    }).setOrigin(0.5);

    if (!disabled) {
      button.on('pointerover', () => {
        button.setFillStyle(color, 0.8);
      });

      button.on('pointerout', () => {
        button.setFillStyle(color, 1);
      });

      button.on('pointerdown', callback);
    }
  }

  private showBanishMode(): void {
    // Show instruction to click on upgrade to banish
    const { width, height } = this.cameras.main;
    const instruction = this.add.text(width / 2, height / 2 - 150, 'Click an upgrade to BANISH it forever', {
      fontSize: '24px',
      color: '#ff4444',
      fontStyle: 'bold',
      backgroundColor: '#000000',
      padding: { x: 20, y: 10 }
    }).setOrigin(0.5);

    // Temporarily change card callbacks
    setTimeout(() => instruction.destroy(), 3000);
  }

  private skipUpgrade(): void {
    if (this.stateManager.runData.skipsRemaining > 0) {
      this.stateManager.runData.skipsRemaining--;
      this.stateManager.gameState.isPaused = false;
      this.scene.stop();
    }
  }

  private refreshUpgrades(): void {
    if (this.stateManager.runData.refreshesRemaining > 0) {
      this.stateManager.runData.refreshesRemaining--;
      this.currentUpgrades = this.upgradeSystem.getRandomUpgrades(3);
      this.displayUpgrades();
      
      // Recreate action buttons with updated counts
      const { width, height } = this.cameras.main;
      this.children.list.forEach(child => {
        if ((child as any).isActionButton) {
          child.destroy();
        }
      });
      this.createActionButtons(width, height);
    }
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
    (card as any).isUpgradeCard = true;

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
