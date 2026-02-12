const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

async function quickTest() {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const result = await model.generateContent('Say hello');
        const response = await result.response;
        console.log('✅ API is working!');
        console.log('Response:', response.text());
    } catch (error) {
        console.log('❌ API Error:');
        console.log(error.message);

        if (error.message.includes('429')) {
            console.log('\n⚠️  QUOTA EXCEEDED - Wait 24 hours or use different API key');
        } else if (error.message.includes('403')) {
            console.log('\n⚠️  API KEY INVALID or DISABLED');
        }
    }
}

quickTest();
