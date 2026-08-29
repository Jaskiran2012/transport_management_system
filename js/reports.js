
document.addEventListener("DOMContentLoaded", () => {
  renderStats();
  renderVehicleCostChart();
  renderEfficiencyChart();
  loadWeatherPanel();
  populateRouteCityDropdowns();

  document.getElementById("exportFuelBtn").addEventListener("click", () => exportCSV("fuel"));
  document.getElementById("exportExpensesBtn").addEventListener("click", () => exportCSV("expenses"));
  document.getElementById("routeForm").addEventListener("submit", handleRouteSubmit);
});

// ---------- Live Conditions panel (Fetch API + async/await) ----------
async function loadWeatherPanel() {
  const container = document.getElementById("weatherPanel");
  const results = await fetchFleetWeather(); // defined in api.js

  container.innerHTML = results
    .map((w) => {
      if (!w.ok) {
        return `<div class="weather-card weather-card--error">${w.city}<br>Unavailable right now</div>`;
      }
      return `
        <div class="weather-card">
          <div class="weather-card__icon">${w.icon}</div>
          <div class="weather-card__city">${w.city}</div>
          <div class="weather-card__temp">${w.temperature}°C</div>
          <div class="weather-card__label">${w.label}</div>
          <div class="weather-card__wind">Wind ${w.windspeed} km/h</div>
        </div>`;
    })
    .join("");

  // chart driven directly by the same API response — no extra fetch
  const chartRows = results
    .filter((w) => w.ok)
    .map((w) => ({ name: w.city, temp: w.temperature }));
  renderBarChart("weatherChart", chartRows, "temp", (v) => `${v}°C`);
}

// ---------- Route planner (Fetch API, for Trips integration) ----------
function populateRouteCityDropdowns() {
  const fromSelect = document.getElementById("fromCity");
  const toSelect = document.getElementById("toCity");

  FLEET_CITIES.forEach((city) => {
    fromSelect.insertAdjacentHTML("beforeend", `<option value="${city.name}">${city.name}</option>`);
    toSelect.insertAdjacentHTML("beforeend", `<option value="${city.name}">${city.name}</option>`);
  });
  toSelect.selectedIndex = 1; // default to a different city than "from"
}

async function handleRouteSubmit(event) {
  event.preventDefault();
  const from = document.getElementById("fromCity").value;
  const to = document.getElementById("toCity").value;
  const resultBox = document.getElementById("routeResult");

  if (from === to) {
    resultBox.innerHTML = `<p style="color:var(--muted); font-size:13px;">Pick two different cities.</p>`;
    return;
  }

  resultBox.innerHTML = `<p style="color:var(--muted); font-size:13px;">Calculating route…</p>`;

  const route = await fetchRoute(from, to); // defined in api.js

  if (!route.ok) {
    resultBox.innerHTML = `<p style="color:var(--muted); font-size:13px;">Couldn't fetch a route right now. Try again.</p>`;
    return;
  }

  resultBox.innerHTML = `
    <div class="stat-card accent-blue" style="max-width:320px;">
      <div class="stat-top"><div class="stat-icon cyan">↗</div></div>
      <h2>${route.distanceKm} km</h2>
      <p>${route.from} → ${route.to}</p>
      <span class="stat-detail">~${route.durationMin} min drive time</span>
    </div>
  `;
}

function renderStats() {
  const { totalFuelCost, totalExpenseCost, totalOperatingCost } = getExpenseStats();
  const vehicles = getVehicles();
  const perVehicleAvg = vehicles.length > 0 ? totalOperatingCost / vehicles.length : 0;

  document.getElementById("statGrid").innerHTML = `
    <div class="stat-card accent-rust">
      <div class="stat-top"><div class="stat-icon blue">₹</div></div>
      <h2>${formatCurrency(totalOperatingCost)}</h2>
      <p>Total Operating Cost</p>
      <span class="stat-detail">Fuel + expenses</span>
    </div>
    <div class="stat-card accent-amber">
      <div class="stat-top"><div class="stat-icon orange">⛽</div></div>
      <h2>${formatCurrency(totalFuelCost)}</h2>
      <p>Fuel Cost</p>
      <span class="stat-detail">All time</span>
    </div>
    <div class="stat-card accent-moss">
      <div class="stat-top"><div class="stat-icon purple">◇</div></div>
      <h2>${formatCurrency(totalExpenseCost)}</h2>
      <p>Other Expenses</p>
      <span class="stat-detail">All time</span>
    </div>
    <div class="stat-card accent-blue">
      <div class="stat-top"><div class="stat-icon cyan">≈</div></div>
      <h2>${formatCurrency(perVehicleAvg)}</h2>
      <p>Avg Cost / Vehicle</p>
      <span class="stat-detail">Across fleet</span>
    </div>
  `;
}

function renderVehicleCostChart() {
  const vehicles = getVehicles();
  const fuelLogs = getData(LS_KEYS.fuelLogs);
  const expenses = getData(LS_KEYS.expenses);

  const rows = vehicles.map((v) => {
    const fuelCost = fuelLogs.filter((l) => l.vehicleId === v.id).reduce((s, l) => s + l.cost, 0);
    const expenseCost = expenses.filter((e) => e.vehicleId === v.id).reduce((s, e) => s + e.amount, 0);
    return { name: getVehicleName(v.id), total: fuelCost + expenseCost };
  });

  renderBarChart("vehicleCostChart", rows, "total", formatCurrency);
}

function renderEfficiencyChart() {
  const vehicles = getVehicles();
  const fuelLogs = getData(LS_KEYS.fuelLogs);

  const rows = vehicles
    .map((v) => {
      const logs = fuelLogs.filter((l) => l.vehicleId === v.id);
      const litres = logs.reduce((s, l) => s + l.litres, 0);
      const cost = logs.reduce((s, l) => s + l.cost, 0);
      const rate = litres > 0 ? cost / litres : 0;
      return { name: getVehicleName(v.id), rate, hasData: logs.length > 0 };
    })
    .filter((r) => r.hasData);

  renderBarChart("efficiencyChart", rows, "rate", (v) => `₹${v.toFixed(2)}`);
}

function renderBarChart(containerId, rows, valueKey, formatFn = (v) => v) {
  const container = document.getElementById(containerId);

  if (rows.length === 0) {
    container.innerHTML = `<p style="color:var(--muted); font-size:13px;">No data yet — add some records first.</p>`;
    return;
  }

  const max = Math.max(...rows.map((r) => r[valueKey]), 1);

  container.innerHTML = [...rows]
    .sort((a, b) => b[valueKey] - a[valueKey])
    .map((r) => {
      const pct = Math.max((r[valueKey] / max) * 100, 3);
      return `
        <div class="bar-row">
          <div class="bar-row__label">${r.name}</div>
          <div class="bar-row__track"><div class="bar-row__fill" style="width:${pct}%"></div></div>
          <div class="bar-row__value">${formatFn(r[valueKey])}</div>
        </div>`;
    })
    .join("");
}

function exportCSV(type) {
  const data = type === "fuel" ? getData(LS_KEYS.fuelLogs) : getData(LS_KEYS.expenses);
  if (data.length === 0) {
    showToast("Nothing to export yet.", "error");
    return;
  }

  const headers = Object.keys(data[0]);
  const rows = data.map((row) =>
    headers.map((h) => (h === "vehicleId" ? getVehicleName(row[h]) : row[h])).join(",")
  );
  const csvContent = [headers.join(","), ...rows].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${type}-export.csv`;
  a.click();
  URL.revokeObjectURL(url);

  showToast(`${type === "fuel" ? "Fuel logs" : "Expenses"} exported.`);
}
