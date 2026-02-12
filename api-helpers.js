/**
 * Helper functions to integrate API Key Manager into existing server.js
 * without major code restructuring
 */

const apiKeyManager = require('./api-key-manager');

/**
 * Get Gemini AI instance with automatic key rotation
 * @param {string} feature - Feature name ('image_analysis', 'chatbot', 'treatment_suggestions', 'qa')
 * @returns {object} genAI instance
 */
function getGeminiAI(feature = 'backup') {
    const { genAI } = apiKeyManager.getAIForFeature(feature);
    return genAI;
}

/**
 * Handle API errors and update key status
 * @param {Error} error - Error object
 * @param {string} feature - Feature that was being used
 */
function handleAPIError(error, feature = 'backup') {
    const keyInfo = apiKeyManager.getKeyForFeature(feature);

    if (error.message.includes('429') || error.message.includes('quota')) {
        const retryMatch = error.message.match(/retry in ([0-9.]+)s/);
        const cooldownSeconds = retryMatch ? parseFloat(retryMatch[1]) : 60;
        apiKeyManager.markKeyFailed(keyInfo.id, cooldownSeconds);
        console.log(`[API Error] Key ${keyInfo.name} hit quota limit. Cooldown: ${cooldownSeconds}s`);
    }
}

/**
 * Mark API call as successful
 * @param {string} feature - Feature that was used
 */
function markAPISuccess(feature = 'backup') {
    const keyInfo = apiKeyManager.getKeyForFeature(feature);
    apiKeyManager.markKeySuccess(keyInfo.id);
}

/**
 * Get API key manager status
 * @returns {array} Status of all keys
 */
function getAPIStatus() {
    return apiKeyManager.getStatus();
}

module.exports = {
    getGeminiAI,
    handleAPIError,
    markAPISuccess,
    getAPIStatus,
    apiKeyManager
};
