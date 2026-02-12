const axios = require('axios');
const FormData = require('form-data');

// minimal 1x1 green pixel jpeg base64
const GREEN_PIXEL = "/9j/4AAQSkZJRgABAQEASABIAAD/2wBDCAgKCgoKCgsLCwtMCw0LDhAODQ0ODhQSERITExQVFBUVFRUVFxUXFxcXFxUFFxcXFxUXFxcXFxUXFxcXFxUXFxf/2wBDAQkKCg4MDhoPDxoYExQTGhoaGhoaGhoaGhoaGhoaGhoaGhoaGhoaGhoaGhoaGhoaGhoaGhoaGhoaGhoaGhoaGhr/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAf/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFAEBAAAAAAAAAAAAAAAAAAAAAP/EABQRAQAAAAAAAAAAAAAAAAAAAAD/2gAMAwEAAhEDEQA/AH8AP//Z";

async function testUpload() {
    try {
        const buffer = Buffer.from(GREEN_PIXEL, 'base64');
        const form = new FormData();
        form.append('files', buffer, { filename: 'green_leaf_test.jpg', contentType: 'image/jpeg' });
        form.append('crop', 'Tomato');

        console.log('Uploading green_leaf_test.jpg...');
        const response = await axios.post('http://localhost:8000/api/analyze', form, {
            headers: {
                ...form.getHeaders()
            }
        });

        console.log('Response:', JSON.stringify(response.data, null, 2));

    } catch (error) {
        console.error('Upload failed:', error.message);
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', error.response.data);
        }
    }
}

testUpload();
