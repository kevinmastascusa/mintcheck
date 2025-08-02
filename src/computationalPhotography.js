const Jimp = require('jimp');
const sharp = require('sharp');

class ComputationalPhotography {
  constructor() {
    this.techniques = {
      HDR: 'high_dynamic_range',
      FOCUS_STACKING: 'focus_stacking',
      NOISE_REDUCTION: 'noise_reduction',
      SHARPNESS_ENHANCEMENT: 'sharpness_enhancement',
      CONTRAST_ENHANCEMENT: 'contrast_enhancement',
      EDGE_ENHANCEMENT: 'edge_enhancement',
      TEXTURE_ANALYSIS: 'texture_analysis',
      COLOR_CORRECTION: 'color_correction'
    };
  }

  async enhanceImage(imagePath) {
    try {
      console.log('Starting computational photography enhancement...');
      
      const image = await Jimp.read(imagePath);
      const enhanced = {
        original: image,
        processed: {},
        metadata: {},
        analysis: {}
      };

      // Apply computational photography techniques
      enhanced.processed = {
        hdr: await this.applyHDR(image),
        sharpened: await this.enhanceSharpness(image),
        denoised: await this.reduceNoise(image),
        contrastEnhanced: await this.enhanceContrast(image),
        edgeEnhanced: await this.enhanceEdges(image),
        colorCorrected: await this.correctColors(image)
      };

      // Generate metadata
      enhanced.metadata = await this.extractMetadata(image);
      
      // Perform advanced analysis
      enhanced.analysis = await this.performAdvancedAnalysis(image);

      console.log('Computational photography enhancement completed');
      return enhanced;
    } catch (error) {
      console.error('Error in computational photography:', error);
      throw error;
    }
  }

  async applyHDR(image) {
    const clone = image.clone();
    
    // Simulate HDR processing by enhancing dynamic range
    clone.contrast(0.2); // Enhance contrast
    clone.brightness(0.1); // Slight brightness boost
    
    // Apply tone mapping
    const width = clone.getWidth();
    const height = clone.getHeight();
    
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const pixel = clone.getPixelColor(x, y);
        const rgba = Jimp.intToRGBA(pixel);
        
        // Apply tone mapping curve
        const newR = this.toneMapping(rgba.r);
        const newG = this.toneMapping(rgba.g);
        const newB = this.toneMapping(rgba.b);
        
        clone.setPixelColor(Jimp.rgbaToInt(newR, newG, newB, rgba.a), x, y);
      }
    }
    
    return clone;
  }

  toneMapping(value) {
    // Reinhard tone mapping
    const mapped = value / (1 + value / 255);
    return Math.min(255, Math.max(0, mapped));
  }

  async enhanceSharpness(image) {
    const clone = image.clone();
    
    // Apply unsharp mask
    const unsharpKernel = [
      [-1, -1, -1],
      [-1,  9, -1],
      [-1, -1, -1]
    ];
    
    clone.convolute(unsharpKernel);
    
    // Additional sharpening for fine details
    clone.convolute([
      [0, -1, 0],
      [-1, 5, -1],
      [0, -1, 0]
    ]);
    
    return clone;
  }

  async reduceNoise(image) {
    const clone = image.clone();
    
    // Apply bilateral filtering simulation
    const width = clone.getWidth();
    const height = clone.getHeight();
    
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const centerPixel = clone.getPixelColor(x, y);
        const centerRgba = Jimp.intToRGBA(centerPixel);
        
        let totalWeight = 0;
        let weightedR = 0, weightedG = 0, weightedB = 0;
        
        // 3x3 neighborhood
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            const neighborPixel = clone.getPixelColor(x + dx, y + dy);
            const neighborRgba = Jimp.intToRGBA(neighborPixel);
            
            // Calculate weight based on intensity difference
            const intensityDiff = Math.abs(centerRgba.r - neighborRgba.r) +
                                Math.abs(centerRgba.g - neighborRgba.g) +
                                Math.abs(centerRgba.b - neighborRgba.b);
            
            const weight = Math.exp(-intensityDiff / 50);
            totalWeight += weight;
            
            weightedR += neighborRgba.r * weight;
            weightedG += neighborRgba.g * weight;
            weightedB += neighborRgba.b * weight;
          }
        }
        
        if (totalWeight > 0) {
          const newR = Math.round(weightedR / totalWeight);
          const newG = Math.round(weightedG / totalWeight);
          const newB = Math.round(weightedB / totalWeight);
          
          clone.setPixelColor(Jimp.rgbaToInt(newR, newG, newB, centerRgba.a), x, y);
        }
      }
    }
    
    return clone;
  }

  async enhanceContrast(image) {
    const clone = image.clone();
    
    // Apply CLAHE (Contrast Limited Adaptive Histogram Equalization)
    const width = clone.getWidth();
    const height = clone.getHeight();
    const blockSize = 8;
    
    for (let y = 0; y < height; y += blockSize) {
      for (let x = 0; x < width; x += blockSize) {
        const blockWidth = Math.min(blockSize, width - x);
        const blockHeight = Math.min(blockSize, height - y);
        
        // Calculate histogram for this block
        const histogram = new Array(256).fill(0);
        for (let by = 0; by < blockHeight; by++) {
          for (let bx = 0; bx < blockWidth; bx++) {
            const pixel = clone.getPixelColor(x + bx, y + by);
            const brightness = Jimp.intToRGBA(pixel).r;
            histogram[brightness]++;
          }
        }
        
        // Apply contrast enhancement
        const clipLimit = 3;
        const totalPixels = blockWidth * blockHeight;
        const average = totalPixels / 256;
        
        for (let by = 0; by < blockHeight; by++) {
          for (let bx = 0; bx < blockWidth; bx++) {
            const pixel = clone.getPixelColor(x + bx, y + by);
            const rgba = Jimp.intToRGBA(pixel);
            
            // Enhance contrast based on local histogram
            const enhancedR = this.enhancePixelValue(rgba.r, histogram, clipLimit, average);
            const enhancedG = this.enhancePixelValue(rgba.g, histogram, clipLimit, average);
            const enhancedB = this.enhancePixelValue(rgba.b, histogram, clipLimit, average);
            
            clone.setPixelColor(Jimp.rgbaToInt(enhancedR, enhancedG, enhancedB, rgba.a), x + bx, y + by);
          }
        }
      }
    }
    
    return clone;
  }

  enhancePixelValue(value, histogram, clipLimit, average) {
    let clippedSum = 0;
    for (let i = 0; i <= value; i++) {
      clippedSum += Math.min(histogram[i], clipLimit * average);
    }
    
    const enhanced = Math.round((clippedSum / (clipLimit * average * 256)) * 255);
    return Math.min(255, Math.max(0, enhanced));
  }

  async enhanceEdges(image) {
    const clone = image.clone();
    
    // Apply Canny edge detection simulation
    const width = clone.getWidth();
    const height = clone.getHeight();
    
    // Step 1: Gaussian blur
    clone.gaussian(1);
    
    // Step 2: Gradient calculation
    const gradientMagnitude = new Array(width * height);
    const gradientDirection = new Array(width * height);
    
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const idx = y * width + x;
        
        // Sobel operators
        const gx = this.calculateGradientX(clone, x, y);
        const gy = this.calculateGradientY(clone, x, y);
        
        gradientMagnitude[idx] = Math.sqrt(gx * gx + gy * gy);
        gradientDirection[idx] = Math.atan2(gy, gx);
      }
    }
    
    // Step 3: Non-maximum suppression
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const idx = y * width + x;
        const magnitude = gradientMagnitude[idx];
        const direction = gradientDirection[idx];
        
        // Apply threshold
        if (magnitude > 50) {
          clone.setPixelColor(Jimp.rgbaToInt(255, 255, 255, 255), x, y);
        } else {
          clone.setPixelColor(Jimp.rgbaToInt(0, 0, 0, 255), x, y);
        }
      }
    }
    
    return clone;
  }

  calculateGradientX(image, x, y) {
    const topLeft = Jimp.intToRGBA(image.getPixelColor(x - 1, y - 1)).r;
    const top = Jimp.intToRGBA(image.getPixelColor(x, y - 1)).r;
    const topRight = Jimp.intToRGBA(image.getPixelColor(x + 1, y - 1)).r;
    const bottomLeft = Jimp.intToRGBA(image.getPixelColor(x - 1, y + 1)).r;
    const bottom = Jimp.intToRGBA(image.getPixelColor(x, y + 1)).r;
    const bottomRight = Jimp.intToRGBA(image.getPixelColor(x + 1, y + 1)).r;
    
    return (topRight + 2 * Jimp.intToRGBA(image.getPixelColor(x + 1, y)).r + bottomRight) -
           (topLeft + 2 * Jimp.intToRGBA(image.getPixelColor(x - 1, y)).r + bottomLeft);
  }

  calculateGradientY(image, x, y) {
    const topLeft = Jimp.intToRGBA(image.getPixelColor(x - 1, y - 1)).r;
    const top = Jimp.intToRGBA(image.getPixelColor(x, y - 1)).r;
    const topRight = Jimp.intToRGBA(image.getPixelColor(x + 1, y - 1)).r;
    const bottomLeft = Jimp.intToRGBA(image.getPixelColor(x - 1, y + 1)).r;
    const bottom = Jimp.intToRGBA(image.getPixelColor(x, y + 1)).r;
    const bottomRight = Jimp.intToRGBA(image.getPixelColor(x + 1, y + 1)).r;
    
    return (bottomLeft + 2 * bottom + bottomRight) -
           (topLeft + 2 * top + topRight);
  }

  async correctColors(image) {
    const clone = image.clone();
    
    // White balance correction
    const width = clone.getWidth();
    const height = clone.getHeight();
    
    // Calculate average color
    let totalR = 0, totalG = 0, totalB = 0;
    let pixelCount = 0;
    
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const pixel = clone.getPixelColor(x, y);
        const rgba = Jimp.intToRGBA(pixel);
        totalR += rgba.r;
        totalG += rgba.g;
        totalB += rgba.b;
        pixelCount++;
      }
    }
    
    const avgR = totalR / pixelCount;
    const avgG = totalG / pixelCount;
    const avgB = totalB / pixelCount;
    
    // Calculate correction factors
    const targetGray = (avgR + avgG + avgB) / 3;
    const correctionR = targetGray / avgR;
    const correctionG = targetGray / avgG;
    const correctionB = targetGray / avgB;
    
    // Apply color correction
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const pixel = clone.getPixelColor(x, y);
        const rgba = Jimp.intToRGBA(pixel);
        
        const correctedR = Math.min(255, Math.max(0, rgba.r * correctionR));
        const correctedG = Math.min(255, Math.max(0, rgba.g * correctionG));
        const correctedB = Math.min(255, Math.max(0, rgba.b * correctionB));
        
        clone.setPixelColor(Jimp.rgbaToInt(correctedR, correctedG, correctedB, rgba.a), x, y);
      }
    }
    
    return clone;
  }

  async extractMetadata(image) {
    const width = image.getWidth();
    const height = image.getHeight();
    
    const metadata = {
      dimensions: { width, height },
      aspectRatio: width / height,
      totalPixels: width * height,
      colorStats: {},
      textureStats: {},
      qualityMetrics: {}
    };
    
    // Color statistics
    const colorHistogram = { r: new Array(256).fill(0), g: new Array(256).fill(0), b: new Array(256).fill(0) };
    let totalBrightness = 0;
    let totalContrast = 0;
    
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const pixel = image.getPixelColor(x, y);
        const rgba = Jimp.intToRGBA(pixel);
        
        colorHistogram.r[rgba.r]++;
        colorHistogram.g[rgba.g]++;
        colorHistogram.b[rgba.b]++;
        
        const brightness = (rgba.r + rgba.g + rgba.b) / 3;
        totalBrightness += brightness;
      }
    }
    
    metadata.colorStats = {
      averageBrightness: totalBrightness / (width * height),
      histogram: colorHistogram,
      dominantColors: this.findDominantColors(colorHistogram)
    };
    
    // Texture analysis
    metadata.textureStats = await this.analyzeTexture(image);
    
    // Quality metrics
    metadata.qualityMetrics = await this.calculateQualityMetrics(image);
    
    return metadata;
  }

  findDominantColors(histogram) {
    const dominant = [];
    const threshold = 0.1; // 10% of total pixels
    
    for (let channel of ['r', 'g', 'b']) {
      const maxCount = Math.max(...histogram[channel]);
      const totalPixels = histogram[channel].reduce((sum, count) => sum + count, 0);
      
      for (let i = 0; i < 256; i++) {
        if (histogram[channel][i] / totalPixels > threshold) {
          dominant.push({ channel, value: i, percentage: histogram[channel][i] / totalPixels });
        }
      }
    }
    
    return dominant.sort((a, b) => b.percentage - a.percentage).slice(0, 5);
  }

  async analyzeTexture(image) {
    const width = image.getWidth();
    const height = image.getHeight();
    
    let textureVariance = 0;
    let edgeDensity = 0;
    let smoothness = 0;
    
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const center = Jimp.intToRGBA(image.getPixelColor(x, y)).r;
        const neighbors = [
          Jimp.intToRGBA(image.getPixelColor(x - 1, y)).r,
          Jimp.intToRGBA(image.getPixelColor(x + 1, y)).r,
          Jimp.intToRGBA(image.getPixelColor(x, y - 1)).r,
          Jimp.intToRGBA(image.getPixelColor(x, y + 1)).r
        ];
        
        // Calculate local variance
        const localVariance = neighbors.reduce((sum, neighbor) => sum + Math.pow(neighbor - center, 2), 0) / 4;
        textureVariance += localVariance;
        
        // Calculate edge density
        const maxDiff = Math.max(...neighbors.map(n => Math.abs(n - center)));
        if (maxDiff > 30) edgeDensity++;
        
        // Calculate smoothness
        const avgNeighbor = neighbors.reduce((sum, n) => sum + n, 0) / 4;
        smoothness += Math.abs(center - avgNeighbor);
      }
    }
    
    const totalPixels = (width - 2) * (height - 2);
    
    return {
      textureVariance: textureVariance / totalPixels,
      edgeDensity: edgeDensity / totalPixels,
      smoothness: smoothness / totalPixels
    };
  }

  async calculateQualityMetrics(image) {
    const width = image.getWidth();
    const height = image.getHeight();
    
    let sharpness = 0;
    let noise = 0;
    let blur = 0;
    
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const center = Jimp.intToRGBA(image.getPixelColor(x, y)).r;
        const neighbors = [
          Jimp.intToRGBA(image.getPixelColor(x - 1, y)).r,
          Jimp.intToRGBA(image.getPixelColor(x + 1, y)).r,
          Jimp.intToRGBA(image.getPixelColor(x, y - 1)).r,
          Jimp.intToRGBA(image.getPixelColor(x, y + 1)).r
        ];
        
        // Sharpness (high frequency content)
        const laplacian = 4 * center - neighbors.reduce((sum, n) => sum + n, 0);
        sharpness += Math.abs(laplacian);
        
        // Noise estimation
        const localVariance = neighbors.reduce((sum, n) => sum + Math.pow(n - center, 2), 0) / 4;
        noise += localVariance;
        
        // Blur estimation
        const avgNeighbor = neighbors.reduce((sum, n) => sum + n, 0) / 4;
        blur += Math.abs(center - avgNeighbor);
      }
    }
    
    const totalPixels = (width - 2) * (height - 2);
    
    return {
      sharpness: sharpness / totalPixels,
      noise: noise / totalPixels,
      blur: blur / totalPixels,
      qualityScore: this.calculateQualityScore(sharpness, noise, blur)
    };
  }

  calculateQualityScore(sharpness, noise, blur) {
    // Normalize metrics
    const normalizedSharpness = Math.min(sharpness / 100, 1);
    const normalizedNoise = Math.max(0, 1 - noise / 1000);
    const normalizedBlur = Math.max(0, 1 - blur / 50);
    
    // Weighted quality score
    return (normalizedSharpness * 0.4 + normalizedNoise * 0.3 + normalizedBlur * 0.3);
  }

  async performAdvancedAnalysis(image) {
    const analysis = {
      focus: await this.analyzeFocus(image),
      lighting: await this.analyzeLighting(image),
      composition: await this.analyzeComposition(image),
      artifacts: await this.detectArtifacts(image)
    };
    
    return analysis;
  }

  async analyzeFocus(image) {
    const width = image.getWidth();
    const height = image.getHeight();
    
    let focusScore = 0;
    let edgeCount = 0;
    
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const center = Jimp.intToRGBA(image.getPixelColor(x, y)).r;
        const neighbors = [
          Jimp.intToRGBA(image.getPixelColor(x - 1, y)).r,
          Jimp.intToRGBA(image.getPixelColor(x + 1, y)).r,
          Jimp.intToRGBA(image.getPixelColor(x, y - 1)).r,
          Jimp.intToRGBA(image.getPixelColor(x, y + 1)).r
        ];
        
        const maxDiff = Math.max(...neighbors.map(n => Math.abs(n - center)));
        if (maxDiff > 20) {
          focusScore += maxDiff;
          edgeCount++;
        }
      }
    }
    
    const averageFocus = edgeCount > 0 ? focusScore / edgeCount : 0;
    
    return {
      score: averageFocus,
      edgeDensity: edgeCount / (width * height),
      quality: averageFocus > 50 ? 'High' : averageFocus > 25 ? 'Medium' : 'Low'
    };
  }

  async analyzeLighting(image) {
    const width = image.getWidth();
    const height = image.getHeight();
    
    let totalBrightness = 0;
    let brightnessVariance = 0;
    const brightnessValues = [];
    
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const pixel = image.getPixelColor(x, y);
        const rgba = Jimp.intToRGBA(pixel);
        const brightness = (rgba.r + rgba.g + rgba.b) / 3;
        
        totalBrightness += brightness;
        brightnessValues.push(brightness);
      }
    }
    
    const averageBrightness = totalBrightness / (width * height);
    
    // Calculate variance
    for (const brightness of brightnessValues) {
      brightnessVariance += Math.pow(brightness - averageBrightness, 2);
    }
    brightnessVariance /= brightnessValues.length;
    
    return {
      averageBrightness,
      variance: brightnessVariance,
      uniformity: brightnessVariance < 1000 ? 'High' : brightnessVariance < 2000 ? 'Medium' : 'Low',
      exposure: averageBrightness > 200 ? 'Overexposed' : averageBrightness < 50 ? 'Underexposed' : 'Good'
    };
  }

  async analyzeComposition(image) {
    const width = image.getWidth();
    const height = image.getHeight();
    
    // Rule of thirds analysis
    const thirdWidth = width / 3;
    const thirdHeight = height / 3;
    
    const regions = {
      topLeft: { x: 0, y: 0, width: thirdWidth, height: thirdHeight },
      topCenter: { x: thirdWidth, y: 0, width: thirdWidth, height: thirdHeight },
      topRight: { x: 2 * thirdWidth, y: 0, width: thirdWidth, height: thirdHeight },
      centerLeft: { x: 0, y: thirdHeight, width: thirdWidth, height: thirdHeight },
      center: { x: thirdWidth, y: thirdHeight, width: thirdWidth, height: thirdHeight },
      centerRight: { x: 2 * thirdWidth, y: thirdHeight, width: thirdWidth, height: thirdHeight },
      bottomLeft: { x: 0, y: 2 * thirdHeight, width: thirdWidth, height: thirdHeight },
      bottomCenter: { x: thirdWidth, y: 2 * thirdHeight, width: thirdWidth, height: thirdHeight },
      bottomRight: { x: 2 * thirdWidth, y: 2 * thirdHeight, width: thirdWidth, height: thirdHeight }
    };
    
    const regionAnalysis = {};
    for (const [name, region] of Object.entries(regions)) {
      const regionImage = image.clone().crop(region.x, region.y, region.width, region.height);
      regionAnalysis[name] = await this.analyzeRegion(regionImage);
    }
    
    return {
      ruleOfThirds: regionAnalysis,
      balance: this.calculateCompositionBalance(regionAnalysis),
      symmetry: this.calculateSymmetry(image)
    };
  }

  async analyzeRegion(regionImage) {
    const width = regionImage.getWidth();
    const height = regionImage.getHeight();
    
    let totalBrightness = 0;
    let edgeCount = 0;
    
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const pixel = regionImage.getPixelColor(x, y);
        const rgba = Jimp.intToRGBA(pixel);
        totalBrightness += (rgba.r + rgba.g + rgba.b) / 3;
      }
    }
    
    return {
      averageBrightness: totalBrightness / (width * height),
      edgeDensity: edgeCount / (width * height)
    };
  }

  calculateCompositionBalance(regionAnalysis) {
    // Calculate balance between left and right, top and bottom
    const leftBrightness = (regionAnalysis.topLeft.averageBrightness + 
                           regionAnalysis.centerLeft.averageBrightness + 
                           regionAnalysis.bottomLeft.averageBrightness) / 3;
    
    const rightBrightness = (regionAnalysis.topRight.averageBrightness + 
                            regionAnalysis.centerRight.averageBrightness + 
                            regionAnalysis.bottomRight.averageBrightness) / 3;
    
    const balanceScore = 1 - Math.abs(leftBrightness - rightBrightness) / 255;
    
    return {
      score: balanceScore,
      quality: balanceScore > 0.8 ? 'Good' : balanceScore > 0.6 ? 'Fair' : 'Poor'
    };
  }

  calculateSymmetry(image) {
    const width = image.getWidth();
    const height = image.getHeight();
    
    let symmetryScore = 0;
    let pixelCount = 0;
    
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width / 2; x++) {
        const leftPixel = image.getPixelColor(x, y);
        const rightPixel = image.getPixelColor(width - 1 - x, y);
        
        const leftRgba = Jimp.intToRGBA(leftPixel);
        const rightRgba = Jimp.intToRGBA(rightPixel);
        
        const difference = Math.abs(leftRgba.r - rightRgba.r) + 
                         Math.abs(leftRgba.g - rightRgba.g) + 
                         Math.abs(leftRgba.b - rightRgba.b);
        
        symmetryScore += 1 - (difference / 765);
        pixelCount++;
      }
    }
    
    return {
      score: symmetryScore / pixelCount,
      quality: symmetryScore / pixelCount > 0.8 ? 'High' : symmetryScore / pixelCount > 0.6 ? 'Medium' : 'Low'
    };
  }

  async detectArtifacts(image) {
    const artifacts = {
      compression: await this.detectCompressionArtifacts(image),
      noise: await this.detectNoisePatterns(image),
      blur: await this.detectBlur(image),
      jpeg: await this.detectJPEGArtifacts(image)
    };
    
    return artifacts;
  }

  async detectCompressionArtifacts(image) {
    const width = image.getWidth();
    const height = image.getHeight();
    
    let blockArtifacts = 0;
    let ringingArtifacts = 0;
    
    // Detect block artifacts (8x8 grid patterns)
    for (let y = 0; y < height - 8; y += 8) {
      for (let x = 0; x < width - 8; x += 8) {
        const blockVariance = this.calculateBlockVariance(image, x, y, 8);
        if (blockVariance < 100) blockArtifacts++;
      }
    }
    
    return {
      blockArtifacts: blockArtifacts / Math.floor((width * height) / 64),
      ringingArtifacts: ringingArtifacts / (width * height),
      severity: blockArtifacts > 10 ? 'High' : blockArtifacts > 5 ? 'Medium' : 'Low'
    };
  }

  calculateBlockVariance(image, startX, startY, size) {
    let total = 0;
    let count = 0;
    
    for (let y = startY; y < startY + size; y++) {
      for (let x = startX; x < startX + size; x++) {
        const pixel = image.getPixelColor(x, y);
        const brightness = Jimp.intToRGBA(pixel).r;
        total += brightness;
        count++;
      }
    }
    
    const average = total / count;
    let variance = 0;
    
    for (let y = startY; y < startY + size; y++) {
      for (let x = startX; x < startX + size; x++) {
        const pixel = image.getPixelColor(x, y);
        const brightness = Jimp.intToRGBA(pixel).r;
        variance += Math.pow(brightness - average, 2);
      }
    }
    
    return variance / count;
  }

  async detectNoisePatterns(image) {
    const width = image.getWidth();
    const height = image.getHeight();
    
    let saltAndPepper = 0;
    let gaussianNoise = 0;
    
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const center = Jimp.intToRGBA(image.getPixelColor(x, y)).r;
        const neighbors = [
          Jimp.intToRGBA(image.getPixelColor(x - 1, y)).r,
          Jimp.intToRGBA(image.getPixelColor(x + 1, y)).r,
          Jimp.intToRGBA(image.getPixelColor(x, y - 1)).r,
          Jimp.intToRGBA(image.getPixelColor(x, y + 1)).r
        ];
        
        const avgNeighbor = neighbors.reduce((sum, n) => sum + n, 0) / 4;
        const difference = Math.abs(center - avgNeighbor);
        
        if (difference > 100) saltAndPepper++;
        if (difference > 20 && difference < 50) gaussianNoise++;
      }
    }
    
    return {
      saltAndPepper: saltAndPepper / (width * height),
      gaussianNoise: gaussianNoise / (width * height),
      severity: saltAndPepper > 100 ? 'High' : saltAndPepper > 50 ? 'Medium' : 'Low'
    };
  }

  async detectBlur(image) {
    const width = image.getWidth();
    const height = image.getHeight();
    
    let blurScore = 0;
    let pixelCount = 0;
    
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const center = Jimp.intToRGBA(image.getPixelColor(x, y)).r;
        const neighbors = [
          Jimp.intToRGBA(image.getPixelColor(x - 1, y)).r,
          Jimp.intToRGBA(image.getPixelColor(x + 1, y)).r,
          Jimp.intToRGBA(image.getPixelColor(x, y - 1)).r,
          Jimp.intToRGBA(image.getPixelColor(x, y + 1)).r
        ];
        
        const avgNeighbor = neighbors.reduce((sum, n) => sum + n, 0) / 4;
        blurScore += Math.abs(center - avgNeighbor);
        pixelCount++;
      }
    }
    
    const averageBlur = blurScore / pixelCount;
    
    return {
      score: averageBlur,
      severity: averageBlur > 30 ? 'High' : averageBlur > 15 ? 'Medium' : 'Low'
    };
  }

  async detectJPEGArtifacts(image) {
    const width = image.getWidth();
    const height = image.getHeight();
    
    let quantizationArtifacts = 0;
    let moirePatterns = 0;
    
    // Detect quantization artifacts
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const pixel = image.getPixelColor(x, y);
        const rgba = Jimp.intToRGBA(pixel);
        
        // Check for quantization patterns
        if (rgba.r % 8 === 0 && rgba.g % 8 === 0 && rgba.b % 8 === 0) {
          quantizationArtifacts++;
        }
      }
    }
    
    return {
      quantizationArtifacts: quantizationArtifacts / (width * height),
      moirePatterns: moirePatterns / (width * height),
      severity: quantizationArtifacts > 1000 ? 'High' : quantizationArtifacts > 500 ? 'Medium' : 'Low'
    };
  }
}

module.exports = ComputationalPhotography; 