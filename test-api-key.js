const { GoogleGenerativeAI } = require('@google/generative-ai');

async function testAPIKey() {
    const apiKey = 'AIzaSyBFhDlJiNq29B-xonHLXMGjQXoSOS1Jv6o';
    const genAI = new GoogleGenerativeAI(apiKey);

    console.log('Testing Gemini API Key...\n');

    // Try different models
    const models = [
        'gemini-2.0-flash-lite-001',
        'gemini-flash-latest',
        'gemini-pro-latest'
    ];

    for (const modelName of models) {
        try {
            console.log(`Testing model: ${modelName}`);
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent('Say hello in one word');
            const response = await result.response;
            const text = response.text();
            console.log(`✅ SUCCESS! Model ${modelName} works!`);
            console.log(`Response: ${text}\n`);
            return; // Exit on first success
        } catch (error) {
            console.log(`❌ FAILED: ${modelName}`);
            console.log(`Error: ${error.message}\n`);
        }
    }

    console.log('All models failed. API key may be invalid or quota exhausted.');
}

testAPIKey();
