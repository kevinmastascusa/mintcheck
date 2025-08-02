const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const CardAnalyzer = require('./src/analyzer');
const PSAGrader = require('./src/grader');
const DefectDetector = require('./src/defectDetector');
const ComputationalPhotography = require('./src/computationalPhotography');
const ImageSegmentation = require('./src/imageSegmentation');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}-${file.originalname}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  }
});

// Initialize analyzers
const cardAnalyzer = new CardAnalyzer();
const psaGrader = new PSAGrader();
const defectDetector = new DefectDetector();
const computationalPhotography = new ComputationalPhotography();
const imageSegmentation = new ImageSegmentation();

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Upload and analyze card
app.post('/api/analyze', upload.single('cardImage'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    const imagePath = req.file.path;
    console.log(`Analyzing card image: ${imagePath}`);

                    // Apply computational photography enhancement
                const enhanced = await computationalPhotography.enhanceImage(imagePath);

                // Analyze the card
                const analysis = await cardAnalyzer.analyzeCard(imagePath);

                // Detect defects and flaws
                const defects = await defectDetector.detectDefects(imagePath);

                // Perform image segmentation and highlights
                const segmentation = await imageSegmentation.segmentCard(imagePath);

                // Grade the card based on PSA guidelines
                const grading = await psaGrader.gradeCard(analysis);
    
    // Clean up uploaded file
    fs.unlinkSync(imagePath);

                    // Optimize response data to prevent JSON size issues
                const optimizedDefects = {
                  overall: defects.overall,
                  details: defects.details.slice(0, 10), // Limit to top 10 defects
                  recommendations: defects.recommendations.slice(0, 5) // Limit to top 5 recommendations
                };

                const optimizedEnhanced = {
                  metadata: {
                    dimensions: enhanced.metadata?.dimensions,
                    qualityMetrics: enhanced.metadata?.qualityMetrics
                  },
                  analysis: {
                    focus: enhanced.analysis?.focus,
                    lighting: enhanced.analysis?.lighting,
                    artifacts: enhanced.analysis?.artifacts
                  }
                };

                // Optimize segmentation data and include image data
                const optimizedSegmentation = {
                  dimensions: segmentation.dimensions,
                  criticalAreas: segmentation.criticalAreas.slice(0, 10), // Limit to top 10 critical areas
                  metadata: segmentation.metadata,
                  highlights: {
                    corners: Object.keys(segmentation.highlights.corners).slice(0, 4),
                    edges: Object.keys(segmentation.highlights.edges).slice(0, 4),
                    center: segmentation.highlights.center ? true : false,
                    surface: Object.keys(segmentation.highlights.surface).slice(0, 6)
                  },
                  // Include base64 encoded highlight images
                  highlightImages: {
                    corners: {},
                    edges: {},
                    center: null,
                    surface: {}
                  }
                };

                // Convert highlight images to base64 for frontend display
                if (segmentation.highlights.corners) {
                  for (const [cornerName, cornerData] of Object.entries(segmentation.highlights.corners)) {
                    if (cornerData.highlight) {
                      optimizedSegmentation.highlightImages.corners[cornerName] = cornerData.highlight.toString('base64');
                    }
                  }
                }

                if (segmentation.highlights.edges) {
                  for (const [edgeName, edgeData] of Object.entries(segmentation.highlights.edges)) {
                    if (edgeData.highlight) {
                      optimizedSegmentation.highlightImages.edges[edgeName] = edgeData.highlight.toString('base64');
                    }
                  }
                }

                if (segmentation.highlights.center && segmentation.highlights.center.highlight) {
                  optimizedSegmentation.highlightImages.center = segmentation.highlights.center.highlight.toString('base64');
                }

                if (segmentation.highlights.surface) {
                  for (const [surfaceName, surfaceData] of Object.entries(segmentation.highlights.surface)) {
                    if (surfaceData.highlight) {
                      optimizedSegmentation.highlightImages.surface[surfaceName] = surfaceData.highlight.toString('base64');
                    }
                  }
                }

                res.json({
                  success: true,
                  analysis,
                  grading,
                  defects: optimizedDefects,
                  enhanced: optimizedEnhanced,
                  segmentation: optimizedSegmentation,
                  timestamp: new Date().toISOString()
                });

  } catch (error) {
    console.error('Error analyzing card:', error);
    res.status(500).json({ 
      error: 'Failed to analyze card',
      details: error.message 
    });
  }
});

// Get PSA grading guidelines
app.get('/api/guidelines', (req, res) => {
  res.json({
    guidelines: psaGrader.getGuidelines()
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Server error:', error);
  res.status(500).json({ 
    error: 'Internal server error',
    message: error.message 
  });
});

app.listen(PORT, () => {
  console.log(`🚀 PSA Card PreGrader server running on port ${PORT}`);
  console.log(`📱 Open http://localhost:${PORT} to use the application`);
}); 