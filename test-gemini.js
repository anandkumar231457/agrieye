require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function testConnection() {
    const key = process.env.GEMINI_API_KEY;
    console.log(`\n🔑 Key: ${key ? key.substring(0, 5) + '...' + key.substring(key.length - 4) : 'MISSING'}`);

    const genAI = new GoogleGenerativeAI(key);
    // Try gemini-pro first as it is standard
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    try {
        process.stdout.write("Testing gemini-pro... ");
        const result = await model.generateContent("Say 'Verified'");
        console.log(`✅ Success! Response: ${result.response.text().trim()}`);
    } catch (e) {
        console.log(`❌ Failed: ${e.message}`);
    }
}
testConnection();
