import Phaser from 'phaser';
import { MetaProgressionSystem } from '../systems/MetaProgressionSystem';
import { UPGRADES } from '../data/upgrades';

interface ShopItem {
  id: string;
  name: string;
  description: string;
  cost: number;
  icon: string;
  maxLevel: number;
  currentLevel: number;
  onPurchase: () => boolean;
}

export class ShopScene extends Phaser.Scene {
  private metaSystem!: MetaProgressionSystem;
  private currentTab: 'upgrades' | 'features' = 'upgrades';
  private scrollY: number = 0;
  private contentContainer!: Phaser.GameObjects.Container;

  constructor() {
    super({ key: 'ShopScene' });
  }

  init(data: { metaSystem: MetaProgressionSystem }): void {
    this.metaSystem = data.metaSystem;
  }

  create(): void {
    const { width, height } = this.cameras.main;

    // Background
    this.add.rectangle(width / 2, height / 2, width, height, 0x0a0a0a);

    // Title
    const title = this.add.text(width / 2, 50, '🏪 SHOP', {
      fontSize: '48px',
      color: '#ffd700',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // Egg Token display
    const tokens = this.metaSystem.getTokens();
    const tokenText = this.add.text(width / 2, 110, `🥚 Egg Tokens: ${tokens}`, {
      fontSize: '24px',
      color: '#ffffff'
    }).setOrigin(0.5);

    // Tab buttons
    this.createTabButtons(width);

    // Shop content area
    this.displayShopContent(width, height);

    // Back button
    const backBtn = this.add.rectangle(width / 2, height - 50, 200, 50, 0x333333);
    backBtn.setStrokeStyle(2, 0xffffff);
    backBtn.setInteractive({ useHandCursor: true });

    const backText = this.add.text(width / 2, height - 50, 'BACK TO MENU', {
      fontSize: '18px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    backBtn.on('pointerover', () => backBtn.setFillStyle(0x555555));
    backBtn.on('pointerout', () => backBtn.setFillStyle(0x333333));
    backBtn.on('pointerdown', () => {
      this.scene.stop();
      this.scene.start('MenuScene');
    });
  }

  private createTabButtons(width: number): void {
    const tabY = 160;
    const tabWidth = 200;
    const tabHeight = 50;

    // Upgrades tab
    const upgradesTab = this.add.rectangle(width / 2 - tabWidth / 2 - 10, tabY, tabWidth, tabHeight,
      this.currentTab === 'upgrades' ? 0x4444ff : 0x222222);
    upgradesTab.setStrokeStyle(2, 0xffffff);
    upgradesTab.setInteractive({ useHandCursor: true });

    const upgradesText = this.add.text(width / 2 - tabWidth / 2 - 10, tabY, '⚡ UPGRADES', {
      fontSize: '18px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    upgradesTab.on('pointerdown', () => {
      this.currentTab = 'upgrades';
      this.scene.restart();
    });

    // Features tab
    const featuresTab = this.add.rectangle(width / 2 + tabWidth / 2 + 10, tabY, tabWidth, tabHeight,
      this.currentTab === 'features' ? 0x4444ff : 0x222222);
    featuresTab.setStrokeStyle(2, 0xffffff);
    featuresTab.setInteractive({ useHandCursor: true });

    const featuresText = this.add.text(width / 2 + tabWidth / 2 + 10, tabY, '📖 FEATURES', {
      fontSize: '18px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    featuresTab.on('pointerdown', () => {
      this.currentTab = 'features';
      this.scene.restart();
    });
  }

  private displayShopContent(width: number, height: number): void {
    if (this.currentTab === 'upgrades') {
      this.displayUpgradesTab(width, height);
    } else {
      this.displayFeaturesTab(width, height);
    }
  }

  private displayUpgradesTab(width: number, height: number): void {
    const metaUpgrades = this.metaSystem.getMetaUpgrades();

    const items: ShopItem[] = [
      {
        id: 'max_hp',
        name: 'Max HP Bonus',
        description: '+10 Max HP per level',
        cost: 50 + metaUpgrades.maxHPBonus * 10,
        icon: '❤️',
        maxLevel: 20,
        currentLevel: metaUpgrades.maxHPBonus / 10,
        onPurchase: () => this.metaSystem.upgradeMaxHP(50 + metaUpgrades.maxHPBonus * 10)
      },
      {
        id: 'damage',
        name: 'Damage Bonus',
        description: '+5% Damage per level',
        cost: 75 + metaUpgrades.damageBonus * 15,
        icon: '⚔️',
        maxLevel: 20,
        currentLevel: metaUpgrades.damageBonus / 5,
        onPurchase: () => this.metaSystem.upgradeDamage(75 + metaUpgrades.damageBonus * 15)
      },
      {
        id: 'xp_gain',
        name: 'XP Bonus',
        description: '+10% XP Gain per level',
        cost: 60 + metaUpgrades.xpBonus * 12,
        icon: '⭐',
        maxLevel: 15,
        currentLevel: metaUpgrades.xpBonus / 10,
        onPurchase: () => this.metaSystem.upgradeXPGain(60 + metaUpgrades.xpBonus * 12)
      },
      {
        id: 'banish_slots',
        name: 'Banish Slots',
        description: 'Add 1 more banish slot',
        cost: 100 * metaUpgrades.banishSlots,
        icon: '🚫',
        maxLevel: 5,
        currentLevel: metaUpgrades.banishSlots - 1,
        onPurchase: () => this.metaSystem.upgradeBanishSlots(100 * metaUpgrades.banishSlots)
      },
      {
        id: 'skip_slots',
        name: 'Skip Slots',
        description: 'Add 1 more skip slot',
        cost: 80 * metaUpgrades.skipSlots,
        icon: '⏭️',
        maxLevel: 5,
        currentLevel: metaUpgrades.skipSlots - 1,
        onPurchase: () => this.metaSystem.upgradeSkipSlots(80 * metaUpgrades.skipSlots)
      },
      {
        id: 'refresh_slots',
        name: 'Refresh Slots',
        description: 'Add 1 more refresh slot',
        cost: 120 * metaUpgrades.refreshSlots,
        icon: '🔄',
        maxLevel: 5,
        currentLevel: metaUpgrades.refreshSlots - 1,
        onPurchase: () => this.metaSystem.upgradeRefreshSlots(120 * metaUpgrades.refreshSlots)
      }
    ];

    this.displayShopItems(items, width, height);
  }

  private displayFeaturesTab(width: number, height: number): void {
    // Display all available upgrades as an encyclopedia with scroll
    const startY = 220;
    this.contentContainer = this.add.container(0, 0);

    const title = this.add.text(width / 2, startY, 'ALL AVAILABLE UPGRADES', {
      fontSize: '24px',
      color: '#ffd700',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    let yOffset = startY + 50;
    const categories = ['DAMAGE', 'DEFENSE', 'MOBILITY', 'UTILITY'];

    categories.forEach(category => {
      const categoryUpgrades = UPGRADES.filter(u => u.category.toUpperCase() === category);
      
      if (categoryUpgrades.length > 0) {
        // Category header
        const categoryText = this.add.text(100, yOffset, `═══ ${category} ═══`, {
          fontSize: '20px',
          color: '#00d9ff',
          fontStyle: 'bold'
        });
        this.contentContainer.add(categoryText);
        yOffset += 35;

        // List upgrades
        categoryUpgrades.forEach(upgrade => {
          const upgradeText = this.add.text(120, yOffset, 
            `${upgrade.icon} ${upgrade.name} - ${upgrade.description}`, {
            fontSize: '16px',
            color: '#ffffff',
            wordWrap: { width: width - 240 }
          });
          this.contentContainer.add(upgradeText);
          yOffset += 30;
        });

        yOffset += 20;
      }
    });
    
    // Enable mouse wheel scrolling
    this.input.on('wheel', (pointer: any, gameObjects: any, deltaX: number, deltaY: number) => {
      if (this.currentTab === 'features') {
        this.scrollY += deltaY * 0.5;
        const maxScroll = Math.max(0, yOffset - height + 150);
        this.scrollY = Phaser.Math.Clamp(this.scrollY, -maxScroll, 0);
        this.contentContainer.y = this.scrollY;
      }
    });
  }

  private displayShopItems(items: ShopItem[], width: number, height: number): void {
    const startY = 240;
    const itemHeight = 100;
    const itemWidth = width - 200;
    const spacing = 20;

    items.forEach((item, index) => {
      const y = startY + (itemHeight + spacing) * index;
      
      if (y > height - 150) return; // Don't render off-screen items

      this.createShopItemCard(width / 2, y, itemWidth, itemHeight, item);
    });
  }

  private createShopItemCard(
    x: number,
    y: number,
    width: number,
    height: number,
    item: ShopItem
  ): void {
    const container = this.add.container(x, y);

    // Background
    const bg = this.add.rectangle(0, 0, width, height, 0x1a1a2e);
    bg.setStrokeStyle(2, 0x16213e);

    // Icon
    const icon = this.add.text(-width / 2 + 40, 0, item.icon, {
      fontSize: '36px'
    }).setOrigin(0.5);

    // Name and description
    const name = this.add.text(-width / 2 + 90, -15, item.name, {
      fontSize: '20px',
      color: '#ffffff',
      fontStyle: 'bold'
    });

    const desc = this.add.text(-width / 2 + 90, 10, item.description, {
      fontSize: '14px',
      color: '#aaaaaa'
    });

    // Level indicator
    const level = this.add.text(width / 2 - 250, 0, `Level: ${item.currentLevel}/${item.maxLevel}`, {
      fontSize: '16px',
      color: '#ffd700'
    }).setOrigin(0.5);

    // Buy button
    const canAfford = this.metaSystem.getTokens() >= item.cost;
    const maxed = item.currentLevel >= item.maxLevel;
    const buttonColor = maxed ? 0x333333 : (canAfford ? 0x44ff44 : 0x666666);

    const buyBtn = this.add.rectangle(width / 2 - 80, 0, 140, 50, buttonColor);
    buyBtn.setStrokeStyle(2, 0xffffff);

    const buttonText = maxed ? 'MAXED' : `🪙 ${item.cost}`;
    const buyText = this.add.text(width / 2 - 80, 0, buttonText, {
      fontSize: '16px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    if (!maxed && canAfford) {
      buyBtn.setInteractive({ useHandCursor: true });

      buyBtn.on('pointerover', () => {
        buyBtn.setFillStyle(0x66ff66);
      });

      buyBtn.on('pointerout', () => {
        buyBtn.setFillStyle(0x44ff44);
      });

      buyBtn.on('pointerdown', () => {
        if (item.onPurchase()) {
          this.scene.restart();
        }
      });
    }

    container.add([bg, icon, name, desc, level, buyBtn, buyText]);
  }
}
