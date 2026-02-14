/**
 * Multi-API Key Rotation System
 * Automatically rotates between multiple Gemini API keys to avoid quota limits
 * Allocates specific keys to specific features for load distribution
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');

class APIKeyManager {
    constructor() {
        // API Keys from different Google accounts
        this.apiKeys = [
            // 1. Environment Variable Key (Primary for Deployment)
            ...(process.env.GEMINI_API_KEY ? [{
                id: 'env_key',
                key: process.env.GEMINI_API_KEY,
                name: 'Environment Key',
                features: ['image_analysis', 'chatbot', 'treatment_suggestions', 'qa', 'backup'],
                failCount: 0,
                lastUsed: null,
                cooldownUntil: null
            }] : []),

            {
                id: 'key1',
                key: 'AIzaSyBVBVpatEH4cKyOK4sjE-G2pJe7jEpThBE',
                name: 'Account 1',
                features: ['image_analysis'], // Primary for image analysis
                failCount: 0,
                lastUsed: null,
                cooldownUntil: null
            },
            {
                id: 'key2',
                key: 'AIzaSyCLZ-fXp28kUik2i4DtQb6W3qD7Tt95Usg',
                name: 'Account 2',
                features: ['chatbot', 'qa'], // For chatbot and Q&A
                failCount: 0,
                lastUsed: null,
                cooldownUntil: null
            },
            {
                id: 'key3',
                key: 'AIzaSyCBFKGawuLN04_whi3kPc6pmiCtuMeLxgw',
                name: 'Account 3',
                features: ['treatment_suggestions'], // For treatment plan generation
                failCount: 0,
                lastUsed: null,
                cooldownUntil: null
            },
            {
                id: 'key4',
                key: 'AIzaSyD_Tb4jPVjziKeikITYXEfZc2E5cbmbq78',
                name: 'Account 4 (Previous)',
                features: ['backup'], // Backup for any feature
                failCount: 0,
                lastUsed: null,
                cooldownUntil: null
            }
        ];

        this.currentKeyIndex = 0;
        this.availableModels = [];
        this.primaryModel = 'gemini-2.5-flash';
    }

    /**
     * Fetch available models from Google API and validate access
     */
    async validateAvailableModels() {
        console.log('[API Key Manager] Validating available models...');
        // Use any valid key to check permissions
        const keyInfo = this.getKeyForFeature('backup');

        if (!keyInfo) {
            console.warn('[API Key Manager] No valid keys found for validation.');
            return;
        }

        try {
            // Manual Fetch to list models (SDK support varies)
            // Dynamically import node-fetch if needed (common in ESM/CJS mixed envs)
            let fetch;
            try {
                fetch = (await import('node-fetch')).default;
            } catch (e) {
                fetch = require('node-fetch');
            }

            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${keyInfo.key}`);
            const data = await response.json();

            if (data.models) {
                // Filter for Gemini models that support generateContent
                this.availableModels = data.models
                    .filter(m => m.name.includes('gemini') && m.supportedGenerationMethods.includes('generateContent'))
                    .map(m => m.name.replace('models/', '')); // Standardize name

                console.log(`[API Key Manager] Discovered ${this.availableModels.length} models:`, this.availableModels.join(', '));

                // Determine Best Model based on Priority List
                const priorityList = [
                    'gemini-2.5-flash',
                    'gemini-2.0-flash',
                    'gemini-1.5-flash',
                    'gemini-flash-latest',
                    'gemini-1.5-pro',
                    'gemini-pro'
                ];

                for (const p of priorityList) {
                    if (this.availableModels.includes(p)) {
                        this.primaryModel = p;
                        console.log(`[API Key Manager] Primary Priority Model set to: ${this.primaryModel}`);
                        break;
                    }
                }
            } else {
                console.warn('[API Key Manager] No models returned from API check.');
            }
        } catch (error) {
            console.error('[API Key Manager] Model validation failed:', error.message);
        }
    }

    getBestModel() { return this.primaryModel; }

    getAvailableModels() {
        return [this.primaryModel, ...this.availableModels];
    }

    /**
     * Get the best available API key for a specific feature
     * @param {string} feature - Feature name: 'image_analysis', 'chatbot', 'treatment_suggestions', 'qa'
     * @returns {object} API key info
     */
    getKeyForFeature(feature) {
        const now = Date.now();

        // First, try to get a key specifically allocated for this feature
        let availableKeys = this.apiKeys.filter(k =>
            k.features.includes(feature) &&
            (!k.cooldownUntil || k.cooldownUntil < now)
        );

        // If no specific key available, try backup keys
        if (availableKeys.length === 0) {
            availableKeys = this.apiKeys.filter(k =>
                k.features.includes('backup') &&
                (!k.cooldownUntil || k.cooldownUntil < now)
            );
        }

        // If still no keys, try any available key
        if (availableKeys.length === 0) {
            availableKeys = this.apiKeys.filter(k =>
                !k.cooldownUntil || k.cooldownUntil < now
            );
        }

        // If all keys are in cooldown, use the one with shortest remaining cooldown
        if (availableKeys.length === 0) {
            const sortedByCooldown = [...this.apiKeys].sort((a, b) =>
                (a.cooldownUntil || 0) - (b.cooldownUntil || 0)
            );
            availableKeys = [sortedByCooldown[0]];
        }

        // Sort by fail count (prefer keys with fewer failures)
        availableKeys.sort((a, b) => a.failCount - b.failCount);

        const selectedKey = availableKeys[0];
        selectedKey.lastUsed = now;

        console.log(`[API Key Manager] Using ${selectedKey.name} (${selectedKey.id}) for ${feature}`);
        return selectedKey;
    }

    /**
     * Mark a key as failed and set cooldown
     * @param {string} keyId - Key ID
     * @param {number} cooldownSeconds - Cooldown duration in seconds
     */
    markKeyFailed(keyId, cooldownSeconds = 60) {
        const key = this.apiKeys.find(k => k.id === keyId);
        if (key) {
            key.failCount++;
            key.cooldownUntil = Date.now() + (cooldownSeconds * 1000);
            console.log(`[API Key Manager] ${key.name} marked as failed. Cooldown: ${cooldownSeconds}s`);
        }
    }

    /**
     * Reset fail count for a key after successful use
     * @param {string} keyId - Key ID
     */
    markKeySuccess(keyId) {
        const key = this.apiKeys.find(k => k.id === keyId);
        if (key) {
            key.failCount = Math.max(0, key.failCount - 1);
            key.cooldownUntil = null;
        }
    }

    /**
     * Get Gemini AI instance for a specific feature
     * @param {string} feature - Feature name
     * @returns {object} { genAI, keyInfo }
     */
    getAIForFeature(feature) {
        const keyInfo = this.getKeyForFeature(feature);
        const genAI = new GoogleGenerativeAI(keyInfo.key);
        return { genAI, keyInfo };
    }

    /**
     * Get status of all API keys
     * @returns {array} Status of all keys
     */
    getStatus() {
        const now = Date.now();
        return this.apiKeys.map(k => ({
            id: k.id,
            name: k.name,
            features: k.features,
            failCount: k.failCount,
            available: !k.cooldownUntil || k.cooldownUntil < now,
            cooldownRemaining: k.cooldownUntil ? Math.max(0, Math.ceil((k.cooldownUntil - now) / 1000)) : 0
        }));
    }
}

// Export singleton instance
const apiKeyManager = new APIKeyManager();
module.exports = apiKeyManager;
