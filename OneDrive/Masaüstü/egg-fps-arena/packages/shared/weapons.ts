// Weapon System for Egg-FPS Arena

export interface WeaponConfig {
  name: string;
  damage: number;
  fireRate: number; // ms between shots
  range: number;
  spread: number; // degrees
  bulletsPerShot: number; // for shotgun
  reloadTime: number;
  magazineSize: number;
  projectileSpeed?: number; // for projectile weapons
  isHitscan: boolean;
}

export const WEAPONS: Record<string, WeaponConfig> = {
  pistol: {
    name: "Pistol",
    damage: 25,
    fireRate: 300,
    range: 1000,
    spread: 2,
    bulletsPerShot: 1,
    reloadTime: 1000,
    magazineSize: 12,
    isHitscan: true
  },
  
  shotgun: {
    name: "Shotgun",
    damage: 15,
    fireRate: 800,
    range: 400,
    spread: 15,
    bulletsPerShot: 8,
    reloadTime: 2000,
    magazineSize: 6,
    isHitscan: true
  },
  
  rifle: {
    name: "Rifle",
    damage: 20,
    fireRate: 150,
    range: 1200,
    spread: 1,
    bulletsPerShot: 1,
    reloadTime: 1500,
    magazineSize: 30,
    isHitscan: true
  },
  
  sniper: {
    name: "Sniper",
    damage: 80,
    fireRate: 1200,
    range: 2000,
    spread: 0,
    bulletsPerShot: 1,
    reloadTime: 2500,
    magazineSize: 5,
    isHitscan: true
  },
  
  smg: {
    name: "SMG",
    damage: 12,
    fireRate: 100,
    range: 800,
    spread: 5,
    bulletsPerShot: 1,
    reloadTime: 1200,
    magazineSize: 25,
    isHitscan: true
  }
};

export function getWeaponConfig(weaponName: string): WeaponConfig {
  return WEAPONS[weaponName] || WEAPONS.pistol;
}
