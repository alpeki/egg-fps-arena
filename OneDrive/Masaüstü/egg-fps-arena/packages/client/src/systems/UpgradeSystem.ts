import { StateManager } from '../core/StateManager';
import { Upgrade, UpgradeCategory } from '../../../shared/types';
import { UPGRADES } from '../data/upgrades';

export class UpgradeSystem {
  private stateManager: StateManager;
  private availableUpgrades: Upgrade[];

  constructor(stateManager: StateManager) {
    this.stateManager = stateManager;
    this.availableUpgrades = UPGRADES;
  }

  getRandomUpgrades(count: number): Upgrade[] {
    const filtered = this.availableUpgrades.filter(upgrade => {
      const currentStacks = this.stateManager.activeUpgrades.get(upgrade.id) || 0;
      return currentStacks < upgrade.maxStacks;
    });

    // Shuffle and take first 'count' items
    const shuffled = [...filtered].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, Math.min(count, shuffled.length));
  }

  applyUpgrade(upgradeId: string): void {
    const upgrade = this.availableUpgrades.find(u => u.id === upgradeId);
    if (!upgrade) return;

    const currentStacks = this.stateManager.activeUpgrades.get(upgradeId) || 0;
    if (currentStacks >= upgrade.maxStacks) return;

    // Increment stack count
    this.stateManager.activeUpgrades.set(upgradeId, currentStacks + 1);

    // Apply effect
    upgrade.effect(this.stateManager.playerState, currentStacks + 1);

    console.log(`Applied upgrade: ${upgrade.name} (Stack ${currentStacks + 1}/${upgrade.maxStacks})`);
  }
}
