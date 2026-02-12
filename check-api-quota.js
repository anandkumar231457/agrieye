const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

async function checkAPIQuota() {
    console.log('🔍 Checking Gemini API Status...\n');

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey || apiKey === 'YOUR_API_KEY_HERE') {
        console.log('❌ No API key found in .env file');
        return;
    }

    console.log('✅ API Key found:', apiKey.substring(0, 10) + '...');

    const genAI = new GoogleGenerativeAI(apiKey);

    // Test with different models
    const modelsToTest = [
        'gemini-2.0-flash-exp',
        'gemini-1.5-flash',
        'gemini-1.5-flash-8b',
        'gemini-pro'
    ];

    console.log('\n📊 Testing Models:\n');

    for (const modelName of modelsToTest) {
        try {
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent('Hello');
            const response = await result.response;
            const text = response.text();

            console.log(`✅ ${modelName}: Working (Response: ${text.substring(0, 30)}...)`);
        } catch (error) {
            if (error.message.includes('429')) {
                console.log(`❌ ${modelName}: QUOTA EXCEEDED`);
            } else if (error.message.includes('404')) {
                console.log(`⚠️  ${modelName}: Not available`);
            } else {
                console.log(`❌ ${modelName}: Error - ${error.message.substring(0, 50)}`);
            }
        }
    }

    console.log('\n📈 Quota Information:');
    console.log('Free tier limits:');
    console.log('  - 15 requests per minute');
    console.log('  - 1,500 requests per day');
    console.log('  - 1 million tokens per day');
    console.log('\nTo check your usage: https://aistudio.google.com/app/apikey');
}

checkAPIQuota();
