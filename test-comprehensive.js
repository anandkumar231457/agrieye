const { GoogleGenerativeAI } = require('@google/generative-ai');

async function testModels(apiKey) {
    console.log('🔍 Testing API Key:', apiKey.substring(0, 10) + '...\n');

    const genAI = new GoogleGenerativeAI(apiKey);

    const modelsToTest = [
        'gemini-pro',
        'gemini-1.5-pro',
        'gemini-2.0-flash-exp',
        'gemini-1.5-flash',
        'gemini-1.5-flash-8b',
        'models/gemini-pro',
        'models/gemini-1.5-flash'
    ];

    let workingModel = null;

    for (const modelName of modelsToTest) {
        try {
            console.log(`Testing ${modelName}...`);
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent('Hello');
            const response = await result.response;

            console.log(`✅ ${modelName} - WORKING!`);
            console.log(`   Response: ${response.text().substring(0, 30)}...\n`);

            if (!workingModel) {
                workingModel = modelName;
            }
        } catch (error) {
            if (error.message.includes('429')) {
                console.log(`❌ ${modelName} - Quota exceeded\n`);
            } else if (error.message.includes('404')) {
                console.log(`⚠️  ${modelName} - Not available\n`);
            } else if (error.message.includes('400')) {
                console.log(`❌ ${modelName} - Invalid API key\n`);
            } else {
                console.log(`❌ ${modelName} - Error\n`);
            }
        }
    }

    if (workingModel) {
        console.log(`\n✅ SUCCESS! Working model: ${workingModel}`);
        console.log(`\nUpdate your .env file with:`);
        console.log(`GEMINI_API_KEY=${apiKey}`);
    } else {
        console.log(`\n❌ No working models found`);
        console.log(`\nPossible solutions:`);
        console.log(`1. Enable Generative Language API at:`);
        console.log(`   https://console.cloud.google.com/apis/library/generativelanguage.googleapis.com`);
        console.log(`2. Create new API key from:`);
        console.log(`   https://aistudio.google.com/app/apikey`);
    }
}

const apiKey = 'AIzaSyA2kVfVYuJJQg7PVfDFEDMyoJIvocPDWLA';
testModels(apiKey);
