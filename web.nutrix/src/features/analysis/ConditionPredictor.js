import { BIOMARKER_STATUS } from '../../models/Biomarker.js';

/**
 * Predict health condition based on biomarkers
 * @param {Array} biomarkers - Array of biomarker objects
 * @returns {{ condition: string, confidence: number, reasons: Array }}
 */
export function predictCondition(biomarkers) {
    if (!biomarkers || biomarkers.length === 0) {
        return {
            condition: 'fit',
            confidence: 0,
            reasons: ['No biomarker data available']
        };
    }

    const scores = {
        anemia: 0,
        diabetes: 0,
        hypertension: 0,
        cholesterol: 0
    };

    const reasons = {
        anemia: [],
        diabetes: [],
        hypertension: [],
        cholesterol: []
    };

    // Analyze each biomarker
    biomarkers.forEach(biomarker => {
        const name = biomarker.name.toLowerCase();
        const status = biomarker.status;

        // Anemia indicators
        if (name.includes('hemoglobin') && status === BIOMARKER_STATUS.LOW) {
            scores.anemia += 40;
            reasons.anemia.push(`Low hemoglobin: ${biomarker.value} ${biomarker.unit}`);
        }

        // Diabetes indicators
        if (name.includes('glucose') && status === BIOMARKER_STATUS.HIGH) {
            scores.diabetes += 30;
            reasons.diabetes.push(`Elevated glucose: ${biomarker.value} ${biomarker.unit}`);
        }
        if (name.includes('hba1c')) {
            if (biomarker.value >= 6.5) {
                scores.diabetes += 50;
                reasons.diabetes.push(`HbA1c indicates diabetes: ${biomarker.value}%`);
            } else if (biomarker.value >= 5.7) {
                scores.diabetes += 20;
                reasons.diabetes.push(`HbA1c indicates prediabetes: ${biomarker.value}%`);
            }
        }

        // Hypertension indicators
        if (name.includes('systolic') && status === BIOMARKER_STATUS.HIGH) {
            scores.hypertension += 35;
            reasons.hypertension.push(`High systolic BP: ${biomarker.value} ${biomarker.unit}`);
        }
        if (name.includes('diastolic') && status === BIOMARKER_STATUS.HIGH) {
            scores.hypertension += 25;
            reasons.hypertension.push(`High diastolic BP: ${biomarker.value} ${biomarker.unit}`);
        }

        // Cholesterol indicators
        if (name.includes('cholesterol') && !name.includes('hdl')) {
            if (status === BIOMARKER_STATUS.HIGH) {
                scores.cholesterol += 20;
                reasons.cholesterol.push(`Elevated total cholesterol: ${biomarker.value} ${biomarker.unit}`);
            }
        }
        if (name.includes('ldl') && status === BIOMARKER_STATUS.HIGH) {
            scores.cholesterol += 30;
            reasons.cholesterol.push(`High LDL cholesterol: ${biomarker.value} ${biomarker.unit}`);
        }
        if (name.includes('triglyceride') && status === BIOMARKER_STATUS.HIGH) {
            scores.cholesterol += 20;
            reasons.cholesterol.push(`Elevated triglycerides: ${biomarker.value} ${biomarker.unit}`);
        }
    });

    // Find the highest scoring condition
    const maxScore = Math.max(...Object.values(scores));

    // If no significant issues found
    if (maxScore < 20) {
        return {
            condition: 'fit',
            confidence: 85,
            reasons: ['All biomarkers within acceptable ranges']
        };
    }

    // Find condition with highest score
    const predictedCondition = Object.keys(scores).find(key => scores[key] === maxScore);
    const confidence = Math.min(95, 50 + maxScore);

    return {
        condition: predictedCondition,
        confidence: Math.round(confidence),
        reasons: reasons[predictedCondition]
    };
}
