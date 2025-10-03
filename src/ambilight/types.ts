/**
 * Types for Philips Ambilight TV using JointSpace API
 */

export interface AmbilightColor {
  r: number;
  g: number;
  b: number;
}

export interface AmbilightPixel {
  x: number;
  y: number;
  color: AmbilightColor;
}

export interface AmbilightTopology {
  layers: {
    left?: number;
    top?: number;
    right?: number;
    bottom?: number;
  };
}

export interface AmbilightMode {
  current: string;
  available: string[];
}

export interface AmbilightCachedData {
  [key: string]: AmbilightColor;
}
