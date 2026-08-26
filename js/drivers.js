const addDriverBtn = document.getElementById("addDriverBtn");
const driverFormPanel = document.getElementById("driverFormPanel");
const cancelDriverBtn = document.getElementById("cancelDriverBtn");
const driverForm = document.getElementById("driverForm");
const driverStatusFilter = document.getElementById("driverStatusFilter");


// ==========================================
// OPEN DRIVER FORM
// ==========================================

addDriverBtn.addEventListener("click", function () {
    driverFormPanel.style.display = "block";
});


// ==========================================
// CLOSE DRIVER FORM
// ==========================================

cancelDriverBtn.addEventListener("click", function () {
    driverFormPanel.style.display = "none";
});


// ==========================================
// ADD DRIVER
// ==========================================

driverForm.addEventListener("submit", function (event) {

    event.preventDefault();

    const driver = {

        name: document.getElementById("driverName").value,
        phone: document.getElementById("driverPhone").value,
        licenseNumber: document.getElementById("licenseNumber").value,
        licenseType: document.getElementById("licenseType").value,
        experience: document.getElementById("experience").value,
        status: document.getElementById("driverStatus").value

    };


    let drivers =
        JSON.parse(localStorage.getItem("drivers")) || [];


    // Generate Driver ID
    driver.id =
        "DR-" + String(drivers.length + 1).padStart(3, "0");


    // Add driver to array
    drivers.push(driver);


    // Save to LocalStorage
    localStorage.setItem(
        "drivers",
        JSON.stringify(drivers)
    );


    // Update table and statistics
    displayDrivers();
    updateDriverStats();


    // Clear form
    driverForm.reset();


    // Close form
    driverFormPanel.style.display = "none";


    console.log("Driver saved:", driver);

});


// ==========================================
// DISPLAY ALL DRIVERS
// ==========================================

function displayDrivers() {

    const driversTableBody =
        document.getElementById("driversTableBody");

    const drivers =
        JSON.parse(localStorage.getItem("drivers")) || [];


    if (drivers.length === 0) {

        driversTableBody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align: center;">
                    No drivers registered yet.
                </td>
            </tr>
        `;

        return;
    }


    driversTableBody.innerHTML = "";


    drivers.forEach(function (driver) {

        const row = `
            <tr>
                <td>${driver.id}</td>
                <td>${driver.name}</td>
                <td>${driver.phone}</td>
                <td>${driver.licenseNumber} (${driver.licenseType})</td>
                <td>${driver.experience} years</td>
                <td>${driver.status}</td>
            </tr>
        `;

        driversTableBody.innerHTML += row;

    });
}


// ==========================================
// UPDATE DRIVER STATISTICS
// ==========================================

function updateDriverStats() {

    const drivers =
        JSON.parse(localStorage.getItem("drivers")) || [];


    const total = drivers.length;


    const available =
        drivers.filter(
            driver => driver.status === "Available"
        ).length;


    const onTrip =
        drivers.filter(
            driver => driver.status === "On Trip"
        ).length;


    const inactive =
        drivers.filter(
            driver => driver.status === "Inactive"
        ).length;


    document.getElementById("totalDrivers").textContent = total;

    document.getElementById("availableDrivers").textContent = available;

    document.getElementById("onTripDrivers").textContent = onTrip;

    document.getElementById("inactiveDrivers").textContent = inactive;
}


// ==========================================
// STATUS FILTER
// ==========================================

driverStatusFilter.addEventListener("change", function () {

    const selectedStatus = driverStatusFilter.value;


    const drivers =
        JSON.parse(localStorage.getItem("drivers")) || [];


    const filteredDrivers =
        selectedStatus === "all"
            ? drivers
            : drivers.filter(
                driver => driver.status === selectedStatus
            );


    displayFilteredDrivers(filteredDrivers);

});


// ==========================================
// DISPLAY FILTERED DRIVERS
// ==========================================

function displayFilteredDrivers(drivers) {

    const driversTableBody =
        document.getElementById("driversTableBody");


    if (drivers.length === 0) {

        driversTableBody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align: center;">
                    No drivers found.
                </td>
            </tr>
        `;

        return;
    }


    driversTableBody.innerHTML = "";


    drivers.forEach(function (driver) {

        const row = `
            <tr>
                <td>${driver.id}</td>
                <td>${driver.name}</td>
                <td>${driver.phone}</td>
                <td>${driver.licenseNumber} (${driver.licenseType})</td>
                <td>${driver.experience} years</td>
                <td>${driver.status}</td>
            </tr>
        `;

        driversTableBody.innerHTML += row;

    });

}


// ==========================================
// INITIAL PAGE LOAD
// ==========================================

displayDrivers();
updateDriverStats();