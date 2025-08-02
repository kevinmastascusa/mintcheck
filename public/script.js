// Global variables
let currentAnalysis = null;
let currentGrading = null;
let currentCardImage = null;
let frontImage = null;
let backImage = null;

// DOM elements
const uploadSection = document.getElementById('uploadSection');
const analysisSection = document.getElementById('analysisSection');
const resultsSection = document.getElementById('resultsSection');
const loadingSpinner = document.getElementById('loadingSpinner');
const analysisContent = document.getElementById('analysisContent');
const imagePreviews = document.getElementById('imagePreviews');
const analyzeBtn = document.getElementById('analyzeBtn');

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeUploadAreas();
    initializeFileInputs();
    
    // Add click event listener to analyze button
    analyzeBtn.addEventListener('click', startAnalysis);
});

// Initialize upload areas
function initializeUploadAreas() {
    const frontUploadArea = document.getElementById('frontUploadArea');
    const backUploadArea = document.getElementById('backUploadArea');

    // Front upload area drag and drop
    frontUploadArea.addEventListener('dragover', handleDragOver);
    frontUploadArea.addEventListener('dragleave', handleDragLeave);
    frontUploadArea.addEventListener('drop', (e) => handleDrop(e, 'front'));

    // Back upload area drag and drop
    backUploadArea.addEventListener('dragover', handleDragOver);
    backUploadArea.addEventListener('dragleave', handleDragLeave);
    backUploadArea.addEventListener('drop', (e) => handleDrop(e, 'back'));
}

// Initialize file inputs
function initializeFileInputs() {
    const frontImageInput = document.getElementById('frontImageInput');
    const backImageInput = document.getElementById('backImageInput');

    frontImageInput.addEventListener('change', (e) => handleFileSelect(e, 'front'));
    backImageInput.addEventListener('change', (e) => handleFileSelect(e, 'back'));
}

// Handle drag over
function handleDragOver(e) {
    e.preventDefault();
    e.currentTarget.classList.add('dragover');
}

// Handle drag leave
function handleDragLeave(e) {
    e.preventDefault();
    e.currentTarget.classList.remove('dragover');
}

// Handle drop
function handleDrop(e, type) {
    e.preventDefault();
    e.currentTarget.classList.remove('dragover');
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        handleFile(files[0], type);
    }
}

// Handle file selection
function handleFileSelect(e, type) {
    const files = e.target.files;
    if (files.length > 0) {
        handleFile(files[0], type);
    }
}

// Handle file upload
function handleFile(file, type) {
    if (!file.type.startsWith('image/')) {
        showError('Please select an image file.');
        return;
    }

    if (file.size > 10 * 1024 * 1024) {
        showError('File size must be less than 10MB.');
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        if (type === 'front') {
            frontImage = file;
            updateUploadStatus('front', file.name);
            updatePreview('front', e.target.result);
        } else if (type === 'back') {
            backImage = file;
            updateUploadStatus('back', file.name);
            updatePreview('back', e.target.result);
        }
        
        checkAnalysisReadiness();
    };
    reader.readAsDataURL(file);
}

// Update upload status
function updateUploadStatus(type, fileName) {
    const statusElement = document.getElementById(`${type}Status`);
    const statusText = statusElement.querySelector('.status-text');
    statusText.textContent = fileName;
    statusElement.style.background = 'rgba(56, 161, 105, 0.2)';
    statusText.style.color = '#38a169';
}

// Update preview
function updatePreview(type, imageData) {
    const previewElement = document.getElementById(`${type}Preview`);
    const placeholder = previewElement.querySelector('.preview-placeholder');
    
    placeholder.innerHTML = `<img src="${imageData}" alt="${type} preview" class="preview-image">`;
    
    // Show previews section
    imagePreviews.style.display = 'block';
}

// Check if ready for analysis
function checkAnalysisReadiness() {
    if (frontImage) {
        analyzeBtn.disabled = false;
        analyzeBtn.textContent = 'Start Analysis';
    } else {
        analyzeBtn.disabled = true;
        analyzeBtn.textContent = 'Upload Front Image First';
    }
}

// Reset uploads
function resetUploads() {
    frontImage = null;
    backImage = null;
    
    // Reset status
    document.getElementById('frontStatus').querySelector('.status-text').textContent = 'No image selected';
    document.getElementById('backStatus').querySelector('.status-text').textContent = 'No image selected';
    document.getElementById('frontStatus').style.background = '';
    document.getElementById('backStatus').style.background = '';
    document.getElementById('frontStatus').querySelector('.status-text').style.color = '';
    document.getElementById('backStatus').querySelector('.status-text').style.color = '';
    
    // Reset previews
    document.getElementById('frontPreview').querySelector('.preview-placeholder').innerHTML = `
        <i class="fas fa-camera"></i>
        <p>No front image selected</p>
    `;
    document.getElementById('backPreview').querySelector('.preview-placeholder').innerHTML = `
        <i class="fas fa-image"></i>
        <p>No back image selected</p>
    `;
    
    // Hide previews
    imagePreviews.style.display = 'none';
    
    // Reset button
    analyzeBtn.disabled = true;
    analyzeBtn.textContent = 'Upload Front Image First';
}

// Start analysis with high-tech effects
function startAnalysis() {
    if (!frontImage) {
        showError('Please upload a front image first.');
        return;
    }

    // Add button animation
    const analyzeBtn = document.getElementById('analyzeBtn');
    analyzeBtn.style.transform = 'scale(0.95)';
    analyzeBtn.style.animation = 'pulse 0.5s ease-in-out';
    
    setTimeout(() => {
        analyzeBtn.style.transform = 'scale(1)';
        analyzeBtn.style.animation = '';
    }, 500);

    // Show analysis section with fade effect
    uploadSection.style.opacity = '0';
    uploadSection.style.transform = 'translateY(-20px)';
    uploadSection.style.transition = 'all 0.5s ease-in-out';
    
    setTimeout(() => {
        uploadSection.style.display = 'none';
        analysisSection.style.display = 'block';
        analysisSection.style.opacity = '0';
        analysisSection.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            analysisSection.style.opacity = '1';
            analysisSection.style.transform = 'translateY(0)';
            analysisSection.style.transition = 'all 0.5s ease-in-out';
        }, 100);
    }, 500);
    
    resultsSection.style.display = 'none';
    
    // Show loading spinner with holographic effect
    loadingSpinner.style.display = 'flex';
    loadingSpinner.style.opacity = '0';
    loadingSpinner.style.transform = 'scale(0.8)';
    
    setTimeout(() => {
        loadingSpinner.style.opacity = '1';
        loadingSpinner.style.transform = 'scale(1)';
        loadingSpinner.style.transition = 'all 0.5s ease-in-out';
    }, 600);
    
    analysisContent.style.display = 'none';
    
    // Create FormData and send to server
    const formData = new FormData();
    formData.append('frontImage', frontImage);
    if (backImage) {
        formData.append('backImage', backImage);
    }
    
    // Start high-tech progress simulation
    setTimeout(() => {
        simulateProgress();
    }, 1000);
    
    fetch('/api/analyze', {
        method: 'POST',
        body: formData
    })
    .then(response => {
        console.log('Response status:', response.status);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        console.log('Analysis data received:', data);
        currentAnalysis = data.analysis;
        currentGrading = data.grading;
        currentCardImage = frontImage ? URL.createObjectURL(frontImage) : null;
        displayResults(data);
    })
    .catch(error => {
        console.error('Error:', error);
        showError('Failed to analyze card. Please try again.');
        resetUploadArea();
    });
}

// Simulate progress with high-tech animations
function simulateProgress() {
    const progressFill = document.getElementById('progressFill');
    const steps = document.querySelectorAll('.analysis-step');
    const statusIndicators = document.querySelectorAll('.status-indicator');
    let progress = 0;
    let currentStep = 0;
    
    // Reset all steps and indicators
    steps.forEach(step => step.classList.remove('active'));
    statusIndicators.forEach(indicator => {
        indicator.classList.remove('processing', 'completed');
    });
    
    // Start with first step active
    steps[0].classList.add('active');
    statusIndicators[0].classList.add('processing');
    
    // Make progress bar visible and animated
    progressFill.style.width = '0%';
    progressFill.style.transition = 'width 0.5s ease-in-out';
    
    const interval = setInterval(() => {
        progress += Math.random() * 6 + 3; // More controlled progress
        
        if (progress > 100) {
            progress = 100;
        }
        
        // Update progress bar with smooth animation
        progressFill.style.width = progress + '%';
        
        // Update steps based on progress with visual feedback
        if (progress > 20 && currentStep === 0) {
            // Complete step 1
            steps[0].classList.remove('active');
            steps[0].classList.add('completed');
            statusIndicators[0].classList.remove('processing');
            statusIndicators[0].classList.add('completed');
            
            // Start step 2
            setTimeout(() => {
                steps[1].classList.add('active');
                statusIndicators[1].classList.add('processing');
            }, 200);
            currentStep = 1;
        } else if (progress > 45 && currentStep === 1) {
            // Complete step 2
            steps[1].classList.remove('active');
            steps[1].classList.add('completed');
            statusIndicators[1].classList.remove('processing');
            statusIndicators[1].classList.add('completed');
            
            // Start step 3
            setTimeout(() => {
                steps[2].classList.add('active');
                statusIndicators[2].classList.add('processing');
            }, 200);
            currentStep = 2;
        } else if (progress > 70 && currentStep === 2) {
            // Complete step 3
            steps[2].classList.remove('active');
            steps[2].classList.add('completed');
            statusIndicators[2].classList.remove('processing');
            statusIndicators[2].classList.add('completed');
            
            // Start step 4
            setTimeout(() => {
                steps[3].classList.add('active');
                statusIndicators[3].classList.add('processing');
            }, 200);
            currentStep = 3;
        } else if (progress >= 100 && currentStep === 3) {
            // Complete final step
            steps[3].classList.remove('active');
            steps[3].classList.add('completed');
            statusIndicators[3].classList.remove('processing');
            statusIndicators[3].classList.add('completed');
            
            // Add completion effect
            setTimeout(() => {
                progressFill.style.animation = 'holographicGlow 1s ease-in-out infinite';
            }, 500);
            
            clearInterval(interval);
        }
    }, 400);
    
    // Add glitch effect to text
    const loadingText = document.querySelector('.holographic-text');
    if (loadingText) {
        loadingText.classList.add('glitch-text');
        loadingText.setAttribute('data-text', loadingText.textContent);
    }
    
    // Add particle effects
    addParticleEffects();
}

// Add dynamic particle effects
function addParticleEffects() {
    const analysisSection = document.querySelector('.analysis-section');
    
    // Create additional particles
    for (let i = 0; i < 5; i++) {
        setTimeout(() => {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.left = Math.random() * 100 + '%';
            particle.style.animationDelay = Math.random() * 2 + 's';
            analysisSection.appendChild(particle);
            
            // Remove particle after animation
            setTimeout(() => {
                if (particle.parentNode) {
                    particle.parentNode.removeChild(particle);
                }
            }, 6000);
        }, i * 1000);
    }
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
    
    // Update card images display
    updateCardImagesDisplay();
    
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
    
    gradeNumber.textContent = grading.overallGrade;
    gradeLabel.textContent = 'Grade';
    gradeTitle.textContent = grading.overallGrade;
    gradeDescription.textContent = `Estimated grade with ${Math.round(grading.confidence * 100)}% confidence`;
    
    // Update grade circle color
    const gradeCircle = document.querySelector('.grade-circle');
    gradeCircle.style.background = getGradeColor(grading.overallGrade);
}

// Update card images display
function updateCardImagesDisplay() {
    const frontCardDisplay = document.getElementById('frontCardDisplay');
    const backCardDisplay = document.getElementById('backCardDisplay');
    
    // Update front image
    if (frontImage) {
        const frontPlaceholder = frontCardDisplay.querySelector('.card-image-placeholder');
        frontPlaceholder.innerHTML = `<img src="${URL.createObjectURL(frontImage)}" alt="Front card" class="card-image">`;
    }
    
    // Update back image
    if (backImage) {
        const backPlaceholder = backCardDisplay.querySelector('.card-image-placeholder');
        backPlaceholder.innerHTML = `<img src="${URL.createObjectURL(backImage)}" alt="Back card" class="card-image">`;
    }
}

// Update metrics
function updateMetrics(grading) {
    const metricsGrid = document.getElementById('metricsGrid');
    metricsGrid.innerHTML = '';
    
    const metrics = [
        { name: 'Centering', score: grading.breakdown.centering.score, grade: grading.breakdown.centering.grade, icon: 'fas fa-crosshairs' },
        { name: 'Corners', score: grading.breakdown.corners.score, grade: grading.breakdown.corners.grade, icon: 'fas fa-square' },
        { name: 'Edges', score: grading.breakdown.edges.score, grade: grading.breakdown.edges.grade, icon: 'fas fa-border-all' },
        { name: 'Surface', score: grading.breakdown.surface.score, grade: grading.breakdown.surface.grade, icon: 'fas fa-eye' }
    ];
    
    metrics.forEach(metric => {
        const metricCard = document.createElement('div');
        metricCard.className = 'metric-card';
        metricCard.innerHTML = `
            <div class="metric-header">
                <i class="${metric.icon}"></i>
                <h4>${metric.name}</h4>
            </div>
            <div class="metric-score">${metric.score}/10</div>
            <div class="metric-grade">${metric.grade}</div>
        `;
        metricsGrid.appendChild(metricCard);
    });
}

// Update probability
function updateProbability(grading) {
    const probabilityChart = document.getElementById('probabilityChart');
    const probability = Math.round(grading.probability * 100);
    
    probabilityChart.innerHTML = `
        <div class="probability-bar">
            <div class="probability-fill" style="width: ${probability}%"></div>
            <span class="probability-text">${probability}%</span>
        </div>
        <p style="text-align: center; margin-top: 10px; color: #666;">
            Probability of achieving ${grading.overallGrade} grade
        </p>
    `;
}

// Update recommendations
function updateRecommendations(grading) {
    const recommendationsList = document.getElementById('recommendationsList');
    recommendationsList.innerHTML = '';
    
    grading.recommendations.forEach(rec => {
        const recItem = document.createElement('div');
        recItem.className = 'recommendation-item';
        recItem.innerHTML = `
            <div class="recommendation-category">${rec.category}</div>
            <div class="recommendation-issue">${rec.issue}</div>
            <div class="recommendation-suggestion">${rec.suggestion}</div>
        `;
        recommendationsList.appendChild(recItem);
    });
}

// Update market value
function updateMarketValue(grading) {
    const marketValueSection = document.getElementById('marketValueSection');
    marketValueSection.innerHTML = `
        <div class="market-value">$${grading.marketValue.toLocaleString()}</div>
        <p class="market-note">*Estimated value based on condition and rarity</p>
    `;
}

// Update defect detection
function updateDefectDetection(defects) {
    const defectSection = document.getElementById('defectSection');
    if (!defectSection) return;
    
    defectSection.innerHTML = '';
    
    // Overall defect score
    const overallDiv = document.createElement('div');
    overallDiv.className = 'defect-overview';
    overallDiv.innerHTML = `
        <div class="defect-stat">
            <div class="defect-stat-label">Overall Score</div>
            <div class="defect-stat-value">${defects.overall.score}/10</div>
        </div>
        <div class="defect-stat">
            <div class="defect-stat-label">Confidence</div>
            <div class="defect-stat-value">${Math.round(defects.overall.confidence * 100)}%</div>
        </div>
    `;
    defectSection.appendChild(overallDiv);
    
    // Defect details
    if (defects.details && defects.details.length > 0) {
        const detailsDiv = document.createElement('div');
        detailsDiv.className = 'defect-details';
        detailsDiv.innerHTML = '<h4>Detected Defects:</h4>';
        
        defects.details.forEach(defect => {
            const defectItem = document.createElement('div');
            defectItem.className = 'defect-item';
            defectItem.innerHTML = `
                <div class="defect-header">
                    <span class="defect-type">${defect.type}</span>
                    <span class="defect-severity ${defect.severity > 0.7 ? 'high' : defect.severity > 0.4 ? 'medium' : 'low'}">
                        ${(defect.severity * 100).toFixed(1)}%
                    </span>
                </div>
                <div class="defect-description">${defect.description}</div>
                <div class="defect-location">Location: ${defect.location}</div>
            `;
            detailsDiv.appendChild(defectItem);
        });
        
        defectSection.appendChild(detailsDiv);
    }
}

// Update computational photography
function updateComputationalPhotography(enhanced) {
    const photoSection = document.getElementById('photoSection');
    if (!photoSection) return;
    
    photoSection.innerHTML = '';
    
    // Quality metrics
    if (enhanced.metadata && enhanced.metadata.qualityMetrics) {
        const qualityDiv = document.createElement('div');
        qualityDiv.className = 'quality-metrics';
        qualityDiv.innerHTML = `
            <div class="quality-metric">
                <div class="quality-metric-label">Focus Score</div>
                <div class="quality-metric-value">${enhanced.metadata.qualityMetrics.focus?.toFixed(2) || 'N/A'}</div>
            </div>
            <div class="quality-metric">
                <div class="quality-metric-label">Lighting Score</div>
                <div class="quality-metric-value">${enhanced.metadata.qualityMetrics.lighting?.toFixed(2) || 'N/A'}</div>
            </div>
            <div class="quality-metric">
                <div class="quality-metric-label">Composition Score</div>
                <div class="quality-metric-value">${enhanced.metadata.qualityMetrics.composition?.toFixed(2) || 'N/A'}</div>
            </div>
        `;
        photoSection.appendChild(qualityDiv);
    }
    
    // Artifact analysis
    if (enhanced.analysis && enhanced.analysis.artifacts) {
        const artifactDiv = document.createElement('div');
        artifactDiv.className = 'artifact-analysis';
        artifactDiv.innerHTML = '<h4>Artifact Detection:</h4>';
        
        Object.entries(enhanced.analysis.artifacts).forEach(([artifact, level]) => {
            const artifactItem = document.createElement('div');
            artifactItem.className = 'artifact-item';
            artifactItem.innerHTML = `
                <div class="artifact-header">
                    <span class="artifact-type">${artifact}</span>
                    <span class="artifact-level ${level}">${level}</span>
                </div>
                <div class="artifact-description">Detected ${level} level ${artifact}</div>
            `;
            artifactDiv.appendChild(artifactItem);
        });
        
        photoSection.appendChild(artifactDiv);
    }
    
    // Texture analysis
    if (enhanced.metadata && enhanced.metadata.textureStats) {
        const textureDiv = document.createElement('div');
        textureDiv.className = 'texture-analysis';
        textureDiv.innerHTML = '<h4>Texture Analysis:</h4>';
        textureDiv.innerHTML += `
            <div class="texture-metric">
                <span>Variance:</span>
                <span>${enhanced.metadata.textureStats.variance?.toFixed(3) || 'N/A'}</span>
            </div>
            <div class="texture-metric">
                <span>Edge Density:</span>
                <span>${enhanced.metadata.textureStats.edgeDensity?.toFixed(3) || 'N/A'}</span>
            </div>
            <div class="texture-metric">
                <span>Smoothness:</span>
                <span>${enhanced.metadata.textureStats.smoothness?.toFixed(3) || 'N/A'}</span>
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
    resetUploads();
    uploadSection.style.display = 'block';
    analysisSection.style.display = 'none';
    resultsSection.style.display = 'none';
    resultsSection.classList.remove('fade-in');
}

// Show error message
function showError(message) {
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