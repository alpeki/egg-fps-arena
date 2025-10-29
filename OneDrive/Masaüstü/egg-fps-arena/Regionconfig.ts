// Region configuration for optimal latency
// Optimized for Turkish players with fallback to EU regions

export interface RegionConfig {
  id: string;
  name: string;
  host: string;
  location: string;
  latencyTarget: number; // Expected latency in ms
  priority: number; // Lower = higher priority
}

export const REGIONS: Record<string, RegionConfig> = {
  'eu-tr': {
    id: 'eu-tr',
    name: 'Turkey (Istanbul)',
    host: process.env.REGION_EU_TR_HOST || 'wss://tr-arena.example.com',
    location: 'Istanbul, TR',
    latencyTarget: 30, // ~30ms for local Turkish players
    priority: 1
  },
  'eu-central': {
    id: 'eu-central',
    name: 'Europe (Central)',
    host: process.env.REGION_EU_CENTRAL_HOST || 'wss://eu-arena.example.com',
    location: 'Frankfurt, DE',
    latencyTarget: 60, // ~60ms from Turkey
    priority: 2
  },
  'eu-west': {
    id: 'eu-west',
    name: 'Europe (West)',
    host: process.env.REGION_EU_WEST_HOST || 'wss://eu-west-arena.example.com',
    location: 'London, UK',
    latencyTarget: 80, // ~80ms from Turkey
    priority: 3
  },
  'me-south': {
    id: 'me-south',
    name: 'Middle East',
    host: process.env.REGION_ME_SOUTH_HOST || 'wss://me-arena.example.com',
    location: 'Bahrain',
    latencyTarget: 50, // ~50ms from Turkey
    priority: 2
  }
};

export interface PingResult {
  region: string;
  latency: number;
  success: boolean;
  timestamp: number;
}

/**
 * Select the best region based on ping results
 */
export function getBestRegion(pingResults: PingResult[]): string {
  const validResults = pingResults.filter(r => r.success);
  
  if (validResults.length === 0) {
    // Fallback to eu-tr if all pings failed
    console.warn('All ping tests failed, using default region: eu-tr');
    return 'eu-tr';
  }
  
  // Sort by latency (ascending)
  validResults.sort((a, b) => a.latency - b.latency);
  
  // Return region with lowest latency
  return validResults[0].region;
}

/**
 * Get recommended region based on user location
 * This can be used as a fallback if ping tests are not available
 */
export function getRecommendedRegion(userCountryCode: string): string {
  const recommendations: Record<string, string> = {
    'TR': 'eu-tr',
    'GR': 'eu-tr',
    'BG': 'eu-tr',
    'CY': 'eu-tr',
    'DE': 'eu-central',
    'PL': 'eu-central',
    'AT': 'eu-central',
    'GB': 'eu-west',
    'FR': 'eu-west',
    'ES': 'eu-west',
    'SA': 'me-south',
    'AE': 'me-south',
    'QA': 'me-south',
    'BH': 'me-south'
  };
  
  return recommendations[userCountryCode] || 'eu-central';
}

/**
 * Get all available regions sorted by priority
 */
export function getAvailableRegions(): RegionConfig[] {
  return Object.values(REGIONS).sort((a, b) => a.priority - b.priority);
}

/**
 * Check if a region is available
 */
export function isRegionAvailable(regionId: string): boolean {
  return regionId in REGIONS;
}

/**
 * Get region by ID
 */
export function getRegion(regionId: string): RegionConfig | undefined {
  return REGIONS[regionId];
}

/**
 * Server-side region health check
 * Returns latency to the region's endpoint
 */
export async function checkRegionHealth(regionId: string): Promise<number> {
  const region = REGIONS[regionId];
  if (!region) {
    throw new Error(`Unknown region: ${regionId}`);
  }
  
  const start = Date.now();
  
  try {
    // Simple HTTP health check (replace with actual WebSocket ping in production)
    const healthUrl = region.host.replace('wss://', 'https://').replace('ws://', 'http://');
    
    const response = await fetch(`${healthUrl}/health`, {
      method: 'GET',
      signal: AbortSignal.timeout(5000) // 5s timeout
    });
    
    if (response.ok) {
      return Date.now() - start;
    } else {
      throw new Error(`Health check failed: ${response.status}`);
    }
  } catch (error) {
    console.error(`Region ${regionId} health check failed:`, error);
    return -1; // Indicates failure
  }
}

/**
 * Monitor and log region performance
 */
export class RegionMonitor {
  private latencyHistory: Map<string, number[]> = new Map();
  private readonly maxHistorySize = 100;
  
  recordLatency(regionId: string, latency: number): void {
    if (!this.latencyHistory.has(regionId)) {
      this.latencyHistory.set(regionId, []);
    }
    
    const history = this.latencyHistory.get(regionId)!;
    history.push(latency);
    
    // Keep only last N measurements
    if (history.length > this.maxHistorySize) {
      history.shift();
    }
  }
  
  getAverageLatency(regionId: string): number {
    const history = this.latencyHistory.get(regionId);
    if (!history || history.length === 0) return -1;
    
    const sum = history.reduce((a, b) => a + b, 0);
    return sum / history.length;
  }
  
  getP95Latency(regionId: string): number {
    const history = this.latencyHistory.get(regionId);
    if (!history || history.length === 0) return -1;
    
    const sorted = [...history].sort((a, b) => a - b);
    const index = Math.floor(sorted.length * 0.95);
    return sorted[index];
  }
  
  getStats(regionId: string) {
    return {
      avg: this.getAverageLatency(regionId),
      p95: this.getP95Latency(regionId),
      samples: this.latencyHistory.get(regionId)?.length || 0
    };
  }
}

export const regionMonitor = new RegionMonitor();