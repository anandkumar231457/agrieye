const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded images securely
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Storage Configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = 'uploads/';
        if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, `esp32-${Date.now()}${path.extname(file.originalname)}`);
    }
});
const upload = multer({ storage });

// Store LAST KNOWN analysis result (In-Memory Database)
let latestAnalysis = {
    disease: null,
    confidence: 0,
    timestamp: null,
    imageUrl: null,
    weather: null
};

// --- GEMINI AI SETUP ---
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function analyzeImage(imagePath) {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        // Read image file
        const imageFile = fs.readFileSync(imagePath);
        const imageBase64 = imageFile.toString('base64');

        const prompt = `Analyze this crop leaf image. Identify disease, confidence (0-1), severity (LOW/MEDIUM/HIGH), and symptoms. 
        Return ONLY valid JSON: { "disease_name": "string", "confidence": number, "severity": "string", "symptoms": ["string"] }`;

        const result = await model.generateContent([
            prompt,
            { inlineData: { data: imageBase64, mimeType: "image/jpeg" } }
        ]);

        const text = result.response.text();
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        return jsonMatch ? JSON.parse(jsonMatch[0]) : null;
    } catch (error) {
        console.error("Gemini Analysis Failed:", error.message);
        return null; // Return null on failure
    }
}

// --- API ROUTES ---

// 1. ESP32 Upload Endpoint
app.post('/api/upload', upload.single('imageFile'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).send('No image uploaded.');

        console.log(`📸 [ESP32] Image received: ${req.file.filename}`);
        const imagePath = req.file.path;
        const imageUrl = `http://${req.hostname}:${PORT}/uploads/${req.file.filename}`;

        // 🚀 Trigger AI Analysis immediately
        const analysis = await analyzeImage(imagePath);

        if (analysis) {
            console.log(`✅ [AI] Analysis complete: ${analysis.disease_name} (${analysis.confidence})`);

            // Update Global State for Field Node Page
            latestAnalysis = {
                ...analysis,
                imageUrl: imageUrl,
                timestamp: new Date().toISOString(),
                source: 'ESP32-CAM'
            };
        } else {
            console.log("⚠️ [AI] Analysis returned empty/failed.");
        }

        res.json({
            status: "success",
            message: "Image processed",
            analysis: analysis
        });

    } catch (error) {
        console.error("Upload Error:", error);
        res.status(500).send("Server Error");
    }
});

// 2. Field Node Endpoint (Frontend polls this)
app.get('/api/data', (req, res) => {
    // Return the latest data stored in memory
    res.json(latestAnalysis);
});

// 3. Heartbeat for ESP32
app.get('/', (req, res) => {
    res.send("AgriEye ESP32 Backend is Online 🟢"); // Simple text response for microcontroller
});

// Start Server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🌱 ESP32 Backend running on port ${PORT}`);
    console.log(`📡 Ready for ESP32-CAM uploads at /api/upload`);
});
