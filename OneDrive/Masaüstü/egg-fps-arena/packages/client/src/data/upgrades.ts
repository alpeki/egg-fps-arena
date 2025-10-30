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
      player.luck = stacks;
    }
  },

  // ADDITIONAL DAMAGE UPGRADES
  {
    id: 'crit_chance',
    name: 'Critical Strike',
    description: '+5% crit chance',
    category: UpgradeCategory.DAMAGE,
    icon: '💥',
    maxStacks: 10,
    effect: (player, stacks) => {
      player.critChance = stacks * 0.05;
    }
  },
  {
    id: 'crit_damage',
    name: 'Deadly Precision',
    description: '+25% crit damage',
    category: UpgradeCategory.DAMAGE,
    icon: '🎯',
    maxStacks: 6,
    effect: (player, stacks) => {
      player.critDamage = 2.0 + (stacks * 0.25);
    }
  },
  {
    id: 'projectile_speed',
    name: 'Velocity',
    description: '+15% projectile speed',
    category: UpgradeCategory.DAMAGE,
    icon: '⚡',
    maxStacks: 5,
    effect: (player, stacks) => {
      // Applied in projectile creation
    }
  },
  {
    id: 'range',
    name: 'Long Range',
    description: '+20% weapon range',
    category: UpgradeCategory.DAMAGE,
    icon: '🔭',
    maxStacks: 5,
    effect: (player, stacks) => {
      // Applied in projectile lifetime
    }
  },
  {
    id: 'explosive_rounds',
    name: 'Explosive Rounds',
    description: 'Bullets explode on impact',
    category: UpgradeCategory.DAMAGE,
    icon: '💣',
    maxStacks: 1,
    effect: (player, stacks) => {
      // Applied in combat system
    }
  },

  // ADDITIONAL DEFENSE UPGRADES
  {
    id: 'lifesteal',
    name: 'Vampirism',
    description: '+3% lifesteal',
    category: UpgradeCategory.DEFENSE,
    icon: '🩸',
    maxStacks: 7,
    effect: (player, stacks) => {
      player.lifesteal = stacks * 0.03;
    }
  },
  {
    id: 'thorns',
    name: 'Thorns',
    description: 'Reflect 10% damage',
    category: UpgradeCategory.DEFENSE,
    icon: '🌵',
    maxStacks: 5,
    effect: (player, stacks) => {
      // Applied in combat system
    }
  },
  {
    id: 'dodge',
    name: 'Evasion',
    description: '+5% dodge chance',
    category: UpgradeCategory.DEFENSE,
    icon: '🌀',
    maxStacks: 6,
    effect: (player, stacks) => {
      // Applied in combat system
    }
  },
  {
    id: 'shield',
    name: 'Energy Shield',
    description: 'Absorb 50 damage',
    category: UpgradeCategory.DEFENSE,
    icon: '🛡️',
    maxStacks: 3,
    effect: (player, stacks) => {
      // Applied as temporary shield
    }
  },

  // ADDITIONAL MOBILITY UPGRADES
  {
    id: 'knockback_resist',
    name: 'Steadfast',
    description: '+20% knockback resist',
    category: UpgradeCategory.MOBILITY,
    icon: '⚓',
    maxStacks: 5,
    effect: (player, stacks) => {
      // Applied in combat system
    }
  },
  {
    id: 'dash_distance',
    name: 'Long Dash',
    description: '+20% dash distance',
    category: UpgradeCategory.MOBILITY,
    icon: '🚀',
    maxStacks: 4,
    effect: (player, stacks) => {
      // Applied in dash system
    }
  },

  // ADDITIONAL UTILITY UPGRADES
  {
    id: 'item_duration',
    name: 'Preservation',
    description: '+50% item duration',
    category: UpgradeCategory.UTILITY,
    icon: '⏱️',
    maxStacks: 3,
    effect: (player, stacks) => {
      // Applied to item drops
    }
  },
  {
    id: 'rare_drops',
    name: 'Fortune',
    description: '+15% rare drop chance',
    category: UpgradeCategory.UTILITY,
    icon: '💎',
    maxStacks: 5,
    effect: (player, stacks) => {
      // Applied in drop system
    }
  },
  {
    id: 'token_gain',
    name: 'Greed',
    description: '+10% token gain',
    category: UpgradeCategory.UTILITY,
    icon: '🪙',
    maxStacks: 5,
    effect: (player, stacks) => {
      // Applied in token calculation
    }
  },
  {
    id: 'cooldown_reduction',
    name: 'Haste',
    description: '-5% all cooldowns',
    category: UpgradeCategory.UTILITY,
    icon: '⏩',
    maxStacks: 6,
    effect: (player, stacks) => {
      // Applied to all abilities
    }
  },
  {
    id: 'area_damage',
    name: 'Shockwave',
    description: 'Damage nearby enemies',
    category: UpgradeCategory.DAMAGE,
    icon: '🌊',
    maxStacks: 3,
    effect: (player, stacks) => {
      // Applied as periodic AOE
    }
  },
  {
    id: 'chain_lightning',
    name: 'Chain Lightning',
    description: 'Attacks chain to enemies',
    category: UpgradeCategory.DAMAGE,
    icon: '⚡',
    maxStacks: 1,
    effect: (player, stacks) => {
      // Applied in combat system
    }
  },
  {
    id: 'poison',
    name: 'Toxic Rounds',
    description: 'Poison enemies over time',
    category: UpgradeCategory.DAMAGE,
    icon: '☠️',
    maxStacks: 3,
    effect: (player, stacks) => {
      // Applied as DOT effect
    }
  },
  {
    id: 'freeze',
    name: 'Frost Bullets',
    description: 'Slow enemies by 20%',
    category: UpgradeCategory.UTILITY,
    icon: '❄️',
    maxStacks: 3,
    effect: (player, stacks) => {
      // Applied as slow effect
    }
  }
];

// Utility function to get upgrade by ID
export function getUpgradeById(id: string): Upgrade | undefined {
  return UPGRADES.find(u => u.id === id);
}
