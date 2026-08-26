/* ============================================================
   api.js — Member 4: Fetch API + REST API consumption
   Syllabus concepts (Lectures 25-28): Promises, Promise chaining,
   async/await, Fetch API, REST API, JSON handling, error handling.

   Uses Open-Meteo (https://open-meteo.com) — free, no API key,
   CORS-enabled. Meaningful for TransitOps: weather at a fleet's
   operating cities affects dispatch/trip risk.
   ============================================================ */

// WMO weather codes -> human-readable label + emoji.
// (Object used as a lookup map instead of a long if/else chain —
// same pattern as categoryPillClass in expenses.js.)
const WEATHER_CODES = {
  0: { label: "Clear sky", icon: "☀" },
  1: { label: "Mainly clear", icon: "🌤" },
  2: { label: "Partly cloudy", icon: "⛅" },
  3: { label: "Overcast", icon: "☁" },
  45: { label: "Fog", icon: "🌫" },
  48: { label: "Fog", icon: "🌫" },
  51: { label: "Light drizzle", icon: "🌦" },
  53: { label: "Drizzle", icon: "🌦" },
  55: { label: "Dense drizzle", icon: "🌧" },
  61: { label: "Light rain", icon: "🌧" },
  63: { label: "Rain", icon: "🌧" },
  65: { label: "Heavy rain", icon: "🌧" },
  71: { label: "Light snow", icon: "❄" },
  80: { label: "Rain showers", icon: "🌦" },
  81: { label: "Rain showers", icon: "🌦" },
  82: { label: "Violent showers", icon: "⛈" },
  95: { label: "Thunderstorm", icon: "⛈" },
};

function describeWeatherCode(code) {
  return WEATHER_CODES[code] || { label: "Unknown", icon: "•" };
}

// The cities your fleet operates in (matches the routes shown
// on the dashboard mockup: Chandigarh, Mohali, Patiala, Zirakpur, Ambala).
const FLEET_CITIES = [
  { name: "Chandigarh", lat: 30.7333, lon: 76.7794 },
  { name: "Mohali", lat: 30.7046, lon: 76.7179 },
  { name: "Patiala", lat: 30.3398, lon: 76.3869 },
  { name: "Zirakpur", lat: 30.6425, lon: 76.8173 },
  { name: "Ambala", lat: 30.3782, lon: 76.7767 },
];

// ---------- async/await + try/catch (Lecture 27-28 topics) ----------
async function fetchWeatherForCity(city) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${city.lat}&longitude=${city.lon}&current_weather=true`;

  try {
    const response = await fetch(url);          // Fetch API
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const data = await response.json();          // JSON handling
    const current = data.current_weather;

    return {
      city: city.name,
      temperature: current.temperature,
      windspeed: current.windspeed,
      ...describeWeatherCode(current.weathercode),
      ok: true,
    };
  } catch (error) {
    // Error handling — one city failing doesn't break the others
    console.error(`Weather fetch failed for ${city.name}:`, error);
    return { city: city.name, ok: false };
  }
}

// Fetch all cities in parallel with Promise.all — faster than
// awaiting them one by one, and still just one await overall.
async function fetchFleetWeather() {
  const results = await Promise.all(
    FLEET_CITIES.map((city) => fetchWeatherForCity(city))
  );
  return results;
}

// ---------- Route planning API (for Trips, per the team plan) ----------
// OSRM public demo server — free, no API key, CORS-enabled.
// This is the function Person 3 will call from Member 3's trips.js
// once "Create Trip" needs a distance/ETA estimate, the same way
// reports.js calls getExpenseStats() for the dashboard.
async function fetchRoute(fromName, toName) {
  const from = FLEET_CITIES.find((c) => c.name === fromName);
  const to = FLEET_CITIES.find((c) => c.name === toName);
  if (!from || !to) return { ok: false, error: "Unknown city" };

  const url = `https://router.project-osrm.org/route/v1/driving/${from.lon},${from.lat};${to.lon},${to.lat}?overview=false`;

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const data = await response.json();
    if (data.code !== "Ok") throw new Error(data.message || "No route found");

    const route = data.routes[0];
    return {
      ok: true,
      from: fromName,
      to: toName,
      distanceKm: (route.distance / 1000).toFixed(1),
      durationMin: Math.round(route.duration / 60),
    };
  } catch (error) {
    console.error(`Route fetch failed (${fromName} -> ${toName}):`, error);
    return { ok: false, error: error.message };
  }
}
