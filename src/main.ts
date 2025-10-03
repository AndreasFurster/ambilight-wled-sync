#!/usr/bin/env node

/**
 * Ambilight WLED Sync Service - Main Entry Point
 * 
 * This service syncs Philips Ambilight TV colors with WLED devices
 * using three main modules:
 * 1. Ambilight - Connects to Philips TV via JointSpace API
 * 2. WLED - Sends color data via UDP
 * 3. Sync - Orchestrates the synchronization
 */

import { AmbilightWLEDSync } from './sync/index.js';
import process from 'node:process';

// Configuration from environment variables or defaults
const config = {
  tvIp: '192.168.2.11',
  wledHost: '192.168.2.2',
  wledPort: 21324,
  pollInterval: 10,
  apiVersion: 6,
};

// Initialize the sync service
let sync: AmbilightWLEDSync | null = null;
let statsInterval: NodeJS.Timeout | null = null;

// Service control functions
async function startService(): Promise<void> {
  try {
    console.log('🚀 Starting Ambilight WLED Sync Service...');
    console.log(`📺 TV IP: ${config.tvIp}`);
    console.log(`💡 WLED Host: ${config.wledHost}:${config.wledPort}`);
    console.log(`⏱️  Poll Interval: ${config.pollInterval}ms`);
    console.log('');

    if (sync) {
      sync.destroy();
    }

    sync = new AmbilightWLEDSync({
      tvIp: config.tvIp,
      wledHost: config.wledHost,
      wledPort: config.wledPort,
      pollInterval: config.pollInterval,
      apiVersion: config.apiVersion,
    });

    await sync.startSync();

    console.log('✅ Service started successfully!');
    startStatsReporting();

  } catch (error) {
    console.error('❌ Failed to start service:', error);
    process.exit(1);
  }
}

function stopService(): void {
  console.log('🛑 Stopping Ambilight WLED Sync Service...');
  
  if (sync) {
    sync.stop();
  }

  if (statsInterval) {
    clearInterval(statsInterval);
    statsInterval = null;
  }

  console.log('✅ Service stopped successfully!');
}

function startStatsReporting(): void {
  // Report stats every 10 seconds
  statsInterval = setInterval(() => {
    if (sync) {
      const stats = sync.getStats();
      console.log(`📊 Updates: ${stats.updateCount} | Errors: ${stats.errors} | Avg Latency: ${stats.averageLatency.toFixed(1)}ms | Last: ${stats.lastUpdate?.toLocaleTimeString() || 'Never'}`);
    }
  }, 10000);
}

// Signal handlers
process.on('SIGINT', () => {
  console.log('\n🔄 Received SIGINT, shutting down gracefully...');
  stopService();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🔄 Received SIGTERM, shutting down gracefully...');
  stopService();
  process.exit(0);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('💥 Uncaught Exception:', error);
  stopService();
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
  stopService();
  process.exit(1);
});

// CLI argument parsing
function printUsage(): void {
  console.log(`
Ambilight WLED Sync Service

Usage: 
  node main.js [mode]

Modes:
  average  - Calculate average color and send to all LEDs (default)
  direct   - Map TV zones directly to LED segments

Environment Variables:
  TV_IP          - IP address of Philips TV (default: 192.168.2.11)
  WLED_HOST      - IP address of WLED device (default: 192.168.2.2)
  WLED_PORT      - UDP port of WLED device (default: 21324)
  POLL_INTERVAL  - Update interval in milliseconds (default: 100)
  API_VERSION    - JointSpace API version (default: 6)
  SYNC_MODE      - Default sync mode: average or direct (default: average)

Examples:
  node main.js
  node main.js average
  node main.js direct
  TV_IP=192.168.1.100 WLED_HOST=192.168.1.200 node main.js
`);
}

// Main execution
async function main(): Promise<void> {
  const args = process.argv.slice(2);
  
  if (args.includes('--help') || args.includes('-h')) {
    printUsage();
    return;
  }

  await startService();
  
  // Keep the process running
  console.log('🔄 Service is running... Press Ctrl+C to stop.');
}

// Start the service
main().catch((error) => {
  console.error('💥 Fatal error:', error);
  process.exit(1);
});