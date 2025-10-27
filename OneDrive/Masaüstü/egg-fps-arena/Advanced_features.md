# 🚀 ADVANCED FEATURES GUIDE

## New Features Added

### 1️⃣ Load Testing System

**Location:** `packages/server/src/tools/loadTest.ts`

Simulates 50 concurrent bots to stress-test the server.

#### Usage

```bash
# Default: 50 bots, 30 seconds
pnpm tsx packages/server/src/tools/loadTest.ts

# Custom configuration
BOT_COUNT=100 TEST_DURATION=60000 pnpm tsx packages/server/src/tools/loadTest.ts

# With custom server
WS_URL=wss://your-server.com pnpm tsx packages/server/src/tools/loadTest.ts
```

#### What It Measures

- ✅ Connection success rate
- ⚡ Latency (average, P50, P95, P99)
- 📊 Message throughput (msg/s, KB/s)
- ❌ Error rate
- 🎯 Overall server performance

#### Expected Results (Good Performance)

```
✅ Bots Connected: 50/50
📤 Total Messages Sent: 30,000
📥 Total Messages Received: 30,000
⚠️  Total Errors: 0

⚡ LATENCY METRICS:
   Average: 45.23ms
   P50: 42.11ms
   P95: 78.54ms
   P99: 95.32ms

🔥 THROUGHPUT:
   1000 messages/second
   117.19 KB/s
```

---

### 2️⃣ Ads Mock System

**Location:** `packages/server/src/net/adsMock.ts`

Mock system for testing rewarded video and interstitial ads before integrating real AdMob/IronSource SDK.

#### Server Integration

```typescript
// In ArenaRoom.ts onCreate():
import { adsMockSystem } from '../net/adsMock';

this.onMessage('request_ad', async (client) => {
  try {
    const reward = await adsMockSystem.simulateRewardedAd(
      this,
      client,
      'xp_boost'
    );
    
    // Apply reward to player
    const player = this.players.get(client.sessionId);
    if (player) {
      player.score += reward.amount;
    }
  } catch (error) {
    client.send('ad:error', { message: error.message });
  }
});
```

#### Client Integration

```typescript
// In GameScene.ts:
import { AdsClient, createAdButton } from '../ads/AdsClient';

// After connection:
const adsClient = new AdsClient(this.client.room);
const adButton = createAdButton(adsClient);
document.body.appendChild(adButton);

// Or programmatically:
const reward = await adsClient.watchRewardedAd({
  onAdStart: () => console.log('Ad starting...'),
  onAdComplete: (reward) => console.log('Got reward:', reward),
  onAdError: (error) => console.error('Ad error:', error)
});
```

#### Features

- ✅ Rewarded video simulation (5s mock, real: 15-30s)
- ✅ Interstitial ads (match end)
- ✅ Cooldown system (3 min between ads)
- ✅ Reward types: XP, cosmetics, currency
- ✅ Beautiful UI notifications
- ✅ Ready for real SDK integration

#### Reward Types

```typescript
// XP boost
'xp_boost' → { type: 'xp', amount: 100 }

// Battle pass XP
'battle_pass_xp' → { type: 'xp', amount: 50 }

// Cosmetic unlock
'cosmetic_unlock' → { 
  type: 'cosmetic', 
  amount: 1, 
  item: 'egg-skin-simit' 
}
```

#### Turkish Cosmetics Pool

- `egg-skin-simit` 🥨
- `egg-skin-menemen` 🍳
- `weapon-skin-cay` ☕
- `hat-fez` 🎩
- `hat-turban` 👳

---

### 3️⃣ Region Optimization (Turkey Focus)

**Locations:**
- Server: `packages/server/src/config/regionConfig.ts`
- Client: `packages/client/src/region/RegionSelector.ts`

Automatic region selection for optimal latency, optimized for Turkish players.

#### Available Regions

| Region | Location | Target Latency | Priority |
|--------|----------|----------------|----------|
| eu-tr | Istanbul, TR | 30ms | 1 (highest) |
| eu-central | Frankfurt, DE | 60ms | 2 |
| eu-west | London, UK | 80ms | 3 |
| me-south | Bahrain | 50ms | 2 |

#### Client Usage

```typescript
import { selectBestRegion } from './region/RegionSelector';

// Automatic (ping tests + localStorage cache)
const region = await selectBestRegion();
console.log('Connecting to:', region.name);

// Or manual selection
import { testAllRegions } from './region/RegionSelector';
const regions = await testAllRegions();
// Show UI for user to pick
```

#### How It Works

1. **First Visit**: Runs ping tests to all regions
2. **Selects Best**: Chooses lowest latency region
3. **Caches Choice**: Saves to localStorage
4. **Next Visits**: Uses cached region instantly

#### Geolocation Fallback

If ping tests fail, uses IP-based geolocation:

```typescript
Turkey (TR) → eu-tr
Greece (GR) → eu-tr
Germany (DE) → eu-central
UK (GB) → eu-west
Saudi Arabia (SA) → me-south
```

#### Server-Side Health Checks

```typescript
import { checkRegionHealth } from './config/regionConfig';

const latency = await checkRegionHealth('eu-tr');
console.log('Region health:', latency, 'ms');
```

#### Monitoring

```typescript
import { regionMonitor } from './config/regionConfig';

// Record latencies
regionMonitor.recordLatency('eu-tr', 45);

// Get stats
const stats = regionMonitor.getStats('eu-tr');
console.log('Region stats:', stats);
// { avg: 45, p95: 78, samples: 100 }
```

---

## Integration Checklist

### Load Testing

- [ ] Run load test locally: `pnpm tsx packages/server/src/tools/loadTest.ts`
- [ ] Verify P95 latency < 200ms
- [ ] Ensure 0 errors with 50 bots
- [ ] Test with production server URL
- [ ] Document results in issue tracker

### Ads System

- [ ] Add ad button to UI (match end screen)
- [ ] Test rewarded video flow
- [ ] Verify cooldown system
- [ ] Test reward notifications
- [ ] Plan real AdMob integration timeline

### Region Selection

- [ ] Add region selector to main menu
- [ ] Test auto-selection in Turkey
- [ ] Test fallback regions
- [ ] Add manual region switcher (settings)
- [ ] Monitor region performance in production

---

## Environment Variables

Add to `.env`:

```env
# Load Testing
WS_URL=ws://localhost:2567
BOT_COUNT=50
TEST_DURATION=30000

# Regions (production)
REGION_EU_TR_HOST=wss://tr-arena.example.com
REGION_EU_CENTRAL_HOST=wss://eu-arena.example.com
REGION_EU_WEST_HOST=wss://eu-west-arena.example.com
REGION_ME_SOUTH_HOST=wss://me-arena.example.com

# Client (build time)
VITE_REGION_EU_TR=wss://tr-arena.example.com
VITE_REGION_EU_CENTRAL=wss://eu-arena.example.com
VITE_REGION_EU_WEST=wss://eu-west-arena.example.com
```

---

## Next Steps

1. **Test Everything Locally**
   ```bash
   pnpm dev
   pnpm tsx packages/server/src/tools/loadTest.ts
   ```

2. **Deploy to Staging**
   - Test with real latency
   - Verify region selection works
   - Test ads flow

3. **Integrate Real Ads**
   - Replace `adsMock.ts` with AdMob SDK
   - Keep same interface
   - Test on real devices

4. **Set Up Multi-Region**
   - Deploy to Istanbul (primary)
   - Deploy to Frankfurt (backup)
   - Configure DNS/load balancer

---

## Troubleshooting

### Load Test Fails

**Problem:** Bots can't connect  
**Solution:** Check server is running, URL is correct, firewall allows WebSocket

**Problem:** High P95 latency (>200ms)  
**Solution:** Check server CPU, reduce tick rate, optimize physics

### Ads Not Working

**Problem:** "Please wait" error  
**Solution:** Check cooldown with `adsMockSystem.getTimeUntilNextAd(playerId)`

**Problem:** Reward not applied  
**Solution:** Verify player state update in ArenaRoom message handler

### Region Selection Issues

**Problem:** All pings fail  
**Solution:** Check CORS, health endpoints, network connectivity

**Problem:** Wrong region selected  
**Solution:** Clear localStorage, re-run ping tests

---

**Ready to test! 🎮**