import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Color extraction utilities
export type RGBColor = { r: number; g: number; b: number };
export type HexColor = string;

/**
 * Converts RGB color to HEX format
 */
export function rgbToHex(rgb: RGBColor): HexColor {
  const toHex = (value: number) => {
    const hex = Math.round(value).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  
  const hex = `#${toHex(rgb.r)}${toHex(rgb.g)}${toHex(rgb.b)}`;
  return hex.toUpperCase();
}

/**
 * K-means clustering algorithm to find dominant colors
 */
function kMeans(
  pixels: RGBColor[], 
  k: number, 
  maxIterations: number = 100
): RGBColor[] {
  // Initialize centroids randomly
  const centroids = pixels
    .sort(() => 0.5 - Math.random())
    .slice(0, k);
  
  let iterations = 0;
  let clusters: RGBColor[][] = [];
  let previousCentroids: RGBColor[] = [];
  
  // Check if centroids have converged
  const hasConverged = () => {
    if (previousCentroids.length !== centroids.length) return false;
    return centroids.every((centroid, index) => {
      const prev = previousCentroids[index];
      return (
        Math.abs(centroid.r - prev.r) < 1 &&
        Math.abs(centroid.g - prev.g) < 1 &&
        Math.abs(centroid.b - prev.b) < 1
      );
    });
  };
  
  while (iterations < maxIterations && !hasConverged()) {
    // Assign pixels to clusters
    clusters = Array.from({ length: k }, () => []);
    
    for (const pixel of pixels) {
      let minDistance = Infinity;
      let clusterIndex = 0;
      
      for (let i = 0; i < centroids.length; i++) {
        const distance = Math.sqrt(
          Math.pow(pixel.r - centroids[i].r, 2) +
          Math.pow(pixel.g - centroids[i].g, 2) +
          Math.pow(pixel.b - centroids[i].b, 2)
        );
        
        if (distance < minDistance) {
          minDistance = distance;
          clusterIndex = i;
        }
      }
      
      clusters[clusterIndex].push(pixel);
    }
    
    // Update centroids
    previousCentroids = [...centroids];
    
    for (let i = 0; i < k; i++) {
      const cluster = clusters[i];
      if (cluster.length === 0) continue;
      
      const sum = cluster.reduce(
        (acc, pixel) => {
          acc.r += pixel.r;
          acc.g += pixel.g;
          acc.b += pixel.b;
          return acc;
        },
        { r: 0, g: 0, b: 0 }
      );
      
      centroids[i] = {
        r: sum.r / cluster.length,
        g: sum.g / cluster.length,
        b: sum.b / cluster.length
      };
    }
    
    iterations++;
  }
  
  return centroids;
}

/**
 * Extract dominant colors from an image file
 */
export async function extractColors(
  file: File, 
  canvasRef: React.RefObject<HTMLCanvasElement>, 
  colorCount: number = 6
): Promise<string[]> {
  return new Promise((resolve, reject) => {
    try {
      const img = new Image();
      img.src = URL.createObjectURL(file);
      
      img.onload = () => {
        const canvas = canvasRef.current;
        if (!canvas) {
          reject(new Error("Canvas element not found"));
          return;
        }
        
        // Resize image for better performance
        const maxDimension = 200;
        let width = img.width;
        let height = img.height;
        
        if (width > height && width > maxDimension) {
          height *= maxDimension / width;
          width = maxDimension;
        } else if (height > maxDimension) {
          width *= maxDimension / height;
          height = maxDimension;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Could not get canvas context"));
          return;
        }
        
        ctx.drawImage(img, 0, 0, width, height);
        
        // Get pixel data
        const imageData = ctx.getImageData(0, 0, width, height);
        const data = imageData.data;
        
        // Extract pixels, skipping transparent ones and duplicates
        const pixels: RGBColor[] = [];
        const pixelSet = new Set<string>();
        
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          const a = data[i + 3];
          
          // Skip transparent pixels
          if (a < 255) continue;
          
          // Skip duplicate pixels
          const key = `${r},${g},${b}`;
          if (!pixelSet.has(key)) {
            pixelSet.add(key);
            pixels.push({ r, g, b });
          }
        }
        
        // If not enough pixels, return default colors
        if (pixels.length <= colorCount) {
          const uniqueColors = pixels.map(p => rgbToHex(p));
          resolve(uniqueColors);
          return;
        }
        
        // Use K-means algorithm to find dominant colors
        const dominantColors = kMeans(pixels, colorCount);
        
        // Convert to hex and return
        const hexColors = dominantColors.map(color => rgbToHex(color));
        resolve(hexColors);
      };
      
      img.onerror = () => {
        reject(new Error("Could not load image"));
      };
    } catch (error) {
      reject(error);
    }
  });
}