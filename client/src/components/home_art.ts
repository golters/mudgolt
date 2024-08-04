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
  avgColor: string
  backColor: string
}

interface ColorCombination {
  colors: [string, string]
  avgColor: { r: number, g: number, b: number }
}

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
  return new Promise((resolve, reject) => {
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
      const colorData: string[][] = new Array(scaledHeight).fill(0)
        .map(() => new Array(scaledWidth).fill(""));
      const colorBackData: string[][] = new Array(scaledHeight).fill(0)
        .map(() => new Array(scaledWidth).fill(""));

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
            colorData[y][x] = "rgba(0, 0, 0, 0)"; // Transparent color
            colorBackData[y][x] = "rgba(0, 0, 0, 0)"; // Transparent color
          } else {
            const avg = (r + g + b) / 3;
            grayData[y][x] = avg;
            colorData[y][x] = `rgba(${r},${g},${b},${a / 255})`;
            colorBackData[y][x] = `rgba(${r},${g},${b},${a / 255})`;
          }
        }
      }

      // Apply Sobel edge detection
      const sobelData = applySobel(grayData, scaledWidth, scaledHeight);

      const asciiArray: AsciiTile[][] = new Array(scaledHeight).fill(0)
        .map(() => new Array(scaledWidth).fill({ character: "",
          avgColor: "",
          backColor: "" }));

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
            backColor: colorBackData[y][x] };
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
}


function grayscaleToAscii(value: number): string {
  const chars: string[] = [" ", ".", "`", ":", ",", "'", "-", "_", ";", "=", "+", "*", ">", "<", "!", "?", ")", "(", "v", "}", "{", "I", "c", "J", "r", "]", "[", "V", "T", "L", "F", "w", "o", "m", "i", "e", "7", "C", "z", "s", "n", "j", "&", "1", "Y", "X", "W", "x", "t", "l", "%", "3", "S", "P", "M", "u", "f", "a", "#", "4", "2", "Z", "O", "G", "E", "y", "K", "A", "@", "9", "6", "5", "U", "Q", "N", "D", "B", "k", "h", "b", "8", "R", "p", "0", "q", "g", "d", "$", "H"];
  //const chars: string[] = ["░", "▒", "▓"]
  const index: number = Math.max(0, Math.min(chars.length - 1, Math.floor((value / 255) * (chars.length - 1))));
  
  return chars[index];
}

function angleToAscii(angle: number): string {
  if ((angle >= -22.5 && angle < 22.5) || (angle >= 157.5 && angle <= 180) || (angle >= -180 && angle < -157.5)) {
    return "|";
  } else if ((angle >= 22.5 && angle < 67.5) || (angle >= -157.5 && angle < -112.5)) {
    return "/";
  } else if ((angle >= 67.5 && angle < 112.5) || (angle >= -112.5 && angle < -67.5)) {
    return "-";
  } else {
    return "\\";
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
        colors: [colorArray[i].color, colorArray[j].color],
        avgColor: avgColor,
      });
    }
  }

  return combinations;
}

export function adjustColorByTime(colorString: string, colorCombinations: ColorCombination[]): string {
  // Extract the RGB values from the color string
  const match = colorString.match(/rgba?\((\d+),\s*(\d+),\s*(\d+),?\s*[\d.]*\)?/);
  if (!match) {
    return colorString; // Return the original string if parsing fails
  }

  let r = parseInt(match[1], 10);
  let g = parseInt(match[2], 10);
  let b = parseInt(match[3], 10);

  const hour = (new Date().getHours()) + ((new Date().getMinutes() * 1.66)/100)

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

  // Return the adjusted color as an RGB string
  
  return `rgb(${r}, ${g}, ${b})`;
}


// Function to find the closest color combination to the target color
export function findClosestColorCombination(targetColor: string, combinations: ColorCombination[]): [string, string] {
  //const timeColor = adjustColorByTime(targetColor);
  const match = targetColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+),?\s*[\d.]*\)?/);
  if (!match) {
    return combinations[0].colors; // Return the first combination if parsing fails
  }

  const tr = parseInt(match[1], 10);
  const tg = parseInt(match[2], 10);
  const tb = parseInt(match[3], 10);
  

  const targetBrightness = (tr + tg + tb) / 3;

  let closestPair: [string, string] = combinations[0].colors;
  let minDistance = Number.MAX_VALUE;

  for (const combination of combinations) {
    const avgColor = combination.avgColor;
    const avgBrightness = (avgColor.r + avgColor.g + avgColor.b) / 3;

    // Calculate the color distance
    const distance = colorDistance({ r: tr,
      g: tg,
      b: tb }, avgColor);

    // Adjust distance by the brightness difference
    const brightnessDifference = Math.abs(targetBrightness - avgBrightness);
    const adjustedDistance = distance + brightnessDifference * 0.01; // Adjust the multiplier as needed

    if (adjustedDistance < minDistance) {
      minDistance = adjustedDistance;
      closestPair = combination.colors;
    }
  }

  return closestPair;
}

// Function to calculate the distance between two RGB colors
function colorDistance(color1: { r: number, g: number, b: number }, color2: { r: number, g: number, b: number }): number {
  return Math.sqrt(Math.pow(color1.r - color2.r, 2) + Math.pow(color1.g - color2.g, 2) + Math.pow(color1.b - color2.b, 2));
}

function adjustSkyColorByTime(): { r: number, g: number, b: number } {
  const hour = new Date().getHours();
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

function perlinNoise(x: number, y: number, scale: number): number {
  let total = 0;
  const persistence = 0.5;
  const octaves = 3; // Number of octaves for noise

  for (let i = 0; i < octaves; i++) {
    const frequency = Math.pow(2, i) / scale;
    const amplitude = Math.pow(persistence, i);
    total += smoothNoise(x * frequency, y * frequency) * amplitude;
  }

  return total;
}

function interpolateColor(color1: string, color2: string, fraction: number): string {
  //const timeColor = adjustColorByTime(targetColor);
  const match = color1.match(/rgba?\((\d+),\s*(\d+),\s*(\d+),?\s*[\d.]*\)?/);
  if (!match) {
    return color2
  }
  const match2 = color2.match(/rgba?\((\d+),\s*(\d+),\s*(\d+),?\s*[\d.]*\)?/);
  if (!match2) {
    return color1
  }
 
  const tr = parseInt(match[1], 10);
  const tg = parseInt(match[2], 10);
  const tb = parseInt(match[3], 10);
  const tr2 = parseInt(match2[1], 10);
  const tg2 = parseInt(match2[2], 10);
  const tb2 = parseInt(match2[3], 10);
  
  
  return `rgb(${Math.round(tr + (tr2 - tr) * fraction)}, 
    ${Math.round(tg + (tg2 - tg) * fraction)}, 
    ${Math.round(tb + (tb2 - tb) * fraction)})`;
}

function getGrassColor(month: number, day: number): string {
  const spring = "rgb(144,238,144)";
  const summer = "rgb(0,255,0)";
  const autumn = "rgb(212,91,18)";
  const winter = "rgb(255,255,255)";

  const colors: string[] = [winter, spring, summer, autumn, winter];
  const startColor = colors[Math.floor(month / 3)];
  const endColor = colors[Math.floor(month / 3) + 1];

  const daysInMonth = new Date(new Date().getFullYear(), month, 0).getDate();
  const fraction = day / daysInMonth;

  const color = interpolateColor(startColor, endColor, fraction);

  return color;
}

export async function generateBackdrop(width: number, height: number, clouds: number): Promise<AsciiTile[][]> {
  const backdrop: AsciiTile[][] = [];

  // Sky color settings
  const skyColor = adjustSkyColorByTime();
  const clamp = (value: number) => Math.min(255, Math.max(0, Math.round(value)));
  const skyColorString = `rgba(${clamp(skyColor.r)}, ${clamp(skyColor.g)}, ${clamp(skyColor.b)}, 1)`;

  // Sea color settings
  const seaColor = {
    r: clamp(skyColor.r),
    g: clamp(skyColor.g),
    b: clamp(skyColor.b * 0.6 + 255 * 0.5),
  };
  const seaColorString = `rgba(${seaColor.r}, ${seaColor.g}, ${seaColor.b}, 1)`;

  // Water level settings
  const getWaterLevelOffset = () => Math.floor(Math.random() * 2) - 1;
  const baseWaterLevel = height / 1.5;
  const waterLevelOffset = getWaterLevelOffset();
  const waterLevel = baseWaterLevel + waterLevelOffset;

  // Character arrays
  const cloudCharacters = [".", ",", "o", "O", "Q", "@"];
  const grassCharacters = ["♠", "¥", "♣", "♀", "☼"];
  const waterCharacters = ["~", "^"];
  const grassBlades = ["\\", "|", "/"];

  // Time and noise settings
  const currentMinute = (new Date().getMinutes() * 10) + (new Date().getSeconds());
  const horizontalOffset = currentMinute * 0.1; // Adjust multiplier to control movement speed
  const cloudDensity = clouds / 10; // Lower value means more clouds
  const cloudChunkiness = 10 - clouds; // Scale of noise

  // Cliff settings
  const cliffRadius = (Math.min(width, height) / 4);
  const cliffX = ((width / 2) - (cliffRadius * 2));

  // Grass settings
  const grassDirection = Math.floor(Math.random() * 3);
  const month = new Date().getMonth();
  const day = new Date().getDay();
  const grassColor = getGrassColor(month, day);

  // Sun settings
  const sunRadius = (Math.min(width, height) / 6);
  const currentHour = new Date().getHours();
  const sunPositionX = ((width / 24) * ((currentHour + 12) % 24)); // Moon opposite the sun
  const sunPositionY = (height / 3) + Math.sin(((currentHour + 12) % 24) / 24 * Math.PI) * (height / 6);
  
  let sunColor;
  if (currentHour < 6 || currentHour > 18) {
    sunColor = "rgba(255, 69, 0, 1)"; // Reddish color for sunrise/sunset
  } else if (currentHour < 9 || currentHour > 15) {
    sunColor = "rgba(255, 165, 0, 1)"; // Orange color for morning/evening
  } else {
    sunColor = "rgba(255, 255, 0, 1)"; // Bright yellow for midday
  }

  // Moon settings
  const moonRadius = sunRadius / 1.2;
  const moonPositionX = ((width / 24) * currentHour); // Sun moves from left to right across the sky
  const moonPositionY = (height / 3) + Math.sin((currentHour / 24) * Math.PI) * (height / 6); // Sun height based on sine wave
  const moonColor = "rgba(210, 210, 200, 1)"; // White color for the moon

  // Main generation loop
  for (let y = 0; y < height; y++) {
    const row: AsciiTile[] = [];
    for (let x = 0; x < width; x++) {
      const cliffDistance = Math.sqrt(Math.pow(x - cliffX, 2) + Math.pow(y - (height / 2) - (cliffRadius / 1.2), 2));
      if (y > height / 2 && (x >= cliffX || cliffRadius > cliffDistance)) {
        // Grass area
        row.push({
          character: (Math.abs((x * 73856093 ^ y * 19349663) % 10) > 5) ? grassCharacters[Math.abs((x * 73856093 ^ y * 19349663) % grassCharacters.length)] : grassBlades[grassDirection],
          avgColor: grassColor,
          backColor: grassColor,
        });
      } else if (y > (height / 2) + (cliffRadius / 2) && x >= cliffX - cliffRadius + ((y - height / 2) / 8)) {
        // Cliff area
        row.push({
          character: "%",
          avgColor: "rgb(139,69,19)",
          backColor: "rgb(139,69,19)",
        });
      } else if (y > waterLevel || (y == waterLevel && Math.random() > 0.7)) {
        // Sea area
        row.push({
          character: waterCharacters[Math.floor(Math.random() * waterCharacters.length)],
          avgColor: seaColorString,
          backColor: seaColorString,
        });
      } else {
        const tempChar = {} as AsciiTile;
        const sunDistance = Math.sqrt(Math.pow(x - sunPositionX, 2) + Math.pow(y - sunPositionY, 2));
        const moonDistance = Math.sqrt(Math.pow(x - moonPositionX, 2) + Math.pow(y - moonPositionY, 2));
        // Sky area with clouds
        const noiseValue = (perlinNoise((x + horizontalOffset) / cloudChunkiness, y / cloudChunkiness, cloudChunkiness) + 1) / 2; // Normalize to 0-1
        if (noiseValue < cloudDensity) { // Threshold to decide cloud placement
          const cloudIndex = Math.floor(noiseValue * cloudCharacters.length);
          const cloudCharacter = cloudCharacters[cloudIndex] || " ";
          const cloudShade = clamp(255 - (noiseValue * 255));
          const cloudColorString = `rgba(${clamp(skyColor.r + (cloudShade) * (noiseValue / 1.5))}, ${clamp(skyColor.g + (cloudShade) * (noiseValue / 1.5))}, ${clamp(skyColor.b + (cloudShade) * (noiseValue / 1.5))})`;
          tempChar.character = cloudCharacter;
          tempChar.avgColor = cloudColorString;
          tempChar.backColor = cloudColorString;
        }else {
          tempChar.character = " "
          tempChar.avgColor = skyColorString;
          tempChar.backColor = skyColorString;
        }if (moonDistance < moonRadius) {
          if(tempChar.character == " "){
            tempChar.character = "@";
          }
          row.push({
            character: tempChar.character,
            avgColor: interpolateColor(moonColor,tempChar.avgColor,0.5),
            backColor: interpolateColor(moonColor,tempChar.avgColor,0.5),
          });
        }else
        if (sunDistance < sunRadius) {
          if(tempChar.character == " "){
            tempChar.character = "*";
          }
          row.push({
            character: tempChar.character,
            avgColor: interpolateColor(sunColor,tempChar.avgColor,0.5),
            backColor: interpolateColor(sunColor,tempChar.avgColor,0.5),
          });
        } else{
          row.push({
            character: tempChar.character,
            avgColor: tempChar.avgColor,
            backColor: tempChar.backColor,
          })
        }
      }
    }
    backdrop.push(row);
  }

  return Promise.resolve(backdrop);
}
