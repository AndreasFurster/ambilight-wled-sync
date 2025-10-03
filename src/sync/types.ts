/**
 * Types for the Sync Module
 */

export interface SyncConfig {
  tvIp: string;
  wledHost: string;
  wledPort?: number;
  pollInterval?: number;
  apiVersion?: number;
}

export interface SyncStats {
  updateCount: number;
  lastUpdate: Date | null;
  averageLatency: number;
  errors: number;
}

export type SyncState = 'started' | 'stopped';
