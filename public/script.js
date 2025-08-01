// Global variables
let currentAnalysis = null;
let currentGrading = null;

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
    const file = e.target.files[0];
    if (file) {
        handleFile(file);
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