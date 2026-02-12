const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

async function testAnalyze() {
    try {
        // Create a dummy image file if it doesn't exist
        const dummyPath = path.join(__dirname, 'dummy.jpg');
        if (!fs.existsSync(dummyPath)) {
            fs.writeFileSync(dummyPath, Buffer.from('fake image data'));
        }

        const form = new FormData();
        form.append('crop', 'Tomato');
        form.append('files', fs.createReadStream(dummyPath));

        console.log('Sending request to http://localhost:8000/api/analyze...');

        const response = await axios.post('http://localhost:8000/api/analyze', form, {
            headers: {
                ...form.getHeaders()
            }
        });

        console.log('Response status:', response.status);
        console.log('Response data:', JSON.stringify(response.data, null, 2));

        if (Array.isArray(response.data) && response.data[0].disease_name === 'AI Service Unavailable (Check API Key)') {
            console.error('❌ FAILURE: Still getting AI Service Unavailable');
        } else {
            console.log('✅ SUCCESS: Got valid response (or at least not the specific fallback)');
        }

    } catch (error) {
        console.error('❌ Error:', error.message);
        if (error.response) {
            console.error('Response data:', error.response.data);
        }
    }
}

testAnalyze();
