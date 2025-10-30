import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../../../shared/constants.js';
import { GameScene } from '../scenes/GameScene.js';
import { MenuScene } from '../scenes/MenuScene.js';
import { GameOverScene } from '../scenes/GameOverScene.js';
import { LevelUpScene } from '../scenes/LevelUpScene.js';
import { MetaUpgradesScene } from '../scenes/MetaUpgradesScene.js';
import { StatsScene } from '../scenes/StatsScene.js';
import { ShopScene } from '../scenes/ShopScene.js';
import { PauseScene } from '../scenes/PauseScene.js';

export class Game {
  private game: Phaser.Game;

  constructor() {
    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      width: GAME_WIDTH,
      height: GAME_HEIGHT,
      parent: 'game-container',
      backgroundColor: '#2d2d2d',
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { x: 0, y: 0 },
          debug: false
        }
      },
      scene: [MenuScene, GameScene, LevelUpScene, GameOverScene, MetaUpgradesScene, StatsScene, ShopScene, PauseScene]
    };

    this.game = new Phaser.Game(config);
  }

  destroy(): void {
    this.game.destroy(true);
  }
}
