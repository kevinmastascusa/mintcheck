class PSAGrader {
  constructor() {
    this.guidelines = this.initializeGuidelines();
  }

  initializeGuidelines() {
    return {
      grades: {
        'Gem Mint': { min: 9.5, max: 10.0, description: 'Perfect card with no visible flaws' },
        'Mint': { min: 9.0, max: 9.4, description: 'Nearly perfect with only minor flaws' },
        'Near Mint-Mint': { min: 8.0, max: 8.9, description: 'Excellent condition with minor wear' },
        'Near Mint': { min: 7.0, max: 7.9, description: 'Very good condition with some wear' },
        'Excellent-Mint': { min: 6.0, max: 6.9, description: 'Good condition with noticeable wear' },
        'Excellent': { min: 5.0, max: 5.9, description: 'Above average condition' },
        'Very Good-Excellent': { min: 4.0, max: 4.9, description: 'Average condition' },
        'Very Good': { min: 3.0, max: 3.9, description: 'Below average condition' },
        'Good-Very Good': { min: 2.0, max: 2.9, description: 'Poor condition' },
        'Good': { min: 1.0, max: 1.9, description: 'Very poor condition' },
        'Poor': { min: 0.0, max: 0.9, description: 'Severely damaged' }
      },
      criteria: {
        centering: {
          weight: 0.25,
          description: 'How well the card image is centered within the borders'
        },
        corners: {
          weight: 0.25,
          description: 'Condition of the four corners of the card'
        },
        edges: {
          weight: 0.25,
          description: 'Condition of the card edges'
        },
        surface: {
          weight: 0.25,
          description: 'Surface condition including scratches, print defects, and wear'
        }
      }
    };
  }

  async gradeCard(analysis) {
    try {
      console.log('Starting PSA grading process...');
      
      const overallScore = analysis.overallCondition.score;
      const grade = this.determineGrade(overallScore);
      const probability = this.calculateProbability(analysis);
      const confidence = this.calculateConfidence(analysis);
      
      const grading = {
        overallGrade: grade,
        overallScore: overallScore,
        probability: probability,
        confidence: confidence,
        breakdown: {
          centering: {
            score: analysis.centering.score,
            grade: analysis.centering.grade,
            impact: this.calculateImpact(analysis.centering.score, 'centering')
          },
          corners: {
            score: analysis.corners.averageScore,
            grade: analysis.corners.grade,
            impact: this.calculateImpact(analysis.corners.averageScore, 'corners')
          },
          edges: {
            score: analysis.edges.averageScore,
            grade: analysis.edges.grade,
            impact: this.calculateImpact(analysis.edges.averageScore, 'edges')
          },
          surface: {
            score: analysis.surface.score,
            grade: analysis.surface.grade,
            impact: this.calculateImpact(analysis.surface.score, 'surface')
          }
        },
        recommendations: this.generateRecommendations(analysis),
        marketValue: this.estimateMarketValue(grade, analysis),
        submissionAdvice: this.generateSubmissionAdvice(analysis)
      };
      
      console.log('PSA grading completed');
      return grading;
    } catch (error) {
      console.error('Error in PSA grading:', error);
      throw error;
    }
  }

  determineGrade(score) {
    for (const [grade, range] of Object.entries(this.guidelines.grades)) {
      if (score >= range.min && score <= range.max) {
        return grade;
      }
    }
    return 'Unknown';
  }

  calculateProbability(analysis) {
    const overallScore = analysis.overallCondition.score;
    const grade = this.determineGrade(overallScore);
    const gradeRange = this.guidelines.grades[grade];
    
    if (!gradeRange) return 0;
    
    // Calculate probability based on how close the score is to the grade range
    const rangeMidpoint = (gradeRange.min + gradeRange.max) / 2;
    const distanceFromMidpoint = Math.abs(overallScore - rangeMidpoint);
    const rangeWidth = gradeRange.max - gradeRange.min;
    
    // Higher probability if score is closer to the midpoint of the grade range
    const baseProbability = Math.max(0.1, 1 - (distanceFromMidpoint / rangeWidth));
    
    // Adjust probability based on consistency across all criteria
    const consistencyBonus = this.calculateConsistencyBonus(analysis);
    
    return Math.min(0.95, Math.max(0.05, baseProbability + consistencyBonus));
  }

  calculateConsistencyBonus(analysis) {
    const scores = [
      analysis.centering.score,
      analysis.corners.averageScore,
      analysis.edges.averageScore,
      analysis.surface.score
    ];
    
    const mean = scores.reduce((a, b) => a + b, 0) / scores.length;
    const variance = scores.reduce((sum, score) => sum + Math.pow(score - mean, 2), 0) / scores.length;
    const standardDeviation = Math.sqrt(variance);
    
    // Lower standard deviation means more consistent scores = higher bonus
    return Math.max(0, (1 - standardDeviation / 10) * 0.1);
  }

  calculateConfidence(analysis) {
    // Calculate confidence based on the quality of the analysis
    const factors = [
      analysis.dimensions.width > 500 && analysis.dimensions.height > 500 ? 1 : 0.5, // Image quality
      analysis.text.confidence > 50 ? 1 : 0.7, // Text recognition quality
      this.hasGoodLighting(analysis) ? 1 : 0.8, // Lighting quality
      this.hasGoodFocus(analysis) ? 1 : 0.8 // Focus quality
    ];
    
    return factors.reduce((a, b) => a + b, 0) / factors.length;
  }

  hasGoodLighting(analysis) {
    // Simple heuristic for lighting quality
    // In a real implementation, this would analyze image brightness distribution
    return true; // Placeholder
  }

  hasGoodFocus(analysis) {
    // Simple heuristic for focus quality
    // In a real implementation, this would analyze image sharpness
    return true; // Placeholder
  }

  calculateImpact(score, criterion) {
    const weight = this.guidelines.criteria[criterion].weight;
    const impact = score * weight;
    
    if (impact >= 2.4) return 'High Positive';
    if (impact >= 2.0) return 'Positive';
    if (impact >= 1.5) return 'Neutral';
    if (impact >= 1.0) return 'Negative';
    return 'High Negative';
  }

  generateRecommendations(analysis) {
    const recommendations = [];
    
    // Centering recommendations
    if (analysis.centering.score < 7) {
      recommendations.push({
        category: 'Centering',
        issue: 'Poor centering detected',
        suggestion: 'Consider if the centering issue significantly affects the card\'s appeal',
        impact: 'High'
      });
    }
    
    // Corner recommendations
    if (analysis.corners.averageScore < 7) {
      recommendations.push({
        category: 'Corners',
        issue: 'Corner damage detected',
        suggestion: 'Examine corners under magnification for wear or damage',
        impact: 'High'
      });
    }
    
    // Edge recommendations
    if (analysis.edges.averageScore < 7) {
      recommendations.push({
        category: 'Edges',
        issue: 'Edge wear detected',
        suggestion: 'Check for edge whitening, chipping, or other damage',
        impact: 'Medium'
      });
    }
    
    // Surface recommendations
    if (analysis.surface.score < 7) {
      recommendations.push({
        category: 'Surface',
        issue: 'Surface issues detected',
        suggestion: 'Look for scratches, print defects, or surface wear under good lighting',
        impact: 'High'
      });
    }
    
    // Overall recommendations
    if (analysis.overallCondition.score >= 9) {
      recommendations.push({
        category: 'Overall',
        issue: 'High-grade potential',
        suggestion: 'Card shows excellent condition - consider professional grading',
        impact: 'Positive'
      });
    }
    
    return recommendations;
  }

  estimateMarketValue(grade, analysis) {
    // This is a simplified market value estimation
    // In a real implementation, this would use actual market data
    const baseValues = {
      'Gem Mint': 1000,
      'Mint': 500,
      'Near Mint-Mint': 250,
      'Near Mint': 150,
      'Excellent-Mint': 100,
      'Excellent': 75,
      'Very Good-Excellent': 50,
      'Very Good': 30,
      'Good-Very Good': 20,
      'Good': 10,
      'Poor': 5
    };
    
    const baseValue = baseValues[grade] || 25;
    
    // Adjust based on card type and rarity (simplified)
    let multiplier = 1.0;
    
    // Check if it's a Charizard (example)
    if (analysis.text && analysis.text.text.toLowerCase().includes('charizard')) {
      multiplier = 5.0;
    }
    
    // Adjust based on overall condition
    const conditionMultiplier = analysis.overallCondition.score / 10;
    
    return Math.round(baseValue * multiplier * conditionMultiplier);
  }

  generateSubmissionAdvice(analysis) {
    const advice = [];
    
    if (analysis.overallCondition.score >= 8.5) {
      advice.push({
        type: 'Positive',
        message: 'This card appears to be in excellent condition and may be worth professional grading.',
        priority: 'High'
      });
    }
    
    if (analysis.overallCondition.score < 6) {
      advice.push({
        type: 'Warning',
        message: 'This card shows significant wear and may not benefit from professional grading.',
        priority: 'Medium'
      });
    }
    
    if (analysis.centering.score < 6 || analysis.corners.averageScore < 6) {
      advice.push({
        type: 'Caution',
        message: 'Major condition issues detected. Consider if the card is worth grading.',
        priority: 'High'
      });
    }
    
    return advice;
  }

  getGuidelines() {
    return this.guidelines;
  }

  // Helper method to get grade description
  getGradeDescription(grade) {
    return this.guidelines.grades[grade]?.description || 'Unknown grade';
  }

  // Helper method to get grade range
  getGradeRange(grade) {
    const range = this.guidelines.grades[grade];
    return range ? `${range.min}-${range.max}` : 'Unknown';
  }
}

module.exports = PSAGrader; 