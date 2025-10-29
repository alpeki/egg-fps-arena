import { StateManager } from '../core/StateManager';

export class CombatSystem {
  private stateManager: StateManager;

  constructor(stateManager: StateManager) {
    this.stateManager = stateManager;
  }

  update(player: any, enemies: any[], projectiles: any[]): void {
    // Check projectile-enemy collisions
    projectiles.forEach(projectile => {
      enemies.forEach(enemy => {
        if (!enemy.active) return;

        const dx = projectile.x - enemy.x;
        const dy = projectile.y - enemy.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < enemy.radius + 5) { // 5 is projectile radius
          // Hit!
          enemy.takeDamage(10); // Base damage
          projectile.destroy();

          // Update state
          const enemyState = this.stateManager.enemies.get(enemy.id);
          if (enemyState) {
            enemyState.health = enemy.health;
            if (enemy.health <= 0) {
              enemyState.isDead = true;
              this.stateManager.gameState.kills++;
            }
          }
        }
      });
    });

    // Check player-enemy collisions
    enemies.forEach(enemy => {
      if (!enemy.active) return;

      const dx = player.x - enemy.x;
      const dy = player.y - enemy.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < 20 + enemy.radius) { // 20 is player radius
        // Damage player
        this.damagePlayer(enemy.damage);
        
        // Knockback
        const angle = Math.atan2(dy, dx);
        player.x += Math.cos(angle) * 10;
        player.y += Math.sin(angle) * 10;
      }
    });
  }

  private damagePlayer(amount: number): void {
    this.stateManager.playerState.health -= amount;
    if (this.stateManager.playerState.health <= 0) {
      this.stateManager.playerState.health = 0;
      this.stateManager.playerState.isDead = true;
    }
  }
}
