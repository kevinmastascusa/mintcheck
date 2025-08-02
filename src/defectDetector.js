const Jimp = require('jimp');
const sharp = require('sharp');

class DefectDetector {
  constructor() {
    this.defectTypes = {
      SCRATCHES: 'scratches',
      DENTS: 'dents',
      CORNER_WEAR: 'corner_wear',
      EDGE_WEAR: 'edge_wear',
      SURFACE_DAMAGE: 'surface_damage',
      DISCOLORATION: 'discoloration',
      PRINTING_DEFECTS: 'printing_defects',
      BLEEDING: 'bleeding',
      FADING: 'fading',
      WATER_DAMAGE: 'water_damage'
    };
  }

  async detectDefects(imagePath) {
    try {
      console.log('Starting defect detection pipeline...');
      
      const image = await Jimp.read(imagePath);
      const defects = {
        overall: { score: 0, confidence: 0 },
        details: [],
        visualizations: {},
        recommendations: []
      };

      // Multi-scale defect detection
      const defectResults = await Promise.all([
        this.detectScratches(image),
        this.detectDents(image),
        this.detectCornerWear(image),
        this.detectEdgeWear(image),
        this.detectSurfaceDamage(image),
        this.detectDiscoloration(image),
        this.detectPrintingDefects(image),
        this.detectWaterDamage(image)
      ]);

      // Aggregate results
      defectResults.forEach(result => {
        if (result) {
          defects.details.push(result);
        }
      });

      // Calculate overall defect score
      defects.overall = this.calculateOverallDefectScore(defects.details);
      
      // Generate visualizations
      defects.visualizations = await this.generateDefectVisualizations(image, defects.details);
      
      // Generate recommendations
      defects.recommendations = this.generateDefectRecommendations(defects.details);

      console.log('Defect detection completed');
      return defects;
    } catch (error) {
      console.error('Error in defect detection:', error);
      throw error;
    }
  }

  async detectScratches(image) {
    const clone = image.clone();
    
    // Apply edge detection
    clone.convolute([
      [-1, -1, -1],
      [-1,  8, -1],
      [-1, -1, -1]
    ]);

    // Analyze edge patterns for scratch detection
    const scratchRegions = this.analyzeEdgePatterns(clone);
    
    return {
      type: this.defectTypes.SCRATCHES,
      severity: this.calculateSeverity(scratchRegions),
      locations: scratchRegions,
      description: 'Linear surface damage detected',
      impact: this.calculateImpact(scratchRegions)
    };
  }

  async detectDents(image) {
    const clone = image.clone();
    
    // Apply morphological operations to detect dents
    clone.gaussian(1);
    const dentRegions = this.analyzeMorphologicalFeatures(clone);
    
    return {
      type: this.defectTypes.DENTS,
      severity: this.calculateSeverity(dentRegions),
      locations: dentRegions,
      description: 'Surface depressions detected',
      impact: this.calculateImpact(dentRegions)
    };
  }

  async detectCornerWear(image) {
    const width = image.getWidth();
    const height = image.getHeight();
    
    // Define corner regions
    const cornerRegions = [
      { x: 0, y: 0, width: width * 0.15, height: height * 0.15 }, // Top-left
      { x: width * 0.85, y: 0, width: width * 0.15, height: height * 0.15 }, // Top-right
      { x: 0, y: height * 0.85, width: width * 0.15, height: height * 0.15 }, // Bottom-left
      { x: width * 0.85, y: height * 0.85, width: width * 0.15, height: height * 0.15 } // Bottom-right
    ];

    const cornerWearResults = [];
    
    for (const region of cornerRegions) {
      const cornerImage = image.clone().crop(region.x, region.y, region.width, region.height);
      const wearAnalysis = this.analyzeCornerWear(cornerImage);
      if (wearAnalysis.severity > 0) {
        cornerWearResults.push({
          ...wearAnalysis,
          region: region
        });
      }
    }

    return {
      type: this.defectTypes.CORNER_WEAR,
      severity: this.calculateAverageSeverity(cornerWearResults),
      locations: cornerWearResults,
      description: 'Corner wear and damage detected',
      impact: this.calculateImpact(cornerWearResults)
    };
  }

  async detectEdgeWear(image) {
    const width = image.getWidth();
    const height = image.getHeight();
    
    // Define edge regions
    const edgeRegions = [
      { x: 0, y: 0, width: width, height: height * 0.1 }, // Top edge
      { x: 0, y: height * 0.9, width: width, height: height * 0.1 }, // Bottom edge
      { x: 0, y: 0, width: width * 0.1, height: height }, // Left edge
      { x: width * 0.9, y: 0, width: width * 0.1, height: height } // Right edge
    ];

    const edgeWearResults = [];
    
    for (const region of edgeRegions) {
      const edgeImage = image.clone().crop(region.x, region.y, region.width, region.height);
      const wearAnalysis = this.analyzeEdgeWear(edgeImage);
      if (wearAnalysis.severity > 0) {
        edgeWearResults.push({
          ...wearAnalysis,
          region: region
        });
      }
    }

    return {
      type: this.defectTypes.EDGE_WEAR,
      severity: this.calculateAverageSeverity(edgeWearResults),
      locations: edgeWearResults,
      description: 'Edge wear and damage detected',
      impact: this.calculateImpact(edgeWearResults)
    };
  }

  async detectSurfaceDamage(image) {
    const clone = image.clone();
    
    // Apply texture analysis
    clone.grayscale();
    const surfaceAnalysis = this.analyzeSurfaceTexture(clone);
    
    return {
      type: this.defectTypes.SURFACE_DAMAGE,
      severity: surfaceAnalysis.severity,
      locations: surfaceAnalysis.regions,
      description: 'Surface texture irregularities detected',
      impact: this.calculateImpact(surfaceAnalysis.regions)
    };
  }

  async detectDiscoloration(image) {
    const clone = image.clone();
    
    // Analyze color distribution
    const colorAnalysis = this.analyzeColorDistribution(clone);
    
    return {
      type: this.defectTypes.DISCOLORATION,
      severity: colorAnalysis.severity,
      locations: colorAnalysis.regions,
      description: 'Color inconsistencies detected',
      impact: this.calculateImpact(colorAnalysis.regions)
    };
  }

  async detectPrintingDefects(image) {
    const clone = image.clone();
    
    // Analyze printing quality
    const printingAnalysis = this.analyzePrintingQuality(clone);
    
    return {
      type: this.defectTypes.PRINTING_DEFECTS,
      severity: printingAnalysis.severity,
      locations: printingAnalysis.regions,
      description: 'Printing quality issues detected',
      impact: this.calculateImpact(printingAnalysis.regions)
    };
  }

  async detectWaterDamage(image) {
    const clone = image.clone();
    
    // Analyze water damage patterns
    const waterAnalysis = this.analyzeWaterDamage(clone);
    
    return {
      type: this.defectTypes.WATER_DAMAGE,
      severity: waterAnalysis.severity,
      locations: waterAnalysis.regions,
      description: 'Water damage patterns detected',
      impact: this.calculateImpact(waterAnalysis.regions)
    };
  }

  analyzeEdgePatterns(image) {
    const width = image.getWidth();
    const height = image.getHeight();
    const regions = [];
    
    // Scan for linear patterns indicative of scratches
    for (let y = 0; y < height; y += 10) {
      for (let x = 0; x < width; x += 10) {
        const pixel = image.getPixelColor(x, y);
        const brightness = Jimp.intToRGBA(pixel).r;
        
        if (brightness > 200) { // High brightness indicates potential scratch
          regions.push({
            x: x,
            y: y,
            width: 10,
            height: 10,
            confidence: brightness / 255
          });
        }
      }
    }
    
    return regions;
  }

  analyzeMorphologicalFeatures(image) {
    const width = image.getWidth();
    const height = image.getHeight();
    const regions = [];
    
    // Detect dark regions that might indicate dents
    for (let y = 0; y < height; y += 5) {
      for (let x = 0; x < width; x += 5) {
        const pixel = image.getPixelColor(x, y);
        const brightness = Jimp.intToRGBA(pixel).r;
        
        if (brightness < 50) { // Low brightness indicates potential dent
          regions.push({
            x: x,
            y: y,
            width: 5,
            height: 5,
            confidence: (255 - brightness) / 255
          });
        }
      }
    }
    
    return regions;
  }

  analyzeCornerWear(cornerImage) {
    const width = cornerImage.getWidth();
    const height = cornerImage.getHeight();
    let totalWear = 0;
    let pixelCount = 0;
    
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const pixel = cornerImage.getPixelColor(x, y);
        const brightness = Jimp.intToRGBA(pixel).r;
        
        // Analyze edge sharpness and wear patterns
        if (x < width * 0.3 || y < height * 0.3) {
          totalWear += (255 - brightness);
          pixelCount++;
        }
      }
    }
    
    const averageWear = pixelCount > 0 ? totalWear / pixelCount : 0;
    const severity = Math.min(averageWear / 255, 1);
    
    return {
      severity: severity,
      regions: [{
        x: 0,
        y: 0,
        width: width,
        height: height,
        confidence: severity
      }]
    };
  }

  analyzeEdgeWear(edgeImage) {
    const width = edgeImage.getWidth();
    const height = edgeImage.getHeight();
    let totalWear = 0;
    let pixelCount = 0;
    
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const pixel = edgeImage.getPixelColor(x, y);
        const brightness = Jimp.intToRGBA(pixel).r;
        
        // Analyze edge wear patterns
        totalWear += (255 - brightness);
        pixelCount++;
      }
    }
    
    const averageWear = pixelCount > 0 ? totalWear / pixelCount : 0;
    const severity = Math.min(averageWear / 255, 1);
    
    return {
      severity: severity,
      regions: [{
        x: 0,
        y: 0,
        width: width,
        height: height,
        confidence: severity
      }]
    };
  }

  analyzeSurfaceTexture(image) {
    const width = image.getWidth();
    const height = image.getHeight();
    let textureVariance = 0;
    const regions = [];
    
    // Calculate texture variance
    for (let y = 0; y < height; y += 5) {
      for (let x = 0; x < width; x += 5) {
        const pixel = image.getPixelColor(x, y);
        const brightness = Jimp.intToRGBA(pixel).r;
        
        if (brightness < 100 || brightness > 200) {
          textureVariance++;
          regions.push({
            x: x,
            y: y,
            width: 5,
            height: 5,
            confidence: Math.abs(brightness - 128) / 128
          });
        }
      }
    }
    
    const severity = Math.min(textureVariance / (width * height / 25), 1);
    
    return {
      severity: severity,
      regions: regions
    };
  }

  analyzeColorDistribution(image) {
    const width = image.getWidth();
    const height = image.getHeight();
    const colorMap = new Map();
    const regions = [];
    
    // Analyze color distribution
    for (let y = 0; y < height; y += 10) {
      for (let x = 0; x < width; x += 10) {
        const pixel = image.getPixelColor(x, y);
        const rgba = Jimp.intToRGBA(pixel);
        
        // Detect unusual color patterns
        const colorKey = `${Math.floor(rgba.r/25)},${Math.floor(rgba.g/25)},${Math.floor(rgba.b/25)}`;
        colorMap.set(colorKey, (colorMap.get(colorKey) || 0) + 1);
        
        // Detect discoloration
        if (Math.abs(rgba.r - rgba.g) > 50 || Math.abs(rgba.g - rgba.b) > 50) {
          regions.push({
            x: x,
            y: y,
            width: 10,
            height: 10,
            confidence: Math.max(Math.abs(rgba.r - rgba.g), Math.abs(rgba.g - rgba.b)) / 255
          });
        }
      }
    }
    
    const severity = regions.length > 0 ? regions.reduce((sum, r) => sum + r.confidence, 0) / regions.length : 0;
    
    return {
      severity: severity,
      regions: regions
    };
  }

  analyzePrintingQuality(image) {
    const width = image.getWidth();
    const height = image.getHeight();
    const regions = [];
    
    // Analyze printing consistency
    for (let y = 0; y < height; y += 5) {
      for (let x = 0; x < width; x += 5) {
        const pixel = image.getPixelColor(x, y);
        const brightness = Jimp.intToRGBA(pixel).r;
        
        // Detect printing defects
        if (brightness < 30 || brightness > 225) {
          regions.push({
            x: x,
            y: y,
            width: 5,
            height: 5,
            confidence: Math.abs(brightness - 128) / 128
          });
        }
      }
    }
    
    const severity = regions.length > 0 ? regions.reduce((sum, r) => sum + r.confidence, 0) / regions.length : 0;
    
    return {
      severity: severity,
      regions: regions
    };
  }

  analyzeWaterDamage(image) {
    const width = image.getWidth();
    const height = image.getHeight();
    const regions = [];
    
    // Analyze water damage patterns (staining, warping indicators)
    for (let y = 0; y < height; y += 10) {
      for (let x = 0; x < width; x += 10) {
        const pixel = image.getPixelColor(x, y);
        const rgba = Jimp.intToRGBA(pixel);
        
        // Detect water damage patterns
        if (rgba.r > 200 && rgba.g > 200 && rgba.b > 200) {
          regions.push({
            x: x,
            y: y,
            width: 10,
            height: 10,
            confidence: (rgba.r + rgba.g + rgba.b) / 765
          });
        }
      }
    }
    
    const severity = regions.length > 0 ? regions.reduce((sum, r) => sum + r.confidence, 0) / regions.length : 0;
    
    return {
      severity: severity,
      regions: regions
    };
  }

  calculateSeverity(regions) {
    if (regions.length === 0) return 0;
    return regions.reduce((sum, region) => sum + (region.confidence || 0), 0) / regions.length;
  }

  calculateAverageSeverity(results) {
    if (results.length === 0) return 0;
    return results.reduce((sum, result) => sum + result.severity, 0) / results.length;
  }

  calculateImpact(regions) {
    if (regions.length === 0) return 'None';
    
    const totalArea = regions.reduce((sum, region) => sum + (region.width * region.height), 0);
    const totalConfidence = regions.reduce((sum, region) => sum + (region.confidence || 0), 0);
    
    const impactScore = (totalArea * totalConfidence) / 10000;
    
    if (impactScore < 0.1) return 'Minimal';
    if (impactScore < 0.3) return 'Minor';
    if (impactScore < 0.5) return 'Moderate';
    if (impactScore < 0.7) return 'Significant';
    return 'Major';
  }

  calculateOverallDefectScore(details) {
    if (details.length === 0) return { score: 0, confidence: 0 };
    
    const totalSeverity = details.reduce((sum, detail) => sum + detail.severity, 0);
    const averageSeverity = totalSeverity / details.length;
    
    const confidence = details.reduce((sum, detail) => sum + (detail.locations?.length || 0), 0) / details.length;
    
    return {
      score: averageSeverity,
      confidence: Math.min(confidence, 1)
    };
  }

  async generateDefectVisualizations(image, defects) {
    const visualizations = {};
    
    for (const defect of defects) {
      if (defect.locations && defect.locations.length > 0) {
        const visualization = image.clone();
        
        // Highlight defect regions
        for (const region of defect.locations) {
          const color = this.getDefectColor(defect.type);
          for (let y = region.y; y < region.y + region.height; y++) {
            for (let x = region.x; x < region.x + region.width; x++) {
              if (x < visualization.getWidth() && y < visualization.getHeight()) {
                visualization.setPixelColor(color, x, y);
              }
            }
          }
        }
        
        visualizations[defect.type] = await visualization.getBufferAsync(Jimp.MIME_PNG);
      }
    }
    
    return visualizations;
  }

  getDefectColor(defectType) {
    const colors = {
      [this.defectTypes.SCRATCHES]: Jimp.rgbaToInt(255, 0, 0, 128), // Red
      [this.defectTypes.DENTS]: Jimp.rgbaToInt(255, 165, 0, 128), // Orange
      [this.defectTypes.CORNER_WEAR]: Jimp.rgbaToInt(255, 255, 0, 128), // Yellow
      [this.defectTypes.EDGE_WEAR]: Jimp.rgbaToInt(0, 255, 0, 128), // Green
      [this.defectTypes.SURFACE_DAMAGE]: Jimp.rgbaToInt(0, 255, 255, 128), // Cyan
      [this.defectTypes.DISCOLORATION]: Jimp.rgbaToInt(128, 0, 255, 128), // Purple
      [this.defectTypes.PRINTING_DEFECTS]: Jimp.rgbaToInt(255, 0, 255, 128), // Magenta
      [this.defectTypes.WATER_DAMAGE]: Jimp.rgbaToInt(0, 0, 255, 128) // Blue
    };
    
    return colors[defectType] || Jimp.rgbaToInt(128, 128, 128, 128);
  }

  generateDefectRecommendations(defects) {
    const recommendations = [];
    
    for (const defect of defects) {
      if (defect.severity > 0.3) {
        recommendations.push({
          type: defect.type,
          severity: defect.severity,
          recommendation: this.getDefectRecommendation(defect.type, defect.severity),
          priority: defect.severity > 0.7 ? 'High' : defect.severity > 0.4 ? 'Medium' : 'Low'
        });
      }
    }
    
    return recommendations.sort((a, b) => b.severity - a.severity);
  }

  getDefectRecommendation(defectType, severity) {
    const recommendations = {
      [this.defectTypes.SCRATCHES]: {
        low: 'Minor surface scratches detected. Consider professional cleaning.',
        medium: 'Moderate scratches may affect grade. Professional restoration recommended.',
        high: 'Significant scratching detected. Will likely impact PSA grade significantly.'
      },
      [this.defectTypes.DENTS]: {
        low: 'Minor surface dents detected. May be improved with careful handling.',
        medium: 'Moderate dents present. Professional assessment recommended.',
        high: 'Severe dents detected. Will significantly impact card grade.'
      },
      [this.defectTypes.CORNER_WEAR]: {
        low: 'Minor corner wear detected. Common in vintage cards.',
        medium: 'Moderate corner wear. May limit grade to NM-MT or lower.',
        high: 'Significant corner damage. Will limit grade to EX or lower.'
      },
      [this.defectTypes.EDGE_WEAR]: {
        low: 'Minor edge wear detected. Normal for circulated cards.',
        medium: 'Moderate edge wear. Will affect grade assessment.',
        high: 'Severe edge wear. Will significantly limit grade potential.'
      },
      [this.defectTypes.SURFACE_DAMAGE]: {
        low: 'Minor surface irregularities detected.',
        medium: 'Moderate surface damage. Professional cleaning may help.',
        high: 'Significant surface damage. Will impact grade significantly.'
      },
      [this.defectTypes.DISCOLORATION]: {
        low: 'Minor color variations detected.',
        medium: 'Moderate discoloration. May indicate storage issues.',
        high: 'Significant discoloration. Will affect grade and value.'
      },
      [this.defectTypes.PRINTING_DEFECTS]: {
        low: 'Minor printing inconsistencies detected.',
        medium: 'Moderate printing defects. May be factory-related.',
        high: 'Significant printing defects. Will impact grade assessment.'
      },
      [this.defectTypes.WATER_DAMAGE]: {
        low: 'Minor water damage indicators detected.',
        medium: 'Moderate water damage. Professional assessment recommended.',
        high: 'Severe water damage detected. Will severely limit grade potential.'
      }
    };
    
    const level = severity > 0.7 ? 'high' : severity > 0.4 ? 'medium' : 'low';
    return recommendations[defectType]?.[level] || 'Defect detected. Professional assessment recommended.';
  }
}

module.exports = DefectDetector; 