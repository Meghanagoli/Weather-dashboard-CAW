const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();
app.use(cors());
app.use(express.json());
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const cache = {
  current: {},  // cache for current weather
  forecast: {}  // cache for forecast
};
const CACHE_TTL = 15 * 60 * 1000; // 15 minutes 

const API_KEY = process.env.WEATHER_API_KEY;
const FAVORITES_PATH = path.join(__dirname, 'favorites.json');
let favorites = [];
try {
  const data = fs.readFileSync(FAVORITES_PATH, 'utf-8');
  favorites = JSON.parse(data);
} catch (err) {
  console.error("Couldn't read favorites.json, using empty list.");
  favorites = [];
}
// 🌤️ Current Weather Route
app.get('/weather/current/:city', async (req, res) => {
  const city = req.params.city.toLowerCase();

  // Serve from cache if fresh
  if (
    cache.current[city] &&
    Date.now() - cache.current[city].timestamp < CACHE_TTL
  ) {
    console.log(`✅ Serving current weather for ${city} from cache`);
    return res.json(cache.current[city].data);
  }

  const url = `https://api.weatherapi.com/v1/current.json?key=${API_KEY}&q=${city}`;
  console.log(`🌐 Fetching current weather from: ${url}`);

  try {
    const response = await axios.get(url);
    cache.current[city] = {
      data: response.data,
      timestamp: Date.now()
    };
    res.json(response.data);
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({ error: 'City not found or API error' });
  }
});


//  Forecast Route (3-day forecast)
app.get('/weather/forecast/:city', async (req, res) => {
  const city = req.params.city.toLowerCase();

  if (
    cache.forecast[city] &&
    Date.now() - cache.forecast[city].timestamp < CACHE_TTL
  ) {
    console.log(`✅ Serving forecast for ${city} from cache`);
    return res.json(cache.forecast[city].data);
  }

  const url = `https://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=${city}&days=5`;
  console.log(`🌐 Fetching forecast from: ${url}`);

  try {
    const response = await axios.get(url);
    cache.forecast[city] = {
      data: response.data,
      timestamp: Date.now()
    };
    res.json(response.data);
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({ error: 'City not found or API error' });
  }
});


//  Save Favorite City
app.post('/weather/favorites', (req, res) => {
  const { city } = req.body;
  if (!favorites.includes(city)) {
    favorites.push(city);

    // Save to file
    fs.writeFile(FAVORITES_PATH, JSON.stringify(favorites, null, 2), (err) => {
      if (err) {
        console.error("Error saving favorites:", err);
      }
    });
  }
  res.json({ favorites });
});


// Get All Favorites
app.get('/weather/favorites', (req, res) => {
  res.json({ favorites });
});
app.get('/weather/history/:city/:date', async (req, res) => {
  const { city, date } = req.params;
  const url = `https://api.weatherapi.com/v1/history.json?key=${API_KEY}&q=${city}&dt=${date}`;
  console.log(`Fetching historical weather from: ${url}`);

  try {
    const response = await axios.get(url);
    res.json(response.data);
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({ error: 'City/date not found or API error' });
  }
});

//  Remove Favorite City
app.delete('/weather/favorites/:city', (req, res) => {
  const cityToRemove = req.params.city;

  // Filtering out the city from the favorites array (case-insensitive match)
  const updatedFavorites = favorites.filter(
    (fav) => fav.toLowerCase() !== cityToRemove.toLowerCase()
  );

  if (updatedFavorites.length === favorites.length) {
    return res.status(404).json({ error: 'City not found in favorites' });
  }

  favorites = updatedFavorites;

  // Persist updated favorites to the file
  fs.writeFile(FAVORITES_PATH, JSON.stringify(favorites, null, 2), (err) => {
    if (err) {
      console.error('Error writing to favorites.json:', err);
      return res.status(500).json({ error: 'Failed to update favorites' });
    }

    res.json({ favorites });
  });
});

app.listen(5000, () => console.log('Server started on port 5000'));
