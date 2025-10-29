// Power-up System

export interface PowerUpConfig {
  type: string;
  duration: number; // ms, 0 for instant
  effect: string;
  value: number;
  respawnTime: number;
}

export const POWERUPS: Record<string, PowerUpConfig> = {
  health: {
    type: "health",
    duration: 0,
    effect: "heal",
    value: 50,
    respawnTime: 10000
  },
  speed: {
    type: "speed",
    duration: 5000,
    effect: "speedBoost",
    value: 1.5, // multiplier
    respawnTime: 15000
  },
  damage: {
    type: "damage",
    duration: 8000,
    effect: "damageBoost",
    value: 2.0, // multiplier
    respawnTime: 20000
  },
  shield: {
    type: "shield",
    duration: 10000,
    effect: "shield",
    value: 50, // extra health
    respawnTime: 25000
  }
};

export class PowerUp {
  id: string;
  type: string;
  x: number;
  y: number;
  active: boolean = true;
  respawnTimer: number = 0;

  constructor(id: string, type: string, x: number, y: number) {
    this.id = id;
    this.type = type;
    this.x = x;
    this.y = y;
  }
}
