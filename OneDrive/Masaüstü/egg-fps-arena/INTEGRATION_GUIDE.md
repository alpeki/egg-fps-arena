# 🔧 Quick Integration Guide

## Step-by-Step Integration Instructions

### 1. Register New Scenes in Game.ts

Add these scenes to your Phaser game configuration:

```typescript
import { StatsScene } from '../scenes/StatsScene';
import { ShopScene } from '../scenes/ShopScene';

// In your game config scenes array:
scene: [
  MenuScene,
  GameScene,
  LevelUpScene,
  GameOverScene,
  StatsScene,      // ADD THIS
  ShopScene,       // ADD THIS
  MetaUpgradesScene
]
```

### 2. Add Shop Button to MenuScene

In `MenuScene.ts`, add a shop button:

```typescript
// After the PLAY button
const shopBtn = this.add.rectangle(width / 2, 350, 300, 60, 0x4444ff);
shopBtn.setInteractive({ useHandCursor: true });

const shopText = this.add.text(width / 2, 350, '🏪 SHOP', {
  fontSize: '28px',
  color: '#ffffff',
  fontStyle: 'bold'
}).setOrigin(0.5);

shopBtn.on('pointerdown', () => {
  this.scene.start('ShopScene', { 
    metaSystem: this.metaSystem 
  });
});
```

### 3. Add Keybinds in GameScene

Add TAB for stats and ESC for pause:

```typescript
// In create() method
this.input.keyboard?.on('keydown-TAB', () => {
  this.scene.pause();
  this.scene.launch('StatsScene', { 
    stateManager: this.stateManager 
  });
});

this.input.keyboard?.on('keydown-ESC', () => {
  this.togglePause();
});

// Add this method
private togglePause(): void {
  this.stateManager.gameState.isPaused = !this.stateManager.gameState.isPaused;
  // Show pause overlay (implement as needed)
}
```

### 4. Connect LevelUpScene to MetaSystem

Update where you launch LevelUpScene:

```typescript
this.scene.launch('LevelUpScene', {
  stateManager: this.stateManager,
  metaSystem: this.metaSystem  // ADD THIS
});
```

### 5. Display Tokens in UI

Add token display to your HUD:

```typescript
// In GameScene create()
this.tokenText = this.add.text(20, 120, '🪙 0', {
  fontSize: '18px',
  color: '#ffd700'
});

// In update()
this.tokenText.setText(`🪙 ${this.stateManager.runData.tokensEarned}`);
```

### 6. Award Tokens on Kill

In your enemy kill handler:

```typescript
import { TOKENS_PER_KILL } from '../../../shared/constants';

// When enemy dies
this.stateManager.runData.tokensEarned += TOKENS_PER_KILL;
```

### 7. Save Tokens on Game Over

In `GameOverScene.ts`:

```typescript
// Calculate and save tokens
const tokensEarned = this.stateManager.runData.tokensEarned;
this.metaSystem.addTokens(tokensEarned);

// Display in game over screen
const tokenText = this.add.text(width / 2, 400, 
  `🪙 Tokens Earned: ${tokensEarned}`, {
  fontSize: '24px',
  color: '#ffd700'
}).setOrigin(0.5);
```

### 8. Initialize RunData with Meta Upgrades

In StateManager or GameScene initialization:

```typescript
const metaUpgrades = this.metaSystem.getMetaUpgrades();
this.stateManager.runData = {
  banishedUpgrades: new Set(),
  skipsRemaining: metaUpgrades.skipSlots,
  refreshesRemaining: metaUpgrades.refreshSlots,
  tokensEarned: 0
};
```

### 9. Remove Weapon System (Optional but Recommended)

Comment out or remove:
- Weapon selection UI
- Weapon switching logic
- Multiple weapon configs (keep only pistol)

### 10. Test Everything

Run the game and verify:
- ✅ Shop opens from menu
- ✅ Tokens display during gameplay
- ✅ Tokens saved after game over
- ✅ Banish/Skip/Refresh work in level-up
- ✅ Stats window opens with TAB
- ✅ Horde waves trigger every 10 waves
- ✅ Shop purchases work and persist

---

## Quick Test Checklist

```
[ ] Game starts without errors
[ ] Shop button appears on menu
[ ] Shop opens and displays items
[ ] Can purchase items with tokens
[ ] Tokens persist after restart
[ ] Level-up shows Banish/Skip/Refresh buttons
[ ] Banish removes upgrade from pool
[ ] Skip works and closes level-up
[ ] Refresh rerolls upgrades
[ ] Stats window opens with TAB
[ ] Stats display correctly
[ ] Wave 10 is a horde wave (4x enemies)
[ ] Tokens earned during gameplay
[ ] Tokens saved on game over
[ ] ESC pauses game (if implemented)
```

---

## Common Issues & Fixes

### Issue: "Cannot find module StatsScene"
**Fix**: Make sure you imported the scene correctly:
```typescript
import { StatsScene } from './scenes/StatsScene';
```

### Issue: "metaSystem is undefined"
**Fix**: Pass metaSystem through scene data:
```typescript
this.scene.start('ShopScene', { metaSystem: this.metaSystem });
```

### Issue: "Tokens not saving"
**Fix**: Ensure MetaProgressionSystem.save() is called:
```typescript
this.metaSystem.addTokens(amount); // This calls save() internally
```

### Issue: "Banish not working"
**Fix**: Make sure UpgradeSystem has access to runData:
```typescript
const banishedUpgrades = this.stateManager.runData.banishedUpgrades;
```

### Issue: "Horde waves not triggering"
**Fix**: Check WAVE_BOSS_INTERVAL is set to 10 in constants.ts

---

## Performance Notes

- All new systems are lightweight
- localStorage operations are minimal
- No performance impact expected
- Upgrade pool filtering is O(n) but n is small (~30)

---

## Need Help?

Check these files for reference implementations:
- `StatsScene.ts` - Complete stats display
- `ShopScene.ts` - Complete shop with tabs
- `LevelUpScene.ts` - Banish/Skip/Refresh implementation
- `WaveManager.ts` - Horde wave logic
- `MetaProgressionSystem.ts` - Token management

All systems are self-contained and well-documented!
