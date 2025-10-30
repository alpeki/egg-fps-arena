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
    const banishedUpgrades = this.stateManager.runData.banishedUpgrades;
    
    const filtered = this.availableUpgrades.filter(upgrade => {
      // Exclude banished upgrades
      if (banishedUpgrades.has(upgrade.id)) return false;
      
      // Exclude maxed upgrades
      const currentStacks = this.stateManager.activeUpgrades.get(upgrade.id) || 0;
      return currentStacks < upgrade.maxStacks;
    });

    // Apply luck - reroll and pick better options
    const luck = this.stateManager.playerState.luck || 0;
    const rollCount = 1 + luck; // More rolls = better choices
    
    let bestOptions: Upgrade[] = [];
    for (let i = 0; i < rollCount; i++) {
      const shuffled = [...filtered].sort(() => Math.random() - 0.5);
      const options = shuffled.slice(0, Math.min(count, shuffled.length));
      
      if (i === 0 || this.calculateUpgradeQuality(options) > this.calculateUpgradeQuality(bestOptions)) {
        bestOptions = options;
      }
    }
    
    return bestOptions;
  }
  
  private calculateUpgradeQuality(upgrades: Upgrade[]): number {
    // Simple quality metric - prefer damage and rare upgrades
    return upgrades.reduce((sum, u) => {
      let quality = 1;
      if (u.category === UpgradeCategory.DAMAGE) quality += 0.5;
      if (u.maxStacks === 1) quality += 0.3; // Unique upgrades
      return sum + quality;
    }, 0);
  }
  
  banishUpgrade(upgradeId: string): void {
    this.stateManager.runData.banishedUpgrades.add(upgradeId);
    console.log(`Banished upgrade: ${upgradeId}`);
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
