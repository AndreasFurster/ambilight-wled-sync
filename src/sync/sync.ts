/**
 * Sync Module
 * Connects Philips Ambilight and WLED
 */

import { AmbilightConnection } from '../ambilight/index.js';
import { WLEDConnection } from '../wled/index.js';
import { mapAmbilightToWLED } from './mapping.js';
import type { SyncConfig, SyncStats, SyncState } from './types.js';

export class AmbilightWLEDSync {
  private ambilightConnection: AmbilightConnection;
  private wledConnection: WLEDConnection;
  private pollInterval: number;
  private intervalId: NodeJS.Timeout | null = null;
  private mode: SyncState = 'stopped' as SyncState;
  private stats: SyncStats = {
    updateCount: 0,
    lastUpdate: null,
    averageLatency: 0,
    errors: 0,
  };

  constructor(config: SyncConfig) {
    this.ambilightConnection = new AmbilightConnection(
      config.tvIp,
      config.apiVersion || 6
    );
    this.wledConnection = new WLEDConnection({
      host: config.wledHost,
      port: config.wledPort || 21324,
    });
    this.pollInterval = config.pollInterval || 100; // Default 100ms (10 updates per second)
  }

  /**
   * Start syncing with direct color mapping mode
   */
  async startSync(): Promise<void> {
    if (this.intervalId) {
      this.stop();
    }

    console.log('Starting Ambilight to WLED sync...');
    this.mode = 'started' as SyncState;
    

    while (this.mode !== 'stopped') {
      try {
        const startTime = Date.now();

        // Get current Ambilight colors
        const colors = await this.ambilightConnection.getColors();

        const mapped = mapAmbilightToWLED(colors, 0.4, 50);
        
        // Convert and send all colors to WLED
        await this.wledConnection.sendColors(mapped);

        // Update stats
        const latency = Date.now() - startTime;
        this.stats.updateCount++;
        this.stats.lastUpdate = new Date();
        this.stats.averageLatency =
          (this.stats.averageLatency * (this.stats.updateCount - 1) + latency) /
          this.stats.updateCount;
      } catch (error) {
        this.stats.errors++;
        console.error('Error syncing Ambilight to WLED:', error);
      }

      await this.delay(this.pollInterval);
    }
  }

  /**
   * Stop syncing
   */
  stop(): void {
    this.mode = 'stopped' as SyncState;
  }

  /**
   * Get current sync statistics
   */
  getStats(): SyncStats {
    return { ...this.stats };
  }

  /**
   * Get current sync mode
   */
  getMode(): SyncState {
    return this.mode;
  }

  /**
   * Reset statistics
   */
  resetStats(): void {
    this.stats = {
      updateCount: 0,
      lastUpdate: null,
      averageLatency: 0,
      errors: 0,
    };
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    this.stop();
    this.wledConnection.close();
  }

  delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
