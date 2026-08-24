/* ============================================================
   reports.js — Member 4: Analytics
   getExpenseStats() is the function Person 1 will call for the
   Dashboard: expenses: getExpenseStats()
   ============================================================ */

document.addEventListener("DOMContentLoaded", () => {
  seedVehiclesIfEmpty();

  renderStats();
  renderVehicleCostChart();
  renderEfficiencyChart();

  document.getElementById("exportFuelBtn").addEventListener("click", () => exportCSV("fuel"));
  document.getElementById("exportExpensesBtn").addEventListener("click", () => exportCSV("expenses"));
});

function getExpenseStats() {
  const fuelLogs = getData(LS_KEYS.fuelLogs);
  const expenses = getData(LS_KEYS.expenses);

  const totalFuelCost = fuelLogs.reduce((sum, l) => sum + l.cost, 0);
  const totalExpenseCost = expenses.reduce((sum, e) => sum + e.amount, 0);

  return {
    totalFuelCost,
    totalExpenseCost,
    totalOperatingCost: totalFuelCost + totalExpenseCost,
    fuelRecordCount: fuelLogs.length,
    expenseRecordCount: expenses.length,
  };
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
    return { name: v.name, total: fuelCost + expenseCost };
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
      return { name: v.name, rate, hasData: logs.length > 0 };
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