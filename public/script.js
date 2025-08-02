// Global variables
let currentAnalysis = null;
let currentGrading = null;
let currentCardImage = null;

// DOM elements
const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');
const uploadSection = document.getElementById('uploadSection');
const analysisSection = document.getElementById('analysisSection');
const resultsSection = document.getElementById('resultsSection');
const loadingSpinner = document.getElementById('loadingSpinner');
const analysisContent = document.getElementById('analysisContent');

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeUploadArea();
    initializeFileInput();
});

// Initialize drag and drop functionality
function initializeUploadArea() {
    uploadArea.addEventListener('dragover', handleDragOver);
    uploadArea.addEventListener('dragleave', handleDragLeave);
    uploadArea.addEventListener('drop', handleDrop);
    uploadArea.addEventListener('click', () => fileInput.click());
}

// Initialize file input
function initializeFileInput() {
    fileInput.addEventListener('change', handleFileSelect);
}

// Drag and drop handlers
function handleDragOver(e) {
    e.preventDefault();
    uploadArea.classList.add('dragover');
}

function handleDragLeave(e) {
    e.preventDefault();
    uploadArea.classList.remove('dragover');
}

function handleDrop(e) {
    e.preventDefault();
    uploadArea.classList.remove('dragover');
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        handleFile(files[0]);
    }
}

function handleFileSelect(e) {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
        if (files.length === 1) {
            handleFile(files[0]);
        } else {
            handleMultipleFiles(files);
        }
    }
}

// Handle file upload
function handleFile(file) {
    // Validate file type
    if (!file.type.startsWith('image/')) {
        showError('Please select a valid image file.');
        return;
    }
    
    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
        showError('File size must be less than 10MB.');
        return;
    }
    
    // Show preview and start analysis
    showFilePreview(file);
    startAnalysis(file);
}

// Handle multiple files
function handleMultipleFiles(files) {
    if (files.length === 0) return;
    
    // For now, analyze the first file (front image)
    const frontImage = files[0];
    handleFile(frontImage);
    
    if (files.length > 1) {
        // Show message about back image being available
        setTimeout(() => {
            showSuccess('Front image uploaded! Back image analysis will be added in future updates.');
        }, 1000);
    }
}

// Show file preview
function showFilePreview(file) {
    const reader = new FileReader();
    reader.onload = function(e) {
        uploadArea.innerHTML = `
            <div class="upload-preview">
                <img src="${e.target.result}" alt="Card preview" style="max-width: 200px; max-height: 200px; border-radius: 10px;">
                <p>${file.name}</p>
            </div>
        `;
        currentCardImage = e.target.result; // Store the current card image
    };
    reader.readAsDataURL(file);
}

// Start analysis process
function startAnalysis(file) {
    // Show analysis section
    uploadSection.style.display = 'none';
    analysisSection.style.display = 'block';
    resultsSection.style.display = 'none';
    
    // Show loading spinner
    loadingSpinner.style.display = 'flex';
    analysisContent.style.display = 'none';
    
    // Create FormData and send to server
    const formData = new FormData();
    formData.append('cardImage', file);
    
    fetch('/api/analyze', {
        method: 'POST',
        body: formData
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        currentAnalysis = data.analysis;
        currentGrading = data.grading;
        displayResults(data);
    })
    .catch(error => {
        console.error('Error:', error);
        showError('Failed to analyze card. Please try again.');
        resetUploadArea();
    });
}

// Display analysis results
function displayResults(data) {
    // Hide loading spinner
    loadingSpinner.style.display = 'none';
    
    // Show results section
    analysisSection.style.display = 'none';
    resultsSection.style.display = 'block';
    
    // Update grade display
    updateGradeDisplay(data.grading);
    
    // Update metrics
    updateMetrics(data.grading);
    
    // Update probability
    updateProbability(data.grading);
    
    // Update recommendations
    updateRecommendations(data.grading);
    
    // Update market value
    updateMarketValue(data.grading);
    
    // Update defect detection results
    if (data.defects) {
        updateDefectDetection(data.defects);
    }
    
    // Update computational photography analysis
    if (data.enhanced) {
        updateComputationalPhotography(data.enhanced);
    }
    
    // Update image segmentation and highlights
    if (data.segmentation) {
        updateImageSegmentation(data.segmentation);
    }
    
    // Add fade-in animation
    resultsSection.classList.add('fade-in');
}

// Update grade display
function updateGradeDisplay(grading) {
    const gradeNumber = document.getElementById('gradeNumber');
    const gradeLabel = document.getElementById('gradeLabel');
    const gradeTitle = document.getElementById('gradeTitle');
    const gradeDescription = document.getElementById('gradeDescription');
    
    // Extract numeric grade from overall grade
    const gradeMatch = grading.overallGrade.match(/(\d+(?:\.\d+)?)/);
    const numericGrade = gradeMatch ? gradeMatch[1] : '--';
    
    gradeNumber.textContent = numericGrade;
    gradeLabel.textContent = grading.overallGrade;
    gradeTitle.textContent = `Estimated Grade: ${grading.overallGrade}`;
    gradeDescription.textContent = `Overall Score: ${grading.overallScore}/10`;
    
    // Update grade circle color based on grade
    const gradeCircle = document.getElementById('gradeCircle');
    gradeCircle.style.background = getGradeColor(grading.overallGrade);
}

// Update metrics display
function updateMetrics(grading) {
    // Centering
    document.getElementById('centeringScore').textContent = grading.breakdown.centering.score.toFixed(1);
    document.getElementById('centeringGrade').textContent = grading.breakdown.centering.grade;
    
    // Corners
    document.getElementById('cornersScore').textContent = grading.breakdown.corners.score.toFixed(1);
    document.getElementById('cornersGrade').textContent = grading.breakdown.corners.grade;
    
    // Edges
    document.getElementById('edgesScore').textContent = grading.breakdown.edges.score.toFixed(1);
    document.getElementById('edgesGrade').textContent = grading.breakdown.edges.grade;
    
    // Surface
    document.getElementById('surfaceScore').textContent = grading.breakdown.surface.score.toFixed(1);
    document.getElementById('surfaceGrade').textContent = grading.breakdown.surface.grade;
}

// Update probability display
function updateProbability(grading) {
    const probabilityFill = document.getElementById('probabilityFill');
    const probabilityText = document.getElementById('probabilityText');
    
    const probability = Math.round(grading.probability * 100);
    probabilityFill.style.width = `${probability}%`;
    probabilityText.textContent = `${probability}%`;
}

// Update recommendations
function updateRecommendations(grading) {
    const recommendationsList = document.getElementById('recommendationsList');
    recommendationsList.innerHTML = '';
    
    if (grading.recommendations && grading.recommendations.length > 0) {
        grading.recommendations.forEach(rec => {
            const recElement = document.createElement('div');
            recElement.className = 'recommendation-item';
            recElement.innerHTML = `
                <div class="recommendation-category">${rec.category}</div>
                <div class="recommendation-issue">${rec.issue}</div>
                <div class="recommendation-suggestion">${rec.suggestion}</div>
            `;
            recommendationsList.appendChild(recElement);
        });
    } else {
        recommendationsList.innerHTML = '<p>No specific recommendations at this time.</p>';
    }
}

// Update market value
function updateMarketValue(grading) {
    const marketValue = document.getElementById('marketValue');
    marketValue.textContent = `$${grading.marketValue.toLocaleString()}`;
}

// Update defect detection results
function updateDefectDetection(defects) {
    const defectSection = document.getElementById('defectSection');
    if (!defectSection) return;
    
    defectSection.innerHTML = '';
    
    // Overall defect score
    const overallScore = document.createElement('div');
    overallScore.className = 'defect-overall';
    overallScore.innerHTML = `
        <h3>Defect Analysis</h3>
        <div class="defect-score">
            <span class="score-label">Overall Defect Score:</span>
            <span class="score-value ${defects.overall.score > 0.5 ? 'high' : defects.overall.score > 0.2 ? 'medium' : 'low'}">
                ${(defects.overall.score * 100).toFixed(1)}%
            </span>
        </div>
    `;
    defectSection.appendChild(overallScore);
    
    // Individual defects
    if (defects.details && defects.details.length > 0) {
        const defectsList = document.createElement('div');
        defectsList.className = 'defects-list';
        
        defects.details.forEach(defect => {
            if (defect.severity > 0.1) { // Only show significant defects
                const defectItem = document.createElement('div');
                defectItem.className = 'defect-item';
                defectItem.innerHTML = `
                    <div class="defect-header">
                        <span class="defect-type">${defect.type.replace(/_/g, ' ').toUpperCase()}</span>
                        <span class="defect-severity ${defect.severity > 0.7 ? 'high' : defect.severity > 0.4 ? 'medium' : 'low'}">
                            ${(defect.severity * 100).toFixed(1)}%
                        </span>
                    </div>
                    <div class="defect-description">${defect.description}</div>
                    <div class="defect-impact">Impact: ${defect.impact}</div>
                `;
                defectsList.appendChild(defectItem);
            }
        });
        
        defectSection.appendChild(defectsList);
    }
    
    // Recommendations
    if (defects.recommendations && defects.recommendations.length > 0) {
        const recommendationsDiv = document.createElement('div');
        recommendationsDiv.className = 'defect-recommendations';
        recommendationsDiv.innerHTML = '<h4>Defect Recommendations:</h4>';
        
        defects.recommendations.forEach(rec => {
            const recItem = document.createElement('div');
            recItem.className = `recommendation-item ${rec.priority.toLowerCase()}`;
            recItem.innerHTML = `
                <div class="rec-priority">${rec.priority}</div>
                <div class="rec-type">${rec.type.replace(/_/g, ' ')}</div>
                <div class="rec-text">${rec.recommendation}</div>
            `;
            recommendationsDiv.appendChild(recItem);
        });
        
        defectSection.appendChild(recommendationsDiv);
    }
}

// Update computational photography analysis
function updateComputationalPhotography(enhanced) {
    const photoSection = document.getElementById('photoSection');
    if (!photoSection) return;
    
    photoSection.innerHTML = '';
    
    // Image quality metrics
    const qualityMetrics = document.createElement('div');
    qualityMetrics.className = 'photo-quality';
    qualityMetrics.innerHTML = `
        <h3>Computational Photography Analysis</h3>
        <div class="quality-metrics">
            <div class="metric">
                <span class="metric-label">Sharpness:</span>
                <span class="metric-value">${enhanced.analysis?.focus?.quality || 'Unknown'}</span>
            </div>
            <div class="metric">
                <span class="metric-label">Lighting:</span>
                <span class="metric-value">${enhanced.analysis?.lighting?.exposure || 'Unknown'}</span>
            </div>
            <div class="metric">
                <span class="metric-label">Composition:</span>
                <span class="metric-value">${enhanced.analysis?.composition?.balance?.quality || 'Unknown'}</span>
            </div>
            <div class="metric">
                <span class="metric-label">Image Quality:</span>
                <span class="metric-value">${enhanced.metadata?.qualityMetrics?.qualityScore ? 
                    (enhanced.metadata.qualityMetrics.qualityScore * 100).toFixed(1) + '%' : 'Unknown'}</span>
            </div>
        </div>
    `;
    photoSection.appendChild(qualityMetrics);
    
    // Artifact detection
    if (enhanced.analysis?.artifacts) {
        const artifactsDiv = document.createElement('div');
        artifactsDiv.className = 'artifacts-detection';
        artifactsDiv.innerHTML = '<h4>Image Artifacts:</h4>';
        
        const artifacts = enhanced.analysis.artifacts;
        const artifactTypes = ['compression', 'noise', 'blur', 'jpeg'];
        
        artifactTypes.forEach(type => {
            if (artifacts[type]) {
                const artifactItem = document.createElement('div');
                artifactItem.className = 'artifact-item';
                artifactItem.innerHTML = `
                    <span class="artifact-type">${type.charAt(0).toUpperCase() + type.slice(1)}:</span>
                    <span class="artifact-severity ${artifacts[type].severity?.toLowerCase() || 'unknown'}">
                        ${artifacts[type].severity || 'Unknown'}
                    </span>
                `;
                artifactsDiv.appendChild(artifactItem);
            }
        });
        
        photoSection.appendChild(artifactsDiv);
    }
    
    // Texture analysis
    if (enhanced.metadata?.textureStats) {
        const textureDiv = document.createElement('div');
        textureDiv.className = 'texture-analysis';
        textureDiv.innerHTML = `
            <h4>Texture Analysis:</h4>
            <div class="texture-metrics">
                <div class="texture-metric">
                    <span>Variance:</span>
                    <span>${enhanced.metadata.textureStats.textureVariance?.toFixed(3) || 'N/A'}</span>
                </div>
                <div class="texture-metric">
                    <span>Edge Density:</span>
                    <span>${enhanced.metadata.textureStats.edgeDensity?.toFixed(3) || 'N/A'}</span>
                </div>
                <div class="texture-metric">
                    <span>Smoothness:</span>
                    <span>${enhanced.metadata.textureStats.smoothness?.toFixed(3) || 'N/A'}</span>
                </div>
            </div>
        `;
        photoSection.appendChild(textureDiv);
    }
}

// Update image segmentation and highlights
function updateImageSegmentation(segmentation) {
    const segmentationSection = document.getElementById('segmentationSection');
    if (!segmentationSection) return;
    
    segmentationSection.innerHTML = '';
    
    // Create segmentation overview
    const overview = document.createElement('div');
    overview.className = 'segmentation-overview';
    overview.innerHTML = `
        <h3>Image Segmentation Analysis</h3>
        <div class="segmentation-stats">
            <div class="stat">
                <span class="stat-label">Image Size:</span>
                <span class="stat-value">${segmentation.dimensions.width} × ${segmentation.dimensions.height}</span>
            </div>
            <div class="stat">
                <span class="stat-label">Critical Areas:</span>
                <span class="stat-value">${segmentation.criticalAreas.length}</span>
            </div>
            <div class="stat">
                <span class="stat-label">Segments Analyzed:</span>
                <span class="stat-value">${segmentation.metadata.totalSegments}</span>
            </div>
        </div>
        <div class="original-image-container">
            <h4>Original Card Image:</h4>
            <img src="${currentCardImage}" alt="Original card" class="original-card-image">
        </div>
    `;
    segmentationSection.appendChild(overview);
    
    // Display critical areas
    if (segmentation.criticalAreas && segmentation.criticalAreas.length > 0) {
        const criticalAreasDiv = document.createElement('div');
        criticalAreasDiv.className = 'critical-areas';
        criticalAreasDiv.innerHTML = '<h4>Critical Areas Detected:</h4>';
        
        segmentation.criticalAreas.forEach((area, index) => {
            const areaItem = document.createElement('div');
            areaItem.className = 'critical-area-item';
            areaItem.innerHTML = `
                <div class="area-header">
                    <span class="area-type">${area.type.replace(/_/g, ' ').toUpperCase()}</span>
                    <span class="area-location">${area.location}</span>
                    <span class="area-severity ${area.severity > 0.7 ? 'high' : area.severity > 0.4 ? 'medium' : 'low'}">
                        ${(area.severity * 100).toFixed(1)}%
                    </span>
                </div>
                <div class="area-description">${area.description}</div>
                <div class="area-coordinates">
                    Position: (${area.segment.x}, ${area.segment.y}) 
                    Size: ${area.segment.width} × ${area.segment.height}
                </div>
            `;
            criticalAreasDiv.appendChild(areaItem);
        });
        
        segmentationSection.appendChild(criticalAreasDiv);
    }
    
    // Display segment highlights with images
    const highlightsDiv = document.createElement('div');
    highlightsDiv.className = 'segment-highlights';
    highlightsDiv.innerHTML = '<h4>Segment Analysis with Visual Highlights:</h4>';
    
    // Corner highlights with images
    if (segmentation.highlights.corners && segmentation.highlights.corners.length > 0) {
        const cornersDiv = document.createElement('div');
        cornersDiv.className = 'highlight-group';
        cornersDiv.innerHTML = `
            <div class="highlight-title">
                <i class="fas fa-square"></i>
                <span>Corner Analysis</span>
            </div>
            <div class="highlight-images">
                ${segmentation.highlights.corners.map(corner => {
                    const imageData = segmentation.highlightImages?.corners?.[corner];
                    return imageData ? 
                        `<div class="highlight-image-container">
                            <img src="data:image/png;base64,${imageData}" alt="${corner} highlight" class="highlight-image">
                            <div class="highlight-label">${corner.replace(/([A-Z])/g, ' $1').trim()}</div>
                        </div>` : '';
                }).join('')}
            </div>
        `;
        highlightsDiv.appendChild(cornersDiv);
    }
    
    // Edge highlights with images
    if (segmentation.highlights.edges && segmentation.highlights.edges.length > 0) {
        const edgesDiv = document.createElement('div');
        edgesDiv.className = 'highlight-group';
        edgesDiv.innerHTML = `
            <div class="highlight-title">
                <i class="fas fa-border-all"></i>
                <span>Edge Analysis</span>
            </div>
            <div class="highlight-images">
                ${segmentation.highlights.edges.map(edge => {
                    const imageData = segmentation.highlightImages?.edges?.[edge];
                    return imageData ? 
                        `<div class="highlight-image-container">
                            <img src="data:image/png;base64,${imageData}" alt="${edge} highlight" class="highlight-image">
                            <div class="highlight-label">${edge.charAt(0).toUpperCase() + edge.slice(1)}</div>
                        </div>` : '';
                }).join('')}
            </div>
        `;
        highlightsDiv.appendChild(edgesDiv);
    }
    
    // Center highlight with image
    if (segmentation.highlights.center) {
        const centerDiv = document.createElement('div');
        centerDiv.className = 'highlight-group';
        const centerImageData = segmentation.highlightImages?.center;
        centerDiv.innerHTML = `
            <div class="highlight-title">
                <i class="fas fa-crosshairs"></i>
                <span>Center Analysis</span>
            </div>
            <div class="highlight-images">
                ${centerImageData ? 
                    `<div class="highlight-image-container">
                        <img src="data:image/png;base64,${centerImageData}" alt="center highlight" class="highlight-image">
                        <div class="highlight-label">Main Image Area</div>
                    </div>` : '<span class="highlight-item center">Main Image Area</span>'
                }
            </div>
        `;
        highlightsDiv.appendChild(centerDiv);
    }
    
    // Surface highlights with images
    if (segmentation.highlights.surface && segmentation.highlights.surface.length > 0) {
        const surfaceDiv = document.createElement('div');
        surfaceDiv.className = 'highlight-group';
        surfaceDiv.innerHTML = `
            <div class="highlight-title">
                <i class="fas fa-eye"></i>
                <span>Surface Analysis</span>
            </div>
            <div class="highlight-images">
                ${segmentation.highlights.surface.map(surface => {
                    const imageData = segmentation.highlightImages?.surface?.[surface];
                    return imageData ? 
                        `<div class="highlight-image-container">
                            <img src="data:image/png;base64,${imageData}" alt="${surface} highlight" class="highlight-image">
                            <div class="highlight-label">${surface.replace(/_/g, ' ')}</div>
                        </div>` : '';
                }).join('')}
            </div>
        `;
        highlightsDiv.appendChild(surfaceDiv);
    }
    
    segmentationSection.appendChild(highlightsDiv);
}

// Get grade color
function getGradeColor(grade) {
    const colors = {
        'Gem Mint': 'linear-gradient(135deg, #ffd700 0%, #ffed4e 100%)',
        'Mint': 'linear-gradient(135deg, #38a169 0%, #48bb78 100%)',
        'Near Mint-Mint': 'linear-gradient(135deg, #3182ce 0%, #4299e1 100%)',
        'Near Mint': 'linear-gradient(135deg, #805ad5 0%, #9f7aea 100%)',
        'Excellent-Mint': 'linear-gradient(135deg, #d69e2e 0%, #ecc94b 100%)',
        'Excellent': 'linear-gradient(135deg, #dd6b20 0%, #ed8936 100%)',
        'Very Good-Excellent': 'linear-gradient(135deg, #c53030 0%, #e53e3e 100%)',
        'Very Good': 'linear-gradient(135deg, #97266d 0%, #b83280 100%)',
        'Good-Very Good': 'linear-gradient(135deg, #744210 0%, #975a16 100%)',
        'Good': 'linear-gradient(135deg, #521b41 0%, #702459 100%)',
        'Poor': 'linear-gradient(135deg, #2d3748 0%, #4a5568 100%)'
    };
    
    return colors[grade] || colors['Poor'];
}

// Analyze new card
function analyzeNewCard() {
    resetUploadArea();
    uploadSection.style.display = 'block';
    analysisSection.style.display = 'none';
    resultsSection.style.display = 'none';
    resultsSection.classList.remove('fade-in');
}

// Download report
function downloadReport() {
    if (!currentAnalysis || !currentGrading) {
        showError('No analysis data available for download.');
        return;
    }
    
    const report = generateReport();
    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `psa-card-report-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Generate report
function generateReport() {
    const report = `PSA Card PreGrader Report
Generated: ${new Date().toLocaleString()}

OVERALL GRADE: ${currentGrading.overallGrade}
Overall Score: ${currentGrading.overallScore}/10
Probability: ${Math.round(currentGrading.probability * 100)}%
Confidence: ${Math.round(currentGrading.confidence * 100)}%

DETAILED BREAKDOWN:
Centering: ${currentGrading.breakdown.centering.score}/10 (${currentGrading.breakdown.centering.grade})
Corners: ${currentGrading.breakdown.corners.score}/10 (${currentGrading.breakdown.corners.grade})
Edges: ${currentGrading.breakdown.edges.score}/10 (${currentGrading.breakdown.edges.grade})
Surface: ${currentGrading.breakdown.surface.score}/10 (${currentGrading.breakdown.surface.grade})

RECOMMENDATIONS:
${currentGrading.recommendations.map(rec => 
    `${rec.category}: ${rec.issue} - ${rec.suggestion}`
).join('\n')}

MARKET VALUE ESTIMATE: $${currentGrading.marketValue.toLocaleString()}

SUBMISSION ADVICE:
${currentGrading.submissionAdvice.map(advice => 
    `${advice.type}: ${advice.message}`
).join('\n')}

---
This report is generated by PSA Card PreGrader for informational purposes only.
Professional grading by PSA is recommended for accurate assessment.
`;
    
    return report;
}

// Reset upload area
function resetUploadArea() {
    uploadArea.innerHTML = `
        <div class="upload-icon">
            <i class="fas fa-cloud-upload-alt"></i>
        </div>
        <h3>Upload Your Pokémon Card</h3>
        <p>Drag and drop your card image here or click to browse</p>
        <p class="upload-hint">Supports JPG, PNG, WEBP (Max 10MB)</p>
        <input type="file" id="fileInput" accept="image/*" hidden>
        <button class="upload-btn" onclick="document.getElementById('fileInput').click()">
            Choose File
        </button>
    `;
    
    // Re-initialize event listeners
    initializeUploadArea();
    initializeFileInput();
}

// Show error message
function showError(message) {
    // Create error notification
    const notification = document.createElement('div');
    notification.className = 'error-notification';
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #e53e3e;
        color: white;
        padding: 15px 20px;
        border-radius: 10px;
        box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
        z-index: 1000;
        animation: slideIn 0.3s ease-out;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Remove notification after 5 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 5000);
}

// Show success message
function showSuccess(message) {
    // Create success notification
    const notification = document.createElement('div');
    notification.className = 'success-notification';
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #38a169;
        color: white;
        padding: 15px 20px;
        border-radius: 10px;
        box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
        z-index: 1000;
        animation: slideIn 0.3s ease-out;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Remove notification after 5 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 5000);
}

// Add CSS animations for notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);

// Health check on page load
window.addEventListener('load', function() {
    fetch('/api/health')
        .then(response => response.json())
        .then(data => {
            console.log('Server health:', data);
        })
        .catch(error => {
            console.error('Server health check failed:', error);
        });
}); 