import { Game } from './core/Game';
import './style.css';

// Initialize game when DOM is ready
window.addEventListener('DOMContentLoaded', () => {
  console.log('🥚 Egg Survivor: Last Hatch');
  console.log('Initializing game...');
  
  const game = new Game();
  
  // Store game instance globally for debugging
  (window as any).game = game;
});
