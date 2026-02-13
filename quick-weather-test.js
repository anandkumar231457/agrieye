const axios = require('axios');
const API_KEY = '3936b64fc24a2ed4ac50c714697f46ca';
const CITY = 'Puducherry';

async function testWeather() {
    console.log(`Testing Weather API for ${CITY}...`);
    try {
        const url = `https://api.openweathermap.org/data/2.5/weather?q=${CITY}&appid=${API_KEY}&units=metric`;
        const response = await axios.get(url);
        console.log('✅ Weather API Success!');
        console.log(`Temp: ${response.data.main.temp}°C`);
        console.log(`Condition: ${response.data.weather[0].description}`);
    } catch (error) {
        console.log('❌ Weather API Failed:', error.response?.data?.message || error.message);
    }
}
testWeather();
