import Phaser from 'phaser';
import { MetaProgressionSystem } from '../systems/MetaProgressionSystem.js';

export class MenuScene extends Phaser.Scene {
  private metaSystem!: MetaProgressionSystem;

  constructor() {
    super({ key: 'MenuScene' });
  }

  create(): void {
    // Initialize meta progression system
    this.metaSystem = new MetaProgressionSystem();
    this.registry.set('metaSystem', this.metaSystem);
    const { width, height } = this.cameras.main;

    // Background
    this.add.rectangle(width / 2, height / 2, width, height, 0x1a1a1a);

    // Title
    const title = this.add.text(width / 2, height / 3, '🥚 EGG SURVIVOR', {
      fontSize: '64px',
      color: '#FFD700',
      fontStyle: 'bold'
    });
    title.setOrigin(0.5);

    // Subtitle
    const subtitle = this.add.text(width / 2, height / 3 + 80, 'Last Hatch', {
      fontSize: '32px',
      color: '#FFFFFF'
    });
    subtitle.setOrigin(0.5);

    // Play button
    const playButton = this.createButton(width / 2, height / 2 + 50, 'PLAY', () => {
      this.scene.start('GameScene');
    });

    // Meta upgrades button
    const upgradesButton = this.createButton(width / 2, height / 2 + 130, '💎 UPGRADES', () => {
      this.scene.start('MetaUpgradesScene', { metaSystem: this.metaSystem });
    });

    // Settings button
    const settingsButton = this.createButton(width / 2, height / 2 + 210, 'SETTINGS', () => {
      // TODO: Open settings screen
      console.log('Settings coming soon!');
    });

    // Credits
    const credits = this.add.text(width / 2, height - 30, 'Made with ❤️ | v2.0.0', {
      fontSize: '16px',
      color: '#888888'
    });
    credits.setOrigin(0.5);
  }

  private createButton(x: number, y: number, text: string, callback: () => void): Phaser.GameObjects.Container {
    const button = this.add.container(x, y);

    const bg = this.add.rectangle(0, 0, 300, 60, 0x4CAF50);
    bg.setInteractive({ useHandCursor: true });

    const label = this.add.text(0, 0, text, {
      fontSize: '24px',
      color: '#FFFFFF',
      fontStyle: 'bold'
    });
    label.setOrigin(0.5);

    button.add([bg, label]);

    // Hover effects
    bg.on('pointerover', () => {
      bg.setFillStyle(0x66BB6A);
    });

    bg.on('pointerout', () => {
      bg.setFillStyle(0x4CAF50);
    });

    bg.on('pointerdown', () => {
      bg.setFillStyle(0x388E3C);
    });

    bg.on('pointerup', () => {
      bg.setFillStyle(0x66BB6A);
      callback();
    });

    return button;
  }
}
