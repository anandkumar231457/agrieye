const FormData = require('form-data');
const fs = require('fs');
const axios = require('axios');

async function testESP32Upload() {
    console.log('🧪 Testing ESP32 Upload Flow...\n');

    // Create form data (simulating what ESP32 sends)
    const form = new FormData();

    // Add device info
    form.append('deviceId', 'ESP32_GATEWAY_01');
    form.append('crop', 'Tomato');

    // Add a test image (you can replace this with any image path)
    const imagePath = 'test-image.jpg'; // Put a test image here

    if (!fs.existsSync(imagePath)) {
        console.log('❌ Please create a test-image.jpg file in the backend-stub directory');
        console.log('   You can use any plant/leaf image for testing');
        return;
    }

    form.append('image', fs.createReadStream(imagePath));

    try {
        console.log('📤 Uploading to backend...');
        const response = await axios.post('http://localhost:8000/api/upload', form, {
            headers: form.getHeaders(),
            timeout: 60000
        });

        console.log('\n✅ Upload successful!');
        console.log('Response:', JSON.stringify(response.data, null, 2));
        console.log('\n📊 Now check the Field Nodes page at http://localhost:5173/monitoring');
        console.log('   The result should appear there within 30 seconds!');

    } catch (error) {
        console.error('❌ Upload failed:', error.message);
        if (error.response) {
            console.error('Response:', error.response.data);
        }
    }
}

testESP32Upload();
