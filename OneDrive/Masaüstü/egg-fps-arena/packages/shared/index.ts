export * from './types.js';
export * from './constants.js';
export * from './math.js';
export * from './protocol.js';
export * from './bot-ai.js';
export const BinaryProtocol = {};
export interface InputCmd {
  seq: number;
  timestamp: number;
  moveX: number;
  moveY: number;
  aimAngle: number;
  fire: boolean;
  dash: boolean;
}
