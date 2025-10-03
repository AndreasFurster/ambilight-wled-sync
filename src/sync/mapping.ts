import { AmbilightColor } from "../ambilight/types.js";
import { WLEDColor } from "../wled/types.js";

// ============================================================================
//  LED STRIP CONFIGURATION               |  |  |
//                                        |  |
//                   _ _ _ _ _ _ _           |
//                  |             |
//                  |             |
//       |          |             |
//    |  |                         
//    |  |  |                      
//    |  |  |                      
// ============================================================================

const LEFT_STRIP_1 = generateLEDArray({ start: 0, end: 21 }); // Right strip: 22 LEDs, top to bottom
const LEFT_STRIP_2 = generateLEDArray({ start: 57, end: 22 }); // Middle strip: 36 LEDs, bottom to top (tallest)
const LEFT_STRIP_3 = generateLEDArray({ start: 58, end: 84 }); // Left strip: 28 LEDs, top to bottom

const RIGHT_STRIP_1 = generateLEDArray({ start: 103, end: 85 }); // Left strip: 18 LEDs, bottom to top
const RIGHT_STRIP_2 = generateLEDArray({ start: 104, end: 128 }); // Middle strip: 25 LEDs, top to bottom
const RIGHT_STRIP_3 = generateLEDArray({ start: 140, end: 129 }); // Right strip: 12 LEDs, bottom to top

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Generates an array of LED indexes based on start and end positions
 * @param start - Starting LED index
 * @param end - Ending LED index
 * @returns Array of LED indexes from start to end (can be ascending or descending)
 */
function generateLEDArray({ start, end }: { start: number; end: number }): number[] {
    const length = Math.abs(end - start) + 1;
    const direction = end >= start ? 1 : -1;
    return Array.from({ length }, (_, i) => start + i * direction);
}

/**
 * Converts an Ambilight color to WLED color with brightness adjustment
 */
function ambilightToWLED(
    color: AmbilightColor,
    brightnessMultiplier: number,
    whiteValue: number
): WLEDColor {
    return {
        r: Math.round(color.r * brightnessMultiplier),
        g: Math.round(color.g * brightnessMultiplier),
        b: Math.round(color.b * brightnessMultiplier),
        w: whiteValue,
    };
}

/**
 * Applies a solid color to all LEDs in an array
 */
function applySolidColor(
    colorMap: Map<number, WLEDColor>,
    ledIndexes: number[],
    color: WLEDColor
): void {
    ledIndexes.forEach((ledIndex) => {
        colorMap.set(ledIndex, color);
    });
}

// ============================================================================
// COLOR INTERPOLATION
// ============================================================================

/**
 * Interpolates between two colors
 */
function interpolateColor(
    color1: AmbilightColor,
    color2: AmbilightColor,
    fraction: number,
    brightnessMultiplier: number,
    whiteValue: number
): WLEDColor {
    return {
        r: Math.round((color1.r + (color2.r - color1.r) * fraction) * brightnessMultiplier),
        g: Math.round((color1.g + (color2.g - color1.g) * fraction) * brightnessMultiplier),
        b: Math.round((color1.b + (color2.b - color1.b) * fraction) * brightnessMultiplier),
        w: whiteValue,
    };
}

/**
 * Interpolates colors from a source array to fill a specific number of target LEDs
 */
function interpolateColors(
    sourceColors: AmbilightColor[],
    targetCount: number,
    brightnessMultiplier: number,
    whiteValue: number
): WLEDColor[] {
    const result: WLEDColor[] = [];

    for (let i = 0; i < targetCount; i++) {
        const position = (i / targetCount) * (sourceColors.length - 1);
        const index = Math.floor(position);
        const fraction = position - index;

        if (index + 1 < sourceColors.length) {
            result.push(interpolateColor(
                sourceColors[index],
                sourceColors[index + 1],
                fraction,
                brightnessMultiplier,
                whiteValue
            ));
        } else {
            result.push(ambilightToWLED(sourceColors[index], brightnessMultiplier, whiteValue));
        }
    }

    return result;
}

// ============================================================================
// LEFT SIDE MAPPING (Height-Aligned Strips with Gradient)
// ============================================================================

/**
 * Maps a shorter strip to colors from the bottom portion of the full gradient
 */
function mapShorterStrip(
    colorMap: Map<number, WLEDColor>,
    ledIndexes: number[],
    fullGradient: WLEDColor[],
    tallestStripLength: number
): void {
    const stripLength = ledIndexes.length;
    const heightRatio = stripLength / tallestStripLength;

    ledIndexes.forEach((ledIndex, i) => {
        // Map from top-to-bottom, taking colors from bottom portion of gradient
        const gradientPosition = (stripLength - 1 - i) * heightRatio * (tallestStripLength - 1) / (stripLength - 1);
        const colorIndex = Math.floor(gradientPosition);
        colorMap.set(ledIndex, fullGradient[colorIndex]);
    });
}

/**
 * Maps left side Ambilight colors to LED strips aligned at the bottom with different heights.
 * The tallest strip (middle) gets the full gradient, shorter strips get bottom portion.
 */
function mapLeftSideColors(
    leftColors: AmbilightColor[],
    brightnessMultiplier: number,
    whiteValue: number
): Map<number, WLEDColor> {
    const colorMap = new Map<number, WLEDColor>();

    // Generate full gradient for the tallest strip (middle strip)
    const tallestStripLength = LEFT_STRIP_2.length;
    const fullGradient = interpolateColors(leftColors, tallestStripLength, brightnessMultiplier, whiteValue);

    // Map middle strip (tallest) - reverse gradient to match visual flow
    LEFT_STRIP_2.forEach((ledIndex, i) => {
        colorMap.set(ledIndex, fullGradient[tallestStripLength - 1 - i]);
    });

    // Map shorter strips - they get colors from bottom portion of gradient
    mapShorterStrip(colorMap, LEFT_STRIP_1, fullGradient, tallestStripLength);
    mapShorterStrip(colorMap, LEFT_STRIP_3, fullGradient, tallestStripLength);

    return colorMap;
}

// ============================================================================
// RIGHT SIDE MAPPING (Solid Colors per Strip)
// ============================================================================

/**
 * Maps right side Ambilight colors to LED strips with solid colors per strip.
 * Each strip displays a single uniform color from the corresponding Ambilight position.
 */
function mapRightSideColors(
    topColors: AmbilightColor[],
    rightColors: AmbilightColor[],
    brightnessMultiplier: number,
    whiteValue: number
): Map<number, WLEDColor> {
    const colorMap = new Map<number, WLEDColor>();

    // Right strip 1: top[5] color
    applySolidColor(
        colorMap,
        RIGHT_STRIP_1,
        ambilightToWLED(topColors[5], brightnessMultiplier, whiteValue)
    );

    // Right strip 2: top[6] color
    applySolidColor(
        colorMap,
        RIGHT_STRIP_2,
        ambilightToWLED(topColors[6], brightnessMultiplier, whiteValue)
    );

    // Right strip 3: right[0] color
    applySolidColor(
        colorMap,
        RIGHT_STRIP_3,
        ambilightToWLED(rightColors[0], brightnessMultiplier, whiteValue)
    );

    return colorMap;
}

// ============================================================================
// MAIN EXPORT FUNCTION
// ============================================================================

/**
 * Maps Ambilight colors to WLED LED strip format
 * @param ambilightColors - Ambilight color data from TV
 * @param outputLeds - Total number of LEDs (default: 141)
 * @param brightness - Brightness multiplier (0-1 range)
 * @returns Array of WLED colors for each LED
 */
export function mapAmbilightToWLED(
    ambilightColors: any,
    brightnessMultiplier: number,
    whiteValue: number,
): WLEDColor[] {
    // Initialize result array with default off state
    const result: WLEDColor[] = [];

    // Extract color data from Ambilight
    const left: AmbilightColor[] = Object.values(ambilightColors.left) as AmbilightColor[];
    const top: AmbilightColor[] = Object.values(ambilightColors.top) as AmbilightColor[];
    const right: AmbilightColor[] = Object.values(ambilightColors.right) as AmbilightColor[];

    // Map left side (height-aligned strips with gradient)
    const leftColorMap = mapLeftSideColors(left, brightnessMultiplier, whiteValue);
    leftColorMap.forEach((color, ledIndex) => {
        result[ledIndex] = color;
    });

    // Map right side (solid colors per strip)
    const rightColorMap = mapRightSideColors(top, right, brightnessMultiplier, whiteValue);
    rightColorMap.forEach((color, ledIndex) => {
        result[ledIndex] = color;
    });

    return result;
}