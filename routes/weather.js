const express = require('express');
const router = express.Router();

// Get weather for a location
router.get('/weather', async (req, res) => {
    try {
        const { location } = req.query;

        if (!location) {
            return res.status(400).json({ error: 'Location is required' });
        }

        const apiKey = process.env.WEATHER_API_KEY;
        if (!apiKey) {
            return res.status(500).json({ error: 'Weather API key not configured' });
        }

        // Fetch weather from OpenWeatherMap API
        const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(location)}&appid=${apiKey}&units=metric`;

        const response = await fetch(weatherUrl);

        if (!response.ok) {
            if (response.status === 404) {
                return res.status(404).json({ error: 'Location not found' });
            }
            throw new Error('Weather API request failed');
        }

        const data = await response.json();

        // Format weather data
        const weatherData = {
            location: data.name,
            country: data.sys.country,
            temperature: Math.round(data.main.temp),
            feelsLike: Math.round(data.main.feels_like),
            humidity: data.main.humidity,
            pressure: data.main.pressure,
            windSpeed: data.wind.speed,
            description: data.weather[0].description,
            icon: data.weather[0].icon,
            main: data.weather[0].main
        };

        res.json(weatherData);
    } catch (error) {
        console.error('Weather API error:', error);
        res.status(500).json({ error: 'Failed to fetch weather data' });
    }
});

module.exports = router;
