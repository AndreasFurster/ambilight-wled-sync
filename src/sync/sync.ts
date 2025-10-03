/**
 * Sync Module
 * Connects Philips Ambilight and WLED
 */

import { AmbilightConnection, type AmbilightColor } from '../ambilight';
import { WLEDConnection, type WLEDColor } from '../wled';
import type { SyncConfig, SyncStats, SyncMode } from './types';

export class AmbilightWLEDSync {
  private ambilightConnection: AmbilightConnection;
  private wledConnection: WLEDConnection;
  private pollInterval: number;
  private intervalId: NodeJS.Timeout | null = null;
  private mode: SyncMode = 'stopped' as SyncMode;
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
   * Convert AmbilightColor to WLEDColor
   */
  private convertColor(color: AmbilightColor): WLEDColor {
    return {
      r: color.r,
      g: color.g,
      b: color.b,
    };
  }

  /**
   * Start syncing with average color mode
   */
  async startAverageSync(): Promise<void> {
    if (this.intervalId) {
      this.stop();
    }

    this.mode = 'average' as SyncMode;
    console.log('Starting Ambilight to WLED sync (average mode)...');

    this.intervalId = setInterval(async () => {
      try {
        const startTime = Date.now();

        // Get current Ambilight colors
        const cachedData = await this.ambilightConnection.getColors();
        const colors = this.ambilightConnection.processColors(cachedData);

        // Calculate average color
        const averageColor = this.ambilightConnection.calculateAverageColor(colors);

        // Send to WLED
        await this.wledConnection.sendColor(this.convertColor(averageColor));

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
    }, this.pollInterval);
  }

  /**
   * Start syncing with direct color mapping mode
   */
  async startDirectSync(): Promise<void> {
    if (this.intervalId) {
      this.stop();
    }

    this.mode = 'direct' as SyncMode;
    console.log('Starting Ambilight to WLED sync (direct mode)...');

    this.intervalId = setInterval(async () => {
      try {
        const startTime = Date.now();

        // Get current Ambilight colors
        const cachedData = await this.ambilightConnection.getColors();
        const colors = this.ambilightConnection.processColors(cachedData);

        // Convert and send all colors to WLED
        const wledColors = colors.map((color) => this.convertColor(color));
        await this.wledConnection.sendColors(wledColors);

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
    }, this.pollInterval);
  }

  /**
   * Stop syncing
   */
  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      this.mode = 'stopped' as SyncMode;
      console.log('Stopped Ambilight to WLED sync');
    }
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
  getMode(): SyncMode {
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
}
