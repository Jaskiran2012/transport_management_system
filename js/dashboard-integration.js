/* ============================================================
   dashboard-integration.js
   The first real "Dashboard + Integration" step from your plan:
   wires ONE card (Fuel Expenses) to Member 4's real localStorage
   data instead of the hardcoded ₹42,850. The rest of the dashboard
   (vehicles, drivers, trips) stays static until Members 1-3 have
   their modules ready to plug in the same way.
   ============================================================ */

document.addEventListener("DOMContentLoaded", () => {
  const amount = getCurrentMonthSpend(); // from shared.js
  const el = document.getElementById("fuelExpenseAmount");
  if (el) {
    el.textContent = `₹${Math.round(amount).toLocaleString("en-IN")}`;
  }
});
