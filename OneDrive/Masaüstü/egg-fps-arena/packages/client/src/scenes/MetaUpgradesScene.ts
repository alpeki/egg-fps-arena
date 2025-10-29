import Phaser from 'phaser';
import { MetaProgressionSystem } from '../systems/MetaProgressionSystem.js';

export class MetaUpgradesScene extends Phaser.Scene {
  private metaSystem!: MetaProgressionSystem;
  private coinsText!: Phaser.GameObjects.Text;

  constructor() {
    super({ key: 'MetaUpgradesScene' });
  }

  init(data: { metaSystem: MetaProgressionSystem }): void {
    this.metaSystem = data.metaSystem;
  }

  create(): void {
    const { width, height } = this.cameras.main;

    // Background
    this.add.rectangle(width / 2, height / 2, width, height, 0x1a1a1a);

    // Title
    const title = this.add.text(width / 2, 60, '💎 META UPGRADES', {
      fontSize: '48px',
      color: '#FFD700',
      fontStyle: 'bold'
    });
    title.setOrigin(0.5);

    // Coins display
    this.coinsText = this.add.text(width / 2, 120, `Coins: ${this.metaSystem.getCoins()}`, {
      fontSize: '28px',
      color: '#FFD700'
    });
    this.coinsText.setOrigin(0.5);

    // Upgrade cards
    const startY = 200;
    const spacing = 140;

    this.createUpgradeCard(width / 4, startY, 
      '❤️ Max HP', 
      `+10 Max HP\nCurrent: +${this.metaSystem.getMetaUpgrades().maxHPBonus}`,
      50,
      () => this.purchaseUpgrade('hp')
    );

    this.createUpgradeCard(width / 2, startY,
      '⚔️ Damage',
      `+5% Damage\nCurrent: +${this.metaSystem.getMetaUpgrades().damageBonus}%`,
      75,
      () => this.purchaseUpgrade('damage')
    );

    this.createUpgradeCard(3 * width / 4, startY,
      '⭐ XP Gain',
      `+10% XP\nCurrent: +${this.metaSystem.getMetaUpgrades().xpBonus}%`,
      60,
      () => this.purchaseUpgrade('xp')
    );

    // High score display
    const highScore = this.metaSystem.getHighScore();
    this.add.text(width / 2, height - 120, 
      `Best Run: Wave ${highScore.wave} | ${highScore.kills} Kills`, {
      fontSize: '20px',
      color: '#AAAAAA'
    }).setOrigin(0.5);

    // Back button
    this.createButton(width / 2, height - 60, 'BACK TO MENU', () => {
      this.scene.start('MenuScene');
    });
  }

  private createUpgradeCard(
    x: number,
    y: number,
    title: string,
    description: string,
    cost: number,
    callback: () => void
  ): void {
    const card = this.add.container(x, y);

    // Background
    const bg = this.add.rectangle(0, 0, 220, 180, 0x2C3E50);
    bg.setStrokeStyle(3, 0x3498DB);

    // Title
    const titleText = this.add.text(0, -60, title, {
      fontSize: '22px',
      color: '#FFFFFF',
      fontStyle: 'bold'
    });
    titleText.setOrigin(0.5);

    // Description
    const descText = this.add.text(0, -20, description, {
      fontSize: '14px',
      color: '#CCCCCC',
      align: 'center'
    });
    descText.setOrigin(0.5);

    // Cost
    const costText = this.add.text(0, 35, `💰 ${cost} Coins`, {
      fontSize: '16px',
      color: '#FFD700',
      fontStyle: 'bold'
    });
    costText.setOrigin(0.5);

    // Buy button
    const buyBtn = this.add.rectangle(0, 70, 150, 35, 0x4CAF50);
    buyBtn.setInteractive({ useHandCursor: true });
    
    const buyText = this.add.text(0, 70, 'PURCHASE', {
      fontSize: '14px',
      color: '#FFFFFF',
      fontStyle: 'bold'
    });
    buyText.setOrigin(0.5);

    buyBtn.on('pointerover', () => {
      buyBtn.setFillStyle(0x66BB6A);
    });

    buyBtn.on('pointerout', () => {
      buyBtn.setFillStyle(0x4CAF50);
    });

    buyBtn.on('pointerdown', () => {
      callback();
    });

    card.add([bg, titleText, descText, costText, buyBtn, buyText]);
  }

  private purchaseUpgrade(type: string): void {
    let success = false;

    switch (type) {
      case 'hp':
        success = this.metaSystem.upgradeMaxHP();
        break;
      case 'damage':
        success = this.metaSystem.upgradeDamage();
        break;
      case 'xp':
        success = this.metaSystem.upgradeXPGain();
        break;
    }

    if (success) {
      // Refresh scene to show updated values
      this.scene.restart({ metaSystem: this.metaSystem });
    } else {
      // Show "not enough coins" message
      const msg = this.add.text(this.cameras.main.width / 2, 160, 'Not enough coins!', {
        fontSize: '20px',
        color: '#FF0000',
        fontStyle: 'bold'
      });
      msg.setOrigin(0.5);

      this.time.delayedCall(1500, () => {
        msg.destroy();
      });
    }
  }

  private createButton(x: number, y: number, text: string, callback: () => void): void {
    const button = this.add.container(x, y);

    const bg = this.add.rectangle(0, 0, 280, 50, 0x4CAF50);
    bg.setInteractive({ useHandCursor: true });

    const label = this.add.text(0, 0, text, {
      fontSize: '20px',
      color: '#FFFFFF',
      fontStyle: 'bold'
    });
    label.setOrigin(0.5);

    button.add([bg, label]);

    bg.on('pointerover', () => {
      bg.setFillStyle(0x66BB6A);
    });

    bg.on('pointerout', () => {
      bg.setFillStyle(0x4CAF50);
    });

    bg.on('pointerdown', () => {
      callback();
    });
  }
}
