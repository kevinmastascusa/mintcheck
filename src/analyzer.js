const Jimp = require('jimp');
const Tesseract = require('tesseract.js');

class CardAnalyzer {
  constructor() {
    this.analysisResults = {};
  }

  async analyzeCard(imagePath) {
    try {
      console.log('Starting card analysis...');
      
      const image = await Jimp.read(imagePath);
      const analysis = {
        cardType: 'Pokemon',
        dimensions: this.getImageDimensions(image),
        centering: await this.analyzeCentering(image),
        corners: await this.analyzeCorners(image),
        edges: await this.analyzeEdges(image),
        surface: await this.analyzeSurface(image),
        text: await this.extractText(image),
        overallCondition: 'Unknown'
      };

      // Calculate overall condition based on individual scores
      analysis.overallCondition = this.calculateOverallCondition(analysis);
      
      console.log('Card analysis completed');
      return analysis;
    } catch (error) {
      console.error('Error in card analysis:', error);
      throw error;
    }
  }

  getImageDimensions(image) {
    return {
      width: image.getWidth(),
      height: image.getHeight(),
      aspectRatio: image.getWidth() / image.getHeight()
    };
  }

  async analyzeCentering(image) {
    try {
      // Analyze the centering of the card by measuring borders
      const width = image.getWidth();
      const height = image.getHeight();
      
      // Sample points along the edges to measure border consistency
      const topBorder = this.measureBorder(image, 'top');
      const bottomBorder = this.measureBorder(image, 'bottom');
      const leftBorder = this.measureBorder(image, 'left');
      const rightBorder = this.measureBorder(image, 'right');
      
      const verticalCentering = Math.abs(topBorder - bottomBorder) / height;
      const horizontalCentering = Math.abs(leftBorder - rightBorder) / width;
      
      // Calculate centering score (0-10, where 10 is perfect)
      const centeringScore = Math.max(0, 10 - (verticalCentering + horizontalCentering) * 50);
      
      return {
        score: Math.round(centeringScore * 10) / 10,
        verticalCentering: Math.round(verticalCentering * 100) / 100,
        horizontalCentering: Math.round(horizontalCentering * 100) / 100,
        topBorder,
        bottomBorder,
        leftBorder,
        rightBorder,
        grade: this.getCenteringGrade(centeringScore)
      };
    } catch (error) {
      console.error('Error analyzing centering:', error);
      return { score: 5, grade: 'Unknown' };
    }
  }

  measureBorder(image, side) {
    const width = image.getWidth();
    const height = image.getHeight();
    let totalDistance = 0;
    let sampleCount = 0;
    
    switch (side) {
      case 'top':
        for (let x = width * 0.1; x < width * 0.9; x += width * 0.1) {
          totalDistance += this.findEdgeDistance(image, x, 0, 'down');
          sampleCount++;
        }
        break;
      case 'bottom':
        for (let x = width * 0.1; x < width * 0.9; x += width * 0.1) {
          totalDistance += this.findEdgeDistance(image, x, height - 1, 'up');
          sampleCount++;
        }
        break;
      case 'left':
        for (let y = height * 0.1; y < height * 0.9; y += height * 0.1) {
          totalDistance += this.findEdgeDistance(image, 0, y, 'right');
          sampleCount++;
        }
        break;
      case 'right':
        for (let y = height * 0.1; y < height * 0.9; y += height * 0.1) {
          totalDistance += this.findEdgeDistance(image, width - 1, y, 'left');
          sampleCount++;
        }
        break;
    }
    
    return sampleCount > 0 ? totalDistance / sampleCount : 0;
  }

  findEdgeDistance(image, startX, startY, direction) {
    const width = image.getWidth();
    const height = image.getHeight();
    let x = startX;
    let y = startY;
    let distance = 0;
    
    while (x >= 0 && x < width && y >= 0 && y < height) {
      const pixel = image.getPixelColor(x, y);
      const brightness = this.getBrightness(pixel);
      
      // If we find a significant color change, we've hit the card edge
      if (brightness < 50 || brightness > 200) {
        break;
      }
      
      distance++;
      
      switch (direction) {
        case 'down': y++; break;
        case 'up': y--; break;
        case 'right': x++; break;
        case 'left': x--; break;
      }
    }
    
    return distance;
  }

  getBrightness(pixel) {
    const r = (pixel >> 24) & 0xff;
    const g = (pixel >> 16) & 0xff;
    const b = (pixel >> 8) & 0xff;
    return (r + g + b) / 3;
  }

  getCenteringGrade(score) {
    if (score >= 9.5) return 'Gem Mint';
    if (score >= 9.0) return 'Mint';
    if (score >= 8.0) return 'Near Mint-Mint';
    if (score >= 7.0) return 'Near Mint';
    if (score >= 6.0) return 'Excellent-Mint';
    if (score >= 5.0) return 'Excellent';
    if (score >= 4.0) return 'Very Good-Excellent';
    if (score >= 3.0) return 'Very Good';
    if (score >= 2.0) return 'Good-Very Good';
    if (score >= 1.0) return 'Good';
    return 'Poor';
  }

  async analyzeCorners(image) {
    try {
      const width = image.getWidth();
      const height = image.getHeight();
      
      // Analyze the four corners
      const corners = {
        topLeft: this.analyzeCorner(image, 0, 0, width * 0.1, height * 0.1),
        topRight: this.analyzeCorner(image, width * 0.9, 0, width, height * 0.1),
        bottomLeft: this.analyzeCorner(image, 0, height * 0.9, width * 0.1, height),
        bottomRight: this.analyzeCorner(image, width * 0.9, height * 0.9, width, height)
      };
      
      const averageScore = (corners.topLeft.score + corners.topRight.score + 
                           corners.bottomLeft.score + corners.bottomRight.score) / 4;
      
      return {
        corners,
        averageScore: Math.round(averageScore * 10) / 10,
        grade: this.getCornerGrade(averageScore)
      };
    } catch (error) {
      console.error('Error analyzing corners:', error);
      return { averageScore: 5, grade: 'Unknown' };
    }
  }

  analyzeCorner(image, startX, startY, endX, endY) {
    let damageScore = 0;
    let totalPixels = 0;
    
    for (let x = startX; x < endX; x++) {
      for (let y = startY; y < endY; y++) {
        const pixel = image.getPixelColor(x, y);
        const brightness = this.getBrightness(pixel);
        
        // Detect potential damage (white spots, color variations)
        if (brightness > 200 || brightness < 30) {
          damageScore += 1;
        }
        
        totalPixels++;
      }
    }
    
    const damagePercentage = totalPixels > 0 ? (damageScore / totalPixels) * 100 : 0;
    const score = Math.max(0, 10 - damagePercentage / 10);
    
    return {
      score: Math.round(score * 10) / 10,
      damagePercentage: Math.round(damagePercentage * 100) / 100
    };
  }

  getCornerGrade(score) {
    if (score >= 9.5) return 'Gem Mint';
    if (score >= 9.0) return 'Mint';
    if (score >= 8.0) return 'Near Mint-Mint';
    if (score >= 7.0) return 'Near Mint';
    if (score >= 6.0) return 'Excellent-Mint';
    if (score >= 5.0) return 'Excellent';
    if (score >= 4.0) return 'Very Good-Excellent';
    if (score >= 3.0) return 'Very Good';
    if (score >= 2.0) return 'Good-Very Good';
    if (score >= 1.0) return 'Good';
    return 'Poor';
  }

  async analyzeEdges(image) {
    try {
      const width = image.getWidth();
      const height = image.getHeight();
      
      // Analyze all four edges
      const edges = {
        top: this.analyzeEdge(image, 'horizontal', 0, width, height * 0.05),
        bottom: this.analyzeEdge(image, 'horizontal', height * 0.95, width, height),
        left: this.analyzeEdge(image, 'vertical', 0, height, width * 0.05),
        right: this.analyzeEdge(image, 'vertical', width * 0.95, height, width)
      };
      
      const averageScore = (edges.top.score + edges.bottom.score + 
                           edges.left.score + edges.right.score) / 4;
      
      return {
        edges,
        averageScore: Math.round(averageScore * 10) / 10,
        grade: this.getEdgeGrade(averageScore)
      };
    } catch (error) {
      console.error('Error analyzing edges:', error);
      return { averageScore: 5, grade: 'Unknown' };
    }
  }

  analyzeEdge(image, orientation, start, length, thickness) {
    let damageScore = 0;
    let totalPixels = 0;
    
    if (orientation === 'horizontal') {
      for (let x = 0; x < length; x++) {
        for (let y = start; y < start + thickness; y++) {
          const pixel = image.getPixelColor(x, y);
          const brightness = this.getBrightness(pixel);
          
          if (brightness > 200 || brightness < 30) {
            damageScore += 1;
          }
          totalPixels++;
        }
      }
    } else {
      for (let y = 0; y < length; y++) {
        for (let x = start; x < start + thickness; x++) {
          const pixel = image.getPixelColor(x, y);
          const brightness = this.getBrightness(pixel);
          
          if (brightness > 200 || brightness < 30) {
            damageScore += 1;
          }
          totalPixels++;
        }
      }
    }
    
    const damagePercentage = totalPixels > 0 ? (damageScore / totalPixels) * 100 : 0;
    const score = Math.max(0, 10 - damagePercentage / 10);
    
    return {
      score: Math.round(score * 10) / 10,
      damagePercentage: Math.round(damagePercentage * 100) / 100
    };
  }

  getEdgeGrade(score) {
    if (score >= 9.5) return 'Gem Mint';
    if (score >= 9.0) return 'Mint';
    if (score >= 8.0) return 'Near Mint-Mint';
    if (score >= 7.0) return 'Near Mint';
    if (score >= 6.0) return 'Excellent-Mint';
    if (score >= 5.0) return 'Excellent';
    if (score >= 4.0) return 'Very Good-Excellent';
    if (score >= 3.0) return 'Very Good';
    if (score >= 2.0) return 'Good-Very Good';
    if (score >= 1.0) return 'Good';
    return 'Poor';
  }

  async analyzeSurface(image) {
    try {
      const width = image.getWidth();
      const height = image.getHeight();
      
      // Analyze the surface for scratches, print defects, and surface wear
      let surfaceDamage = 0;
      let totalPixels = 0;
      
      // Sample the surface area (excluding borders)
      const sampleStep = Math.max(1, Math.floor(width / 100));
      
      for (let x = width * 0.1; x < width * 0.9; x += sampleStep) {
        for (let y = height * 0.1; y < height * 0.9; y += sampleStep) {
          const pixel = image.getPixelColor(x, y);
          const brightness = this.getBrightness(pixel);
          
          // Detect potential surface issues
          if (brightness > 220 || brightness < 20) {
            surfaceDamage += 1;
          }
          
          totalPixels++;
        }
      }
      
      const damagePercentage = totalPixels > 0 ? (surfaceDamage / totalPixels) * 100 : 0;
      const score = Math.max(0, 10 - damagePercentage / 5);
      
      return {
        score: Math.round(score * 10) / 10,
        damagePercentage: Math.round(damagePercentage * 100) / 100,
        grade: this.getSurfaceGrade(score)
      };
    } catch (error) {
      console.error('Error analyzing surface:', error);
      return { score: 5, grade: 'Unknown' };
    }
  }

  getSurfaceGrade(score) {
    if (score >= 9.5) return 'Gem Mint';
    if (score >= 9.0) return 'Mint';
    if (score >= 8.0) return 'Near Mint-Mint';
    if (score >= 7.0) return 'Near Mint';
    if (score >= 6.0) return 'Excellent-Mint';
    if (score >= 5.0) return 'Excellent';
    if (score >= 4.0) return 'Very Good-Excellent';
    if (score >= 3.0) return 'Very Good';
    if (score >= 2.0) return 'Good-Very Good';
    if (score >= 1.0) return 'Good';
    return 'Poor';
  }

  async extractText(image) {
    try {
      // Convert Jimp image to buffer for Tesseract
      const buffer = await image.getBufferAsync(Jimp.MIME_PNG);
      
      const result = await Tesseract.recognize(buffer, 'eng', {
        logger: m => console.log(m)
      });
      
      return {
        text: result.data.text,
        confidence: result.data.confidence,
        words: result.data.words || []
      };
    } catch (error) {
      console.error('Error extracting text:', error);
      return { text: '', confidence: 0, words: [] };
    }
  }

  calculateOverallCondition(analysis) {
    const centeringWeight = 0.25;
    const cornersWeight = 0.25;
    const edgesWeight = 0.25;
    const surfaceWeight = 0.25;
    
    const weightedScore = 
      (analysis.centering.score * centeringWeight) +
      (analysis.corners.averageScore * cornersWeight) +
      (analysis.edges.averageScore * edgesWeight) +
      (analysis.surface.score * surfaceWeight);
    
    return {
      score: Math.round(weightedScore * 10) / 10,
      grade: this.getOverallGrade(weightedScore),
      breakdown: {
        centering: analysis.centering.score,
        corners: analysis.corners.averageScore,
        edges: analysis.edges.averageScore,
        surface: analysis.surface.score
      }
    };
  }

  getOverallGrade(score) {
    if (score >= 9.5) return 'Gem Mint';
    if (score >= 9.0) return 'Mint';
    if (score >= 8.0) return 'Near Mint-Mint';
    if (score >= 7.0) return 'Near Mint';
    if (score >= 6.0) return 'Excellent-Mint';
    if (score >= 5.0) return 'Excellent';
    if (score >= 4.0) return 'Very Good-Excellent';
    if (score >= 3.0) return 'Very Good';
    if (score >= 2.0) return 'Good-Very Good';
    if (score >= 1.0) return 'Good';
    return 'Poor';
  }
}

module.exports = CardAnalyzer; 