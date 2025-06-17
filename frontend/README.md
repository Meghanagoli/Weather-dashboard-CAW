# 🌦️ Full Stack Weather Dashboard

A responsive weather application built using **React**, **Node.js**, and the **WeatherAPI**, offering live, forecasted, and historical weather insights — with PDF export and favorites management.

---

## 🚀 Features

- 🌍 **Current Location Weather** using Geolocation API
- 🔍 **Search by City** to view:
  - ✅ Current weather
  - 📅 5-day forecast
  - 🕰️ Historical weather (by selected date)
- ⭐ **Add/Remove Favorite Cities** (persisted to file)
- 🌓 **Toggle Temperature Units** (°C / °F)
- 📄 **Export Weather Report to PDF**
- ⚡ **In-memory Caching** (current & forecast) to reduce API load
- 💾 Persistent file storage of favorites (`favorites.json`)

---

## 🖥️ Tech Stack

### Frontend

- React.js
- TailwindCSS
- Axios
- html2canvas + jsPDF

### Backend

- Node.js
- Express.js
- Axios
- dotenv
- File System (`fs`)

---

## 📦 Installation & Setup

### 📁 Clone the repository

```bash
git clone https://github.com/your-username/weather-dashboard.git
cd weather-dashboard
```

---

### 🔧 Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file with your [WeatherAPI](https://www.weatherapi.com/) key:

```env
WEATHER_API_KEY=your_weatherapi_key_here
```

Start the backend server:

```bash
node server.js
```

Your backend will now run at: `http://localhost:5000`

---

### 💻 Frontend Setup

```bash
cd ../front
npm install
npm start
```

Visit your app at: `http://localhost:3000`

---

## 🔗 API Endpoints

| Method   | Endpoint                       | Description                  |
| -------- | ------------------------------ | ---------------------------- |
| `GET`    | `/weather/current/:city`       | Get current weather          |
| `GET`    | `/weather/forecast/:city`      | Get 5-day forecast           |
| `GET`    | `/weather/history/:city/:date` | Get historical data          |
| `GET`    | `/weather/favorites`           | Get all favorite cities      |
| `POST`   | `/weather/favorites`           | Add a city to favorites      |
| `DELETE` | `/weather/favorites/:city`     | Remove a city from favorites |

---

---

## 🧠 How It Works

- **Geolocation Support**: On first load, the app fetches your current weather using browser geolocation.
- **City Search**: Lets users search for weather details of any city.
- **Forecast**: Displays a 5-day weather forecast using WeatherAPI.
- **History**: Fetches past weather data for a selected date.
- **Favorites**: Cities added to favorites are persisted in `favorites.json` on the backend.
- **Export to PDF**: Weather reports can be exported as PDFs using `html2canvas` and `jsPDF`.
- **In-memory Caching**: Reduces unnecessary API calls by caching current and forecast data for 10 minutes.

---

## 📝 Notes

- Make sure both backend and frontend are running simultaneously.
- This app uses the free tier of [WeatherAPI](https://www.weatherapi.com/).
- The backend stores favorite cities in a simple JSON file (no database).

---
