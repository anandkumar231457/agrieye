const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const apiKey = process.env.GEMINI_API_KEY;
console.log('API Key configured:', apiKey ? 'YES (' + apiKey.substring(0, 5) + '...)' : 'NO');

const genAI = new GoogleGenerativeAI(apiKey);

async function testModel(modelName) {
    console.log(`\nTesting model: ${modelName}...`);
    try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent("Hello, are you working?");
        const response = await result.response;
        const text = response.text();
        console.log(`✅ SUCCESS: ${modelName} responded: "${text.substring(0, 20)}..."`);
    } catch (error) {
        console.error(`❌ FAILED: ${modelName} - ${error.message}`);
    }
}

async function runTests() {
    await testModel('gemini-1.5-flash');
    await testModel('gemini-2.0-flash');
    await testModel('gemini-2.5-flash');
    await testModel('gemini-pro');
}

runTests();
