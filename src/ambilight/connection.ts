/**
 * Philips Ambilight Connection Module
 * Connects to Philips TV using JointSpace API
 */

import axios from 'axios';
import type { AxiosInstance } from 'axios';
import type { AmbilightColor, AmbilightTopology, AmbilightCachedData } from './types.js';

export class AmbilightConnection {
  private readonly baseUrl: string;
  private readonly axiosInstance: AxiosInstance;
  private topology: AmbilightTopology | null = null;

  constructor(tvIp: string, apiVersion: number = 6) {
    this.baseUrl = `http://${tvIp}:1925/${apiVersion}`;
    this.axiosInstance = axios.create({
      baseURL: this.baseUrl,
      timeout: 5000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Get the Ambilight topology (number of LEDs on each side)
   */
  async getTopology(): Promise<AmbilightTopology> {
    if (this.topology) {
      return this.topology as AmbilightTopology;
    }

    try {
      const response = await this.axiosInstance.get('/ambilight/topology');
      this.topology = response.data;
      return this.topology as AmbilightTopology;
    } catch (error) {
      throw new Error(`Failed to get Ambilight topology: ${error}`);
    }
  }

  /**
   * Get current Ambilight colors
   */
  async getColors(): Promise<AmbilightCachedData> {
    try {
      const response = await this.axiosInstance.get('/ambilight/processed'); // Processed, measured, cached
      return response.data.layer1;
    } catch (error) {
      throw new Error(`Failed to get Ambilight colors: ${error}`);
    }
  }

  /**
   * Get the current Ambilight mode
   */
  async getMode(): Promise<string> {
    try {
      const response = await this.axiosInstance.get('/ambilight/mode');
      return response.data.current;
    } catch (error) {
      throw new Error(`Failed to get Ambilight mode: ${error}`);
    }
  }

  /**
   * Set Ambilight mode
   */
  async setMode(mode: string): Promise<void> {
    try {
      await this.axiosInstance.post('/ambilight/mode', { current: mode });
    } catch (error) {
      throw new Error(`Failed to set Ambilight mode: ${error}`);
    }
  }

  /**
   * Process the cached data into a flat array of colors
   */
  processColors(cachedData: AmbilightCachedData): AmbilightColor[] {
    const colors: AmbilightColor[] = [];
    
    for (const key in cachedData) {
      if (Object.prototype.hasOwnProperty.call(cachedData, key)) {
        colors.push(cachedData[key]);
      }
    }
    
    return colors;
  }

  /**
   * Calculate average color from all Ambilight LEDs
   */
  calculateAverageColor(colors: AmbilightColor[]): AmbilightColor {
    if (colors.length === 0) {
      return { r: 0, g: 0, b: 0 };
    }

    const sum = colors.reduce(
      (acc, color) => ({
        r: acc.r + color.r,
        g: acc.g + color.g,
        b: acc.b + color.b,
      }),
      { r: 0, g: 0, b: 0 }
    );

    return {
      r: Math.round(sum.r / colors.length),
      g: Math.round(sum.g / colors.length),
      b: Math.round(sum.b / colors.length),
    };
  }
}
