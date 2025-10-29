// Ads mock system - Simulates rewarded video ads
// This is a placeholder for real AdMob/IronSource integration

import type { Room, Client } from '@colyseus/core';
import { createLogger } from './utils/logger';


const logger = createLogger('AdsMock');

export interface AdReward {
  type: 'xp' | 'cosmetic' | 'currency';
  amount: number;
  item?: string;
}

export interface AdConfig {
  rewardedVideoEnabled: boolean;
  interstitialEnabled: boolean;
  minTimeBetweenAds: number; // seconds
  rewardMultiplier: number;
}

const DEFAULT_CONFIG: AdConfig = {
  rewardedVideoEnabled: true,
  interstitialEnabled: true,
  minTimeBetweenAds: 180, // 3 minutes
  rewardMultiplier: 1.0
};

export class AdsMockSystem {
  private config: AdConfig;
  private lastAdTimestamp: Map<string, number> = new Map();
  
  constructor(config: Partial<AdConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Check if a player can watch a rewarded ad
   */
  canWatchAd(playerId: string): boolean {
    const lastAd = this.lastAdTimestamp.get(playerId);
    if (!lastAd) return true;
    
    const elapsed = (Date.now() - lastAd) / 1000;
    return elapsed >= this.config.minTimeBetweenAds;
  }

  /**
   * Simulate watching a rewarded video ad
   * In production, this would trigger real AdMob SDK
   */
  async simulateRewardedAd(
    room: Room,
    client: Client,
    rewardType: 'xp_boost' | 'cosmetic_unlock' | 'battle_pass_xp' = 'xp_boost'
  ): Promise<AdReward> {
    const playerId = client.sessionId;
    
    if (!this.config.rewardedVideoEnabled) {
      throw new Error('Rewarded ads are disabled');
    }
    
    if (!this.canWatchAd(playerId)) {
      const lastAd = this.lastAdTimestamp.get(playerId)!;
      const timeLeft = this.config.minTimeBetweenAds - (Date.now() - lastAd) / 1000;
      throw new Error(`Please wait ${Math.ceil(timeLeft)}s before watching another ad`);
    }
    
    logger.info(`Starting rewarded ad for player ${playerId}`);
    
    // Notify client that ad is starting
    client.send('ad:start', { type: 'rewarded' });
    
    // Simulate ad duration (5 seconds in mock, real ads are 15-30s)
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Calculate reward
    const reward = this.calculateReward(rewardType);
    
    // Mark timestamp
    this.lastAdTimestamp.set(playerId, Date.now());
    
    // Send reward to client
    client.send('ad:complete', { reward });
    
    // Broadcast to room (optional, for stats)
    room.broadcast('ad:player_rewarded', {
      playerId,
      rewardType: reward.type
    }, { except: client });
    
    logger.info(`Rewarded ad complete for player ${playerId}:`, reward);
    
    return reward;
  }

  /**
   * Show interstitial ad (match end)
   * In production, this would trigger AdMob interstitial
   */
  async showInterstitial(client: Client): Promise<void> {
    if (!this.config.interstitialEnabled) {
      return;
    }
    
    logger.info(`Showing interstitial ad to player ${client.sessionId}`);
    
    // Notify client
    client.send('ad:interstitial:start');
    
    // Simulate interstitial duration (3 seconds in mock)
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    client.send('ad:interstitial:complete');
  }

  /**
   * Calculate reward based on type
   */
  private calculateReward(rewardType: string): AdReward {
    const multiplier = this.config.rewardMultiplier;
    
    switch (rewardType) {
      case 'xp_boost':
        return {
          type: 'xp',
          amount: Math.floor(100 * multiplier)
        };
      
      case 'battle_pass_xp':
        return {
          type: 'xp',
          amount: Math.floor(50 * multiplier)
        };
      
      case 'cosmetic_unlock':
        // Random cosmetic from pool
        const cosmetics = [
          'egg-skin-simit',
          'egg-skin-menemen',
          'weapon-skin-cay',
          'hat-fez',
          'hat-turban'
        ];
        const randomCosmetic = cosmetics[Math.floor(Math.random() * cosmetics.length)];
        
        return {
          type: 'cosmetic',
          amount: 1,
          item: randomCosmetic
        };
      
      default:
        return {
          type: 'xp',
          amount: Math.floor(50 * multiplier)
        };
    }
  }

  /**
   * Reset ad cooldown for a player (for testing)
   */
  resetCooldown(playerId: string): void {
    this.lastAdTimestamp.delete(playerId);
  }

  /**
   * Get time until next ad is available
   */
  getTimeUntilNextAd(playerId: string): number {
    const lastAd = this.lastAdTimestamp.get(playerId);
    if (!lastAd) return 0;
    
    const elapsed = (Date.now() - lastAd) / 1000;
    const remaining = Math.max(0, this.config.minTimeBetweenAds - elapsed);
    return Math.ceil(remaining);
  }
}

// Global instance (can be replaced with room-specific instances)
export const adsMockSystem = new AdsMockSystem();

/**
 * Integration example for ArenaRoom:
 * 
 * In ArenaRoom.onCreate():
 *   this.onMessage('request_ad', async (client) => {
 *     try {
 *       const reward = await adsMockSystem.simulateRewardedAd(this, client, 'xp_boost');
 *       // Apply reward to player state
 *       const player = this.players.get(client.sessionId);
 *       if (player) {
 *         player.xp += reward.amount;
 *       }
 *     } catch (error) {
 *       client.send('ad:error', { message: error.message });
 *     }
 *   });
 * 
 * On match end:
 *   await adsMockSystem.showInterstitial(client);
 */