# PSA Card PreGrader - Pokémon Cards

A professional-grade card analysis tool that estimates PSA grades for Pokémon trading cards using computer vision and machine learning techniques.

## 🚀 Features

- **Advanced Card Analysis**: Analyzes centering, corners, edges, and surface condition
- **State-of-the-Art Defect Detection**: Multi-scale computational photography pipeline
- **PSA Grade Estimation**: Provides accurate grade estimates based on PSA guidelines
- **Probability Scoring**: Calculates the probability of achieving specific grades
- **Market Value Estimation**: Estimates card value based on condition and rarity
- **Professional Recommendations**: Offers specific advice for card improvement
- **Computational Photography**: Advanced image enhancement and quality analysis
- **Beautiful UI**: Modern, responsive interface with drag-and-drop functionality
- **Report Generation**: Download detailed analysis reports

## 📋 Requirements

- Node.js (v14 or higher)
- npm or yarn
- Modern web browser

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd psa-card-grader
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the server**
   ```bash
   npm start
   ```

4. **Open your browser**
   Navigate to `http://localhost:3000`

## 🎯 Usage

### Basic Usage

1. **Upload a Card Image**
   - Drag and drop your Pokémon card image onto the upload area
   - Or click "Choose File" to browse and select an image
   - Supported formats: JPG, PNG, WEBP (Max 10MB)

2. **Wait for Analysis**
   - The system will analyze your card automatically
   - Analysis includes centering, corners, edges, and surface condition

3. **Review Results**
   - View the estimated PSA grade
   - Check individual component scores
   - Read recommendations for improvement
   - See estimated market value

4. **Download Report**
   - Click "Download Report" to save a detailed analysis

### Advanced Features

- **Grade Probability**: See the likelihood of achieving specific grades
- **Component Breakdown**: Detailed scores for each grading criterion
- **Market Value**: Estimated value based on condition and rarity
- **Submission Advice**: Professional guidance on whether to submit for grading
- **Defect Detection**: Advanced computational photography pipeline for flaw identification
- **Image Quality Analysis**: Comprehensive analysis of image artifacts and quality metrics

## 🔍 Analysis Criteria

### Centering (25% weight)
- Measures how well the card image is centered within borders
- Analyzes border consistency on all sides
- Critical for high-grade cards

### Corners (25% weight)
- Examines the condition of all four corners
- Detects wear, damage, and whitening
- Essential for mint condition assessment

### Edges (25% weight)
- Analyzes edge condition and wear
- Detects chipping, whitening, and damage
- Important for overall card integrity

### Surface (25% weight)
- Evaluates surface condition and print quality
- Detects scratches, print defects, and wear
- Critical for visual appeal and value

## 📊 PSA Grading Scale

| Grade | Score Range | Description |
|-------|-------------|-------------|
| Gem Mint | 9.5-10.0 | Perfect card with no visible flaws |
| Mint | 9.0-9.4 | Nearly perfect with only minor flaws |
| Near Mint-Mint | 8.0-8.9 | Excellent condition with minor wear |
| Near Mint | 7.0-7.9 | Very good condition with some wear |
| Excellent-Mint | 6.0-6.9 | Good condition with noticeable wear |
| Excellent | 5.0-5.9 | Above average condition |
| Very Good-Excellent | 4.0-4.9 | Average condition |

## 🔬 Defect Detection & Computational Photography

### Advanced Defect Detection Pipeline

The system employs state-of-the-art computational photography techniques to identify and analyze card defects:

#### **Defect Types Detected**
- **Scratches**: Linear surface damage detection using edge analysis
- **Dents**: Surface depressions identified through morphological analysis
- **Corner Wear**: Corner damage assessment with regional analysis
- **Edge Wear**: Edge condition evaluation across all card edges
- **Surface Damage**: Texture irregularities and surface defects
- **Discoloration**: Color inconsistencies and fading detection
- **Printing Defects**: Print quality and consistency analysis
- **Water Damage**: Water damage patterns and staining detection

#### **Computational Photography Techniques**
- **HDR Processing**: High dynamic range enhancement for better defect visibility
- **Sharpness Enhancement**: Unsharp masking and edge enhancement
- **Noise Reduction**: Bilateral filtering for artifact removal
- **Contrast Enhancement**: CLAHE (Contrast Limited Adaptive Histogram Equalization)
- **Color Correction**: White balance and color accuracy improvement
- **Texture Analysis**: Advanced texture variance and edge density analysis

#### **Quality Metrics**
- **Focus Analysis**: Edge density and sharpness assessment
- **Lighting Analysis**: Exposure and uniformity evaluation
- **Composition Analysis**: Rule of thirds and balance assessment
- **Artifact Detection**: Compression, noise, blur, and JPEG artifact identification

#### **Visualization Features**
- **Defect Highlighting**: Color-coded defect regions on card images
- **Severity Indicators**: Visual severity levels for each defect type
- **Impact Assessment**: Defect impact on overall grade estimation
- **Recommendation Engine**: Professional advice for defect mitigation
| Very Good | 3.0-3.9 | Below average condition |
| Good-Very Good | 2.0-2.9 | Poor condition |
| Good | 1.0-1.9 | Very poor condition |
| Poor | 0.0-0.9 | Severely damaged |

## 🏗️ Technical Architecture

### Backend Components

- **Express Server**: RESTful API with file upload handling
- **Card Analyzer**: Computer vision analysis using Jimp and Canvas
- **PSA Grader**: Grade estimation based on PSA guidelines
- **Text Recognition**: OCR using Tesseract.js for card identification

### Frontend Components

- **Modern UI**: Responsive design with CSS Grid and Flexbox
- **Drag & Drop**: Intuitive file upload interface
- **Real-time Updates**: Dynamic result display with animations
- **Report Generation**: Downloadable analysis reports

### Analysis Pipeline

1. **Image Processing**: Resize and optimize uploaded images
2. **Edge Detection**: Analyze card borders and centering
3. **Corner Analysis**: Examine corner condition and damage
4. **Surface Scanning**: Detect scratches and print defects
5. **Text Recognition**: Extract card information for identification
6. **Grade Calculation**: Apply PSA grading algorithms
7. **Result Generation**: Compile comprehensive analysis report

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
PORT=3000
NODE_ENV=development
```

### Customization

- **Grading Weights**: Modify weights in `src/grader.js`
- **Analysis Parameters**: Adjust detection sensitivity in `src/analyzer.js`
- **UI Styling**: Customize appearance in `public/styles.css`

## 📈 Performance

- **Analysis Time**: 5-15 seconds per card (depending on image quality)
- **Accuracy**: High correlation with professional PSA grading
- **Scalability**: Handles multiple concurrent users
- **Memory Usage**: Optimized for efficient processing

## 🛡️ Security

- **File Validation**: Strict file type and size checking
- **Input Sanitization**: All user inputs are validated
- **Error Handling**: Comprehensive error management
- **Secure Uploads**: Temporary file storage with automatic cleanup

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## ⚠️ Disclaimer

This tool provides estimates based on computer vision analysis and should not replace professional PSA grading. Always consult with professional graders for official assessments.

## 🆘 Support

For support and questions:
- Create an issue on GitHub
- Check the documentation
- Review the troubleshooting guide

## 🔄 Updates

Stay updated with the latest features and improvements:
- Follow the repository for updates
- Check the changelog for version history
- Subscribe to release notifications

---

**Built with ❤️ for the Pokémon card collecting community** 