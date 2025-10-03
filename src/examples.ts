/**
 * Example: Using the Ambilight WLED Sync modules
 * 
 * This file demonstrates how to use each module independently
 * and how to use the sync module to connect them together.
 */

/* eslint-disable @typescript-eslint/no-unused-vars */

// ============================================================================
// Example 1: Using the Ambilight module directly
// ============================================================================

import { AmbilightConnection } from './ambilight';

async function ambilightExample() {
  const ambilight = new AmbilightConnection('192.168.1.100', 6);

  // Get topology (number of LEDs on each side)
  const topology = await ambilight.getTopology();
  console.log('Ambilight topology:', topology);

  // Get current colors
  const colors = await ambilight.getColors();
  console.log('Current colors:', colors);

  // Process colors into array
  const colorArray = ambilight.processColors(colors);
  console.log('Color array:', colorArray);

  // Calculate average color
  const avgColor = ambilight.calculateAverageColor(colorArray);
  console.log('Average color:', avgColor);
}

// ============================================================================
// Example 2: Using the WLED module directly
// ============================================================================

import { WLEDConnection } from './wled';

async function wledExample() {
  console.log('Starting WLED example...');
  
  const wled = new WLEDConnection({
    host: '192.168.2.2',
    port: 21324,
  });

  console.log('WLED connection established');

  const indexToShow = 140
  
  // Create 100 random colors
  const colors = Array.from({ length: indexToShow - 1 }, () => ({
    r: 0,
    g: 0,
    b: 0,
    w: 100,
  }));

  colors.push({ r: 255, g: 0, b: 0, w: 0 });

  // Send multiple colors (one per LED)
  await wled.sendColors(colors);


  // Close the connection when done
  wled.close();
}

// ============================================================================
// Example 3: Using the Sync module (recommended)
// ============================================================================

import { AmbilightWLEDSync } from './sync';

async function syncExample() {
  const sync = new AmbilightWLEDSync({
    tvIp: '192.168.1.100',
    wledHost: '192.168.1.101',
    wledPort: 21324,
    pollInterval: 100, // Update every 100ms
    apiVersion: 6,
  });

  // Start syncing with average color mode
  await sync.startAverageSync();

  // Let it run for 10 seconds
  await new Promise(resolve => setTimeout(resolve, 10000));

  // Get statistics
  const stats = sync.getStats();
  console.log('Statistics:', stats);

  // Stop syncing
  sync.stop();

  // Or try direct sync mode
  await sync.startDirectSync();

  // Let it run for 10 seconds
  await new Promise(resolve => setTimeout(resolve, 10000));

  // Clean up
  sync.destroy();
}

// ============================================================================
// Example 4: Advanced usage with error handling
// ============================================================================

async function advancedExample() {
  const sync = new AmbilightWLEDSync({
    tvIp: '192.168.1.100',
    wledHost: '192.168.1.101',
    pollInterval: 100,
  });

  try {
    // Start syncing
    await sync.startAverageSync();
    console.log('Sync started successfully');

    // Monitor statistics every 5 seconds
    const statsInterval = setInterval(() => {
      const stats = sync.getStats();
      console.log(`Updates: ${stats.updateCount}, Errors: ${stats.errors}, Latency: ${stats.averageLatency.toFixed(2)}ms`);
    }, 5000);

    // Run for 30 seconds
    await new Promise(resolve => setTimeout(resolve, 30000));

    // Stop monitoring
    clearInterval(statsInterval);

    // Stop sync and cleanup
    sync.destroy();
    console.log('Sync stopped');
  } catch (error) {
    console.error('Error during sync:', error);
    sync.destroy();
  }
}

// ============================================================================
// Run examples (uncomment the one you want to try)
// ============================================================================

// ambilightExample().catch(console.error);
wledExample().catch(console.error);
// syncExample().catch(console.error);
// advancedExample().catch(console.error);
