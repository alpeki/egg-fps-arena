import Phaser from 'phaser';
import { StateManager } from '../core/StateManager';

export class PauseScene extends Phaser.Scene {
  private stateManager!: StateManager;
  
  constructor() {
    super({ key: 'PauseScene' });
  }
  
  init(data: { stateManager?: StateManager }): void {
    if (data.stateManager) {
      this.stateManager = data.stateManager;
    }
  }

  create(): void {
    const { width, height } = this.cameras.main;

    // Semi-transparent overlay
    const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.7);
    overlay.setInteractive();

    // Pause title
    const title = this.add.text(width / 2, height / 2 - 100, 'PAUSED', {
      fontSize: '64px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // Resume button
    const resumeBtn = this.add.rectangle(width / 2, height / 2, 250, 60, 0x44ff44);
    resumeBtn.setStrokeStyle(3, 0xffffff);
    resumeBtn.setInteractive({ useHandCursor: true });

    const resumeText = this.add.text(width / 2, height / 2, 'RESUME (ESC)', {
      fontSize: '24px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // Main menu button
    const menuBtn = this.add.rectangle(width / 2, height / 2 + 80, 250, 60, 0xff4444);
    menuBtn.setStrokeStyle(3, 0xffffff);
    menuBtn.setInteractive({ useHandCursor: true });

    const menuText = this.add.text(width / 2, height / 2 + 80, 'MAIN MENU', {
      fontSize: '24px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // Button hover effects
    resumeBtn.on('pointerover', () => resumeBtn.setFillStyle(0x66ff66));
    resumeBtn.on('pointerout', () => resumeBtn.setFillStyle(0x44ff44));
    menuBtn.on('pointerover', () => menuBtn.setFillStyle(0xff6666));
    menuBtn.on('pointerout', () => menuBtn.setFillStyle(0xff4444));

    // Button click handlers
    resumeBtn.on('pointerdown', () => this.resumeGame());
    menuBtn.on('pointerdown', () => this.returnToMenu());

    // ESC key to resume
    this.input.keyboard?.on('keydown-ESC', () => this.resumeGame());
  }

  private resumeGame(): void {
    if (this.stateManager) {
      this.stateManager.gameState.isPaused = false;
    }
    this.scene.stop();
    this.scene.resume('GameScene');
  }

  private returnToMenu(): void {
    this.scene.stop();
    this.scene.stop('GameScene');
    this.scene.start('MenuScene');
  }
}
