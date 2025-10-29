import Phaser from 'phaser';
import { PLAYER_RADIUS } from '../../../shared/constants';

export class Player extends Phaser.GameObjects.Arc {
  private fireRate: number = 200; // ms between shots
  private lastFireTime: number = 0;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, PLAYER_RADIUS, 0, 360, false, 0xFFD700);
    
    // Enable physics
    scene.physics.add.existing(this);
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setCircle(PLAYER_RADIUS);
  }

  update(time: number, delta: number): void {
    // Movement is handled in GameScene
  }

  shoot(): void {
    const now = this.scene.time.now;
    if (now - this.lastFireTime < this.fireRate) {
      return;
    }

    this.lastFireTime = now;
    
    // Get GameScene to access projectiles group
    const gameScene = this.scene as any;
    if (gameScene.getProjectilesGroup) {
      const projectilesGroup = gameScene.getProjectilesGroup();
      
      // Create projectile
      const angle = this.scene.registry.get('playerAimAngle') || 0;
      const projectile = this.scene.add.circle(
        this.x + Math.cos(angle) * 30,
        this.y + Math.sin(angle) * 30,
        5,
        0xFF0000
      );

      this.scene.physics.add.existing(projectile);
      const body = projectile.body as Phaser.Physics.Arcade.Body;
      body.setVelocity(Math.cos(angle) * 800, Math.sin(angle) * 800);

      projectilesGroup.add(projectile);

      // Auto-destroy after 2 seconds
      this.scene.time.delayedCall(2000, () => {
        projectile.destroy();
      });
    }
  }

  setFireRate(rate: number): void {
    this.fireRate = rate;
  }
}
