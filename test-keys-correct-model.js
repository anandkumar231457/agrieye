const { GoogleGenerativeAI } = require('@google/generative-ai');

const apiKeys = [
    'AIzaSyBVBVpatEH4cKyOK4sjE-G2pJe7jEpThBE',
    'AIzaSyCLZ-fXp28kUik2i4DtQb6W3qD7Tt95Usg',
    'AIzaSyCBFKGawuLN04_whi3kPc6pmiCtuMeLxgw',
    'AIzaSyD_Tb4jPVjziKeikITYXEfZc2E5cbmbq78'
];

async function testKeysWithCorrectModel() {
    console.log('🔍 Testing API keys with gemini-1.5-flash (better free tier support)...\n');

    for (let i = 0; i < apiKeys.length; i++) {
        try {
            console.log(`Testing Key ${i + 1}...`);
            const genAI = new GoogleGenerativeAI(apiKeys[i]);
            const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

            const result = await model.generateContent('Say hello');
            const response = await result.response;
            const text = response.text();

            console.log(`✅ Key ${i + 1} WORKS! Response: ${text}\n`);
        } catch (error) {
            const msg = error.message;
            if (msg.includes('429')) {
                const retryMatch = msg.match(/retry in ([0-9.]+)s/);
                if (retryMatch) {
                    console.log(`⏱️ Key ${i + 1}: Rate limited - Retry in ${retryMatch[1]}s\n`);
                } else {
                    console.log(`❌ Key ${i + 1}: Quota exhausted\n`);
                }
            } else if (msg.includes('404')) {
                console.log(`❌ Key ${i + 1}: Model not found - ${msg.substring(0, 100)}\n`);
            } else {
                console.log(`❌ Key ${i + 1}: Error - ${msg.substring(0, 100)}\n`);
            }
        }

        // Wait 2 seconds between tests to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 2000));
    }
}

testKeysWithCorrectModel();
