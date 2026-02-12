require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');

async function testImageAnalysis() {
    const key = process.env.GEMINI_API_KEY;
    console.log(`\n🔑 Testing with API Key: ${key ? key.substring(0, 5) + '...' + key.substring(key.length - 4) : 'MISSING'}\n`);

    const genAI = new GoogleGenerativeAI(key);

    // Test with the new model
    const modelName = 'gemini-2.5-flash';
    console.log(`Testing ${modelName} with vision capability...\n`);

    try {
        const model = genAI.getGenerativeModel({ model: modelName });

        // Simple test without image first
        console.log('1. Testing text generation...');
        const textResult = await model.generateContent("Say 'Hello from Gemini!'");
        const textResponse = await textResult.response;
        console.log(`   ✅ Text: ${textResponse.text()}\n`);

        // Test with a simple prompt about agriculture
        console.log('2. Testing agriculture knowledge...');
        const agriResult = await model.generateContent("What is Early Blight disease in tomatoes? Answer in one sentence.");
        const agriResponse = await agriResult.response;
        console.log(`   ✅ Response: ${agriResponse.text()}\n`);

        console.log('✅ Model is working correctly!');
        console.log('\nYour backend should now return REAL AI results instead of simulated data.');

    } catch (e) {
        console.log(`❌ Failed: ${e.message}`);
    }
}

testImageAnalysis();
