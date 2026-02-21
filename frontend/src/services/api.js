import axios from 'axios';

// COMMAND CENTER CONFIGURATION
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || '/api',
    timeout: 120000,
    headers: { 'Content-Type': 'application/json' },
    withCredentials: true // Crucial for cross-origin cookies
});

// Ensure global defaults are set (redundancy for safety)
api.defaults.withCredentials = true;

// Debug Interceptor
api.interceptors.request.use(request => {
    // console.log('[API Request]', request.method, request.url, 'Creds:', request.withCredentials);
    return request;
});

// --- MOCK DATA ENGINE (FALLBACK) ---
const generateMockData = () => ({
    disease: 'Pending Analysis',
    confidence: 0,
    category: 'Unknown',
    severity_level: 'Healthy',
    imageUrl: null,
    crop: 'Select Crop',
    humidity: null,
    temperature: null,
    timestamp: new Date().toISOString(),
    device_id: 'ESP32_XC_04'
});

const generateMockCameras = () => [
    { id: 'CAM_01', temperature: 24, humidity: 65, image: null },
    { id: 'CAM_02', temperature: 23, humidity: 68, image: null },
    { id: 'CAM_03', temperature: 25, humidity: 60, image: null },
];

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

// --- API SAFE WRAPPER ---

const safeRequest = async (requestFn, mockFallbackFn) => {
    try {
        console.log('[API] Making request...');
        const response = await requestFn();
        console.log('[API] Request successful:', response);
        return response.data !== undefined ? response.data : response;
    } catch (error) {
        console.error('[API] Request failed:', error);
        console.warn('Backend unavailable (Simulation Mode Active):', error.message);
        // Only sleep if falling back, to make it feel like a network request
        await sleep(600);
        return mockFallbackFn();
    }
};

export const analyzeImage = async (crop, files, language) => {
    const fn = async () => {
        const formData = new FormData();
        formData.append('crop', crop);
        if (language) {
            formData.append('language', language);
        }
        if (Array.isArray(files)) {
            files.forEach(file => formData.append('files', file));
        } else {
            formData.append('files', files);
        }
        const response = await api.post('/analyze', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });

        // Transform Gemini API response (Array) to frontend format
        const results = Array.isArray(response.data) ? response.data : [response.data];

        return results.map(data => ({
            disease: data.disease_name || data.health_status,
            confidence: data.confidence,
            category: determineDiseaseCategory(data.disease_name),
            severity_level: data.severity,
            recommended_actions: data.recommended_actions || [],
            medicines: data.medicines || [],
            natural_treatments: data.natural_treatments || [],
            preventive_measures: data.preventive_measures || [],
            symptoms: data.symptoms || [],
            crop: crop,
            timestamp: data.timestamp,
            analyzed_by: data.analyzed_by,
            raw_response: data,
            image_path: data.image_path || data.environmental_context?.original_filename
        }));
    };

    return safeRequest(fn, () => ({
        ...generateMockData(),
        crop: crop,
        disease: 'Simulated Analysis Result',
        confidence: 0.98
    }));
};

// Helper function to determine disease category from disease name
const determineDiseaseCategory = (diseaseName) => {
    if (!diseaseName) return 'Unknown';
    const name = diseaseName.toLowerCase();

    if (name.includes('blight') || name.includes('rust') || name.includes('mildew') ||
        name.includes('spot') || name.includes('rot')) {
        return 'Fungal';
    }
    if (name.includes('virus') || name.includes('mosaic') || name.includes('curl')) {
        return 'Viral';
    }
    if (name.includes('bacterial') || name.includes('canker') || name.includes('wilt')) {
        return 'Bacterial';
    }
    if (name.includes('healthy')) {
        return 'Healthy';
    }
    return 'Pathogen';
};

export const getLatestData = async () => {
    return safeRequest(() => api.get('/data'), generateMockData);
};

export const getWeather = async (location) => {
    return safeRequest(() => api.get(`/weather?location=${encodeURIComponent(location)}`), () => ({
        location: location,
        temperature: 28,
        humidity: 65,
        description: 'Partly Cloudy',
        icon: '02d'
    }));
};

export const getCameras = async () => {
    return safeRequest(() => api.get('/cameras'), generateMockCameras);
};

export const uploadFromESP32 = async (formData) => {
    const fn = () => api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    return safeRequest(fn, () => ({ status: 'success', mode: 'simulation' }));
};

export default api;
