const { GoogleGenerativeAI } = require('@google/generative-ai');

async function listAvailableModels() {
    const apiKey = 'AIzaSyBHPqsK3LJe5GNIkAgTYIT_4ZOYxx40yK8';
    console.log('🔍 Listing Available Models...\n');

    const genAI = new GoogleGenerativeAI(apiKey);

    try {
        // Try to list models
        const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models?key=' + apiKey);
        const data = await response.json();

        if (data.models) {
            console.log('✅ Available Models:\n');
            data.models.forEach(model => {
                console.log(`- ${model.name}`);
                if (model.supportedGenerationMethods) {
                    console.log(`  Methods: ${model.supportedGenerationMethods.join(', ')}`);
                }
            });

            // Test first available model
            if (data.models.length > 0) {
                const firstModel = data.models[0].name.replace('models/', '');
                console.log(`\n🧪 Testing first model: ${firstModel}...`);

                const model = genAI.getGenerativeModel({ model: firstModel });
                const result = await model.generateContent('Hello');
                const text = await result.response.text();

                console.log(`✅ SUCCESS! Model works!`);
                console.log(`Response: ${text}\n`);
                console.log(`✅ Use this API key with model: ${firstModel}`);
            }
        } else {
            console.log('❌ No models available');
            console.log('Response:', JSON.stringify(data, null, 2));
        }
    } catch (error) {
        console.log('❌ Error listing models:');
        console.log(error.message);
    }
}

listAvailableModels();
