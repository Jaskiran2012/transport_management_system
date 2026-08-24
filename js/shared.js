/* ============================================================
   shared.js — common helpers for Member 4 (Fuel + Expenses + Reports)
   These will later be replaced/merged with Person 1's real
   storage.js + auth.js once the team integrates. For now this
   file lets your pages run and be tested completely standalone.
   ============================================================ */

// ---------- LocalStorage keys (matches the data contract) ----------
const LS_KEYS = {
  vehicles: "vehicles",
  fuelLogs: "fuelLogs",
  expenses: "expenses",
};

// ---------- generic get/set (used everywhere below) ----------
function getData(key) {
  const raw = localStorage.getItem(key);
  return raw ? JSON.parse(raw) : [];
}

function setData(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

// simple unique id generator (Date.now + random -> template literal, ES6)
function generateId(prefix = "id") {
  return `${prefix}_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
}

// ---------- seed mock vehicles so this module works BEFORE
// Member 2's Vehicles module exists. Once real vehicle data
// is in localStorage under "vehicles", this seed is skipped. ----------
function seedVehiclesIfEmpty() {
  const existing = getData(LS_KEYS.vehicles);
  if (existing.length > 0) return;

  const mockVehicles = [
    { id: "v1", name: "Truck 101", plate: "PB-11-AB-1234", status: "Available" },
    { id: "v2", name: "Truck 102", plate: "PB-11-AB-5678", status: "On Trip" },
    { id: "v3", name: "Van 201", plate: "PB-65-CD-4321", status: "In Maintenance" },
    { id: "v4", name: "Truck 103", plate: "PB-11-AB-9012", status: "Available" },
  ];
  setData(LS_KEYS.vehicles, mockVehicles);
}

function getVehicles() {
  return getData(LS_KEYS.vehicles);
}

// destructuring + find() — get one vehicle's display name by id
function getVehicleName(vehicleId) {
  const vehicles = getVehicles();
  const match = vehicles.find((v) => v.id === vehicleId);
  return match ? match.name : "Unknown vehicle";
}

// ---------- formatting helpers ----------
function formatCurrency(amount) {
  return `₹${Number(amount).toFixed(2)}`;
}

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

// ---------- toast notifications ----------
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

// ---------- sidebar + topbar (shared shell across pages) ----------
// In the real merged project, Person 1 owns this. This local
// version keeps your 3 pages navigable on their own for now.
function renderShell(activePage) {
  const nav = [
    { key: "dashboard", label: "Dashboard", href: "dashboard.html" },
    { key: "vehicles", label: "Vehicles", href: "vehicles.html" },
    { key: "drivers", label: "Drivers", href: "drivers.html" },
    { key: "trips", label: "Trips", href: "trips.html" },
    { key: "maintenance", label: "Maintenance", href: "maintenance.html" },
    { key: "fuel", label: "Fuel & Expenses", href: "fuel.html" },
    { key: "expenses", label: "Expenses", href: "expenses.html" },
    { key: "reports", label: "Reports", href: "reports.html" },
  ];

  const sidebarHTML = `
    <aside class="sidebar">
      <div class="sidebar__brand">
        <span class="sidebar__mark">◐</span>
        <span class="sidebar__name">TRANSITOPS</span>
      </div>
      <nav class="sidebar__nav">
        ${nav
          .map(
            (item) => `
          <a href="${item.href}" class="sidebar__link ${item.key === activePage ? "sidebar__link--active" : ""}">
            ${item.label}
          </a>`
          )
          .join("")}
      </nav>
    </aside>`;

  const topbarHTML = `
    <header class="topbar">
      <div class="topbar__title" id="pageTitle"></div>
      <div class="topbar__right">
        <span class="topbar__user" id="sharedUserName">Finance &amp; Analytics</span>
      </div>
    </header>`;

  document.getElementById("shellSidebar").innerHTML = sidebarHTML;
  document.getElementById("shellTopbar").innerHTML = topbarHTML;

  updateSharedUser();
}

function updateSharedUser() {
  const session = localStorage.getItem("transitopsSession");
  const user = session ? JSON.parse(session) : null;
  const userElement = document.getElementById("sharedUserName") || document.getElementById("sharedProfileName");
  const roleElement = document.getElementById("sharedProfileRole");
  const avatarElement = document.getElementById("sharedProfileAvatar");

  if (userElement && user) {
    userElement.textContent = user.name;
  }

  if (roleElement && user) {
    roleElement.textContent = user.role;
  }

  if (avatarElement && user) {
    avatarElement.textContent = user.name.charAt(0).toUpperCase();
  }
}

document.addEventListener("DOMContentLoaded", updateSharedUser);