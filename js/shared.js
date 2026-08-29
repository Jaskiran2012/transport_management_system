
const LS_KEYS = {
  vehicles: "vehicles",
  fuelLogs: "fuelLogs",
  expenses: "expenses",
};

function getData(key) {
  const raw = localStorage.getItem(key);
  return raw ? JSON.parse(raw) : [];
}

function setData(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function generateId(prefix = "id") {
  return `${prefix}_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
}

function getVehicles() {
  return getData(LS_KEYS.vehicles);
}

function getVehicleName(vehicleId) {
  const vehicles = getVehicles();
  const match = vehicles.find((v) => v.id === vehicleId);
  if (!match) return "Unknown vehicle";
  const label = match.model || match.number || match.id;
  return `${match.id} · ${label}`;
}

function formatCurrency(amount) {
  return `₹${Number(amount).toFixed(2)}`;
}

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

function showToast(message, type = "success") {
  let container = document.getElementById("toastContainer");
  if (!container) {
    container = document.createElement("div");
    container.id = "toastContainer";
    container.className = "toast-container";
    document.body.appendChild(container);
  }
  const toast = document.createElement("div");
  toast.className = `toast toast--${type}`;
  toast.textContent = message;
  container.appendChild(toast);

  setTimeout(() => toast.classList.add("toast--visible"), 10);
  setTimeout(() => {
    toast.classList.remove("toast--visible");
    setTimeout(() => toast.remove(), 300);
  }, 2600);
}

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

function getCurrentMonthSpend() {
  const now = new Date();
  const isThisMonth = (dateStr) => {
    const d = new Date(dateStr);
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
  };
  const fuelTotal = getData(LS_KEYS.fuelLogs).filter((l) => isThisMonth(l.date)).reduce((s, l) => s + l.cost, 0);
  const expenseTotal = getData(LS_KEYS.expenses).filter((e) => isThisMonth(e.date)).reduce((s, e) => s + e.amount, 0);
  return fuelTotal + expenseTotal;
}

function updateSharedUser() {
  const rawSession = localStorage.getItem("transitopsSession");
  if (!rawSession) return;

  const user = JSON.parse(rawSession);
  const nameElement = document.getElementById("sharedProfileName") || document.getElementById("profileName");
  const roleElement = document.getElementById("sharedProfileRole") || document.getElementById("profileRole");
  const avatarElement = document.getElementById("sharedProfileAvatar") || document.getElementById("profileAvatar");

  if (nameElement) nameElement.textContent = user.name;
  if (roleElement) roleElement.textContent = user.role;
  if (avatarElement) avatarElement.textContent = user.name.charAt(0).toUpperCase();
}

document.addEventListener("DOMContentLoaded", updateSharedUser);
