/* ============================================================
   expenses.js — Member 4: Toll / Maintenance / Other expenses
   ============================================================ */

const categoryPillClass = {
  Toll: "pill--toll",
  Maintenance: "pill--maintenance",
  Other: "pill--other",
};

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("dateInput").valueAsDate = new Date();

  populateVehicleDropdown();
  renderStats();
  renderTable();

  document.getElementById("expenseForm").addEventListener("submit", handleAddExpense);
  document.getElementById("searchInput").addEventListener("input", renderTable);
  document.getElementById("categoryFilter").addEventListener("change", renderTable);
  document.getElementById("sortSelect").addEventListener("change", renderTable);
});

function populateVehicleDropdown() {
  const vehicles = getVehicles();
  const select = document.getElementById("vehicleSelect");
  vehicles.forEach((v) => {
    select.insertAdjacentHTML("beforeend", `<option value="${v.id}">${getVehicleName(v.id)}</option>`);
  });
}

function validateExpenseForm({ vehicleId, amount, date }) {
  let valid = true;
  clearErrors();
  if (!vehicleId) { setError("err-vehicle", "Select a vehicle."); valid = false; }
  if (!amount || amount <= 0) { setError("err-amount", "Enter a valid amount."); valid = false; }
  if (!date) { setError("err-date", "Pick a date."); valid = false; }
  return valid;
}
function setError(id, msg) { document.getElementById(id).textContent = msg; }
function clearErrors() { document.querySelectorAll(".field-error").forEach((el) => (el.textContent = "")); }

function handleAddExpense(event) {
  event.preventDefault();

  const vehicleId = document.getElementById("vehicleSelect").value;
  const category = document.getElementById("categorySelect").value;
  const amount = parseFloat(document.getElementById("amountInput").value);
  const date = document.getElementById("dateInput").value;
  const note = document.getElementById("noteInput").value.trim();

  if (!validateExpenseForm({ vehicleId, amount, date })) return;

  const record = { id: generateId("exp"), vehicleId, category, amount, date, note };

  const expenses = getData(LS_KEYS.expenses);
  expenses.push(record);
  setData(LS_KEYS.expenses, expenses);

  showToast("Expense added.");
  event.target.reset();
  document.getElementById("dateInput").valueAsDate = new Date();
  renderStats();
  renderTable();
}

function deleteExpense(id) {
  const expenses = getData(LS_KEYS.expenses);
  setData(LS_KEYS.expenses, expenses.filter((e) => e.id !== id));
  showToast("Expense deleted.", "error");
  renderStats();
  renderTable();
}

function renderStats() {
  const expenses = getData(LS_KEYS.expenses);
  const total = expenses.reduce((sum, e) => sum + e.amount, 0);
  const byCategory = (cat) =>
    expenses.filter((e) => e.category === cat).reduce((sum, e) => sum + e.amount, 0);

  document.getElementById("statGrid").innerHTML = `
    <div class="stat-card accent-blue">
      <div class="stat-top"><div class="stat-icon blue">₹</div></div>
      <h2>${formatCurrency(total)}</h2>
      <p>Total Expenses</p>
      <span class="stat-detail">${expenses.length} records</span>
    </div>
    <div class="stat-card accent-rust">
      <div class="stat-top"><div class="stat-icon orange">⛟</div></div>
      <h2>${formatCurrency(byCategory("Toll"))}</h2>
      <p>Toll</p>
      <span class="stat-detail">All time</span>
    </div>
    <div class="stat-card accent-amber">
      <div class="stat-top"><div class="stat-icon purple">◇</div></div>
      <h2>${formatCurrency(byCategory("Maintenance"))}</h2>
      <p>Maintenance</p>
      <span class="stat-detail">All time</span>
    </div>
    <div class="stat-card accent-moss">
      <div class="stat-top"><div class="stat-icon cyan">◌</div></div>
      <h2>${formatCurrency(byCategory("Other"))}</h2>
      <p>Other</p>
      <span class="stat-detail">All time</span>
    </div>
  `;
}

function renderTable() {
  const expenses = getData(LS_KEYS.expenses);
  const searchTerm = document.getElementById("searchInput").value.toLowerCase();
  const categoryValue = document.getElementById("categoryFilter").value;
  const sortMode = document.getElementById("sortSelect").value;

  let filtered = expenses.filter((e) => {
    const haystack = `${getVehicleName(e.vehicleId)} ${e.note || ""}`.toLowerCase();
    const matchesSearch = haystack.includes(searchTerm);
    const matchesCategory = !categoryValue || e.category === categoryValue;
    return matchesSearch && matchesCategory;
  });

  const sorters = {
    "date-desc": (a, b) => new Date(b.date) - new Date(a.date),
    "date-asc": (a, b) => new Date(a.date) - new Date(b.date),
    "amount-desc": (a, b) => b.amount - a.amount,
  };
  filtered = [...filtered].sort(sorters[sortMode]);

  const tbody = document.getElementById("expenseTableBody");
  if (filtered.length === 0) {
    tbody.innerHTML = `<tr class="empty-row"><td colspan="6">No expenses found.</td></tr>`;
    return;
  }

  tbody.innerHTML = filtered
    .map(
      (e) => `
        <tr>
          <td>${formatDate(e.date)}</td>
          <td>${getVehicleName(e.vehicleId)}</td>
          <td><span class="pill ${categoryPillClass[e.category]}">${e.category}</span></td>
          <td>${e.note || "—"}</td>
          <td class="mono">${formatCurrency(e.amount)}</td>
          <td><button class="btn btn--danger" onclick="deleteExpense('${e.id}')">Delete</button></td>
        </tr>`
    )
    .join("");
}
