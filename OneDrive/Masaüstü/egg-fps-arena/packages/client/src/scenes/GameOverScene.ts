import Phaser from 'phaser';
import { MetaProgressionSystem } from '../systems/MetaProgressionSystem.js';

export class GameOverScene extends Phaser.Scene {
  private wave!: number;
  private survivalTime!: number;
  private kills!: number;
  private tokens!: number;
  private metaSystem!: MetaProgressionSystem;

  constructor() {
    super({ key: 'GameOverScene' });
  }

  init(data: { wave: number; time: number; kills: number; tokens?: number }): void {
    this.wave = data.wave;
    this.survivalTime = data.time;
    this.kills = data.kills;
    this.tokens = data.tokens || 0;
    
    // Get meta system from registry
    this.metaSystem = this.registry.get('metaSystem') as MetaProgressionSystem;
    if (!this.metaSystem) {
      this.metaSystem = new MetaProgressionSystem();
    }
  }

  create(): void {
    const { width, height } = this.cameras.main;

    // Background
    this.add.rectangle(width / 2, height / 2, width, height, 0x1a1a1a);

    // Game Over title
    const title = this.add.text(width / 2, height / 4, 'GAME OVER', {
      fontSize: '64px',
      color: '#FF4444',
      fontStyle: 'bold'
    });
    title.setOrigin(0.5);

    // Stats container
    const statsY = height / 2 - 50;

    this.add.text(width / 2, statsY, 'Final Stats', {
      fontSize: '32px',
      color: '#FFD700'
    }).setOrigin(0.5);

    // Wave survived
    this.add.text(width / 2, statsY + 60, `Wave Reached: ${this.wave}`, {
      fontSize: '24px',
      color: '#FFFFFF'
    }).setOrigin(0.5);

    // Time survived
    const minutes = Math.floor(this.survivalTime / 60);
    const seconds = this.survivalTime % 60;
    this.add.text(width / 2, statsY + 100, `Time Survived: ${minutes}m ${seconds}s`, {
      fontSize: '24px',
      color: '#FFFFFF'
    }).setOrigin(0.5);

    // Kills
    this.add.text(width / 2, statsY + 140, `Enemies Killed: ${this.kills}`, {
      fontSize: '24px',
      color: '#FFFFFF'
    }).setOrigin(0.5);
    
    // Check for new high score
    const isNewRecord = this.metaSystem.updateHighScore('default', this.wave, this.survivalTime, this.kills);
    
    // Tokens earned (zaten GameScene'de kaydedildi)
    this.add.text(width / 2, statsY + 180, `🪙 Tokens Earned: ${this.tokens}`, {
      fontSize: '28px',
      color: '#FFD700',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    
    if (isNewRecord) {
      this.add.text(width / 2, statsY + 220, '🏆 NEW RECORD!', {
        fontSize: '28px',
        color: '#FF00FF',
        fontStyle: 'bold'
      }).setOrigin(0.5);
    }

    // Buttons
    const buttonY = height - 150;

    // Retry button
    this.createButton(width / 2 - 160, buttonY, 'RETRY', () => {
      this.scene.start('GameScene');
    });

    // Main Menu button
    this.createButton(width / 2 + 160, buttonY, 'MAIN MENU', () => {
      this.scene.start('MenuScene');
    });
  }

  private createButton(x: number, y: number, text: string, callback: () => void): void {
    const button = this.add.container(x, y);

    const bg = this.add.rectangle(0, 0, 280, 60, 0x4CAF50);
    bg.setInteractive({ useHandCursor: true });

    const label = this.add.text(0, 0, text, {
      fontSize: '24px',
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
      bg.setFillStyle(0x388E3C);
    });

    bg.on('pointerup', () => {
      bg.setFillStyle(0x66BB6A);
      callback();
    });
  }
}
