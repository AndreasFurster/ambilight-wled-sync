# Architecture Documentation

## Overview

The Ambilight WLED Sync project is built using a modular architecture with clear separation of concerns. The project is structured into three main modules, each responsible for a specific aspect of the synchronization process.

## Module Architecture

```
┌─────────────────────────────────────────────────────────┐
│                      Main Application                    │
│                       (main.ts)                          │
└─────────────────────────────────────────────────────────┘
                            │
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│                      Sync Module                         │
│                      (src/sync/)                         │
│  • Orchestrates synchronization                          │
│  • Manages polling intervals                             │
│  • Tracks statistics                                     │
│  • Provides two sync modes                               │
└─────────────┬───────────────────────────┬───────────────┘
              │                           │
              ▼                           ▼
┌─────────────────────────┐   ┌─────────────────────────┐
│   Ambilight Module      │   │      WLED Module        │
│   (src/ambilight/)      │   │      (src/wled/)        │
│                         │   │                         │
│  • JointSpace API       │   │  • UDP Communication    │
│  • Color fetching       │   │  • Protocol support     │
│  • Topology detection   │   │  • Color transmission   │
│  • Color processing     │   │  • Multiple protocols   │
└──────────┬──────────────┘   └──────────┬──────────────┘
           │                             │
           ▼                             ▼
    ┌──────────────┐              ┌──────────────┐
    │ Philips TV   │              │ WLED Device  │
    │ (Ambilight)  │              │  (UDP Port)  │
    └──────────────┘              └──────────────┘
```

## Module Details

### 1. Ambilight Module

**Location**: `src/ambilight/`

**Responsibilities**:
- Connect to Philips TV via HTTP using JointSpace API
- Fetch real-time Ambilight color data
- Retrieve LED topology information
- Process raw color data into usable format
- Calculate average colors

**Key Components**:
- `connection.ts`: Main API client class
- `types.ts`: TypeScript type definitions
- `index.ts`: Public exports

**API Endpoints Used**:
- `GET /ambilight/cached` - Get current LED colors
- `GET /ambilight/topology` - Get LED layout
- `GET /ambilight/mode` - Get current mode
- `POST /ambilight/mode` - Set mode

**Data Flow**:
```
Philips TV → HTTP API → AmbilightConnection → Color Data → Sync Module
```

### 2. WLED Module

**Location**: `src/wled/`

**Responsibilities**:
- Establish UDP communication with WLED devices
- Format color data according to WLED protocols
- Send color updates efficiently
- Support multiple WLED protocols

**Key Components**:
- `connection.ts`: UDP client class
- `types.ts`: TypeScript type definitions
- `index.ts`: Public exports

**Supported Protocols**:
1. **WARLS** (Protocol 1) - Most common, includes timeout
2. **DRGB** (Protocol 2) - Direct RGB
3. **DRGBW** (Protocol 3) - RGB + White channel
4. **DNRGB** (Protocol 4) - Notched RGB

**Data Flow**:
```
Sync Module → Color Data → WLEDConnection → UDP Packet → WLED Device
```

### 3. Sync Module

**Location**: `src/sync/`

**Responsibilities**:
- Orchestrate data flow between Ambilight and WLED
- Manage polling intervals and timing
- Transform color formats between modules
- Track performance statistics
- Handle errors gracefully

**Key Components**:
- `sync.ts`: Main synchronization class
- `types.ts`: TypeScript type definitions
- `index.ts`: Public exports

**Sync Modes**:

1. **Average Mode**:
   - Fetches all Ambilight LED colors
   - Calculates average RGB values
   - Sends single color to all WLED LEDs
   - Lower bandwidth, simpler effect

2. **Direct Mode**:
   - Fetches all Ambilight LED colors
   - Maps each color to corresponding WLED LED
   - Sends individual colors for each LED
   - Higher bandwidth, more accurate replication

**Data Flow**:
```
┌─────────────────────────────────────────────────────────┐
│                  Sync Module Loop                        │
│                                                          │
│  1. Poll Ambilight API (every 100ms)                    │
│  2. Receive color data                                  │
│  3. Process/Transform colors                            │
│  4. Send to WLED via UDP                                │
│  5. Update statistics                                   │
│  6. Repeat                                              │
└─────────────────────────────────────────────────────────┘
```

## Configuration

All modules are configured through a central configuration object:

```typescript
interface SyncConfig {
  tvIp: string;         // Philips TV IP address
  wledHost: string;     // WLED device IP address
  wledPort?: number;    // UDP port (default: 21324)
  pollInterval?: number; // Update interval in ms (default: 100)
  apiVersion?: number;   // JointSpace API version (default: 6)
}
```

## Error Handling

Each module implements its own error handling:

- **Ambilight Module**: Throws descriptive errors for API failures
- **WLED Module**: Uses Promise rejection for UDP errors
- **Sync Module**: Catches errors, increments error counter, continues operation

## Performance Considerations

1. **Polling Interval**: Default 100ms provides good balance between responsiveness and network load
2. **UDP Protocol**: Chosen for low latency and minimal overhead
3. **Average Mode**: Reduces network traffic when exact replication isn't needed
4. **Statistics**: Tracked to monitor performance and identify issues

## TypeScript Type Safety

All modules use strict TypeScript configuration:
- `strict: true` - All strict type checking
- `noUnusedLocals: true` - No unused variables
- `noUnusedParameters: true` - No unused function parameters
- Type definitions separate from implementation

## Testing Strategy

While the current implementation doesn't include automated tests, the modular architecture makes it easy to add:

1. **Unit Tests**: Test each module independently
2. **Integration Tests**: Test module interactions
3. **Mock Services**: Mock TV and WLED endpoints
4. **Performance Tests**: Measure latency and throughput

## Future Enhancements

The modular architecture allows for easy extensions:

1. **Additional Protocols**: Add more WLED protocols in WLED module
2. **Multiple WLED Devices**: Extend Sync module to support multiple targets
3. **Color Transformations**: Add color adjustment in Sync module
4. **Alternative TV APIs**: Support other TV brands in separate modules
5. **WebSocket Support**: Real-time updates instead of polling

## Dependencies

### Production Dependencies
- `axios` (^1.7.9) - HTTP client for JointSpace API
- Node.js built-in `dgram` - UDP client for WLED

### Development Dependencies
- `vite` (^7.1.9) - Build tool and dev server
- `typescript` (~5.9.3) - Type checking and compilation
- `@types/node` (^22.10.2) - Node.js type definitions

## Build Process

1. **TypeScript Compilation**: `tsc` checks types and compiles to JavaScript
2. **Vite Bundling**: `vite build` bundles for production
3. **Output**: Static files in `dist/` directory

## Deployment

The application can be deployed in multiple ways:

1. **Static Hosting**: Deploy `dist/` folder to any static host
2. **Node.js Server**: Serve with Express or similar
3. **Electron**: Wrap in desktop application
4. **Docker**: Containerize for easy deployment

## Development Workflow

1. `npm install` - Install dependencies
2. `npm run dev` - Start development server
3. Make changes to source files
4. Hot reload updates automatically
5. `npm run build` - Build for production
6. Test production build with `npm run preview`
