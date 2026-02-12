const { GoogleGenerativeAI } = require('@google/generative-ai');

const apiKeys = [
    'AIzaSyBVBVpatEH4cKyOK4sjE-G2pJe7jEpThBE',
    'AIzaSyCLZ-fXp28kUik2i4DtQb6W3qD7Tt95Usg',
    'AIzaSyCBFKGawuLN04_whi3kPc6pmiCtuMeLxgw',
    'AIzaSyD_Tb4jPVjziKeikITYXEfZc2E5cbmbq78'
];

// Try newer models with potentially better quotas
const modelsToTry = [
    'gemini-2.5-flash-lite',
    'gemini-2.5-flash',
    'gemini-flash-lite-latest',
    'gemini-flash-latest'
];

async function testNewModels() {
    console.log('🔍 Testing newer Gemini models with fresh quotas...\n');

    for (const modelName of modelsToTry) {
        console.log(`\n📝 Testing model: ${modelName}`);
        console.log('='.repeat(50));

        for (let i = 0; i < apiKeys.length; i++) {
            try {
                const genAI = new GoogleGenerativeAI(apiKeys[i]);
                const model = genAI.getGenerativeModel({ model: modelName });

                const result = await model.generateContent('Say hello in one word');
                const response = await result.response;
                const text = response.text();

                console.log(`✅ Key ${i + 1} + ${modelName}: SUCCESS! Response: ${text}`);
                console.log(`\n🎉 FOUND WORKING COMBINATION!\n`);
                return { keyIndex: i, model: modelName, key: apiKeys[i] };

            } catch (error) {
                const msg = error.message;
                if (msg.includes('429')) {
                    console.log(`⏱️ Key ${i + 1}: Rate limited`);
                } else if (msg.includes('404')) {
                    console.log(`❌ Key ${i + 1}: Model not found`);
                    break; // Skip to next model
                } else {
                    console.log(`❌ Key ${i + 1}: ${msg.substring(0, 80)}`);
                }
            }
        }
    }

    console.log('\n❌ All combinations failed. All keys are quota exhausted.');
}

testNewModels();
