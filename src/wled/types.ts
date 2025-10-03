/**
 * Types for WLED UDP connection
 */

export interface WLEDColor {
  r: number;
  g: number;
  b: number;
}

export interface WLEDConfig {
  host: string;
  port?: number;
  timeout?: number;
}

export type WLEDProtocol = 1 | 2 | 3 | 4;
