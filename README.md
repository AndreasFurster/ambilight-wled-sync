# ambilight-wled-sync

Sync Philips Ambilight TV with WLED devices in real-time.

## Overview

This project synchronizes the colors from your Philips Ambilight TV with WLED-controlled LED strips using a modular TypeScript architecture. The project is built with Vite and organized into three main modules:

1. **Ambilight Module** - Connects to Philips TV via JointSpace API
2. **WLED Module** - Sends color data to WLED devices via UDP
3. **Sync Module** - Orchestrates the synchronization between the two

## Features

- 🎨 Real-time color synchronization
- 🔄 Two sync modes:
  - **Average Mode**: Calculates and sends the average color from all Ambilight LEDs
  - **Direct Mode**: Maps individual Ambilight LED colors to WLED LEDs
- 📊 Live statistics and monitoring
- ⚙️ Configurable poll intervals
- 🎯 TypeScript for type safety
- 🚀 Built with Vite for fast development

## Prerequisites

- Node.js (v18 or higher recommended)
- Philips TV with Ambilight and JointSpace API enabled
- WLED device on your local network

## Installation

```bash
npm install
```

## Configuration

Before starting, update the configuration in `src/main.ts` with your device IP addresses:

```typescript
const config = {
  tvIp: '192.168.1.100',      // Your TV's IP address
  wledHost: '192.168.1.101',  // Your WLED device's IP address
  wledPort: 21324,            // Default WLED UDP port
  pollInterval: 100,          // Update interval in milliseconds
  apiVersion: 6,              // JointSpace API version
};
```

## Usage

### Development Mode

Start the development server:

```bash
npm run dev
```

Then open your browser and navigate to the provided local URL (typically `http://localhost:5173`).

### Building for Production

Build the project:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

## Project Structure

```
src/
├── ambilight/           # Ambilight module
│   ├── connection.ts    # JointSpace API connection
│   ├── types.ts         # TypeScript type definitions
│   └── index.ts         # Module exports
├── wled/                # WLED module
│   ├── connection.ts    # UDP communication
│   ├── types.ts         # TypeScript type definitions
│   └── index.ts         # Module exports
├── sync/                # Sync module
│   ├── sync.ts          # Synchronization logic
│   ├── types.ts         # TypeScript type definitions
│   └── index.ts         # Module exports
├── main.ts              # Application entry point
└── style.css            # UI styles
```

## Modules

### Ambilight Module

Handles communication with Philips TV using the JointSpace API:
- Fetches current Ambilight colors
- Retrieves Ambilight topology
- Processes color data

### WLED Module

Manages UDP communication with WLED devices:
- Supports WARLS, DRGB, and DRGBW protocols
- Sends color data via UDP packets
- Handles single color and multi-color updates

### Sync Module

Orchestrates the synchronization:
- Polls Ambilight data at configured intervals
- Processes and transforms colors
- Sends updates to WLED
- Tracks statistics and performance metrics

## API Reference

### AmbilightConnection

```typescript
const ambilight = new AmbilightConnection(tvIp, apiVersion);
await ambilight.getColors();           // Get current colors
await ambilight.getTopology();         // Get LED layout
```

### WLEDConnection

```typescript
const wled = new WLEDConnection({ host, port });
await wled.sendColor({ r, g, b });     // Send single color
await wled.sendColors([colors]);       // Send multiple colors
```

### AmbilightWLEDSync

```typescript
const sync = new AmbilightWLEDSync(config);
await sync.startAverageSync();         // Start in average mode
await sync.startDirectSync();          // Start in direct mode
sync.stop();                           // Stop syncing
sync.getStats();                       // Get statistics
```

## Troubleshooting

### TV Connection Issues

- Ensure your TV's JointSpace API is enabled
- Check that the TV is on the same network
- Try different API versions (5 or 6)

### WLED Connection Issues

- Verify the WLED device IP address
- Ensure UDP port 21324 is not blocked by firewall
- Check WLED is powered on and connected to network

### Performance Issues

- Increase the poll interval (e.g., 200ms instead of 100ms)
- Use average mode instead of direct mode
- Check network latency

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
