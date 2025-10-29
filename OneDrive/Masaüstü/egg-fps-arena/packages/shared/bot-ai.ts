// Bot AI System for Egg-FPS Arena
// Handles autonomous bot behavior in multiplayer matches

import { PlayerState } from "./types.js";

export interface BotConfig {
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  accuracy: number; // 0-1, higher = more accurate
  reactionTime: number; // milliseconds
  aggression: number; // 0-1, higher = more aggressive
  targetSelection: 'closest' | 'random' | 'weakest' | 'strongest';
  movementStyle: 'aggressive' | 'defensive' | 'balanced' | 'roamer';
}

export class BotAI {
  private player: PlayerState;
  private config: BotConfig;
  private targetPlayer: string | null = null;
  private lastDecisionTime: number = 0;
  private decisionInterval: number;
  private lastFireTime: number = 0;
  private fireCooldown: number;
  private lastDashTime: number = 0;
  private dashCooldown: number;
  private movementPhase: number = 0;
  private stuckTime: number = 0;
  private lastPosition: { x: number; y: number } = { x: 0, y: 0 };

  constructor(player: PlayerState, difficulty: 'easy' | 'medium' | 'hard' | 'expert' = 'medium') {
    this.player = player;
    this.config = this.getDifficultyConfig(difficulty);
    this.decisionInterval = this.config.reactionTime;
    this.fireCooldown = this.getFireCooldown();
    this.dashCooldown = 2000; // 2 seconds between dashes
  }

  private getDifficultyConfig(difficulty: 'easy' | 'medium' | 'hard' | 'expert'): BotConfig {
    switch (difficulty) {
      case 'easy':
        return {
          difficulty,
          accuracy: 0.3,
          reactionTime: 800,
          aggression: 0.4,
          targetSelection: 'random',
          movementStyle: 'roamer'
        };
      case 'medium':
        return {
          difficulty,
          accuracy: 0.6,
          reactionTime: 500,
          aggression: 0.6,
          targetSelection: 'closest',
          movementStyle: 'balanced'
        };
      case 'hard':
        return {
          difficulty,
          accuracy: 0.8,
          reactionTime: 300,
          aggression: 0.8,
          targetSelection: 'weakest',
          movementStyle: 'aggressive'
        };
      case 'expert':
        return {
          difficulty,
          accuracy: 0.95,
          reactionTime: 150,
          aggression: 0.9,
          targetSelection: 'strongest',
          movementStyle: 'aggressive'
        };
      default:
        return this.getDifficultyConfig('medium');
    }
  }

  private getFireCooldown(): number {
    const baseCooldown = 400; // Base fire rate in ms
    const difficultyModifier = {
      'easy': 1.5,
      'medium': 1.2,
      'hard': 1.0,
      'expert': 0.8
    }[this.config.difficulty];
    return baseCooldown * difficultyModifier;
  }

  public update(botState: PlayerState, allPlayers: Map<string, PlayerState>, deltaTime: number): BotInput {
    const currentTime = Date.now();
    
    // Update internal player state
    this.player = botState;
    
    // Check if bot is stuck
    this.checkIfStuck();
    
    // Make decisions at specified intervals
    if (currentTime - this.lastDecisionTime >= this.decisionInterval) {
      this.makeDecision(allPlayers);
      this.lastDecisionTime = currentTime;
    }
    
    // Generate AI input
    return this.generateInput(allPlayers, deltaTime);
  }

  private checkIfStuck(): void {
    const positionChange = Math.abs(this.player.x - this.lastPosition.x) + Math.abs(this.player.y - this.lastPosition.y);
    
    if (positionChange < 5) { // Less than 5 pixels movement
      this.stuckTime += 50; // Assuming 50ms update rate
    } else {
      this.stuckTime = 0;
    }
    
    this.lastPosition = { x: this.player.x, y: this.player.y };
  }

  private makeDecision(allPlayers: Map<string, PlayerState>): void {
    // Remove invalid targets
    if (this.targetPlayer && (!allPlayers.has(this.targetPlayer) || allPlayers.get(this.targetPlayer)?.isDead)) {
      this.targetPlayer = null;
    }
    
    // Select new target if needed
    if (!this.targetPlayer || Math.random() < 0.1) { // 10% chance to retarget
      this.targetPlayer = this.selectTarget(allPlayers);
    }
  }

  private selectTarget(allPlayers: Map<string, PlayerState>): string | null {
    const validPlayers = Array.from(allPlayers.values())
      .filter(p => p.id !== this.player.id && !p.isDead && p.health > 0);
    
    if (validPlayers.length === 0) return null;
    
    switch (this.config.targetSelection) {
      case 'closest':
        return this.getClosestPlayer(validPlayers)?.id || null;
      case 'random':
        return validPlayers[Math.floor(Math.random() * validPlayers.length)].id;
      case 'weakest':
        return validPlayers.sort((a, b) => a.health - b.health)[0].id;
      case 'strongest':
        return validPlayers.sort((a, b) => b.health - a.health)[0].id;
      default:
        return validPlayers[Math.floor(Math.random() * validPlayers.length)].id;
    }
  }

  private getClosestPlayer(players: PlayerState[]): PlayerState | null {
    if (players.length === 0) return null;
    
    let closest = players[0];
    let minDistance = this.getDistance(this.player, closest);
    
    for (const player of players) {
      const distance = this.getDistance(this.player, player);
      if (distance < minDistance) {
        minDistance = distance;
        closest = player;
      }
    }
    
    return closest;
  }

  private getDistance(player1: PlayerState, player2: PlayerState): number {
    return Math.sqrt(Math.pow(player1.x - player2.x, 2) + Math.pow(player1.y - player2.y, 2));
  }

  private generateInput(allPlayers: Map<string, PlayerState>, deltaTime: number): BotInput {
    const currentTime = Date.now();
    const input: BotInput = {
      moveX: 0,
      moveY: 0,
      aimAngle: this.player.aimAngle,
      fire: false,
      dash: false,
      seq: this.player.seq
    };
    
    // Target acquisition and movement
    if (this.targetPlayer && allPlayers.has(this.targetPlayer)) {
      const target = allPlayers.get(this.targetPlayer)!;
      this.moveTowardsTarget(target, input);
      this.aimAtTarget(target, input);
      this.engageTarget(target, input, currentTime);
    } else {
      // No target, move around randomly
      this.wander(input);
    }
    
    // Handle getting unstuck
    if (this.stuckTime > 1000) { // Stuck for more than 1 second
      this.getUnstuck(input);
      this.stuckTime = 0; // Reset after attempting to get unstuck
    }
    
    return input;
  }

  private moveTowardsTarget(target: PlayerState, input: BotInput): void {
    const dx = target.x - this.player.x;
    const dy = target.y - this.player.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // Optimal engagement distance
    const optimalDistance = this.config.movementStyle === 'aggressive' ? 100 : 
                           this.config.movementStyle === 'defensive' ? 200 : 150;
    
    if (distance > optimalDistance + 50) {
      // Move towards target
      input.moveX = Math.sign(dx);
      input.moveY = Math.sign(dy);
    } else if (distance < optimalDistance - 50) {
      // Move away from target
      input.moveX = -Math.sign(dx);
      input.moveY = -Math.sign(dy);
    } else {
      // Strafe around target
      this.strafeMovement(target, input);
    }
    
    // Add some randomness to movement
    input.moveX += (Math.random() - 0.5) * 0.3;
    input.moveY += (Math.random() - 0.5) * 0.3;
    
    // Clamp movement values
    input.moveX = Math.max(-1, Math.min(1, input.moveX));
    input.moveY = Math.max(-1, Math.min(1, input.moveY));
  }

  private strafeMovement(target: PlayerState, input: BotInput): void {
    this.movementPhase += 0.1;
    
    // Circle around the target
    const strafeAngle = this.movementPhase + Math.atan2(target.y - this.player.y, target.x - this.player.x);
    input.moveX = Math.cos(strafeAngle);
    input.moveY = Math.sin(strafeAngle);
  }

  private wander(input: BotInput): void {
    this.movementPhase += 0.05;
    
    // Random wandering movement
    input.moveX = Math.sin(this.movementPhase) * 0.5;
    input.moveY = Math.cos(this.movementPhase * 0.7) * 0.5;
    
    // Occasionally change direction
    if (Math.random() < 0.01) {
      this.movementPhase += Math.PI * Math.random();
    }
  }

  private getUnstuck(input: BotInput): void {
    // Move in a random direction to get unstuck
    const angle = Math.random() * Math.PI * 2;
    input.moveX = Math.cos(angle);
    input.moveY = Math.sin(angle);
    
    // Dash if available
    if (Date.now() - this.lastDashTime > this.dashCooldown) {
      input.dash = true;
      this.lastDashTime = Date.now();
    }
  }

  private aimAtTarget(target: PlayerState, input: BotInput): void {
    const dx = target.x - this.player.x;
    const dy = target.y - this.player.y;
    let aimAngle = Math.atan2(dy, dx);
    
    // Add inaccuracy based on difficulty and movement
    const baseInaccuracy = (1 - this.config.accuracy) * 0.5; // Max 0.5 radians (28.6 degrees)
    const movementPenalty = (Math.abs(input.moveX) + Math.abs(input.moveY)) * 0.2;
    const totalInaccuracy = baseInaccuracy + movementPenalty;
    
    // Apply random inaccuracy
    aimAngle += (Math.random() - 0.5) * totalInaccuracy;
    
    input.aimAngle = aimAngle;
  }

  private engageTarget(target: PlayerState, input: BotInput, currentTime: number): void {
    const distance = this.getDistance(this.player, target);
    const canFire = currentTime - this.lastFireTime > this.fireCooldown;
    const canDash = currentTime - this.lastDashTime > this.dashCooldown;
    
    // Fire decision based on accuracy, distance, and aggression
    const shouldFire = this.shouldFire(target, distance) && canFire;
    
    if (shouldFire) {
      input.fire = true;
      this.lastFireTime = currentTime;
    }
    
    // Dash decision based on aggression and situation
    const shouldDash = this.shouldDash(target, distance, canDash);
    
    if (shouldDash) {
      input.dash = true;
      this.lastDashTime = currentTime;
    }
  }

  private shouldFire(target: PlayerState, distance: number): boolean {
    // Don't fire if target is very far away
    if (distance > 600) return false;
    
    // Base fire chance based on aggression
    let fireChance = this.config.aggression;
    
    // Increase fire chance when closer
    if (distance < 200) fireChance += 0.3;
    if (distance < 100) fireChance += 0.4;
    
    // Decrease fire chance if target is moving fast (harder to hit)
    const targetSpeed = Math.sqrt(target.vx * target.vx + target.vy * target.vy);
    if (targetSpeed > 150) fireChance *= 0.7;
    
    // Add random element
    fireChance += (Math.random() - 0.5) * 0.3;
    
    return fireChance > 0.3; // Base threshold
  }

  private shouldDash(target: PlayerState, distance: number, canDash: boolean): boolean {
    if (!canDash) return false;
    
    // Dash when too far away and aggressive
    if (distance > 300 && this.config.aggression > 0.7) {
      return Math.random() < 0.3; // 30% chance
    }
    
    // Dash when low on health and defensive
    if (this.player.health < 30 && this.config.movementStyle === 'defensive') {
      return Math.random() < 0.5; // 50% chance
    }
    
    // Occasional aggressive dash
    if (this.config.aggression > 0.8 && distance < 150) {
      return Math.random() < 0.2; // 20% chance
    }
    
    return false;
  }
}

export interface BotInput {
  moveX: number;
  moveY: number;
  aimAngle: number;
  fire: boolean;
  dash: boolean;
  seq: number;
}

export class BotManager {
  private bots: Map<string, BotAI> = new Map();
  private botConfigs: Map<string, BotConfig> = new Map();

  public addBot(botId: string, difficulty: 'easy' | 'medium' | 'hard' | 'expert' = 'medium'): void {
    const config = this.getDifficultyConfig(difficulty);
    this.botConfigs.set(botId, config);
    console.log(`Bot ${botId} added with ${difficulty} difficulty`);
  }

  public removeBot(botId: string): void {
    this.bots.delete(botId);
    this.botConfigs.delete(botId);
    console.log(`Bot ${botId} removed`);
  }

  public updateBots(botStates: Map<string, PlayerState>, allPlayers: Map<string, PlayerState>, deltaTime: number): Map<string, BotInput> {
    const botInputs: Map<string, BotInput> = new Map();
    
    // Update existing bots and create new ones as needed
    for (const [botId, botState] of botStates) {
      if (!this.bots.has(botId)) {
        // Create new bot AI
        const config = this.botConfigs.get(botId) || this.getDifficultyConfig('medium');
        this.bots.set(botId, new BotAI(botState, config.difficulty));
      }
      
      // Update bot AI
      const botAI = this.bots.get(botId)!;
      const input = botAI.update(botState, allPlayers, deltaTime);
      botInputs.set(botId, input);
    }
    
    // Remove bots that no longer exist
    for (const botId of this.bots.keys()) {
      if (!botStates.has(botId)) {
        this.removeBot(botId);
      }
    }
    
    return botInputs;
  }

  private getDifficultyConfig(difficulty: 'easy' | 'medium' | 'hard' | 'expert'): BotConfig {
    switch (difficulty) {
      case 'easy':
        return {
          difficulty,
          accuracy: 0.3,
          reactionTime: 800,
          aggression: 0.4,
          targetSelection: 'random',
          movementStyle: 'roamer'
        };
      case 'medium':
        return {
          difficulty,
          accuracy: 0.6,
          reactionTime: 500,
          aggression: 0.6,
          targetSelection: 'closest',
          movementStyle: 'balanced'
        };
      case 'hard':
        return {
          difficulty,
          accuracy: 0.8,
          reactionTime: 300,
          aggression: 0.8,
          targetSelection: 'weakest',
          movementStyle: 'aggressive'
        };
      case 'expert':
        return {
          difficulty,
          accuracy: 0.95,
          reactionTime: 150,
          aggression: 0.9,
          targetSelection: 'strongest',
          movementStyle: 'aggressive'
        };
      default:
        return this.getDifficultyConfig('medium');
    }
  }

  public getBotCount(): number {
    return this.bots.size;
  }
}
