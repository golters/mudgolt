import {
  colors,
  colorPallete,
} from "../../../constants"
import {
  cga,
  green,
  amber,
  commodore,
  windows,
  dmg,
  teletext,
  error,
} from "./themes"

interface AsciiTile {
  character: string
  avgColor: number
  backColor: number
}

interface ColorCombination {
  colors: [number, number]
  avgColor: { r: number, g: number, b: number }
}

const packRgb = (r: number, g: number, b: number) =>
  (r << 16) | (g << 8) | b;
const colorRed = (color: number) => color >>> 16;
const colorGreen = (color: number) => color >>> 8 & 0xff;
const colorBlue = (color: number) => color & 0xff;

export const GRAYSCALE_GLYPHS = ' .`:,\'_-;=+*><!?)(v}{IcJr][VTLFwo mie7Czsnj&1YXWxtl%3SPMufa#42ZOGEyKA@965UQNDBkhb8Rp0qg$H';
export const EDGE_GLYPHS = ['|', '/', '-', '\\'] as const;
export const CLOUD_GLYPHS = ['.', ',', 'o', 'O', 'Q', '@'] as const;
export const GRASS_GLYPHS = ['♠', '¥', '♣', '♀', '☼'] as const;
export const GRASS_BLADE_GLYPHS = ['\\', '|', '/'] as const;
export const WATER_GLYPHS = ['~', '^'] as const;
export const MUSIC_GLYPHS = ['♪', '♫'] as const;
export const RAIN_GLYPHS = ['*', '/'] as const;
export const FRAME_GLYPH = '▓';
export const HOME_GLYPHS = [...new Set([
  ...GRAYSCALE_GLYPHS,
  ...EDGE_GLYPHS,
  ...CLOUD_GLYPHS,
  ...GRASS_GLYPHS,
  ...GRASS_BLADE_GLYPHS,
  ...WATER_GLYPHS,
  ...MUSIC_GLYPHS,
  ...RAIN_GLYPHS,
  FRAME_GLYPH,
])].join('');

const asciiImageCache = new Map<string, Promise<AsciiTile[][]>>();
let backdropBuffer: AsciiTile[][] = [];
let backdropWidth = 0;
let backdropHeight = 0;

// Function to get the value of a CSS variable from the <html> style attribute
export const getCSS = (variableName: string): string | null => {
  // Access the <html> tag and get its style attribute
  const styleAttribute = document.documentElement.getAttribute("style") || "";

  // Use a regular expression to extract the variable value
  const match = styleAttribute.match(new RegExp(`${variableName}:\\s*([^;]+);`));

  // Return the value or null if not found
  return match ? match[1].trim() : null;
};

export function imageToAsciiArray(imageSrc: string, width: number, height: number): Promise<AsciiTile[][]> {
  const cacheKey = `${imageSrc}|${width}|${height}`;
  const cachedImage = asciiImageCache.get(cacheKey);
  if (cachedImage) {
    return cachedImage;
  }

  const imagePromise = new Promise<AsciiTile[][]>((resolve, reject) => {
    const canvas: HTMLCanvasElement = document.createElement("canvas");
    const context = canvas.getContext("2d");
    if (!context) {
      console.error("Canvas context not found");
      reject("Canvas context not found");
      
      return;
    }

    const image: HTMLImageElement = new Image();
    image.crossOrigin = "Anonymous"; // Handle cross-origin images
    image.onload = () => {
      // Calculate scaling factor to maintain aspect ratio
      const scaleX = width / image.width;
      const scaleY = height / image.height;
      const scale = scaleY;
      
      const lineThreshold = 200 - scale;

      const scaledWidth = Math.max(1, Math.floor(image.width * scale));
      const scaledHeight = Math.max(1, Math.floor(image.height * scale));

      canvas.width = scaledWidth;
      canvas.height = scaledHeight;

      // Draw image onto canvas with scaling
      context.drawImage(image, 0, 0, scaledWidth, scaledHeight);

      const imageData = context.getImageData(0, 0, scaledWidth, scaledHeight);
      const data = imageData.data;

      // Convert image to grayscale and get average color
      const grayData: number[][] = new Array(scaledHeight).fill(0)
        .map(() => new Array(scaledWidth).fill(0));
      const colorData: number[][] = new Array(scaledHeight).fill(0)
        .map(() => new Array(scaledWidth).fill(0));

      for (let y = 0; y < scaledHeight; y++) {
        for (let x = 0; x < scaledWidth; x++) {
          const index = (y * scaledWidth + x) * 4;
          const r = data[index];
          const g = data[index + 1];
          const b = data[index + 2];
          const a = data[index + 3];

          // Check if the pixel is transparent
          if (a === 0) {
            grayData[y][x] = -1; // Use -1 to indicate transparency
            colorData[y][x] = 0;
          } else {
            const avg = (r + g + b) / 3;
            grayData[y][x] = avg;
            colorData[y][x] = packRgb(r, g, b);
          }
        }
      }

      // Apply Sobel edge detection
      const sobelData = applySobel(grayData, scaledWidth, scaledHeight);

      const asciiArray: AsciiTile[][] = new Array(scaledHeight).fill(0)
        .map(() => new Array(scaledWidth).fill({ character: "",
          avgColor: 0,
          backColor: 0 }));

      for (let y = 0; y < scaledHeight; y++) {
        for (let x = 0; x < scaledWidth; x++) {
          const grayValue = grayData[y][x];
          let character: string;
          if (grayValue === -1) { // Transparent pixel
            character = ""; // Use a space or any other special character for transparency
          } else {
            const { magnitude, angle } = sobelData[y][x];
            if (magnitude > lineThreshold) { // Increased threshold to make outlines thinner
              character = angleToAscii(angle);
            } else {
              character = grayscaleToAscii(grayValue);
            }
          }
          asciiArray[y][x] = { character,
            avgColor: colorData[y][x],
            backColor: colorData[y][x] };
        }
      }
      resolve(asciiArray);
    };

    image.onerror = () => {
      console.error("Error loading image");
      reject("Error loading image");
    };

    // Set image source
    image.src = imageSrc;
  });

  asciiImageCache.set(cacheKey, imagePromise);
  imagePromise.catch(() => asciiImageCache.delete(cacheKey));
  return imagePromise;
}


function grayscaleToAscii(value: number): string {
  const index: number = Math.max(0, Math.min(GRAYSCALE_GLYPHS.length - 1, Math.floor((value / 255) * (GRAYSCALE_GLYPHS.length - 1))));
  
  return GRAYSCALE_GLYPHS[index];
}

function angleToAscii(angle: number): string {
  if ((angle >= -22.5 && angle < 22.5) || (angle >= 157.5 && angle <= 180) || (angle >= -180 && angle < -157.5)) {
    return EDGE_GLYPHS[0];
  } else if ((angle >= 22.5 && angle < 67.5) || (angle >= -157.5 && angle < -112.5)) {
    return EDGE_GLYPHS[1];
  } else if ((angle >= 67.5 && angle < 112.5) || (angle >= -112.5 && angle < -67.5)) {
    return EDGE_GLYPHS[2];
  } else {
    return EDGE_GLYPHS[3];
  }
}

function applySobel(grayData: number[][], width: number, height: number): { magnitude: number, angle: number }[][] {
  const sobelData: { magnitude: number, angle: number }[][] = [];
  const kernelX: number[][] = [
    [-1, 0, 1],
    [-2, 0, 2],
    [-1, 0, 1],
  ];
  const kernelY: number[][] = [
    [-1, -2, -1],
    [0, 0, 0],
    [1, 2, 1],
  ];

  for (let y = 0; y < height; y++) {
    const row: { magnitude: number, angle: number }[] = [];
    for (let x = 0; x < width; x++) {
      let gx = 0;
      let gy = 0;
      for (let ky = -1; ky <= 1; ky++) {
        for (let kx = -1; kx <= 1; kx++) {
          const posY: number = y + ky;
          const posX: number = x + kx;
          if (posY >= 0 && posY < height && posX >= 0 && posX < width) {
            const pixelValue = grayData[posY][posX];
            if (pixelValue !== -1) { // Only consider non-transparent pixels
              gx += pixelValue * kernelX[ky + 1][kx + 1];
              gy += pixelValue * kernelY[ky + 1][kx + 1];
            }
          }
        }
      }
      const magnitude: number = Math.sqrt(gx * gx + gy * gy);
      const angle: number = Math.atan2(gy, gx) * (180 / Math.PI);
      row.push({ magnitude,
        angle });
    }
    sobelData.push(row);
  }

  return sobelData;
}

// Helper function to load SVG as an image
function loadSVG(svgContent: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const svgBlob: Blob = new Blob([svgContent], { type: "image/svg+xml" });
    const url: string = URL.createObjectURL(svgBlob);
    const image: HTMLImageElement = new Image();
    image.onload = () => {
      URL.revokeObjectURL(url); // Clean up URL object
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url); // Clean up URL object
      reject("Error loading SVG image");
    };
    image.src = url;
  });
}

// Modified function to handle SVG content
export async function svgToAsciiArray(svgContent: string, width: number, height: number): Promise<AsciiTile[][]> {
  try {
    const image: HTMLImageElement = await loadSVG(svgContent);
    
    return imageToAsciiArray(image.src, width, height);
  } catch (error) {
    console.error(error);
    throw error;
  }
}

// Function to create all color combinations and their average colors
export function createColorCombinations(): ColorCombination[] {  
  let colorArray = colors;
  const theme = getCSS("--color-name");
  switch (theme) {
    default:
      colorArray = colors
      break;
  }
  const combinations: ColorCombination[] = [];
  const offset = 1;
  for (let i = 0; i < colorArray.length; i++) {
    for (let j = i; j < colorArray.length; j++) {
      const color1 = colorArray[i].rgb;
      const color2 = colorArray[j].rgb;

      const avgColor = {
        r: Math.round((color1.r + offset * color2.r) / 2),
        g: Math.round((color1.g + offset * color2.g) / 2),
        b: Math.round((color1.b + offset * color2.b) / 2),
      };

      combinations.push({
        colors: [
          packRgb(color1.r, color1.g, color1.b),
          packRgb(color2.r, color2.g, color2.b),
        ],
        avgColor: avgColor,
      });
    }
  }

  return combinations;
}

export function adjustColorByTime(color: number, now = new Date()): number {
  let r = colorRed(color);
  let g = colorGreen(color);
  let b = colorBlue(color);

  const hour = now.getHours() + ((now.getMinutes() * 1.66) / 100)

  // Initialize color adjustment and brightness adjustment
  const colorAdjustment: { r: number, g: number, b: number } = { r: 0,
    g: 0,
    b: 0 };
  let brightnessAdjustment = 1;

  const sunriseColor = { r: 255,
    g: 165,
    b: 0 }; // Warm orange for sunrise
  const sunsetColor = { r: 255,
    g: 69,
    b: 0 }; // Warm red-orange for sunset
  const nightColor = { r: 0,
    g: 0,
    b: 139 }; // Cool dark blue for night

  let factor: number;

  if (hour < 5) {
    // Transition from nightColor to sunriseColor before 5 AM
    factor = hour / 5;
    colorAdjustment.r = nightColor.r + factor * (sunriseColor.r - nightColor.r);
    colorAdjustment.g = nightColor.g + factor * (sunriseColor.g - nightColor.g);
    colorAdjustment.b = nightColor.b + factor * (sunriseColor.b - nightColor.b);
    brightnessAdjustment = 0.2 + factor * 0.8; // Brightness from 0.2 to 1.0
  } else if (hour >= 5 && hour < 20) {
    // No color or brightness adjustment between 5 AM and 8 PM
    colorAdjustment.r = 0;
    colorAdjustment.g = 0;
    colorAdjustment.b = 0;
    brightnessAdjustment = 1;
  } else if (hour >= 20 && hour < 24) {
    // Transition from sunsetColor to nightColor after 8 PM
    factor = (hour - 20) / 4;
    colorAdjustment.r = sunsetColor.r + factor * (nightColor.r - sunsetColor.r);
    colorAdjustment.g = sunsetColor.g + factor * (nightColor.g - sunsetColor.g);
    colorAdjustment.b = sunsetColor.b + factor * (nightColor.b - sunsetColor.b);
    brightnessAdjustment = 1 - factor * 0.8; // Brightness from 1.0 to 0.2
  }

  // Apply color adjustment to the RGB values
  r = Math.min(255, Math.max(0, Math.floor(r * (1 + colorAdjustment.r / 255))));
  g = Math.min(255, Math.max(0, Math.floor(g * (1 + colorAdjustment.g / 255))));
  b = Math.min(255, Math.max(0, Math.floor(b * (1 + colorAdjustment.b / 255))));

  // Apply brightness adjustment
  r = Math.min(255, Math.max(0, Math.floor(r * brightnessAdjustment)));
  g = Math.min(255, Math.max(0, Math.floor(g * brightnessAdjustment)));
  b = Math.min(255, Math.max(0, Math.floor(b * brightnessAdjustment)));

  return packRgb(r, g, b);
}


const INV_3 = 1 / 3;

export function findClosestColorCombination(
  targetColor: number,
  combinations: ColorCombination[],
  cache?: Map<number, [number, number]>
): [number, number] {
  const cached = cache?.get(targetColor);
  if (cached) {
    return cached;
  }

  const r = colorRed(targetColor);
  const g = colorGreen(targetColor);
  const b = colorBlue(targetColor);

  const targetBrightness = (r + g + b) * INV_3;

  let best = 0;
  let minDistance = Infinity;

  for (let j = 0, n = combinations.length; j < n; ++j) {
    const avg = combinations[j].avgColor;

    const dr = r - avg.r;
    const dg = g - avg.g;
    const db = b - avg.b;

    const avgBrightness = (avg.r + avg.g + avg.b) * INV_3;

    const distance =
      Math.sqrt(dr * dr + dg * dg + db * db) +
      Math.abs(targetBrightness - avgBrightness) * 0.01;

    if (distance < minDistance) {
      minDistance = distance;
      best = j;
    }
  }

  const closestColors = combinations[best].colors;
  cache?.set(targetColor, closestColors);
  return closestColors;
}

// Function to calculate the distance between two RGB colors
function colorDistance(color1: { r: number, g: number, b: number }, color2: { r: number, g: number, b: number }): number {
  return Math.sqrt(Math.pow(color1.r - color2.r, 2) + Math.pow(color1.g - color2.g, 2) + Math.pow(color1.b - color2.b, 2));
}

function adjustSkyColorByTime(hour: number): { r: number, g: number, b: number } {
  const sunriseColor = { r: 255,
    g: 165,
    b: 0 }; // Warm orange for sunrise
  const noonColor = { r: 135,
    g: 206,
    b: 250 }; // Sky blue for noon
  const sunsetColor = { r: 255,
    g: 69,
    b: 0 }; // Warm red-orange for sunset
  const nightColor = { r: 25,
    g: 25,
    b: 112 }; // Cool dark blue for night

  let factor: number;
  let skyColor = { r: 0,
    g: 0,
    b: 0 };

  if (hour < 5) {
    // Transition from night to sunrise
    factor = hour / 5;
    skyColor.r = nightColor.r + factor * (sunriseColor.r - nightColor.r);
    skyColor.g = nightColor.g + factor * (sunriseColor.g - nightColor.g);
    skyColor.b = nightColor.b + factor * (sunriseColor.b - nightColor.b);
  } else if (hour >= 5 && hour < 8) {
    // Transition from sunrise to noon
    factor = (hour - 5) / 3;
    skyColor.r = sunriseColor.r + factor * (noonColor.r - sunriseColor.r);
    skyColor.g = sunriseColor.g + factor * (noonColor.g - sunriseColor.g);
    skyColor.b = sunriseColor.b + factor * (noonColor.b - sunriseColor.b);
  } else if (hour >= 8 && hour < 20) {
    // Daytime (noon)
    skyColor = noonColor;
  } else if (hour >= 20){
    factor = (hour - 20) / 2;
    skyColor.r = sunsetColor.r + factor * (nightColor.r - sunsetColor.r);
    skyColor.g = sunsetColor.g + factor * (nightColor.g - sunsetColor.g);
    skyColor.b = sunsetColor.b + factor * (nightColor.b - sunsetColor.b);
  }

  return skyColor;
}

function hash(x: number, y: number): number {
  const n = x + y * 57;
  const nn = (n << 13) ^ n;
  
  return (1.0 - ((nn * (nn * nn * 15731 + 789221) + 1376312589) & 0x7fffffff) / 1073741824.0);
}

function smoothNoise(x: number, y: number): number {
  const corners = (hash(x - 1, y - 1) + hash(x + 1, y - 1) + hash(x - 1, y + 1) + hash(x + 1, y + 1)) / 16;
  const sides = (hash(x - 1, y) + hash(x + 1, y) + hash(x, y - 1) + hash(x, y + 1)) / 8;
  const center = hash(x, y) / 4;
  
  return corners + sides + center;
}

function perlinNoise(x: number, y: number): number {
  let total = 0;
  const octaves = 3; // Number of octaves for noise
  let frequency = 1;
  let amplitude = 1;

  for (let i = 0; i < octaves; i++) {
    total += smoothNoise(x * frequency, y * frequency) * amplitude;
    frequency *= 2;
    amplitude *= 0.5;
  }

  return total;
}

function interpolateColor(color1: number, color2: number, fraction: number): number {
  return packRgb(
    Math.round(colorRed(color1) + (colorRed(color2) - colorRed(color1)) * fraction),
    Math.round(colorGreen(color1) + (colorGreen(color2) - colorGreen(color1)) * fraction),
    Math.round(colorBlue(color1) + (colorBlue(color2) - colorBlue(color1)) * fraction)
  );
}

function getGrassColor(month: number, day: number): number {
  const spring = packRgb(144, 238, 144);
  const summer = packRgb(0, 255, 0);
  const autumn = packRgb(212, 91, 18);
  const winter = packRgb(255, 255, 255);

  const colors: number[] = [winter, spring, summer, autumn, winter];
  const startColor = colors[Math.floor(month / 3)];
  const endColor = colors[Math.floor(month / 3) + 1];

  const daysInMonth = new Date(new Date().getFullYear(), month, 0).getDate();
  const fraction = day / daysInMonth;

  const color = interpolateColor(startColor, endColor, fraction);

  return color;
}

export async function generateBackdrop(
  width: number,
  height: number,
  clouds: number,
  now = new Date()
): Promise<AsciiTile[][]> {
  if (backdropWidth !== width || backdropHeight !== height) {
    backdropBuffer = Array.from(
      { length: height },
      () => Array.from(
        { length: width },
        () => ({ character: '', avgColor: 0, backColor: 0 })
      )
    );
    backdropWidth = width;
    backdropHeight = height;
  }

  // Sky color settings
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes() * 10 + now.getSeconds();
  const skyColor = adjustSkyColorByTime(currentHour);
  const clamp = (value: number) => Math.min(255, Math.max(0, Math.round(value)));
  const skyColorPacked = packRgb(clamp(skyColor.r), clamp(skyColor.g), clamp(skyColor.b));

  // Sea color settings
  const seaColor = {
    r: clamp(skyColor.r),
    g: clamp(skyColor.g),
    b: clamp(skyColor.b * 0.6 + 255 * 0.5),
  };
  const seaColorPacked = packRgb(seaColor.r, seaColor.g, seaColor.b);

  // Water level settings
  const getWaterLevelOffset = () => Math.floor(Math.random() * 2) - 1;
  const baseWaterLevel = height / 1.5;
  const waterLevelOffset = getWaterLevelOffset();
  const waterLevel = baseWaterLevel + waterLevelOffset;

  // Character arrays

  // Time and noise settings
  const horizontalOffset = currentMinute * 0.1; // Adjust multiplier to control movement speed
  const cloudDensity = clouds / 10; // Lower value means more clouds
  const cloudChunkiness = 10 - clouds; // Scale of noise
  const noiseScale = 1 / (cloudChunkiness * cloudChunkiness);

  // Cliff settings
  const cliffRadius = (Math.min(width, height) / 4);
  const cliffRadiusSquared = cliffRadius * cliffRadius;
  const cliffX = ((width / 2) - (cliffRadius * 2));

  // Grass settings
  const grassDirection = Math.floor(Math.random() * 3);
  const month = now.getMonth();
  const day = now.getDay();
  const grassColor = getGrassColor(month, day);

  // Sun settings
  const sunRadius = Math.min(width, height) / 6;
  const sunRadiusSquared = sunRadius * sunRadius;
  const sunPositionX = ((width / 24) * ((currentHour + 12) % 24)); // Moon opposite the sun
  const sunPositionY = (height / 3) + Math.sin(((currentHour + 12) % 24) / 24 * Math.PI) * (height / 6);
  
  let sunColor;
  if (currentHour < 6 || currentHour > 18) {
    sunColor = packRgb(255, 69, 0); // Reddish color for sunrise/sunset
  } else if (currentHour < 9 || currentHour > 15) {
    sunColor = packRgb(255, 165, 0); // Orange color for morning/evening
  } else {
    sunColor = packRgb(255, 255, 0); // Bright yellow for midday
  }

  // Moon settings
  const moonRadius = sunRadius / 1.2;
  const moonRadiusSquared = moonRadius * moonRadius;
  const moonPositionX = ((width / 24) * currentHour); // Sun moves from left to right across the sky
  const moonPositionY = (height / 3) + Math.sin((currentHour / 24) * Math.PI) * (height / 6); // Sun height based on sine wave
  const moonColor = packRgb(210, 210, 200); // White color for the moon

  // Main generation loop
  for (let y = 0; y < height; y++) {
    const row = backdropBuffer[y];
    const cliffY = y - height / 2 - cliffRadius / 1.2;
    const cliffYSquared = cliffY * cliffY;
    for (let x = 0; x < width; x++) {
      const cliffXOffset = x - cliffX;
      const tile = row[x];
      if (y > height / 2 && (x >= cliffX || cliffRadiusSquared > cliffXOffset * cliffXOffset + cliffYSquared)) {
        // Grass area
        tile.character = (Math.abs((x * 73856093 ^ y * 19349663) % 10) > 5) ? GRASS_GLYPHS[Math.abs((x * 73856093 ^ y * 19349663) % GRASS_GLYPHS.length)] : GRASS_BLADE_GLYPHS[grassDirection];
        tile.avgColor = grassColor;
        tile.backColor = grassColor;
      } else if (y > (height / 2) + (cliffRadius / 2) && x >= cliffX - cliffRadius + ((y - height / 2) / 8)) {
        // Cliff area
        tile.character = "%";
        tile.avgColor = packRgb(139, 69, 19);
        tile.backColor = tile.avgColor;
      } else if (y > waterLevel || (y == waterLevel && Math.random() > 0.7)) {
        // Sea area
        tile.character = WATER_GLYPHS[Math.floor(Math.random() * WATER_GLYPHS.length)];
        tile.avgColor = seaColorPacked;
        tile.backColor = seaColorPacked;
      } else {
        const sunX = x - sunPositionX;
        const sunY = y - sunPositionY;
        const moonX = x - moonPositionX;
        const moonY = y - moonPositionY;
        const insideSun = sunX * sunX + sunY * sunY < sunRadiusSquared;
        const insideMoon = moonX * moonX + moonY * moonY < moonRadiusSquared;
        // Sky area with clouds
        const noiseValue = (perlinNoise(
          (x + horizontalOffset) * noiseScale,
          y * noiseScale
        ) + 1) / 2; // Normalize to 0-1
        let character: string;
        let color: number;
        if (noiseValue < cloudDensity) { // Threshold to decide cloud placement
          const cloudIndex = Math.floor(noiseValue * CLOUD_GLYPHS.length);
          const cloudShade = clamp(255 - (noiseValue * 255));
          character = CLOUD_GLYPHS[cloudIndex] || " ";
          color = packRgb(
            clamp(skyColor.r + cloudShade * (noiseValue / 1.5)),
            clamp(skyColor.g + cloudShade * (noiseValue / 1.5)),
            clamp(skyColor.b + cloudShade * (noiseValue / 1.5))
          );
        }else {
          character = " ";
          color = skyColorPacked;
        }
        if (insideMoon) {
          tile.character = character === " " ? "@" : character;
          tile.avgColor = interpolateColor(moonColor, color, 0.5);
        } else if (insideSun) {
          tile.character = character === " " ? "*" : character;
          tile.avgColor = interpolateColor(sunColor, color, 0.5);
        } else {
          tile.character = character;
          tile.avgColor = color;
        }
        tile.backColor = tile.avgColor;
      }
    }
  }

  return backdropBuffer;
}
