const { GoogleGenerativeAI } = require('@google/generative-ai');

async function testNewKey() {
    const apiKey = 'AIzaSyBHPqsK3LJe5GNIkAgTYIT_4ZOYxx40yK8';
    console.log('🔍 Testing New API Key from Google AI Studio...\n');

    const genAI = new GoogleGenerativeAI(apiKey);

    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const result = await model.generateContent('Say hello in one word');
        const response = await result.response;

        console.log('✅✅✅ SUCCESS! API Key is WORKING! ✅✅✅\n');
        console.log('Response:', response.text());
        console.log('\n🎉 This API key is ready to use!');
        console.log('\nNext step: Update .env file with this key');
        return true;
    } catch (error) {
        console.log('❌ API Key test failed');
        console.log('Error:', error.message);
        return false;
    }
}

testNewKey();
