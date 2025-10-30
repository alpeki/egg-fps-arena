import { SaveData, MetaUpgrades, WeaponType } from '../../../shared/types';

const SAVE_KEY = 'egg_survivor_save_data';

export class MetaProgressionSystem {
  private saveData: SaveData;

  constructor() {
    this.saveData = this.loadSaveData();
  }

  private loadSaveData(): SaveData {
    const saved = localStorage.getItem(SAVE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to load save data:', e);
      }
    }

    // Default save data
    return {
      metaUpgrades: {
        maxHPBonus: 0,
        damageBonus: 0,
        xpBonus: 0,
        startingLevel: 1,
        unlockedWeapons: [WeaponType.PISTOL],
        banishSlots: 1,
        skipSlots: 1,
        refreshSlots: 1
      },
      totalTokens: 0,
      highScores: {},
      settings: {
        volume: 1,
        sfxVolume: 1,
        musicVolume: 0.7
      }
    };
  }

  save(): void {
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(this.saveData));
      console.log('Game saved successfully!');
    } catch (e) {
      console.error('Failed to save game:', e);
    }
  }

  getSaveData(): SaveData {
    return this.saveData;
  }

  getMetaUpgrades(): MetaUpgrades {
    return this.saveData.metaUpgrades;
  }

  addTokens(amount: number): void {
    this.saveData.totalTokens += amount;
    this.save();
  }

  spendTokens(amount: number): boolean {
    if (this.saveData.totalTokens >= amount) {
      this.saveData.totalTokens -= amount;
      this.save();
      return true;
    }
    return false;
  }

  getTokens(): number {
    return this.saveData.totalTokens;
  }

  // Meta upgrade purchases
  upgradeMaxHP(cost: number = 50): boolean {
    if (this.spendTokens(cost)) {
      this.saveData.metaUpgrades.maxHPBonus += 10;
      this.save();
      return true;
    }
    return false;
  }

  upgradeDamage(cost: number = 75): boolean {
    if (this.spendTokens(cost)) {
      this.saveData.metaUpgrades.damageBonus += 5;
      this.save();
      return true;
    }
    return false;
  }

  upgradeXPGain(cost: number = 60): boolean {
    if (this.spendTokens(cost)) {
      this.saveData.metaUpgrades.xpBonus += 10;
      this.save();
      return true;
    }
    return false;
  }

  upgradeBanishSlots(cost: number = 100): boolean {
    if (this.spendTokens(cost)) {
      this.saveData.metaUpgrades.banishSlots++;
      this.save();
      return true;
    }
    return false;
  }

  upgradeSkipSlots(cost: number = 80): boolean {
    if (this.spendTokens(cost)) {
      this.saveData.metaUpgrades.skipSlots++;
      this.save();
      return true;
    }
    return false;
  }

  upgradeRefreshSlots(cost: number = 120): boolean {
    if (this.spendTokens(cost)) {
      this.saveData.metaUpgrades.refreshSlots++;
      this.save();
      return true;
    }
    return false;
  }

  unlockWeapon(weapon: WeaponType, cost: number = 100): boolean {
    if (!this.saveData.metaUpgrades.unlockedWeapons.includes(weapon)) {
      if (this.spendTokens(cost)) {
        this.saveData.metaUpgrades.unlockedWeapons.push(weapon);
        this.save();
        return true;
      }
    }
    return false;
  }

  // High score tracking
  updateHighScore(arenaId: string, wave: number, time: number, kills: number): boolean {
    const current = this.saveData.highScores[arenaId];
    const isNewRecord = !current || wave > current.wave || 
                        (wave === current.wave && kills > current.kills);

    if (isNewRecord) {
      this.saveData.highScores[arenaId] = { wave, time, kills };
      this.save();
      return true;
    }
    return false;
  }

  getHighScore(arenaId: string = 'default') {
    return this.saveData.highScores[arenaId] || { wave: 0, time: 0, kills: 0 };
  }

  // Calculate tokens earned from a run
  calculateTokensEarned(wave: number, kills: number, timeSeconds: number): number {
    const waveBonus = wave * 10;
    const killBonus = kills * 2;
    const timeBonus = Math.floor(timeSeconds / 10);
    return waveBonus + killBonus + timeBonus;
  }

  // Reset save data (for testing)
  resetSaveData(): void {
    localStorage.removeItem(SAVE_KEY);
    this.saveData = this.loadSaveData();
    console.log('Save data reset!');
  }
}
