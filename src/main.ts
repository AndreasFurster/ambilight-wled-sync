/**
 * Ambilight WLED Sync - Main Entry Point
 * 
 * This application syncs Philips Ambilight TV colors with WLED devices
 * using three main modules:
 * 1. Ambilight - Connects to Philips TV via JointSpace API
 * 2. WLED - Sends color data via UDP
 * 3. Sync - Orchestrates the synchronization
 */

import './style.css';
import { AmbilightWLEDSync } from './sync';

// Configuration
const config = {
  tvIp: '192.168.1.100',      // Change to your TV's IP address
  wledHost: '192.168.1.101',  // Change to your WLED device's IP address
  wledPort: 21324,            // Default WLED UDP port
  pollInterval: 100,          // Update every 100ms (10 times per second)
  apiVersion: 6,              // JointSpace API version
};

// Initialize the sync
let sync: AmbilightWLEDSync | null = null;

// UI Setup
document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div>
    <h1>Ambilight WLED Sync</h1>
    <div class="config">
      <h2>Configuration</h2>
      <div class="form-group">
        <label for="tv-ip">TV IP Address:</label>
        <input type="text" id="tv-ip" value="${config.tvIp}" />
      </div>
      <div class="form-group">
        <label for="wled-ip">WLED IP Address:</label>
        <input type="text" id="wled-ip" value="${config.wledHost}" />
      </div>
      <div class="form-group">
        <label for="poll-interval">Poll Interval (ms):</label>
        <input type="number" id="poll-interval" value="${config.pollInterval}" min="50" max="1000" step="50" />
      </div>
    </div>
    
    <div class="controls">
      <h2>Controls</h2>
      <button id="start-average" type="button">Start (Average Mode)</button>
      <button id="start-direct" type="button">Start (Direct Mode)</button>
      <button id="stop" type="button" disabled>Stop</button>
    </div>
    
    <div class="stats">
      <h2>Statistics</h2>
      <div id="stats-content">
        <p>Status: <span id="status">Stopped</span></p>
        <p>Updates: <span id="updates">0</span></p>
        <p>Average Latency: <span id="latency">0</span> ms</p>
        <p>Errors: <span id="errors">0</span></p>
        <p>Last Update: <span id="last-update">Never</span></p>
      </div>
      <button id="reset-stats" type="button">Reset Statistics</button>
    </div>
  </div>
`;

// Get UI elements
const tvIpInput = document.querySelector<HTMLInputElement>('#tv-ip')!;
const wledIpInput = document.querySelector<HTMLInputElement>('#wled-ip')!;
const pollIntervalInput = document.querySelector<HTMLInputElement>('#poll-interval')!;
const startAverageBtn = document.querySelector<HTMLButtonElement>('#start-average')!;
const startDirectBtn = document.querySelector<HTMLButtonElement>('#start-direct')!;
const stopBtn = document.querySelector<HTMLButtonElement>('#stop')!;
const resetStatsBtn = document.querySelector<HTMLButtonElement>('#reset-stats')!;
const statusSpan = document.querySelector<HTMLSpanElement>('#status')!;
const updatesSpan = document.querySelector<HTMLSpanElement>('#updates')!;
const latencySpan = document.querySelector<HTMLSpanElement>('#latency')!;
const errorsSpan = document.querySelector<HTMLSpanElement>('#errors')!;
const lastUpdateSpan = document.querySelector<HTMLSpanElement>('#last-update')!;

// Update stats display
let statsInterval: number | null = null;

function updateStatsDisplay(): void {
  if (sync) {
    const stats = sync.getStats();
    const mode = sync.getMode();
    
    statusSpan.textContent = mode === 'stopped' ? 'Stopped' : `Running (${mode})`;
    updatesSpan.textContent = stats.updateCount.toString();
    latencySpan.textContent = stats.averageLatency.toFixed(2);
    errorsSpan.textContent = stats.errors.toString();
    lastUpdateSpan.textContent = stats.lastUpdate 
      ? stats.lastUpdate.toLocaleTimeString() 
      : 'Never';
  }
}

function startStatsUpdate(): void {
  if (statsInterval) {
    clearInterval(statsInterval);
  }
  statsInterval = window.setInterval(updateStatsDisplay, 500);
}

function stopStatsUpdate(): void {
  if (statsInterval) {
    clearInterval(statsInterval);
    statsInterval = null;
  }
}

// Event handlers
startAverageBtn.addEventListener('click', async () => {
  try {
    const currentConfig = {
      tvIp: tvIpInput.value,
      wledHost: wledIpInput.value,
      wledPort: config.wledPort,
      pollInterval: parseInt(pollIntervalInput.value, 10),
      apiVersion: config.apiVersion,
    };

    if (sync) {
      sync.destroy();
    }

    sync = new AmbilightWLEDSync(currentConfig);
    await sync.startAverageSync();

    startAverageBtn.disabled = true;
    startDirectBtn.disabled = true;
    stopBtn.disabled = false;
    tvIpInput.disabled = true;
    wledIpInput.disabled = true;
    pollIntervalInput.disabled = true;

    startStatsUpdate();
  } catch (error) {
    console.error('Failed to start sync:', error);
    alert(`Failed to start sync: ${error}`);
  }
});

startDirectBtn.addEventListener('click', async () => {
  try {
    const currentConfig = {
      tvIp: tvIpInput.value,
      wledHost: wledIpInput.value,
      wledPort: config.wledPort,
      pollInterval: parseInt(pollIntervalInput.value, 10),
      apiVersion: config.apiVersion,
    };

    if (sync) {
      sync.destroy();
    }

    sync = new AmbilightWLEDSync(currentConfig);
    await sync.startDirectSync();

    startAverageBtn.disabled = true;
    startDirectBtn.disabled = true;
    stopBtn.disabled = false;
    tvIpInput.disabled = true;
    wledIpInput.disabled = true;
    pollIntervalInput.disabled = true;

    startStatsUpdate();
  } catch (error) {
    console.error('Failed to start sync:', error);
    alert(`Failed to start sync: ${error}`);
  }
});

stopBtn.addEventListener('click', () => {
  if (sync) {
    sync.stop();
  }

  startAverageBtn.disabled = false;
  startDirectBtn.disabled = false;
  stopBtn.disabled = true;
  tvIpInput.disabled = false;
  wledIpInput.disabled = false;
  pollIntervalInput.disabled = false;

  stopStatsUpdate();
  updateStatsDisplay();
});

resetStatsBtn.addEventListener('click', () => {
  if (sync) {
    sync.resetStats();
    updateStatsDisplay();
  }
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
  if (sync) {
    sync.destroy();
  }
  stopStatsUpdate();
});
