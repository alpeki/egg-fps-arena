import { StateManager } from '../core/StateManager';
import { XP_BASE_REQUIREMENT, XP_SCALING_FACTOR, XP_MAGNET_RANGE } from '../../../shared/constants';

export class XPSystem {
  private stateManager: StateManager;

  constructor(stateManager: StateManager) {
    this.stateManager = stateManager;
  }

  update(player: any, xpOrbs: any[]): void {
    // Magnet effect - attract nearby XP orbs
    xpOrbs.forEach(orb => {
      const dx = player.x - orb.x;
      const dy = player.y - orb.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < XP_MAGNET_RANGE) {
        // Move orb towards player
        const speed = 300;
        orb.x += (dx / distance) * speed * 0.016; // Assuming 60fps
        orb.y += (dy / distance) * speed * 0.016;

        // Collect if close enough
        if (distance < 30) {
          this.collectXP(orb.value || 10);
          orb.destroy();
        }
      }
    });
  }

  collectXP(amount: number): void {
    this.stateManager.playerState.xp += amount;
  }

  checkLevelUp(): boolean {
    if (this.stateManager.playerState.xp >= this.stateManager.playerState.xpToNextLevel) {
      this.levelUp();
      return true;
    }
    return false;
  }

  private levelUp(): void {
    this.stateManager.playerState.level++;
    this.stateManager.playerState.xp -= this.stateManager.playerState.xpToNextLevel;
    this.stateManager.playerState.xpToNextLevel = Math.floor(
      XP_BASE_REQUIREMENT * Math.pow(XP_SCALING_FACTOR, this.stateManager.playerState.level - 1)
    );

    console.log(`Level up! Now level ${this.stateManager.playerState.level}`);
  }

  spawnXPOrb(scene: Phaser.Scene, x: number, y: number, value: number): void {
    const gameScene = scene as any;
    if (gameScene.getXPOrbsGroup) {
      const orb = scene.add.circle(x, y, 8, 0x00FF00);
      (orb as any).value = value;
      gameScene.getXPOrbsGroup().add(orb);

      // Add to state
      this.stateManager.xpOrbs.set(`xp_${Date.now()}_${Math.random()}`, {
        id: `xp_${Date.now()}`,
        x,
        y,
        value
      });
    }
  }
}
