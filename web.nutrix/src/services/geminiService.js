import { COMMON_BIOMARKERS, createBiomarker } from '../models/Biomarker.js';

/**
 * Gemini API service for medical report extraction
 * 
 * This is a MOCK implementation. To use the real Gemini API:
 * 1. Get an API key from Google AI Studio
 * 2. Set VITE_GEMINI_API_KEY in your .env file
 * 3. Uncomment the real API implementation below
 */

const USE_MOCK = true; // Set to false when you have a real API key

/**
 * Extract biomarkers from PDF text
 * @param {File} pdfFile - PDF file to analyze
 * @returns {Promise<Array>} Array of biomarker objects
 */
export async function extractBiomarkersFromPDF(pdfFile) {
    if (USE_MOCK) {
        return mockExtractBiomarkers(pdfFile);
    }

    // Real implementation (requires API key)
    // const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    // const formData = new FormData();
    // formData.append('file', pdfFile);

    // try {
    //   const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro-vision:generateContent?key=${apiKey}`, {
    //     method: 'POST',
    //     body: formData
    //   });
    //   
    //   const data = await response.json();
    //   return parseBiomarkersFromResponse(data);
    // } catch (error) {
    //   console.error('Gemini API error:', error);
    //   throw new Error('Failed to extract biomarkers from PDF');
    // }
}

/**
 * Mock biomarker extraction (for development/testing)
 * @param {File} pdfFile - PDF file
 * @returns {Promise<Array>} Mock biomarker data
 */
async function mockExtractBiomarkers(pdfFile) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    console.log('Mock: Extracting biomarkers from', pdfFile.name);

    // Return sample biomarkers with some abnormal values
    return [
        createBiomarker({
            ...COMMON_BIOMARKERS.hemoglobin,
            value: 10.5, // Low (normal: 12-16)
        }),
        createBiomarker({
            ...COMMON_BIOMARKERS.glucose,
            value: 125, // High (normal: 70-100)
        }),
        createBiomarker({
            ...COMMON_BIOMARKERS.cholesterol,
            value: 220, // High (normal: 125-200)
        }),
        createBiomarker({
            ...COMMON_BIOMARKERS.ldl,
            value: 110, // High (normal: 0-100)
        }),
        createBiomarker({
            ...COMMON_BIOMARKERS.hdl,
            value: 55, // Normal
        }),
        createBiomarker({
            ...COMMON_BIOMARKERS.triglycerides,
            value: 140, // Normal
        }),
        createBiomarker({
            ...COMMON_BIOMARKERS.hba1c,
            value: 6.2, // Prediabetic (normal: 4-5.7)
        }),
        createBiomarker({
            ...COMMON_BIOMARKERS.systolicBP,
            value: 142, // High (normal: 90-120)
        }),
        createBiomarker({
            ...COMMON_BIOMARKERS.diastolicBP,
            value: 88, // High (normal: 60-80)
        })
    ];
}

/**
 * Parse biomarkers from Gemini API response
 * @param {Object} response - Gemini API response
 * @returns {Array} Array of biomarker objects
 */
function parseBiomarkersFromResponse(response) {
    // Implement parsing logic based on Gemini API response format
    // This will depend on how you structure your prompt
    return [];
}
