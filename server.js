const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const CardAnalyzer = require('./src/analyzer');
const PSAGrader = require('./src/grader');

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

    // Analyze the card
    const analysis = await cardAnalyzer.analyzeCard(imagePath);
    
    // Grade the card based on PSA guidelines
    const grading = await psaGrader.gradeCard(analysis);
    
    // Clean up uploaded file
    fs.unlinkSync(imagePath);

    res.json({
      success: true,
      analysis,
      grading,
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