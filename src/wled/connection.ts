/**
 * WLED Connection Module
 * Sends color data to WLED using UDP protocol
 * 
 * Supports multiple WLED protocols:
 * - Protocol 1 (WARLS): RGB with timeout
 * - Protocol 2 (DRGB): Direct RGB
 * - Protocol 3 (DRGB): Direct RGB (alternate)
 * - Protocol 4 (DRGBW): Direct RGBW (default, supports white channel)
 */

import dgram from 'node:dgram';
import type { WLEDColor, WLEDConfig, WLEDProtocol } from './types.js';

export class WLEDConnection {
  private readonly host: string;
  private readonly port: number;
  private socket: dgram.Socket | null = null;

  constructor(config: WLEDConfig) {
    this.host = config.host;
    this.port = config.port || 21324; // Default WLED UDP port
  }

  /**
   * Initialize UDP socket
   */
  private ensureSocket(): dgram.Socket {
    if (!this.socket) {
      this.socket = dgram.createSocket('udp4');
    }
    return this.socket;
  }

  /**
   * Send a single color to all LEDs using DRGBW protocol
   * DRGBW: 2 bytes header + 4 bytes RGBW per LED
   */
  async sendColor(color: WLEDColor, protocol: WLEDProtocol = 4): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const socket = this.ensureSocket();
        
        // Create DRGBW protocol packet
        // Byte 0: Protocol (4 = DRGBW)
        // Byte 1: Timeout multiplier (1 = 1 second)
        // Bytes 2+: RGBW data (4 bytes per LED)
        const buffer = Buffer.from([
          protocol,           // Protocol (4 = DRGBW)
          1,                  // Timeout multiplier
          color.r,            // Red
          color.g,            // Green
          color.b,            // Blue
          color.w || 0,       // White (0 if not specified)
        ]);

        socket.send(buffer, 0, buffer.length, this.port, this.host, (error) => {
          if (error) {
            reject(new Error(`Failed to send color to WLED: ${error}`));
          } else {
            resolve();
          }
        });
      } catch (error) {
        reject(new Error(`Failed to send color to WLED: ${error}`));
      }
    });
  }

  /**
   * Send multiple colors to LEDs using DRGBW protocol
   */
  async sendColors(colors: WLEDColor[], protocol: WLEDProtocol = 3): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const socket = this.ensureSocket();
        
        // Create DRGBW protocol packet
        const data: number[] = [
          protocol,  // Protocol (4 = DRGBW)
          2,         // Timeout multiplier
        ];

        // Add RGBW data for each LED
        colors.forEach((color) => {
          data.push(color.r, color.g, color.b, color.w || 0); // Use white channel if specified
        });

        // console.log(data.join(','));
        // console.log('Update');
        

        const buffer = Buffer.from(data);

        socket.send(buffer, 0, buffer.length, this.port, this.host, (error) => {
          if (error) {
            reject(new Error(`Failed to send colors to WLED: ${error}`));
          } else {
            resolve();
          }
        });
      } catch (error) {
        reject(new Error(`Failed to send colors to WLED: ${error}`));
      }
    });
  }

  /**
   * Send DRGB protocol packet (Direct RGB)
   * DRGB: 2 bytes protocol + 3 bytes RGB per LED
   */
  async sendDRGB(colors: WLEDColor[]): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const socket = this.ensureSocket();
        
        // Create DRGB protocol packet
        const data: number[] = [
          2,    // Protocol (2 = DRGB)
          1,    // Timeout multiplier
        ];

        // Add RGB data for each LED
        colors.forEach((color) => {
          data.push(color.r, color.g, color.b);
        });

        const buffer = Buffer.from(data);

        socket.send(buffer, 0, buffer.length, this.port, this.host, (error) => {
          if (error) {
            reject(new Error(`Failed to send DRGB to WLED: ${error}`));
          } else {
            resolve();
          }
        });
      } catch (error) {
        reject(new Error(`Failed to send DRGB to WLED: ${error}`));
      }
    });
  }

  /**
   * Close the UDP socket
   */
  close(): void {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }
}
