export interface PlayerState {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  aimAngle: number;
  health: number;
  maxHealth: number;
  weapon: string;
  score: number;
  isDead: boolean;
  dashCooldown: number;
  seq: number;
}

export interface InputCmd {
  seq: number;
  timestamp: number;
  moveX: number;
  moveY: number;
  aimAngle: number;
  fire: boolean;
  dash: boolean;
}
