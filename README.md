# ambilight-wled-sync# ambilight-wled-sync



Sync Philips Ambilight TV with WLED devices in real-time using UDP.Sync Philips Ambilight TV with WLED devices in real-time.



## Overview## Overview



This project synchronizes the colors from your Philips Ambilight TV with WLED-controlled LED strips using a modular TypeScript architecture. The service runs as a Node.js application and is organized into three main modules:This project synchronizes the colors from your Philips Ambilight TV with WLED-controlled LED strips using a modular TypeScript architecture. The project is built with Vite and organized into three main modules:



1. **Ambilight Module** - Connects to Philips TV via JointSpace API1. **Ambilight Module** - Connects to Philips TV via JointSpace API

2. **WLED Module** - Sends color data to WLED devices via UDP2. **WLED Module** - Sends color data to WLED devices via UDP

3. **Sync Module** - Orchestrates the synchronization between the two3. **Sync Module** - Orchestrates the synchronization between the two



## Features## Features



- 🎨 Real-time color synchronization- 🎨 Real-time color synchronization

- 🔄 Two sync modes:- 🔄 Two sync modes:

  - **Average Mode**: Calculates and sends the average color from all Ambilight LEDs  - **Average Mode**: Calculates and sends the average color from all Ambilight LEDs

  - **Direct Mode**: Maps individual Ambilight LED colors to WLED LEDs  - **Direct Mode**: Maps individual Ambilight LED colors to WLED LEDs

- 📊 Live statistics and monitoring- 📊 Live statistics and monitoring

- ⚙️ Configurable via environment variables- ⚙️ Configurable poll intervals

- 🎯 TypeScript for type safety- 🎯 TypeScript for type safety

- 🚀 UDP communication for low-latency updates- 🚀 Built with Vite for fast development

- 🔧 Runs as a service (no browser required)

## Prerequisites

## Prerequisites

- Node.js (v18 or higher recommended)

- Node.js (v18 or higher recommended)- Philips TV with Ambilight and JointSpace API enabled

- Philips TV with Ambilight and JointSpace API enabled- WLED device on your local network

- WLED device on your local network

- Both devices must be on the same network## Installation



## Installation```bash

npm install

```bash```

npm install

```## Configuration



## ConfigurationBefore starting, update the configuration in `src/main.ts` with your device IP addresses:



Configure the service using environment variables:```typescript

const config = {

```bash  tvIp: '192.168.1.100',      // Your TV's IP address

# TV Configuration  wledHost: '192.168.1.101',  // Your WLED device's IP address

TV_IP=192.168.2.11           # Your TV's IP address  wledPort: 21324,            // Default WLED UDP port

  pollInterval: 100,          // Update interval in milliseconds

# WLED Configuration  apiVersion: 6,              // JointSpace API version

WLED_HOST=192.168.2.2        # Your WLED device's IP address};

WLED_PORT=21324              # WLED UDP port (default: 21324)```



# Sync Configuration## Usage

POLL_INTERVAL=100            # Update interval in milliseconds (default: 100)

API_VERSION=6                # JointSpace API version (default: 6)### Development Mode

SYNC_MODE=average            # Default mode: average or direct (default: average)

```Start the development server:



## Usage```bash

npm run dev

### Development Mode (TypeScript)```



Run directly from TypeScript source with auto-reload:Then open your browser and navigate to the provided local URL (typically `http://localhost:5173`).



```bash### Building for Production

npm run dev

```Build the project:



Or specify a mode:```bash

npm run build

```bash```

npm run dev average  # Average color mode

npm run dev direct   # Direct mapping modePreview the production build:

```

```bash

### Running from TypeScript (Single Run)npm run preview

```

```bash

npm run start:dev [mode]## Project Structure

```

```

### Building for Productionsrc/

├── ambilight/           # Ambilight module

Build the TypeScript to JavaScript:│   ├── connection.ts    # JointSpace API connection

│   ├── types.ts         # TypeScript type definitions

```bash│   └── index.ts         # Module exports

npm run build├── wled/                # WLED module

```│   ├── connection.ts    # UDP communication

│   ├── types.ts         # TypeScript type definitions

### Running Production Build│   └── index.ts         # Module exports

├── sync/                # Sync module

```bash│   ├── sync.ts          # Synchronization logic

npm start [mode]│   ├── types.ts         # TypeScript type definitions

```│   └── index.ts         # Module exports

├── main.ts              # Application entry point

Or with Node directly:└── style.css            # UI styles

```

```bash

node dist/main.js [mode]## Modules

```

### Ambilight Module

### With Environment Variables

Handles communication with Philips TV using the JointSpace API:

```powershell- Fetches current Ambilight colors

# Windows PowerShell- Retrieves Ambilight topology

$env:TV_IP="192.168.1.100"; $env:WLED_HOST="192.168.1.200"; npm run dev- Processes color data



# Windows CMD### WLED Module

set TV_IP=192.168.1.100 && set WLED_HOST=192.168.1.200 && npm run dev

Manages UDP communication with WLED devices:

# Linux/Mac- Supports WARLS, DRGB, and DRGBW protocols

TV_IP=192.168.1.100 WLED_HOST=192.168.1.200 npm run dev- Sends color data via UDP packets

```- Handles single color and multi-color updates



### Examples### Sync Module



```bashOrchestrates the synchronization:

# Development with auto-reload- Polls Ambilight data at configured intervals

npm run dev- Processes and transforms colors

- Sends updates to WLED

# Run in average mode- Tracks statistics and performance metrics

npm run dev average

## API Reference

# Run in direct mode with custom IPs

$env:TV_IP="192.168.1.50"; $env:WLED_HOST="192.168.1.51"; npm run dev direct### AmbilightConnection



# Production build and run```typescript

npm run buildconst ambilight = new AmbilightConnection(tvIp, apiVersion);

npm start averageawait ambilight.getColors();           // Get current colors

```await ambilight.getTopology();         // Get LED layout

```

## Project Structure

### WLEDConnection

```

src/```typescript

├── ambilight/           # Ambilight moduleconst wled = new WLEDConnection({ host, port });

│   ├── connection.ts    # JointSpace API connectionawait wled.sendColor({ r, g, b });     // Send single color

│   ├── types.ts         # TypeScript type definitionsawait wled.sendColors([colors]);       // Send multiple colors

│   └── index.ts         # Module exports```

├── wled/                # WLED module

│   ├── connection.ts    # UDP communication### AmbilightWLEDSync

│   ├── types.ts         # TypeScript type definitions

│   └── index.ts         # Module exports```typescript

├── sync/                # Sync moduleconst sync = new AmbilightWLEDSync(config);

│   ├── sync.ts          # Synchronization logicawait sync.startAverageSync();         // Start in average mode

│   ├── types.ts         # TypeScript type definitionsawait sync.startDirectSync();          // Start in direct mode

│   └── index.ts         # Module exportssync.stop();                           // Stop syncing

└── main.ts              # Service entry pointsync.getStats();                       // Get statistics

``````



## Modules## Troubleshooting



### Ambilight Module### TV Connection Issues



Handles communication with Philips TV using the JointSpace API:- Ensure your TV's JointSpace API is enabled

- Fetches current Ambilight colors via HTTP- Check that the TV is on the same network

- Retrieves Ambilight topology- Try different API versions (5 or 6)

- Processes color data

- Calculates average colors### WLED Connection Issues



### WLED Module- Verify the WLED device IP address

- Ensure UDP port 21324 is not blocked by firewall

Manages UDP communication with WLED devices:- Check WLED is powered on and connected to network

- Supports WARLS, DRGB, and DRGBW protocols

- Sends color data via UDP packets### Performance Issues

- Handles single color and multi-color updates

- Low-latency communication- Increase the poll interval (e.g., 200ms instead of 100ms)

- Use average mode instead of direct mode

### Sync Module- Check network latency



Orchestrates the synchronization:## License

- Polls Ambilight data at configured intervals

- Processes and transforms colorsMIT

- Sends updates to WLED via UDP

- Tracks statistics and performance metrics## Contributing



## API ReferenceContributions are welcome! Please feel free to submit a Pull Request.


### AmbilightConnection

```typescript
const ambilight = new AmbilightConnection(tvIp, apiVersion);
await ambilight.getColors();           // Get current colors
await ambilight.getTopology();         // Get LED layout
const avg = ambilight.calculateAverageColor(colors);
```

### WLEDConnection

```typescript
const wled = new WLEDConnection({ host, port });
await wled.sendColor({ r, g, b });     // Send single color
await wled.sendColors([colors]);       // Send multiple colors
wled.close();                          // Close UDP socket
```

### AmbilightWLEDSync

```typescript
const sync = new AmbilightWLEDSync(config);
await sync.startAverageSync();         // Start in average mode
await sync.startDirectSync();          // Start in direct mode
sync.stop();                           // Stop syncing
sync.getStats();                       // Get statistics
sync.resetStats();                     // Reset statistics
sync.destroy();                        // Clean up resources
```

## Statistics

The service outputs statistics every 10 seconds:

```
📊 Updates: 1234 | Errors: 0 | Avg Latency: 45.3ms | Last: 10:30:45 AM
```

## Sync Modes

### Average Mode (Recommended)

Calculates the average color from all Ambilight LEDs and sends it to all WLED LEDs. This provides a cohesive ambient lighting effect.

**Best for:**
- Single color ambient lighting
- Simple WLED setups
- Lower processing overhead

### Direct Mode

Maps individual Ambilight LED zones to corresponding WLED LED segments. Requires proper topology configuration.

**Best for:**
- Multi-zone LED setups
- Matching TV layout to LED strip layout
- More dynamic effects

## Running as a System Service

### Windows (Task Scheduler)

1. Build the project: `npm run build`
2. Create a batch file to start the service
3. Use Task Scheduler to run on startup

### Linux (systemd)

Create `/etc/systemd/system/ambilight-wled-sync.service`:

```ini
[Unit]
Description=Ambilight WLED Sync Service
After=network.target

[Service]
Type=simple
User=your-user
WorkingDirectory=/path/to/ambilight-wled-sync
Environment="TV_IP=192.168.2.11"
Environment="WLED_HOST=192.168.2.2"
ExecStart=/usr/bin/node dist/main.js average
Restart=always

[Install]
WantedBy=multi-user.target
```

Then:
```bash
sudo systemctl enable ambilight-wled-sync
sudo systemctl start ambilight-wled-sync
```

## Troubleshooting

### TV Connection Issues

- Ensure your TV's JointSpace API is enabled
- Check that the TV is on the same network
- Try different API versions (5 or 6)
- Verify the TV IP address is correct

### WLED Connection Issues

- Verify the WLED device IP address
- Ensure UDP port 21324 is not blocked by firewall
- Check WLED is powered on and connected to network
- Test WLED with the official app first

### Performance Issues

- Increase the poll interval (e.g., 200ms instead of 100ms)
- Use average mode instead of direct mode
- Check network latency with `ping`
- Reduce number of LEDs in WLED config

### UDP Socket Errors

- Ensure no other process is using the UDP port
- Check firewall settings
- Try running with administrator/root privileges

### TypeScript Compilation Errors

- Run `npm install` to ensure dependencies are installed
- Check Node.js version: `node --version` (should be v18+)
- Clean and rebuild: `npm run clean && npm run build`

## Architecture

See [ARCHITECTURE.md](ARCHITECTURE.md) for detailed technical documentation.

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Credits

- Built with TypeScript and Node.js
- Uses axios for HTTP requests
- UDP communication via Node.js dgram module
