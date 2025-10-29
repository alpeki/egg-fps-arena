import { Upgrade, UpgradeCategory } from '../../../shared/types';

export const UPGRADES: Upgrade[] = [
  // DAMAGE UPGRADES
  {
    id: 'damage_boost',
    name: 'Damage Boost',
    description: '+10% damage',
    category: UpgradeCategory.DAMAGE,
    icon: '⚔️',
    maxStacks: 10,
    effect: (player, stacks) => {
      // Damage is applied in combat system
    }
  },
  {
    id: 'fire_rate',
    name: 'Rapid Fire',
    description: '+15% fire rate',
    category: UpgradeCategory.DAMAGE,
    icon: '🔫',
    maxStacks: 8,
    effect: (player, stacks) => {
      // Fire rate is applied in player
    }
  },
  {
    id: 'multishot',
    name: 'Multishot',
    description: '+1 projectile',
    category: UpgradeCategory.DAMAGE,
    icon: '🎯',
    maxStacks: 5,
    effect: (player, stacks) => {
      // Projectile count is applied in player shoot
    }
  },
  {
    id: 'piercing',
    name: 'Piercing Shots',
    description: 'Bullets pierce enemies',
    category: UpgradeCategory.DAMAGE,
    icon: '🏹',
    maxStacks: 1,
    effect: (player, stacks) => {
      // Piercing is applied in combat system
    }
  },

  // DEFENSE UPGRADES
  {
    id: 'max_hp',
    name: 'Vitality',
    description: '+20 max HP',
    category: UpgradeCategory.DEFENSE,
    icon: '❤️',
    maxStacks: 10,
    effect: (player, stacks) => {
      player.maxHealth += 20;
      player.health = Math.min(player.health + 20, player.maxHealth);
    }
  },
  {
    id: 'hp_regen',
    name: 'Regeneration',
    description: '+1 HP/sec',
    category: UpgradeCategory.DEFENSE,
    icon: '💚',
    maxStacks: 5,
    effect: (player, stacks) => {
      // Regen is applied in game loop
    }
  },
  {
    id: 'damage_reduction',
    name: 'Armor',
    description: '-5% damage taken',
    category: UpgradeCategory.DEFENSE,
    icon: '🛡️',
    maxStacks: 8,
    effect: (player, stacks) => {
      // Damage reduction is applied in combat system
    }
  },

  // MOBILITY UPGRADES
  {
    id: 'move_speed',
    name: 'Swift Feet',
    description: '+10% move speed',
    category: UpgradeCategory.MOBILITY,
    icon: '👟',
    maxStacks: 8,
    effect: (player, stacks) => {
      // Move speed is applied in movement
    }
  },
  {
    id: 'dash_cooldown',
    name: 'Quick Dash',
    description: '-1s dash cooldown',
    category: UpgradeCategory.MOBILITY,
    icon: '💨',
    maxStacks: 5,
    effect: (player, stacks) => {
      // Dash cooldown is applied in dash system
    }
  },

  // UTILITY UPGRADES
  {
    id: 'xp_gain',
    name: 'Experience',
    description: '+10% XP gain',
    category: UpgradeCategory.UTILITY,
    icon: '⭐',
    maxStacks: 5,
    effect: (player, stacks) => {
      // XP gain is applied in XP system
    }
  },
  {
    id: 'magnet_range',
    name: 'Magnet',
    description: '+50 pickup range',
    category: UpgradeCategory.UTILITY,
    icon: '🧲',
    maxStacks: 5,
    effect: (player, stacks) => {
      // Magnet range is applied in XP system
    }
  },
  {
    id: 'luck',
    name: 'Luck',
    description: 'Better upgrade choices',
    category: UpgradeCategory.UTILITY,
    icon: '🍀',
    maxStacks: 3,
    effect: (player, stacks) => {
      // Luck affects upgrade pool
    }
  }
];
