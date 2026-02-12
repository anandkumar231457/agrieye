const { GoogleGenerativeAI } = require('@google/generative-ai');

async function testModels(apiKey) {
    console.log('🔍 Testing API Key with different models...\n');

    const genAI = new GoogleGenerativeAI(apiKey);

    const modelsToTest = [
        'gemini-pro',
        'gemini-1.5-pro',
        'gemini-2.0-flash-exp',
        'gemini-1.5-flash',
        'gemini-1.5-flash-8b'
    ];

    let workingModel = null;

    for (const modelName of modelsToTest) {
        try {
            console.log(`Testing ${modelName}...`);
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent('Hello');
            const response = await result.response;

            console.log(`✅ ${modelName} - WORKING!`);
            console.log(`   Response: ${response.text().substring(0, 50)}...\n`);

            if (!workingModel) {
                workingModel = modelName;
            }
        } catch (error) {
            if (error.message.includes('429')) {
                console.log(`❌ ${modelName} - Quota exceeded\n`);
            } else if (error.message.includes('404')) {
                console.log(`⚠️  ${modelName} - Not available\n`);
            } else {
                console.log(`❌ ${modelName} - ${error.message.substring(0, 50)}...\n`);
            }
        }
    }

    if (workingModel) {
        console.log(`\n✅ API Key is VALID!`);
        console.log(`✅ Recommended model: ${workingModel}`);
    } else {
        console.log(`\n❌ No working models found`);
    }
}

const apiKey = 'AIzaSyBwYUyy750xqH-t2Ykr6ZilvylkWSycEvs';
testModels(apiKey);
