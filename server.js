const express = require('express');
const cors = require('cors');
const session = require('express-session');
const multer = require('multer');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Initialize database
const { db, analysisOps } = require('./database');

const app = express();
const port = process.env.PORT || 8000;

// OpenWeather API configuration
const OPENWEATHER_API_KEY = process.env.WEATHER_API_KEY;
const OPENWEATHER_BASE_URL = 'https://api.openweathermap.org/data/2.5/weather';

// Function to fetch weather data from OpenWeather API
async function getWeatherData(location) {
    if (!location || !OPENWEATHER_API_KEY) {
        console.log('Weather API: No location or API key provided');
        return { temperature: null, humidity: null };
    }

    try {
        const response = await axios.get(OPENWEATHER_BASE_URL, {
            params: {
                q: location,
                appid: OPENWEATHER_API_KEY,
                units: 'metric' // Celsius
            },
            timeout: 5000
        });

        const weatherData = {
            temperature: Math.round(response.data.main.temp),
            humidity: response.data.main.humidity,
            location: response.data.name,
            country: response.data.sys.country
        };

        console.log(`Weather data fetched for ${weatherData.location}, ${weatherData.country}: ${weatherData.temperature}°C, ${weatherData.humidity}%`);
        return weatherData;
    } catch (error) {
        console.error('Weather API error:', error.message);
        return { temperature: null, humidity: null };
    }
}

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        // Allow any origin for development/demo ease
        return callback(null, true);
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials: true
}));
app.use(express.json());

// Session middleware
app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key-change-in-production',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false, // Set to true in production with HTTPS
        httpOnly: true,
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    }
}));

// Attach user middleware
const { attachUser } = require('./middleware/auth');
app.use(attachUser);

// Request logging middleware for debugging
app.use((req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${req.method} ${req.path}`);
    if (req.method === 'POST' || req.method === 'PUT') {
        console.log('Request body:', JSON.stringify(req.body));
    }
    next();
});

// Import API Key Manager for multi-key rotation
const { getGeminiAI, handleAPIError, markAPISuccess, getAPIStatus } = require('./api-helpers');

// Configure multer for file uploads
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Helper function to build context-aware prompt
function buildAnalysisPrompt(crop, temperature, humidity, imageSource, language) {
    let prompt = `You are an expert agricultural plant pathologist with deep knowledge of crop diseases, fungal, bacterial, viral infections, and nutrient deficiencies.

Analyze the uploaded crop leaf image carefully.

Context:
- Crop type: ${crop}
- Temperature: ${temperature} °C
- Humidity: ${humidity} %
- Image source: ${imageSource}
`;

    // Language Instruction - MOVED TO TOP FOR PRIORITY
    if (language && language !== 'en') {
        const langMap = { 'hi': 'Hindi', 'pa': 'Punjabi', 'ta': 'Tamil' };
        const langName = langMap[language] || language;
        prompt += `\nCRITICAL LOCALIZATION INSTRUCTION:
1. You MUST PROVIDE THE ANALYSIS RESULTS IN ${langName}.
2. Translate ALL string VALUES (disease_name, symptoms, recommended_actions, medicines, etc.) into ${langName}.
3. DO NOT TRANSLATE THE JSON KEYS. Keep keys like "health_status", "disease_name", "symptoms" in English.
4. If the disease name has a common English name, providing it in brackets is helpful, but the main text must be ${langName}.
\n`;
    } else {
        prompt += `\nProvide the analysis results in English.\n`;
    }

    prompt += `
Tasks:
1. Identify whether the crop leaf is HEALTHY or DISEASED.
2. If diseased, identify the MOST LIKELY disease name (in the requested language).
3. Provide a confidence score between 0 and 1 (e.g., 0.92 for 92% confidence).
4. Classify disease severity as: LOW, MODERATE, or HIGH.
5. List visible symptoms observed in the image (in the requested language).
6. Provide 3-5 SPECIFIC recommended actions for this disease (in the requested language).
7. Suggest 5-7 chemical pesticides/fungicides with dosage and frequency (in the requested language).
8. Provide 8-10 natural/organic treatment methods (in the requested language).
9. Suggest 8-10 preventive and control measures (in the requested language).
10. If the leaf appears healthy, clearly state that no disease is detected and suggest general preventive care.

IMPORTANT RULES:
- Respond ONLY in valid JSON
- Do NOT include explanations, markdown, or extra text
- Use the EXACT field names specified below
- Confidence must be a number between 0 and 1 (not a percentage string)
- If healthy, set disease_name to null and severity to "NONE"
- Recommended actions should be SPECIFIC to the disease, not generic
- Provide practical, actionable advice
- For optimization: Provide AT LEAST 8 options for natural treatments and preventive measures
- Include variety in treatment options (different active ingredients, application methods, etc.)
- Natural treatments should be eco-friendly and sustainable
- Prevention measures should cover multiple aspects (cultural, biological, physical)

Expected JSON structure:
{
  "health_status": "HEALTHY | DISEASED",
  "disease_name": "string or null",
  "confidence": number,
  "severity": "LOW | MODERATE | HIGH | NONE",
  "symptoms": [ "string" ],
  "recommended_actions": [ "string" ],
  "medicines": [
    {
      "name": "string",
      "dosage": "string",
      "frequency": "string",
      "application": "string"
    }
  ],
  "natural_treatments": [ "string" ],
  "preventive_measures": [ "string" ]
}`;

    return prompt;
}

// Helper function to convert buffer to base64
function bufferToBase64(buffer) {
    return buffer.toString('base64');
}

// POST /api/analyze - Gemini Vision Analysis (Multi-File Support)
app.post('/api/analyze', upload.array('files', 10), async (req, res) => {
    console.log('[POST] /analyze - Processing Multi-File Request');

    try {
        if (!req.files || req.files.length === 0) {
            // Check for single file fallback if frontend sends 'file' instead of 'files'
            if (req.file) req.files = [req.file];
            else return res.status(400).json({ error: 'No image files uploaded' });
        }

        // Extract parameters
        const crop = req.body.crop || 'Unknown';
        const temperature = req.body.temperature || 'Not provided';
        const humidity = req.body.humidity || 'Not provided';
        const imageSource = req.body.imageSource || 'USER_UPLOAD';
        const language = req.body.language || 'en';

        console.log(`Analyzing ${req.files.length} images of ${crop} (Language: ${language})...`);

        // Check API configuration
        if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'YOUR_API_KEY_HERE') {
            console.warn('Gemini API key not configured, using fallback mock data');
            return res.json([getFallbackResponse()]); // Return array
        }

        const validModels = [
            'gemini-2.5-flash',       // PRIORITY: Confirmed working & fast
            'gemini-1.5-flash',       // Fallback: Stable standard
            'gemini-1.5-pro',         // Fallback: High reasoning
            'gemini-1.5-pro-latest',  // Fallback: Latest Pro
            'gemini-1.0-pro',         // Fallback: Legacy Pro
            'gemini-flash-latest'     // Fallback: Legacy alias
        ];



        // Process all files in parallel
        const analysisPromises = req.files.map(async (file, index) => {
            const imageBase64 = bufferToBase64(file.buffer);
            const mimeType = file.mimetype;

            let successfulResult = null;
            let lastError = null;

            // Retry strategy per file with API key rotation
            for (const modelName of validModels) {
                try {
                    const genAI = getGeminiAI('image_analysis');
                    const model = genAI.getGenerativeModel({ model: modelName });
                    const prompt = buildAnalysisPrompt(crop, temperature, humidity, imageSource, language);
                    const imagePart = {
                        inlineData: { data: imageBase64, mimeType: mimeType }
                    };

                    const result = await model.generateContent([prompt, imagePart]);
                    const text = await result.response.text();

                    const cleanedText = text.replace(/```json\n ? /g, '').replace(/```\n?/g, '').trim();
                    successfulResult = JSON.parse(cleanedText);
                    successfulResult.analyzed_by = `Gemini(${modelName}) - Multi - Key Rotation`;
                    markAPISuccess('image_analysis');
                    break;
                } catch (error) {
                    console.warn(`⚠️ Model ${modelName} failed/exhausted. Switching to next model... Error: ${error.message}`);
                    handleAPIError(error, 'image_analysis');
                    lastError = error;
                }
            }

            if (successfulResult) {
                successfulResult.timestamp = new Date().toISOString();
                successfulResult.environmental_context = {
                    crop, temperature, humidity, image_source: imageSource,
                    original_filename: file.originalname
                };

                // --- PERSISTENCE: Save to Database ---
                try {
                    const savedRecord = analysisOps.create({
                        device_id: 'WEB_UPLOAD', // Mark as web upload
                        crop: crop,
                        temperature: temperature,
                        humidity: humidity,
                        health_status: successfulResult.health_status,
                        disease_name: successfulResult.disease_name,
                        confidence: successfulResult.confidence,
                        severity: successfulResult.severity,
                        symptoms: successfulResult.symptoms,
                        recommended_actions: successfulResult.recommended_actions,
                        medicines: successfulResult.medicines,
                        natural_treatments: successfulResult.natural_treatments,
                        preventive_measures: successfulResult.preventive_measures,
                        image_path: file.originalname, // Store filename/path
                        analyzed_by: successfulResult.analyzed_by
                    });
                    console.log(`[DB] Saved analysis result ID: ${savedRecord.id}`);
                } catch (dbError) {
                    console.error('[DB] Failed to save analysis:', dbError.message);
                }

                return successfulResult;
            }

            // Fallback for this specific image
            const fallback = getFallbackResponse();
            fallback.analyzed_by = `Simulation(Analysis Failed: ${lastError?.message || 'Unknown'})`;
            fallback.environmental_context = { original_filename: file.originalname };
            return fallback;
        });

        const results = await Promise.all(analysisPromises);
        console.log(`Completed analysis for ${results.length} images.`);

        return res.json(results);

    } catch (criticalError) {
        console.error("Critical Analysis Error:", criticalError);
        res.status(500).json({ error: "Critical Server Error", details: criticalError.message });
    }
});

// POST /api/upload - Separate endpoint for ESP32/IoT Devices
// Simpler structure for embedded devices
app.post('/api/upload', upload.single('image'), async (req, res) => {
    console.log('[POST] /api/upload - Processing IoT Device Upload');

    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No image file uploaded' });
        }

        const deviceId = req.body.deviceId || 'ESP32_UNKNOWN';
        const crop = req.body.crop || 'Unknown';
        // const apiKey = req.body.apiKey; // Optional simple auth

        console.log(`IoT Upload from ${deviceId} - Crop: ${crop}`);

        // Convert to base64 for Gemini
        const imageBase64 = bufferToBase64(req.file.buffer);
        const mimeType = req.file.mimetype;

        let successfulResult = null;

        // Use Priority Model List
        const validModels = [
            'gemini-2.5-flash',
            'gemini-1.5-flash',
            'gemini-1.5-pro'
        ];

        for (const modelName of validModels) {
            try {
                const genAI = getGeminiAI('image_analysis');
                const model = genAI.getGenerativeModel({ model: modelName });
                // IoT prompt can be simpler or same as web
                const prompt = buildAnalysisPrompt(crop, 'Measured by Device', 'Measured by Device', 'IoT_Device', 'en');

                const imagePart = {
                    inlineData: { data: imageBase64, mimeType: mimeType }
                };

                const result = await model.generateContent([prompt, imagePart]);
                const text = await result.response.text();
                const cleanedText = text.replace(/```json\n ? /g, '').replace(/```\n?/g, '').trim();

                successfulResult = JSON.parse(cleanedText);
                successfulResult.analyzed_by = `Gemini(${modelName}) - IoT`;
                markAPISuccess('image_analysis');
                break;
            } catch (error) {
                console.warn(`IoT Analysis Retry (${modelName}): ${error.message}`);
                handleAPIError(error, 'image_analysis');
            }
        }

        if (successfulResult) {
            // --- PERSISTENCE: Save to Database with DEVICE ID ---
            try {
                const savedRecord = analysisOps.create({
                    device_id: deviceId, // USES ACTUAL DEVICE ID
                    crop: crop,
                    temperature: null, // Could parse from body if sent
                    humidity: null,
                    health_status: successfulResult.health_status,
                    disease_name: successfulResult.disease_name,
                    confidence: successfulResult.confidence,
                    severity: successfulResult.severity,
                    symptoms: successfulResult.symptoms,
                    recommended_actions: successfulResult.recommended_actions,
                    medicines: successfulResult.medicines,
                    natural_treatments: successfulResult.natural_treatments,
                    preventive_measures: successfulResult.preventive_measures,
                    image_path: req.file.originalname,
                    analyzed_by: successfulResult.analyzed_by
                });
                console.log(`[IoT] Analysis saved for ${deviceId} (ID: ${savedRecord.id})`);

                // Return simple JSON for ESP32 (less data to parse)
                return res.json({
                    status: 'success',
                    disease: successfulResult.disease_name,
                    confidence: successfulResult.confidence,
                    severity: successfulResult.severity
                });

            } catch (dbError) {
                console.error('[IoT] DB Save Failed:', dbError.message);
                return res.status(500).json({ error: 'Database save failed' });
            }
        }

        return res.status(500).json({ error: 'AI Analysis failed after retries' });

    } catch (error) {
        console.error('[IoT] Upload critical error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// POST /api/qa - Gemini Text QA
app.post('/api/qa', async (req, res) => {
    console.log('[POST] /qa - Processing QA Request');

    try {
        const { question, context, history, language } = req.body;

        if (!question) {
            return res.status(400).json({ error: 'Question is required' });
        }

        console.log(`Question received: "${question}"(Language: ${language || 'en'})`);

        // Robust context logging
        try {
            if (context) console.log(`Context length: ${context.length} chars`);
        } catch (e) { console.log('Context log failed:', e.message); }

        // API Key Validation
        const apiKey = process.env.GEMINI_API_KEY;
        const isKeyConfigured = apiKey && apiKey !== 'YOUR_API_KEY_HERE' && apiKey.length > 20;

        if (!isKeyConfigured) {
            console.warn('Gemini API key missing or invalid. Using Simulation Mode.');

            // Simulation Delay (to feel real)
            await new Promise(resolve => setTimeout(resolve, 1000));

            return res.json({
                answer: "I am currently in **Simulation Mode** because the AI API key is not configured. \n\n" +
                    "**Based on the context:** " + (context ? "I see you are monitoring specific farm data. " : "") +
                    "Typically, I would analyze this deep data to provide specific insights.\n\n" +
                    "**Answer to your question:** For crop health, ensure consistent irrigation and monitor for visual symptoms like yellowing or spots. If you see specific disease signs, check the Risk Analysis tab."
            });
        }

        // Build prompt first
        let prompt = `You are an expert agricultural plant pathologist and farming assistant. 
Answer the following question from a farmer clearly, concisely, and accurately.

`;

        // Language Instruction
        if (language && language !== 'en') {
            const langMap = { 'hi': 'Hindi', 'pa': 'Punjabi', 'ta': 'Tamil' };
            const langName = langMap[language] || language;
            prompt += `IMPORTANT: Answer the ENTIRE response in ${langName} language.\n\n`;
        } else {
            prompt += `Answer in English.\n\n`;
        }

        if (context) {
            prompt += `IMPORTANT - CURRENT DIAGNOSIS CONTEXT:
The farmer has just received an AI analysis of their crop.Here are the details:
${context}

When answering questions:
- Reference specific details from this diagnosis(disease name, severity, symptoms, treatments)
    - If they ask about treatments, refer to the recommended medicines, natural treatments, or preventive measures from the analysis
        - If they ask "what disease" or "what's wrong", use the disease name from the context
            - Be specific and practical based on this diagnosis

`;
        }

        if (history && Array.isArray(history)) {
            prompt += `CONVERSATION HISTORY:
             ${history.map(msg => `${msg.role}: ${msg.content}`).join('\n')}

`;
        }

        prompt += `Question: ${question} `;

        // Try models in order (updated to current available models)
        const validQA = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-flash-latest', 'gemini-pro-latest'];
        let textAnswer = null;
        let lastQaError = null;

        for (const mName of validQA) {
            try {
                const genAI = getGeminiAI('chatbot');
                console.log(`QA: Trying ${mName}...`);
                const model = genAI.getGenerativeModel({ model: mName });
                const result = await model.generateContent(prompt);
                textAnswer = await result.response.text();
                console.log(`✅ QA Success with ${mName} `);
                break;
            } catch (err) {
                console.warn(`QA Failed(${mName}): `, err.message);
                lastQaError = err;
            }
        }

        if (textAnswer) {
            console.log('Gemini Answer Generated');
            return res.json({ answer: textAnswer });
        }

        throw lastQaError || new Error("All QA models failed");

    } catch (error) {
        console.error('Gemini QA CRASH:', error.message);

        // Auto-fallback on API failure (404, 403, etc.)
        if (error.message.includes('404') || error.message.includes('not found') || error.message.includes('403')) {
            console.log('Switching to Simulation Mode due to API Error.');
            return res.json({
                answer: "⚠️ **API Connection Failed** (Model Not Found/Access Denied).\n\n" +
                    "**Switched to Simulation Mode:**\n" +
                    "Based on the context, I recommend checking the risk analysis charts. " +
                    "For general crop health, maintain optimal humidity (60-70%) and temperature (20-25°C). " +
                    "If you see leaf spots, consider applying a copper-based fungicide."
            });
        }

        res.status(500).json({
            error: 'Failed to get answer',
            details: error.message,
            answer: "Backend Error: " + error.message
        });
    }
});

// Fallback response when API key not configured
function getFallbackResponse() {
    return {
        health_status: 'UNKNOWN',
        disease_name: 'AI Service Unavailable (Check API Key)',
        confidence: 0,
        severity: 'NONE',
        symptoms: [
            'System status check required',
            'Verify API configuration',
            'Ensure internet connectivity'
        ],
        recommended_treatment: [
            'Check system logs',
            'Verify API keys in .env file',
            'Restart application server'
        ],
        pesticide: {
            required: false,
            name: 'N/A',
            dosage: 'N/A',
            frequency: 'N/A'
        },
        preventive_measures: [
            'Regular system maintenance',
            'Keep API keys secure',
            'Monitor connection status'
        ],
        timestamp: new Date().toISOString(),
        analyzed_by: 'System Fallback',
        environmental_context: {
            crop: 'Unknown',
            temperature: 'N/A',
            humidity: 'N/A',
            image_source: 'SYSTEM'
        }
    };
}

// POST /api/generate-schedule - Generate AI treatment schedule
app.post('/api/generate-schedule', async (req, res) => {
    console.log('[POST] /generate-schedule - Generating treatment schedule');

    try {
        const { disease, severity, treatmentType, medicines, naturalTreatments, preventiveMeasures } = req.body;

        if (!disease || !treatmentType) {
            return res.status(400).json({ error: 'Disease and treatment type are required' });
        }

        // API Key Validation
        const apiKey = process.env.GEMINI_API_KEY;
        const isKeyConfigured = apiKey && apiKey !== 'YOUR_API_KEY_HERE' && apiKey.length > 20;

        if (!isKeyConfigured) {
            console.warn('Gemini API key missing. Using fallback schedule.');
            return res.json(getFallbackSchedule(disease, treatmentType));
        }

        // Build schedule generation prompt
        const prompt = `You are an expert agricultural advisor.Create a detailed day - by - day treatment schedule for the following crop disease.

    Disease: ${disease}
Severity: ${severity}
Treatment Type: ${treatmentType === 'medicine' ? 'Chemical/Medicine-based' : 'Organic/Natural'}

${treatmentType === 'medicine' && medicines?.length > 0 ? `
Available Medicines:
${medicines.map(m => `- ${m.name}: ${m.dosage}, ${m.frequency}`).join('\n')}
` : ''
            }

${treatmentType === 'organic' && naturalTreatments?.length > 0 ? `
Natural Treatments Available:
${naturalTreatments.map((t, i) => `${i + 1}. ${t}`).join('\n')}
` : ''
            }

Preventive Measures:
${preventiveMeasures?.map((p, i) => `${i + 1}. ${p}`).join('\n') || 'General crop care'}

Create a concise 7 - day treatment schedule with specific daily tasks.
For each day, provide 2 - 3 actionable, practical tasks that farmers can easily follow.
Keep tasks short and clear.

    IMPORTANT: Respond ONLY with valid JSON in this exact format:
{
    "duration": 7,
        "schedule": [
            {
                "day": 1,
                "tasks": ["task 1", "task 2", "task 3"]
            }
        ]
}

Do not include any explanations or markdown.Only the JSON object.`;

        // Try models for schedule generation
        const validModels = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-flash-latest'];
        let scheduleData = null;

        for (const modelName of validModels) {
            try {
                const genAI = getGeminiAI('treatment_suggestions');
                console.log(`Trying ${modelName} for schedule generation...`);
                const model = genAI.getGenerativeModel({ model: modelName });
                const result = await model.generateContent(prompt);
                const text = await result.response.text();

                // Parse JSON response
                const jsonMatch = text.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    scheduleData = JSON.parse(jsonMatch[0]);
                    console.log(`✅ Schedule generated with ${modelName} `);
                    break;
                }
            } catch (err) {
                console.warn(`Failed with ${modelName}: `, err.message);
            }
        }

        if (scheduleData) {
            // Add dates to schedule
            const today = new Date();
            scheduleData.schedule = scheduleData.schedule.map((day, index) => {
                const date = new Date(today);
                date.setDate(date.getDate() + index);
                return {
                    ...day,
                    date: date.toISOString().split('T')[0]
                };
            });

            return res.json({
                ...scheduleData,
                treatmentType,
                disease,
                severity
            });
        }

        // Fallback if all models fail
        return res.json(getFallbackSchedule(disease, treatmentType));

    } catch (error) {
        console.error('Schedule generation error:', error);
        res.status(500).json({
            error: 'Failed to generate schedule',
            details: error.message
        });
    }
});

// Fallback schedule generator
function getFallbackSchedule(disease, treatmentType) {
    const duration = 7; // Short 1-week plan
    const today = new Date();

    const schedule = [];
    for (let i = 0; i < duration; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() + i);

        const tasks = [];
        if (i === 0) {
            tasks.push('Initial inspection and documentation of affected areas');
            tasks.push(treatmentType === 'medicine' ? 'Apply first treatment application' : 'Prepare organic treatment solution');
            tasks.push('Remove severely affected plant parts');
        } else if (i % 3 === 0) {
            tasks.push(treatmentType === 'medicine' ? 'Apply scheduled treatment' : 'Apply organic treatment');
            tasks.push('Monitor plant response');
        } else if (i % 7 === 0) {
            tasks.push('Weekly assessment of disease progression');
            tasks.push('Document changes with photos');
        } else {
            tasks.push('Monitor plants for new symptoms');
            tasks.push('Maintain proper watering schedule');
        }

        schedule.push({
            day: i + 1,
            date: date.toISOString().split('T')[0],
            tasks
        });
    }

    return {
        duration,
        schedule,
        treatmentType,
        disease,
        severity: 'MODERATE',
        note: 'Simulated schedule - API key not configured'
    };
}

// GET /api/weather - Get weather data for a location
app.get('/api/weather', async (req, res) => {
    console.log('[GET] /api/weather - Fetching weather data');

    try {
        const { location } = req.query;

        if (!location) {
            return res.status(400).json({ error: 'Location parameter is required' });
        }

        const apiKey = process.env.WEATHER_API_KEY;
        if (!apiKey) {
            console.warn('Weather API key not configured, using fallback data');
            return res.json(getFallbackWeather(location));
        }

        // Call OpenWeatherMap API
        const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(location)}&appid=${apiKey}&units=metric`;

        const fetch = (await import('node-fetch')).default;
        const response = await fetch(weatherUrl);

        if (!response.ok) {
            console.warn(`Weather API returned ${response.status}, using fallback`);
            return res.json(getFallbackWeather(location));
        }

        const data = await response.json();

        // Format the response
        const weatherData = {
            temperature: Math.round(data.main.temp),
            condition: data.weather[0].main,
            description: data.weather[0].description,
            humidity: data.main.humidity,
            high: Math.round(data.main.temp_max),
            low: Math.round(data.main.temp_min),
            location: data.name,
            icon: data.weather[0].icon,
            windSpeed: data.wind?.speed || 0,
            feelsLike: Math.round(data.main.feels_like)
        };

        console.log(`Weather data fetched for ${data.name}: ${weatherData.temperature}°C, ${weatherData.condition}`);
        res.json(weatherData);

    } catch (error) {
        console.error('Weather API error:', error.message);
        res.json(getFallbackWeather(req.query.location || 'Unknown'));
    }
});

// Fallback weather data
function getFallbackWeather(location) {
    return {
        temperature: 28,
        condition: 'Partly Cloudy',
        description: 'partly cloudy',
        humidity: 62,
        high: 32,
        low: 24,
        location: location,
        icon: '03d',
        windSpeed: 3.5,
        feelsLike: 29,
        fallback: true
    };
}

// GET /api/data - Latest crop monitoring data
app.get('/api/data', async (req, res) => {
    console.log('[GET] /api/data - Fetching latest monitoring data');

    try {
        // Get latest analysis result from database
        const latestResult = analysisOps.getLatest();

        // Get user location from session for weather data
        let weatherData = { temperature: null, humidity: null };
        if (req.session && req.session.userId) {
            const userId = req.session.userId;
            const user = db.prepare('SELECT field_location, location FROM users WHERE id = ?').get(userId);

            // Prefer field_location if set, otherwise use location
            const locationToUse = user?.field_location || user?.location;

            if (locationToUse) {
                console.log(`Fetching weather for: ${locationToUse}`);
                weatherData = await getWeatherData(locationToUse);
            }
        }

        if (!latestResult) {
            return res.json({
                message: 'No analysis data available yet',
                health_status: 'UNKNOWN',
                disease_name: null,
                confidence: 0,
                severity: 'NONE',
                symptoms: [],
                recommended_actions: ['Upload an image to start analysis'],
                medicines: [],
                natural_treatments: [],
                preventive_measures: [],
                temperature: weatherData.temperature,
                humidity: weatherData.humidity,
                weather_location: weatherData.location,
                crop: null,
                device_id: null,
                timestamp: new Date().toISOString()
            });
        }

        // Parse JSON string fields into arrays
        const parseJsonField = (field) => {
            if (!field) return [];
            if (typeof field === 'string') {
                try {
                    return JSON.parse(field);
                } catch (e) {
                    console.error('Failed to parse JSON field:', e);
                    return [];
                }
            }
            return field;
        };

        const result = {
            ...latestResult,
            // Override with weather data (prefer weather API over ESP32 sensor data)
            temperature: weatherData.temperature !== null ? weatherData.temperature : latestResult.temperature,
            humidity: weatherData.humidity !== null ? weatherData.humidity : latestResult.humidity,
            weather_location: weatherData.location,
            // Parse JSON string fields
            symptoms: parseJsonField(latestResult.symptoms),
            recommended_actions: parseJsonField(latestResult.recommended_actions),
            medicines: parseJsonField(latestResult.medicines),
            natural_treatments: parseJsonField(latestResult.natural_treatments),
            preventive_measures: parseJsonField(latestResult.preventive_measures),
            // Add backward compatibility fields
            disease: latestResult.disease_name,
            severity_level: latestResult.severity === 'NONE' ? 'Healthy' : 'Warning',
            recommended_treatment: parseJsonField(latestResult.recommended_actions),
            category: latestResult.disease_name ? 'Disease Detected' : 'Healthy',
            imageUrl: latestResult.image_path
        };

        console.log(`Returning analysis from ${result.timestamp} with weather data`);
        res.json(result);

    } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).json({ error: 'Failed to fetch data' });
    }
});

// POST /api/optimize - Run Multi-Objective Optimization
app.post('/api/optimize', async (req, res) => {
    console.log('[POST] /api/optimize - Starting Multi-Objective Optimization...');

    try {
        const { treatments, severity } = req.body;

        if (!treatments || !Array.isArray(treatments)) {
            return res.status(400).json({ error: 'Invalid input: treatments array required' });
        }

        // Import the new optimization logic
        const { optimizeTreatments } = require('./optimization');

        // Run optimization (synchronous, fast)
        const result = optimizeTreatments(treatments, severity || 0.5);

        console.log('✅ Optimization Complete');
        res.json(result);

    } catch (error) {
        console.error('Optimization Handler Error:', error);
        res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
});

// Helper: Generate Simulated Quantum Result (REMOVED - Classical Only)
// function generateSimulatedQuantumResult(treatments) { ... }

// GET /api/cameras - Camera/sensor nodes data
app.get('/api/cameras', (req, res) => {
    console.log('[GET] /api/cameras - Fetching camera nodes');

    // Return array of camera nodes with environmental data
    const cameras = [
        {
            id: 'CAM_01',
            temperature: 24 + Math.floor(Math.random() * 2),
            humidity: 65 + Math.floor(Math.random() * 3),
            image: null,
            status: 'online',
            lastUpdate: new Date().toISOString()
        },
        {
            id: 'CAM_02',
            temperature: 23 + Math.floor(Math.random() * 2),
            humidity: 68 + Math.floor(Math.random() * 3),
            image: null,
            status: 'online',
            lastUpdate: new Date().toISOString()
        },
        {
            id: 'CAM_03',
            temperature: 25 + Math.floor(Math.random() * 2),
            humidity: 60 + Math.floor(Math.random() * 3),
            image: null,
            status: 'online',
            lastUpdate: new Date().toISOString()
        }
    ];

    res.json(cameras);
});

// POST /api/upload - ESP32 camera upload endpoint
app.post('/api/upload', upload.single('image'), async (req, res) => {
    console.log('[POST] /api/upload - ESP32 upload received');

    try {
        if (!req.file) {
            return res.status(400).json({
                status: 'error',
                error: 'No image file uploaded'
            });
        }

        const { deviceId, temperature, humidity, crop } = req.body;

        console.log(`Upload from device: ${deviceId || 'Unknown'}`);
        console.log(`Environmental data - Temp: ${temperature}°C, Humidity: ${humidity}%`);
        console.log(`Crop type: ${crop || 'Unknown'}`);

        // Check if API key is configured
        if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'YOUR_API_KEY_HERE') {
            console.warn('Gemini API key not configured, storing upload without analysis');
            return res.json({
                status: 'success',
                message: 'Upload received but analysis unavailable (API key not configured)',
                data: {
                    deviceId: deviceId || 'ESP32_DEFAULT',
                    timestamp: new Date().toISOString(),
                    fileSize: req.file.size
                }
            });
        }

        // Trigger Gemini Vision analysis
        console.log('Triggering Gemini Vision analysis...');
        const imageBase64 = bufferToBase64(req.file.buffer);
        const mimeType = req.file.mimetype;
        const prompt = buildAnalysisPrompt(crop || 'Unknown', temperature || 'Not provided', humidity || 'Not provided', 'ESP32_UPLOAD');

        const validModels = [
            'gemini-2.5-flash',
            'gemini-2.0-flash',
            'gemini-flash-latest',
            'gemini-2.0-flash-lite-001',
            'gemini-2.0-flash-lite',
            'gemini-pro-latest',
            'gemini-2.5-pro'
        ];
        let analysisResult = null;
        let lastError = null;

        for (const modelName of validModels) {
            try {
                console.log(`Trying model: ${modelName}...`);
                const genAI = getGeminiAI('image_analysis');
                const model = genAI.getGenerativeModel({ model: modelName });
                const imagePart = {
                    inlineData: {
                        data: imageBase64,
                        mimeType: mimeType
                    }
                };

                const result = await model.generateContent([prompt, imagePart]);
                const response = await result.response;
                const text = response.text();

                console.log(`✅ Analysis success with ${modelName}`);
                const cleanedText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
                analysisResult = JSON.parse(cleanedText);
                analysisResult.analyzed_by = `Gemini (${modelName})`;
                break;
            } catch (error) {
                console.warn(`❌ Failed with ${modelName}: ${error.message}`);
                lastError = error;
            }
        }

        if (!analysisResult) {
            console.error('All Gemini models failed, cannot store analysis');
            return res.status(500).json({
                status: 'error',
                error: 'Analysis failed',
                details: lastError?.message || 'All models failed'
            });
        }

        // Store analysis result in database
        const storedResult = analysisOps.create({
            device_id: deviceId || 'ESP32_DEFAULT',
            crop: crop || 'Unknown',
            temperature: parseFloat(temperature) || null,
            humidity: parseFloat(humidity) || null,
            health_status: analysisResult.health_status,
            disease_name: analysisResult.disease_name,
            confidence: analysisResult.confidence,
            severity: analysisResult.severity,
            symptoms: analysisResult.symptoms,
            recommended_actions: analysisResult.recommended_actions,
            medicines: analysisResult.medicines,
            natural_treatments: analysisResult.natural_treatments,
            preventive_measures: analysisResult.preventive_measures,
            image_path: null, // Could save image to disk and store path
            analyzed_by: analysisResult.analyzed_by
        });

        console.log(`✅ Analysis stored in database (ID: ${storedResult.id})`);

        // Return full analysis result
        res.json({
            status: 'success',
            message: 'Upload and analysis successful',
            data: storedResult
        });

    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({
            status: 'error',
            error: 'Upload failed',
            details: error.message
        });
    }
});

// GET /api/status
app.get('/api/status', (req, res) => {
    const hasApiKey = process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'YOUR_API_KEY_HERE';
    res.json({
        status: 'online',
        gateway: 'active',
        gemini_configured: hasApiKey,
        mode: hasApiKey ? 'AI Analysis' : 'Simulation'
    });
});

// Mount authentication and user routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const treatmentRoutes = require('./routes/treatment');
const weatherRoutes = require('./routes/weather');

app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/treatment-plans', treatmentRoutes);
app.use('/api', weatherRoutes);

// Global error handler middleware
app.use((err, req, res, next) => {
    console.error('[GLOBAL ERROR HANDLER] Unhandled error:', err);
    console.error('Stack trace:', err.stack);
    console.error('Request:', {
        method: req.method,
        path: req.path,
        body: req.body,
        query: req.query
    });

    res.status(err.status || 500).json({
        error: 'Internal server error',
        message: err.message,
        details: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
});


app.listen(port, '0.0.0.0', () => {
    const hasApiKey = process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'YOUR_API_KEY_HERE';
    console.log(`\n🌱 AgriEye Backend running on http://0.0.0.0:${port}`);
    console.log(`📊 Mode: ${hasApiKey ? '✅ Gemini Vision AI' : '⚠️  Simulation (Set GEMINI_API_KEY)'}`);
    console.log(`🔬 Ready for disease analysis\n`);
});
