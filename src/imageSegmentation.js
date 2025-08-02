const Jimp = require('jimp');

class ImageSegmentation {
  constructor() {
    this.segments = {
      CORNERS: 'corners',
      EDGES: 'edges',
      CENTER: 'center',
      SURFACE: 'surface',
      TEXT_AREA: 'text_area',
      IMAGE_AREA: 'image_area',
      BORDER: 'border'
    };
  }

  async segmentCard(imagePath) {
    try {
      console.log('Starting image segmentation...');
      
      const image = await Jimp.read(imagePath);
      const width = image.getWidth();
      const height = image.getHeight();
      
      const segmentation = {
        dimensions: { width, height },
        segments: {},
        highlights: {},
        criticalAreas: [],
        metadata: {}
      };

      // Define card segments
      segmentation.segments = {
        corners: this.defineCornerSegments(width, height),
        edges: this.defineEdgeSegments(width, height),
        center: this.defineCenterSegment(width, height),
        surface: this.defineSurfaceSegments(width, height),
        textArea: this.defineTextArea(width, height),
        imageArea: this.defineImageArea(width, height),
        border: this.defineBorderSegment(width, height)
      };

      // Generate highlights for each segment
      segmentation.highlights = await this.generateHighlights(image, segmentation.segments);
      
      // Identify critical areas
      segmentation.criticalAreas = await this.identifyCriticalAreas(image, segmentation.segments);
      
      // Generate metadata
      segmentation.metadata = await this.generateSegmentationMetadata(image, segmentation.segments);

      console.log('Image segmentation completed');
      return segmentation;
    } catch (error) {
      console.error('Error in image segmentation:', error);
      throw error;
    }
  }

  defineCornerSegments(width, height) {
    const cornerSize = Math.min(width, height) * 0.15;
    
    return {
      topLeft: { x: 0, y: 0, width: cornerSize, height: cornerSize },
      topRight: { x: width - cornerSize, y: 0, width: cornerSize, height: cornerSize },
      bottomLeft: { x: 0, y: height - cornerSize, width: cornerSize, height: cornerSize },
      bottomRight: { x: width - cornerSize, y: height - cornerSize, width: cornerSize, height: cornerSize }
    };
  }

  defineEdgeSegments(width, height) {
    const edgeThickness = Math.min(width, height) * 0.05;
    
    return {
      top: { x: 0, y: 0, width: width, height: edgeThickness },
      bottom: { x: 0, y: height - edgeThickness, width: width, height: edgeThickness },
      left: { x: 0, y: 0, width: edgeThickness, height: height },
      right: { x: width - edgeThickness, y: 0, width: edgeThickness, height: height }
    };
  }

  defineCenterSegment(width, height) {
    const centerSize = Math.min(width, height) * 0.6;
    const centerX = (width - centerSize) / 2;
    const centerY = (height - centerSize) / 2;
    
    return {
      x: centerX,
      y: centerY,
      width: centerSize,
      height: centerSize
    };
  }

  defineSurfaceSegments(width, height) {
    const segmentCount = 9; // 3x3 grid
    const segmentWidth = width / 3;
    const segmentHeight = height / 3;
    
    const segments = {};
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 3; col++) {
        const key = `surface_${row}_${col}`;
        segments[key] = {
          x: col * segmentWidth,
          y: row * segmentHeight,
          width: segmentWidth,
          height: segmentHeight
        };
      }
    }
    
    return segments;
  }

  defineTextArea(width, height) {
    // Text area is typically in the bottom portion
    return {
      x: width * 0.1,
      y: height * 0.7,
      width: width * 0.8,
      height: height * 0.25
    };
  }

  defineImageArea(width, height) {
    // Image area is typically in the center-top portion
    return {
      x: width * 0.1,
      y: height * 0.1,
      width: width * 0.8,
      height: height * 0.6
    };
  }

  defineBorderSegment(width, height) {
    const borderThickness = Math.min(width, height) * 0.02;
    
    return {
      x: borderThickness,
      y: borderThickness,
      width: width - (borderThickness * 2),
      height: height - (borderThickness * 2)
    };
  }

  async generateHighlights(image, segments) {
    const highlights = {};
    
    // Generate corner highlights
    highlights.corners = await this.createCornerHighlights(image, segments.corners);
    
    // Generate edge highlights
    highlights.edges = await this.createEdgeHighlights(image, segments.edges);
    
    // Generate center highlight
    highlights.center = await this.createCenterHighlight(image, segments.center);
    
    // Generate surface highlights
    highlights.surface = await this.createSurfaceHighlights(image, segments.surface);
    
    // Generate text area highlight
    highlights.textArea = await this.createTextAreaHighlight(image, segments.textArea);
    
    // Generate image area highlight
    highlights.imageArea = await this.createImageAreaHighlight(image, segments.imageArea);
    
    return highlights;
  }

  async createCornerHighlights(image, cornerSegments) {
    const highlights = {};
    
    for (const [cornerName, segment] of Object.entries(cornerSegments)) {
      const cornerImage = image.clone().crop(segment.x, segment.y, segment.width, segment.height);
      const highlight = await this.createHighlightOverlay(cornerImage, 'corner', cornerName);
      highlights[cornerName] = {
        segment: segment,
        highlight: highlight,
        analysis: await this.analyzeCorner(cornerImage, cornerName)
      };
    }
    
    return highlights;
  }

  async createEdgeHighlights(image, edgeSegments) {
    const highlights = {};
    
    for (const [edgeName, segment] of Object.entries(edgeSegments)) {
      const edgeImage = image.clone().crop(segment.x, segment.y, segment.width, segment.height);
      const highlight = await this.createHighlightOverlay(edgeImage, 'edge', edgeName);
      highlights[edgeName] = {
        segment: segment,
        highlight: highlight,
        analysis: await this.analyzeEdge(edgeImage, edgeName)
      };
    }
    
    return highlights;
  }

  async createCenterHighlight(image, centerSegment) {
    const centerImage = image.clone().crop(centerSegment.x, centerSegment.y, centerSegment.width, centerSegment.height);
    const highlight = await this.createHighlightOverlay(centerImage, 'center', 'main');
    
    return {
      segment: centerSegment,
      highlight: highlight,
      analysis: await this.analyzeCenter(centerImage)
    };
  }

  async createSurfaceHighlights(image, surfaceSegments) {
    const highlights = {};
    
    for (const [segmentName, segment] of Object.entries(surfaceSegments)) {
      const surfaceImage = image.clone().crop(segment.x, segment.y, segment.width, segment.height);
      const highlight = await this.createHighlightOverlay(surfaceImage, 'surface', segmentName);
      highlights[segmentName] = {
        segment: segment,
        highlight: highlight,
        analysis: await this.analyzeSurface(surfaceImage, segmentName)
      };
    }
    
    return highlights;
  }

  async createTextAreaHighlight(image, textSegment) {
    const textImage = image.clone().crop(textSegment.x, textSegment.y, textSegment.width, textSegment.height);
    const highlight = await this.createHighlightOverlay(textImage, 'text', 'main');
    
    return {
      segment: textSegment,
      highlight: highlight,
      analysis: await this.analyzeTextArea(textImage)
    };
  }

  async createImageAreaHighlight(image, imageSegment) {
    const imageArea = image.clone().crop(imageSegment.x, imageSegment.y, imageSegment.width, imageSegment.height);
    const highlight = await this.createHighlightOverlay(imageArea, 'image', 'main');
    
    return {
      segment: imageSegment,
      highlight: highlight,
      analysis: await this.analyzeImageArea(imageArea)
    };
  }

  async createHighlightOverlay(image, type, name) {
    const width = image.getWidth();
    const height = image.getHeight();
    const highlight = image.clone();
    
    // Apply different highlight colors based on type
    const colors = {
      corner: Jimp.rgbaToInt(255, 0, 0, 128), // Red for corners
      edge: Jimp.rgbaToInt(0, 255, 0, 128), // Green for edges
      center: Jimp.rgbaToInt(0, 0, 255, 128), // Blue for center
      surface: Jimp.rgbaToInt(255, 255, 0, 128), // Yellow for surface
      text: Jimp.rgbaToInt(255, 0, 255, 128), // Magenta for text
      image: Jimp.rgbaToInt(0, 255, 255, 128) // Cyan for image
    };
    
    const color = colors[type] || Jimp.rgbaToInt(128, 128, 128, 128);
    
    // Create highlight overlay
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const pixel = highlight.getPixelColor(x, y);
        const rgba = Jimp.intToRGBA(pixel);
        
        // Apply highlight with transparency
        const highlightR = Math.round((rgba.r + Jimp.intToRGBA(color).r) / 2);
        const highlightG = Math.round((rgba.g + Jimp.intToRGBA(color).g) / 2);
        const highlightB = Math.round((rgba.b + Jimp.intToRGBA(color).b) / 2);
        
        highlight.setPixelColor(Jimp.rgbaToInt(highlightR, highlightG, highlightB, rgba.a), x, y);
      }
    }
    
    // Add border to highlight area
    this.addBorderToHighlight(highlight, color);
    
    return await highlight.getBufferAsync(Jimp.MIME_PNG);
  }

  addBorderToHighlight(image, color) {
    const width = image.getWidth();
    const height = image.getHeight();
    const borderWidth = 3;
    
    // Draw border
    for (let i = 0; i < borderWidth; i++) {
      // Top border
      for (let x = 0; x < width; x++) {
        image.setPixelColor(color, x, i);
      }
      // Bottom border
      for (let x = 0; x < width; x++) {
        image.setPixelColor(color, x, height - 1 - i);
      }
      // Left border
      for (let y = 0; y < height; y++) {
        image.setPixelColor(color, i, y);
      }
      // Right border
      for (let y = 0; y < height; y++) {
        image.setPixelColor(color, width - 1 - i, y);
      }
    }
  }

  async analyzeCorner(cornerImage, cornerName) {
    const width = cornerImage.getWidth();
    const height = cornerImage.getHeight();
    
    let totalWear = 0;
    let pixelCount = 0;
    
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const pixel = cornerImage.getPixelColor(x, y);
        const brightness = Jimp.intToRGBA(pixel).r;
        
        // Analyze corner wear
        if (x < width * 0.3 || y < height * 0.3) {
          totalWear += (255 - brightness);
          pixelCount++;
        }
      }
    }
    
    const averageWear = pixelCount > 0 ? totalWear / pixelCount : 0;
    const severity = Math.min(averageWear / 255, 1);
    
    return {
      corner: cornerName,
      severity: severity,
      condition: severity > 0.7 ? 'Poor' : severity > 0.4 ? 'Fair' : 'Good',
      description: `Corner ${cornerName} analysis completed`
    };
  }

  async analyzeEdge(edgeImage, edgeName) {
    const width = edgeImage.getWidth();
    const height = edgeImage.getHeight();
    
    let totalWear = 0;
    let pixelCount = 0;
    
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const pixel = edgeImage.getPixelColor(x, y);
        const brightness = Jimp.intToRGBA(pixel).r;
        
        totalWear += (255 - brightness);
        pixelCount++;
      }
    }
    
    const averageWear = pixelCount > 0 ? totalWear / pixelCount : 0;
    const severity = Math.min(averageWear / 255, 1);
    
    return {
      edge: edgeName,
      severity: severity,
      condition: severity > 0.7 ? 'Poor' : severity > 0.4 ? 'Fair' : 'Good',
      description: `Edge ${edgeName} analysis completed`
    };
  }

  async analyzeCenter(centerImage) {
    const width = centerImage.getWidth();
    const height = centerImage.getHeight();
    
    let totalBrightness = 0;
    let pixelCount = 0;
    
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const pixel = centerImage.getPixelColor(x, y);
        const brightness = Jimp.intToRGBA(pixel).r;
        
        totalBrightness += brightness;
        pixelCount++;
      }
    }
    
    const averageBrightness = pixelCount > 0 ? totalBrightness / pixelCount : 0;
    
    return {
      averageBrightness: averageBrightness,
      condition: averageBrightness > 200 ? 'Bright' : averageBrightness > 100 ? 'Normal' : 'Dark',
      description: 'Center area analysis completed'
    };
  }

  async analyzeSurface(surfaceImage, segmentName) {
    const width = surfaceImage.getWidth();
    const height = surfaceImage.getHeight();
    
    let textureVariance = 0;
    let pixelCount = 0;
    
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const center = Jimp.intToRGBA(surfaceImage.getPixelColor(x, y)).r;
        const neighbors = [
          Jimp.intToRGBA(surfaceImage.getPixelColor(x - 1, y)).r,
          Jimp.intToRGBA(surfaceImage.getPixelColor(x + 1, y)).r,
          Jimp.intToRGBA(surfaceImage.getPixelColor(x, y - 1)).r,
          Jimp.intToRGBA(surfaceImage.getPixelColor(x, y + 1)).r
        ];
        
        const localVariance = neighbors.reduce((sum, neighbor) => sum + Math.pow(neighbor - center, 2), 0) / 4;
        textureVariance += localVariance;
        pixelCount++;
      }
    }
    
    const averageVariance = pixelCount > 0 ? textureVariance / pixelCount : 0;
    
    return {
      segment: segmentName,
      textureVariance: averageVariance,
      condition: averageVariance > 1000 ? 'Rough' : averageVariance > 500 ? 'Normal' : 'Smooth',
      description: `Surface segment ${segmentName} analysis completed`
    };
  }

  async analyzeTextArea(textImage) {
    const width = textImage.getWidth();
    const height = textImage.getHeight();
    
    let totalContrast = 0;
    let pixelCount = 0;
    
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const center = Jimp.intToRGBA(textImage.getPixelColor(x, y)).r;
        const neighbors = [
          Jimp.intToRGBA(textImage.getPixelColor(x - 1, y)).r,
          Jimp.intToRGBA(textImage.getPixelColor(x + 1, y)).r,
          Jimp.intToRGBA(textImage.getPixelColor(x, y - 1)).r,
          Jimp.intToRGBA(textImage.getPixelColor(x, y + 1)).r
        ];
        
        const maxDiff = Math.max(...neighbors.map(n => Math.abs(n - center)));
        totalContrast += maxDiff;
        pixelCount++;
      }
    }
    
    const averageContrast = pixelCount > 0 ? totalContrast / pixelCount : 0;
    
    return {
      averageContrast: averageContrast,
      readability: averageContrast > 50 ? 'Good' : averageContrast > 25 ? 'Fair' : 'Poor',
      description: 'Text area analysis completed'
    };
  }

  async analyzeImageArea(imageArea) {
    const width = imageArea.getWidth();
    const height = imageArea.getHeight();
    
    let totalSharpness = 0;
    let pixelCount = 0;
    
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const center = Jimp.intToRGBA(imageArea.getPixelColor(x, y)).r;
        const neighbors = [
          Jimp.intToRGBA(imageArea.getPixelColor(x - 1, y)).r,
          Jimp.intToRGBA(imageArea.getPixelColor(x + 1, y)).r,
          Jimp.intToRGBA(imageArea.getPixelColor(x, y - 1)).r,
          Jimp.intToRGBA(imageArea.getPixelColor(x, y + 1)).r
        ];
        
        const laplacian = 4 * center - neighbors.reduce((sum, n) => sum + n, 0);
        totalSharpness += Math.abs(laplacian);
        pixelCount++;
      }
    }
    
    const averageSharpness = pixelCount > 0 ? totalSharpness / pixelCount : 0;
    
    return {
      averageSharpness: averageSharpness,
      quality: averageSharpness > 100 ? 'Sharp' : averageSharpness > 50 ? 'Normal' : 'Blurry',
      description: 'Image area analysis completed'
    };
  }

  async identifyCriticalAreas(image, segments) {
    const criticalAreas = [];
    
    // Analyze corners for critical wear
    for (const [cornerName, segment] of Object.entries(segments.corners)) {
      const cornerImage = image.clone().crop(segment.x, segment.y, segment.width, segment.height);
      const analysis = await this.analyzeCorner(cornerImage, cornerName);
      
      if (analysis.severity > 0.5) {
        criticalAreas.push({
          type: 'corner_wear',
          location: cornerName,
          segment: segment,
          severity: analysis.severity,
          description: `Critical wear detected in ${cornerName} corner`
        });
      }
    }
    
    // Analyze edges for critical wear
    for (const [edgeName, segment] of Object.entries(segments.edges)) {
      const edgeImage = image.clone().crop(segment.x, segment.y, segment.width, segment.height);
      const analysis = await this.analyzeEdge(edgeImage, edgeName);
      
      if (analysis.severity > 0.5) {
        criticalAreas.push({
          type: 'edge_wear',
          location: edgeName,
          segment: segment,
          severity: analysis.severity,
          description: `Critical wear detected on ${edgeName} edge`
        });
      }
    }
    
    // Analyze surface for critical defects
    for (const [segmentName, segment] of Object.entries(segments.surface)) {
      const surfaceImage = image.clone().crop(segment.x, segment.y, segment.width, segment.height);
      const analysis = await this.analyzeSurface(surfaceImage, segmentName);
      
      if (analysis.textureVariance > 1500) {
        criticalAreas.push({
          type: 'surface_damage',
          location: segmentName,
          segment: segment,
          severity: analysis.textureVariance / 2000,
          description: `Surface damage detected in ${segmentName}`
        });
      }
    }
    
    return criticalAreas;
  }

  async generateSegmentationMetadata(image, segments) {
    const width = image.getWidth();
    const height = image.getHeight();
    
    return {
      totalSegments: Object.keys(segments).length,
      segmentTypes: Object.keys(segments),
      imageDimensions: { width, height },
      aspectRatio: width / height,
      segmentCounts: {
        corners: Object.keys(segments.corners).length,
        edges: Object.keys(segments.edges).length,
        surface: Object.keys(segments.surface).length
      }
    };
  }
}

module.exports = ImageSegmentation; 