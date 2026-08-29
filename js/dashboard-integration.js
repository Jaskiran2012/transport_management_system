
document.addEventListener("DOMContentLoaded", () => {
  const amount = getCurrentMonthSpend(); // from shared.js
  const el = document.getElementById("fuelExpenseAmount");
  if (el) {
    el.textContent = `₹${Math.round(amount).toLocaleString("en-IN")}`;
  }
});
