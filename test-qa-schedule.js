const axios = require('axios');

async function testQA() {
    console.log('Testing Chatbot (QA) endpoint with gemini-2.5-flash...');

    try {
        const response = await axios.post('http://localhost:8000/api/qa', {
            question: "How do I treat early blight in tomatoes?",
            context: "Disease: Early Blight, Severity: Medium"
        });

        console.log('✅ QA Success!');
        console.log('Answer:', response.data.answer.substring(0, 100) + '...');

    } catch (error) {
        console.log('❌ QA Failed:', error.response?.data || error.message);
    }
}

async function testSchedule() {
    console.log('\nTesting Treatment Planner...');

    try {
        const response = await axios.post('http://localhost:8000/api/generate-schedule', {
            disease: "Early Blight",
            severity: "HIGH",
            treatmentType: "organic",
            naturalTreatments: ["Neem oil", "Copper fungicide"]
        });

        console.log('✅ Schedule Success!');
        if (response.data.schedule) {
            console.log('Plan length:', response.data.schedule.length, 'days');
        } else {
            console.log('Response:', response.data);
        }

    } catch (error) {
        console.log('❌ Schedule Failed:', error.response?.data || error.message);
    }
}

async function runTests() {
    await testQA();
    await testSchedule();
}

runTests();
