const { GoogleGenerativeAI } = require('@google/generative-ai');

const apiKeys = [
    { name: 'Key 1 (New Account 1)', key: 'AIzaSyBVBVpatEH4cKyOK4sjE-G2pJe7jEpThBE' },
    { name: 'Key 2 (New Account 2)', key: 'AIzaSyCLZ-fXp28kUik2i4DtQb6W3qD7Tt95Usg' },
    { name: 'Key 3 (New Account 3)', key: 'AIzaSyCBFKGawuLN04_whi3kPc6pmiCtuMeLxgw' },
    { name: 'Key 4 (Previous Account)', key: 'AIzaSyD_Tb4jPVjziKeikITYXEfZc2E5cbmbq78' }
];

async function testAllKeys() {
    console.log('🔍 Testing all API keys...\n');

    const results = [];

    for (const apiKeyInfo of apiKeys) {
        try {
            console.log(`Testing: ${apiKeyInfo.name}`);
            const genAI = new GoogleGenerativeAI(apiKeyInfo.key);
            const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-lite-001' });

            const result = await model.generateContent('Say hello in one word');
            const response = await result.response;
            const text = response.text();

            console.log(`✅ SUCCESS! Response: ${text}`);
            results.push({ ...apiKeyInfo, status: 'working', response: text });

        } catch (error) {
            const msg = error.message;
            const retryMatch = msg.match(/retry in ([0-9.]+)s/);

            if (retryMatch) {
                console.log(`⏱️ Rate limited - Retry in: ${retryMatch[1]} seconds`);
                results.push({ ...apiKeyInfo, status: 'rate_limited', retryIn: retryMatch[1] });
            } else if (msg.includes('429')) {
                console.log(`❌ Quota exhausted`);
                results.push({ ...apiKeyInfo, status: 'quota_exhausted' });
            } else {
                console.log(`❌ Error: ${msg.substring(0, 100)}`);
                results.push({ ...apiKeyInfo, status: 'error', error: msg.substring(0, 100) });
            }
        }
        console.log('');
    }

    console.log('\n📊 Summary:');
    console.log('='.repeat(50));
    results.forEach((r, i) => {
        console.log(`${i + 1}. ${r.name}: ${r.status.toUpperCase()}`);
    });

    const workingKeys = results.filter(r => r.status === 'working');
    console.log(`\n✅ Working keys: ${workingKeys.length}/${results.length}`);

    return results;
}

testAllKeys();
