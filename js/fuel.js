
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("dateInput").valueAsDate = new Date();

  populateVehicleDropdowns();
  renderStats();
  renderTable();

  document.getElementById("fuelForm").addEventListener("submit", handleAddFuel);
  document.getElementById("searchInput").addEventListener("input", renderTable);
  document.getElementById("vehicleFilter").addEventListener("change", renderTable);
  document.getElementById("sortSelect").addEventListener("change", renderTable);
});

function populateVehicleDropdowns() {
  const vehicles = getVehicles();
  const select = document.getElementById("vehicleSelect");
  const filter = document.getElementById("vehicleFilter");

  vehicles.forEach((v) => {
    select.insertAdjacentHTML("beforeend", `<option value="${v.id}">${getVehicleName(v.id)}</option>`);
    filter.insertAdjacentHTML("beforeend", `<option value="${v.id}">${getVehicleName(v.id)}</option>`);
  });
}

function validateFuelForm({ vehicleId, litres, cost, date }) {
  let valid = true;
  clearErrors();

  if (!vehicleId) { setError("err-vehicle", "Select a vehicle."); valid = false; }
  if (!litres || litres <= 0) { setError("err-litres", "Enter litres greater than 0."); valid = false; }
  if (!cost || cost <= 0) { setError("err-cost", "Enter a valid cost."); valid = false; }
  if (!date) { setError("err-date", "Pick a date."); valid = false; }
  return valid;
}

function setError(id, msg) { document.getElementById(id).textContent = msg; }
function clearErrors() { document.querySelectorAll(".field-error").forEach((el) => (el.textContent = "")); }

function handleAddFuel(event) {
  event.preventDefault();

  const vehicleId = document.getElementById("vehicleSelect").value;
  const litres = parseFloat(document.getElementById("litresInput").value);
  const cost = parseFloat(document.getElementById("costInput").value);
  const odometer = document.getElementById("odometerInput").value;
  const date = document.getElementById("dateInput").value;

  if (!validateFuelForm({ vehicleId, litres, cost, date })) return;

  const record = {
    id: generateId("fuel"),
    vehicleId,
    litres,
    cost,
    odometer: odometer ? Number(odometer) : null,
    date,
  };

  const logs = getData(LS_KEYS.fuelLogs);
  logs.push(record);
  setData(LS_KEYS.fuelLogs, logs);

  showToast("Fuel record added.");
  event.target.reset();
  document.getElementById("dateInput").valueAsDate = new Date();
  renderStats();
  renderTable();
}

function deleteFuelRecord(id) {
  const logs = getData(LS_KEYS.fuelLogs);
  setData(LS_KEYS.fuelLogs, logs.filter((log) => log.id !== id));
  showToast("Fuel record deleted.", "error");
  renderStats();
  renderTable();
}

function renderStats() {
  const logs = getData(LS_KEYS.fuelLogs);
  const totalLitres = logs.reduce((sum, log) => sum + log.litres, 0);
  const totalCost = logs.reduce((sum, log) => sum + log.cost, 0);
  const avgRate = totalLitres > 0 ? totalCost / totalLitres : 0;

  document.getElementById("statGrid").innerHTML = `
    <div class="stat-card accent-amber">
      <div class="stat-top"><div class="stat-icon orange">⛽</div></div>
      <h2>${totalLitres.toFixed(1)}<span>L</span></h2>
      <p>Total Litres</p>
      <span class="stat-detail">${logs.length} records</span>
    </div>
    <div class="stat-card accent-rust">
      <div class="stat-top"><div class="stat-icon blue">₹</div></div>
      <h2>${formatCurrency(totalCost)}</h2>
      <p>Total Fuel Cost</p>
      <span class="stat-detail">All time</span>
    </div>
    <div class="stat-card accent-moss">
      <div class="stat-top"><div class="stat-icon cyan">≈</div></div>
      <h2>${formatCurrency(avgRate)}</h2>
      <p>Avg Rate / Litre</p>
      <span class="stat-detail">Across all fill-ups</span>
    </div>
  `;
}

function renderTable() {
  const logs = getData(LS_KEYS.fuelLogs);
  const searchTerm = document.getElementById("searchInput").value.toLowerCase();
  const vehicleFilterValue = document.getElementById("vehicleFilter").value;
  const sortMode = document.getElementById("sortSelect").value;

  let filtered = logs.filter((log) => {
    const vehicleName = getVehicleName(log.vehicleId).toLowerCase();
    const matchesSearch = vehicleName.includes(searchTerm);
    const matchesFilter = !vehicleFilterValue || log.vehicleId === vehicleFilterValue;
    return matchesSearch && matchesFilter;
  });

  const sorters = {
    "date-desc": (a, b) => new Date(b.date) - new Date(a.date),
    "date-asc": (a, b) => new Date(a.date) - new Date(b.date),
    "cost-desc": (a, b) => b.cost - a.cost,
    "litres-desc": (a, b) => b.litres - a.litres,
  };
  filtered = [...filtered].sort(sorters[sortMode]);

  const tbody = document.getElementById("fuelTableBody");

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr class="empty-row"><td colspan="7">No fuel records found.</td></tr>`;
    return;
  }

  tbody.innerHTML = filtered
    .map((log) => {
      const rate = (log.cost / log.litres).toFixed(2);
      return `
        <tr>
          <td>${formatDate(log.date)}</td>
          <td>${getVehicleName(log.vehicleId)}</td>
          <td class="mono">${log.litres.toFixed(1)} L</td>
          <td class="mono">${formatCurrency(log.cost)}</td>
          <td class="mono">₹${rate}</td>
          <td class="mono">${log.odometer ?? "—"}</td>
          <td><button class="btn btn--danger" onclick="deleteFuelRecord('${log.id}')">Delete</button></td>
        </tr>`;
    })
    .join("");
}
