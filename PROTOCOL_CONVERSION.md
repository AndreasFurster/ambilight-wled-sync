# WLED Protocol Conversion: WARLS → DRGBW

## Summary

The WLED connection has been converted from **WARLS (Protocol 1)** to **DRGBW (Protocol 4)** to support RGBW LED strips with a white channel.

## Changes Made

### 1. Protocol Default Changed
- **Before**: Protocol 1 (WARLS) - RGB only with timeout in seconds
- **After**: Protocol 4 (DRGBW) - RGBW with timeout multiplier

### 2. Packet Structure

#### WARLS (Old Protocol 1)
```
Byte 0: Protocol ID (1)
Byte 1: Timeout in seconds (2)
Bytes 2+: RGB data (3 bytes per LED)
  - R, G, B
```

#### DRGBW (New Protocol 4)
```
Byte 0: Protocol ID (4)
Byte 1: Timeout multiplier (1)
Bytes 2+: RGBW data (4 bytes per LED)
  - R, G, B, W
```

### 3. Updated Code

**File: `src/wled/types.ts`**
- Added optional `w` (white) property to `WLEDColor` interface

```typescript
export interface WLEDColor {
  r: number;
  g: number;
  b: number;
  w?: number;  // NEW: Optional white channel
}
```

**File: `src/wled/connection.ts`**
- Changed default protocol from 1 to 4
- Updated `sendColor()` to include white channel byte
- Updated `sendColors()` to include white channel for each LED
- Uses `color.w || 0` to default to 0 if white channel not specified

## Benefits of DRGBW

1. **RGBW Support**: Can control RGBW LED strips with dedicated white LEDs
2. **Better Color Accuracy**: White channel provides pure white instead of RGB mix
3. **Energy Efficiency**: Using white LED is more efficient than RGB white
4. **Backward Compatible**: Works with RGB strips (white channel set to 0)

## Usage

### Basic RGB Color (No White)
```typescript
const wled = new WLEDConnection({ host: '192.168.2.2' });
await wled.sendColor({ r: 255, g: 0, b: 0 }); // Red color, w defaults to 0
```

### RGBW Color (With White)
```typescript
await wled.sendColor({ r: 255, g: 0, b: 0, w: 128 }); // Red + half white
```

### Multiple Colors
```typescript
const colors = [
  { r: 255, g: 0, b: 0 },      // Red (no white)
  { r: 0, g: 255, b: 0, w: 64 }, // Green + some white
  { r: 0, g: 0, b: 255 },      // Blue (no white)
];
await wled.sendColors(colors);
```

## Protocol Comparison

| Feature | WARLS (1) | DRGB (2) | DRGBW (4) |
|---------|-----------|----------|-----------|
| RGB Support | ✅ | ✅ | ✅ |
| White Channel | ❌ | ❌ | ✅ |
| Bytes per LED | 3 | 3 | 4 |
| Timeout Type | Seconds | Multiplier | Multiplier |
| Header Size | 2 bytes | 2 bytes | 2 bytes |

## Migration Notes

- **No breaking changes** for existing code using RGB colors
- White channel automatically defaults to 0 if not specified
- WLED devices automatically detect the protocol from the first byte
- For RGB-only strips, the white channel byte is ignored

## Testing

Test the new protocol with:

```bash
npm run dev
```

The service will use DRGBW protocol by default. Monitor the output for any errors.

## Troubleshooting

If WLED doesn't respond:
1. Verify your WLED firmware supports protocol 4 (most versions do)
2. Check WLED's UDP port (default: 21324)
3. Ensure firewall allows UDP traffic
4. Try protocol 2 (DRGB) if protocol 4 doesn't work:
   ```typescript
   await wled.sendColor(color, 2); // Use DRGB instead
   ```

## References

- WLED UDP Protocol Documentation: https://kno.wled.ge/interfaces/udp-realtime/
- Protocol 1 (WARLS): Wearable Addressable Real-time LED Strip
- Protocol 2 (DRGB): Direct RGB
- Protocol 4 (DRGBW): Direct RGBW
