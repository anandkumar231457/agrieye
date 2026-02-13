const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');
const path = require('path');

async function testESP32Upload() {
    // 1. Create a dummy image if not exists (or use an existing one)
    // We'll try to find an existing image in the directory
    // For this test, let's just use a text file masquerading or try to find a real image
    // Actually, let's use a 1x1 pixel png if we can, or just try to find a .jpg in the current dir

    // Let's create a dummy file
    const dummyPath = 'test_leaf.jpg';
    if (!fs.existsSync(dummyPath)) {
        fs.writeFileSync(dummyPath, 'fake image data');
        // Note: Real Gemini API will fail on fake image data, but the upload endpoint should accept it
        // and try to process it. We want to see if it reaches the server.
    }

    const form = new FormData();
    form.append('imageFile', fs.createReadStream(dummyPath));

    try {
        console.log('📤 Sending image to ESP32 Backend...');
        const response = await axios.post('http://localhost:8000/api/upload', form, {
            headers: {
                ...form.getHeaders()
            }
        });

        console.log('✅ Upload Success:', response.data);
    } catch (error) {
        console.error('❌ Upload Failed:', error.response ? error.response.data : error.message);
    }
}

testESP32Upload();
