const fetch = require('node-fetch');

const API_KEY = process.env.PLANT_ID_API_KEY;
const API_URL = 'https://crop.kindwise.com/api/v1/identification';

/**
 * Analyzes an image using the Plant.id / Crop Health API.
 * @param {string} base64Image - The image data in base64 format (without prefix).
 * @param {object} options - Optional parameters (latitude, longitude, similar_images).
 * @returns {Promise<object>} - Normalized analysis result.
 */
async function analyzeImage(base64Image, options = {}) {
    if (!API_KEY) {
        throw new Error('PLANT_ID_API_KEY is not configured');
    }

    const payload = {
        images: [base64Image],
        similar_images: true,
        latitude: options.latitude,
        longitude: options.longitude
    };

    console.log('[Plant.id] Sending request to:', API_URL);

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Api-Key': API_KEY,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload),
            timeout: 15000 // 15 seconds timeout
        });
        console.log(`[Plant.id] Response status: ${response.status}`);

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Plant.id API Error (${response.status}): ${errorText}`);
        }

        const data = await response.json();
        console.log('[Plant.id] Raw Response:', JSON.stringify(data, null, 2));
        return normalizeResponse(data);

    } catch (error) {
        console.error('[Plant.id] Analysis failed:', error.message);
        throw error;
    }
}

/**
 * Normalizes the Plant.id API response to match the AgriEye schema.
 * @param {object} data - Raw response from Plant.id.
 * @returns {object} - Normalized result.
 */
function normalizeResponse(data) {
    const result = data.result;

    if (!result || !result.is_plant || !result.is_plant.binary) {
        // Fallback or handle non-plant images if needed
        console.warn('[Plant.id] Image might not be a plant:', result?.is_plant?.probability);
    }

    const isHealthy = result.is_healthy?.binary;

    // Get top disease suggestion
    const diseaseSuggestion = result.disease?.suggestions?.[0];
    const diseaseName = diseaseSuggestion?.name || 'Unknown';
    const confidence = diseaseSuggestion?.probability || 0;

    // Detailed info (treatment, description, etc.)
    const details = diseaseSuggestion?.details || {};

    // Extract treatment info
    const treatments = details.treatment || {};
    const prevention = treatments.prevention ? [treatments.prevention] : [];
    const biological = treatments.biological ? [treatments.biological] : [];
    const chemical = treatments.chemical ? [treatments.chemical] : [];

    // Combine actions
    const recommendedActions = [
        ...prevention,
        ...biological,
        ...chemical
    ].filter(Boolean);

    // Symptoms (Plant.id doesn't always give explicit symptom list in 'details', 
    // sometimes it's in description. We'll use description as a fallback or if 'common_names' are available as symptoms)
    const symptoms = details.symptoms || (details.description ? [details.description.value] : []);

    return {
        health_status: isHealthy ? 'HEALTHY' : 'UNHEALTHY',
        disease_name: isHealthy ? 'Healthy Plant' : diseaseName,
        confidence: confidence,
        severity: isHealthy ? 'NONE' : (confidence > 0.7 ? 'HIGH' : 'MODERATE'),
        symptoms: symptoms,
        recommended_actions: recommendedActions,
        medicines: chemical,
        natural_treatments: biological,
        preventive_measures: prevention,
        description: details.description?.value || 'No description available.',
        analyzed_by: 'Plant.id (Crop Health v1)'
    };
}

module.exports = { analyzeImage };
