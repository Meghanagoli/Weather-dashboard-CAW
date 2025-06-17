import  { useState, useEffect } from "react";
import axios from "axios";
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const API = "http://localhost:5000";

function App() {
  const [city, setCity] = useState("");
  const [current, setCurrent] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [unit, setUnit] = useState("C"); // Celsius or Fahrenheit
  const [loading, setLoading] = useState(false);
const [error, setError] = useState("");
const [selectedDate, setSelectedDate] = useState("");
const [historical, setHistorical] = useState(null);

  const searchWeather = async () => {
    if (!city) return;
    setLoading(true);
    setError("");
    setHistorical(null); 
    try {
      const res1 = await axios.get(`${API}/weather/current/${city}`);
      const res2 = await axios.get(`${API}/weather/forecast/${city}`);
      setCurrent(res1.data);
      setForecast(res2.data);
    } catch (err) {
    setError("❌ City not found. Please try another.");
    setCurrent(null);
    setForecast(null);
  } finally {
      setLoading(false);
    }
  };

  const addToFavorites = async () => {
    if (!city || favorites.includes(city)) return;
    await axios.post(`${API}/weather/favorites`, { city });
    loadFavorites();
  };

 

  const loadFavorites = async () => {
    const res = await axios.get(`${API}/weather/favorites`);
    const uniqueCities = [...new Set(res.data.favorites)];
    setFavorites(uniqueCities);
  };

  useEffect(() => {
    loadFavorites();
  }, []);

  const toggleUnit = () => {
    setUnit(unit === "C" ? "F" : "C");
  };

  const convert = (tempC) => {
    return unit === "C"
      ? `${tempC}°C`
      : `${((tempC * 9) / 5 + 32).toFixed(1)}°F`;
  };
useEffect(() => {
  loadFavorites();

  // 🌍 Auto-fetch current location
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(async (position) => {
      const { latitude, longitude } = position.coords;
      const loc = `${latitude},${longitude}`;
      try {
        const res1 = await axios.get(`${API}/weather/current/${loc}`);
        const res2 = await axios.get(`${API}/weather/forecast/${loc}`);
        setCurrent(res1.data);
        setForecast(res2.data);
        setCity(res1.data.location.name); // set city name for input box
      } catch (err) {
        console.log("Geolocation weather fetch failed");
      }
    });
  }
}, []);
const removeFromFavorites = async (cityToRemove) => {
  try {
    await axios.delete(`${API}/weather/favorites/${cityToRemove}`);
    alert(`${cityToRemove} removed from favorites ✅`);
    loadFavorites();
  } catch (err) {
    console.error("Failed to remove favorite:", err);
    alert("❌ Failed to remove favorite");
  }
};

const fetchHistorical = async () => {
  if (!city || !selectedDate) return;
  try {
    const res = await axios.get(`${API}/weather/history/${city}/${selectedDate}`);
    setHistorical(res.data);
  } catch (err) {
    console.error("Historical fetch failed");
    setHistorical(null);
  }
};

const exportPDF = () => {
  const input = document.getElementById("report-section");
  if (!input) return;

  html2canvas(input, { scale: 2 }).then((canvas) => {
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save('weather-report.pdf');
  });
};


  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-100 to-white p-6 font-sans text-gray-800">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center">🌤️ Weather Dashboard</h1>

        {/* Search + Buttons */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-center mb-6">
  <input
    value={city}
    onChange={(e) => setCity(e.target.value)}
    placeholder="Enter city name"
    className="w-full md:w-1/2 p-3 rounded border border-gray-300 shadow-sm focus:outline-none"
  />

  <button
    onClick={searchWeather}
    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-sm rounded shadow min-w-[140px]"
  >
    🔍 Search
  </button>

  <button
    onClick={addToFavorites}
    className="bg-yellow-500 hover:bg-yellow-400 text-white px-4 py-2 text-sm rounded shadow min-w-[140px]"
  >
    ⭐ Mark Favorite
  </button>

  <button
    onClick={toggleUnit}
    className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 text-sm rounded shadow min-w-[140px]"
  >
    {unit === "C" ? "Switch to °F" : "Switch to °C"}
  </button>

  <button
    onClick={exportPDF}
    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 text-sm rounded shadow min-w-[140px]"
  >
    📄 Export Report
  </button>
</div>

{error && (
  <div className="text-center text-red-600 font-semibold mb-4">
    {error}
  </div>
)}
        {loading && (
          <div className="text-center text-blue-700 font-semibold mb-6 animate-pulse">
            🔄 Fetching weather data...
          </div>
        )}
<div className="mt-4 mb-6 text-center">
  <label className="block mb-2 text-sm font-semibold">Pick a date for historical weather :</label>
  <div className="flex justify-center gap-4">
    <input
      type="date"
      max={new Date().toISOString().split("T")[0]}
      value={selectedDate}
      onChange={(e) => setSelectedDate(e.target.value)}
      className="p-2 border rounded"
    />
    <button
      onClick={fetchHistorical}
      className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded shadow"
    >
      Fetch Historical
    </button>
  </div>
</div>

<div id="report-section">
  {historical && (
  <div className="bg-white rounded-xl shadow-md p-6 mb-6 border border-gray-200">
    <h2 className="text-2xl font-semibold mb-4">
      Historical Weather for {historical.location.name} on {historical.forecast.forecastday[0].date}
    </h2>
    <div className="flex items-center gap-4">
      <img
        src={historical.forecast.forecastday[0].day.condition.icon}
        alt="history-icon"
      />
      <div>
        <p className="text-lg font-medium">
          {historical.forecast.forecastday[0].day.condition.text}
        </p>
        <p className="text-lg">
          Avg Temp: {convert(historical.forecast.forecastday[0].day.avgtemp_c)}
        </p>
        <p className="text-sm text-gray-600">
          🌡️ Max: {convert(historical.forecast.forecastday[0].day.maxtemp_c)}, Min: {convert(historical.forecast.forecastday[0].day.mintemp_c)}
        </p>
        <p className="text-sm text-gray-600">
          💧 Humidity: {historical.forecast.forecastday[0].day.avghumidity}%
        </p>
      </div>
    </div>
  </div>
)}

  {/* ✅ Current Weather */}
  {current && (
    <div className="bg-white rounded-xl shadow-md p-6 mb-6 border border-gray-200">
      <h2 className="text-2xl font-semibold mb-2">
        Current Weather in {current.location.name}, {current.location.country}
      </h2>
      <div className="flex items-center gap-4">
        <img src={current.current.condition.icon} alt="icon" />
        <div>
          <p className="text-lg font-medium">{current.current.condition.text}</p>
          <p className="text-lg">{convert(current.current.temp_c)}</p>
          <p className="text-sm text-gray-600">💧 Humidity: {current.current.humidity}%</p>
          <p className="text-sm text-gray-600">💨 Wind: {current.current.wind_kph} kph</p>
        </div>
      </div>
    </div>
  )}

  {/* ✅ 5-Day Forecast */}
  {forecast && (
    <div className="bg-white rounded-xl shadow-md p-6 mb-6 border border-gray-200">
      <h2 className="text-2xl font-semibold mb-4">5-Day Forecast</h2>
      <div className="grid md:grid-cols-5 gap-4">
        {forecast.forecast.forecastday.map((day, i) => (
          <div key={i} className="p-4 border rounded shadow-sm text-center bg-gray-50">
            <p className="font-bold">{day.date}</p>
            <img src={day.day.condition.icon} alt="forecast" className="mx-auto" />
            <p>{day.day.condition.text}</p>
            <p className="text-sm text-gray-700">Avg: {convert(day.day.avgtemp_c)}</p>
          </div>
        ))}
      </div>
    </div>
  )}
</div>


        {/* Favorites */}
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
          <h2 className="text-2xl font-semibold mb-4">⭐ Favorite Cities</h2>
          {favorites.length === 0 ? (
            <p className="text-gray-600">No favorite cities saved.</p>
          ) : (
           <ul className="space-y-2">
  {favorites.map((fav, i) => (
    <li key={i} className="flex items-center justify-between border-b pb-2">
      <span className="text-lg">{fav}</span>
      <button
        onClick={() => removeFromFavorites(fav)}
        className="text-yellow-500 hover:text-yellow-700 text-lg"
      >
        ⭐ Remove
      </button>
    </li>
  ))}
</ul>

          )}
        </div>
      </div>
    </div>
  );
}

export default App;
