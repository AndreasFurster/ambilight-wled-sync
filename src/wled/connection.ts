/**
 * WLED Connection Module
 * Sends color data to WLED using UDP protocol
 */

import dgram from 'node:dgram';
import type { WLEDColor, WLEDConfig, WLEDProtocol } from './types';

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
   * Send a single color to all LEDs using WARLS protocol
   * WARLS: 1 byte protocol ID + 1 byte timeout + 3 bytes RGB per LED
   */
  async sendColor(color: WLEDColor, protocol: WLEDProtocol = 1): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const socket = this.ensureSocket();
        
        // Create WARLS protocol packet
        // Byte 0: Protocol (1 = WARLS)
        // Byte 1: Timeout in seconds (255 = use existing timeout)
        // Bytes 2+: RGB data (3 bytes per LED)
        const buffer = Buffer.from([
          protocol,           // Protocol
          2,                  // Timeout (2 seconds)
          color.r,            // Red
          color.g,            // Green
          color.b,            // Blue
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
   * Send multiple colors to LEDs using WARLS protocol
   */
  async sendColors(colors: WLEDColor[], protocol: WLEDProtocol = 1): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const socket = this.ensureSocket();
        
        // Create WARLS protocol packet
        const data: number[] = [
          protocol,  // Protocol
          2,         // Timeout (2 seconds)
        ];

        // Add RGB data for each LED
        colors.forEach((color) => {
          data.push(color.r, color.g, color.b);
        });

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
