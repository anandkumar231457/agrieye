const { GoogleGenerativeAI } = require('@google/generative-ai');

async function testAPIKey(apiKey) {
    console.log('🔍 Testing API Key:', apiKey.substring(0, 10) + '...\n');

    const genAI = new GoogleGenerativeAI(apiKey);

    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const result = await model.generateContent('Say hello in one word');
        const response = await result.response;

        console.log('✅ API Key is VALID!');
        console.log('Response:', response.text());
        console.log('\n✅ You can use this API key');
        return true;
    } catch (error) {
        console.log('❌ API Key is INVALID');
        console.log('Error:', error.message);

        if (error.message.includes('429')) {
            console.log('\n⚠️  Quota exceeded - wait 24 hours');
        } else if (error.message.includes('403') || error.message.includes('400')) {
            console.log('\n⚠️  API key is invalid or disabled');
        }
        return false;
    }
}

const apiKey = process.argv[2] || 'AIzaSyBwYUyy750xqH-t2Ykr6ZilvylkWSycEvs';
testAPIKey(apiKey);
