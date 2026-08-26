// ==========================================
// TRIPS - TRANSITOPS
// ==========================================

const addTripBtn = document.getElementById("addTripBtn");
const tripFormPanel = document.getElementById("tripFormPanel");
const cancelTripBtn = document.getElementById("cancelTripBtn");
const tripForm = document.getElementById("tripForm");

const vehicleSelect = document.getElementById("vehicle");
const driverSelect = document.getElementById("driver");


// ==========================================
// GET DATA
// ==========================================

function getVehicles() {
    return JSON.parse(localStorage.getItem("vehicles")) || [];
}

function getDrivers() {
    return JSON.parse(localStorage.getItem("drivers")) || [];
}

function getTrips() {
    return JSON.parse(localStorage.getItem("trips")) || [];
}


// ==========================================
// OPEN FORM
// ==========================================

addTripBtn.addEventListener("click", function () {

    populateVehicleDropdown();
    populateDriverDropdown();

    tripFormPanel.style.display = "block";
});


// ==========================================
// CLOSE FORM
// ==========================================

cancelTripBtn.addEventListener("click", function () {

    tripFormPanel.style.display = "none";
    tripForm.reset();

});


// ==========================================
// VEHICLE DROPDOWN
// ==========================================

function populateVehicleDropdown() {

    const vehicles = getVehicles();

    vehicleSelect.innerHTML = `
        <option value="">Select vehicle</option>
    `;

    const addedVehicles = new Set();

    vehicles.forEach(function (vehicle) {

        if (vehicle.status !== "Available") {
            return;
        }

        const vehicleNumber =
            String(vehicle.number || vehicle.id).trim();

        const key = vehicleNumber.toLowerCase();

        if (addedVehicles.has(key)) {
            return;
        }

        addedVehicles.add(key);

        const option = document.createElement("option");

        option.value = vehicleNumber;
        option.textContent = vehicleNumber;

        if (vehicle.capacity) {
            option.dataset.capacity =
                parseFloat(vehicle.capacity);
        }

        vehicleSelect.appendChild(option);

    });
}


// ==========================================
// DRIVER DROPDOWN
// ==========================================

function populateDriverDropdown() {

    const drivers = getDrivers();

    driverSelect.innerHTML = `
        <option value="">Select driver</option>
    `;

    const addedDrivers = new Set();

    drivers.forEach(function (driver) {

        if (driver.status !== "Available") {
            return;
        }

        const driverName =
            String(driver.name || driver.id).trim();

        const key = driverName.toLowerCase();

        if (addedDrivers.has(key)) {
            return;
        }

        addedDrivers.add(key);

        const option = document.createElement("option");

        option.value = driverName;
        option.textContent = driverName;

        driverSelect.appendChild(option);

    });
}


// ==========================================
// CREATE TRIP
// ==========================================

tripForm.addEventListener("submit", function (event) {

    event.preventDefault();

    const selectedVehicle = vehicleSelect.value;
    const selectedDriver = driverSelect.value;

    if (!selectedVehicle) {
        alert("Please select a vehicle.");
        return;
    }

    if (!selectedDriver) {
        alert("Please select a driver.");
        return;
    }


    // Get selected vehicle
    const vehicles = getVehicles();

    const vehicle = vehicles.find(function (v) {

        return (
            v.number === selectedVehicle ||
            v.id === selectedVehicle
        );

    });


    // Cargo weight
    const cargoWeight =
        Number(
            document.getElementById("cargoWeight").value
        );


    // Capacity validation
    if (vehicle) {

        const capacity =
            parseFloat(vehicle.capacity);

        if (
            !isNaN(capacity) &&
            cargoWeight > capacity
        ) {

            alert(
                `Cargo weight exceeds vehicle capacity of ${capacity} kg.`
            );

            return;
        }
    }


    // Create trip
    const trip = {

        vehicle: selectedVehicle,

        driver: selectedDriver,

        source:
            document.getElementById("source").value,

        destination:
            document.getElementById("destination").value,

        cargo:
            document.getElementById("cargo").value,

        cargoWeight: cargoWeight,

        departureDate:
            document.getElementById("departureDate").value,

        departureTime:
            document.getElementById("departureTime").value,

        status: "Scheduled"
    };


    // Save trip
    let trips = getTrips();

    trip.id =
        "TR-" +
        String(trips.length + 1).padStart(3, "0");

    trips.push(trip);

    localStorage.setItem(
        "trips",
        JSON.stringify(trips)
    );


    displayTrips();
    updateTripStats();

    tripForm.reset();

    tripFormPanel.style.display = "none";

    console.log("Trip saved:", trip);

});


// ==========================================
// DISPLAY TRIPS
// ==========================================

function displayTrips() {

    const tripsTableBody =
        document.getElementById("tripsTableBody");

    const trips = getTrips();


    if (trips.length === 0) {

        tripsTableBody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align:center;">
                    No trips scheduled yet.
                </td>
            </tr>
        `;

        return;
    }


    tripsTableBody.innerHTML = "";


    trips.forEach(function (trip) {

        const row = `
            <tr>

                <td>${trip.id}</td>

                <td>${trip.vehicle}</td>

                <td>${trip.driver}</td>

                <td>
                    ${trip.source} → ${trip.destination}
                </td>

                <td>${trip.cargo}</td>

                <td>${trip.departureDate}</td>

                <td>

                    <select
                        class="trip-status-select"
                        data-trip-id="${trip.id}"
                    >

                        <option value="Scheduled"
                            ${trip.status === "Scheduled" ? "selected" : ""}>
                            Scheduled
                        </option>

                        <option value="Active"
                            ${trip.status === "Active" ? "selected" : ""}>
                            Active
                        </option>

                        <option value="Completed"
                            ${trip.status === "Completed" ? "selected" : ""}>
                            Completed
                        </option>

                        <option value="Delayed"
                            ${trip.status === "Delayed" ? "selected" : ""}>
                            Delayed
                        </option>

                    </select>

                </td>

            </tr>
        `;

        tripsTableBody.innerHTML += row;

    });


    // Add status listeners
    document
        .querySelectorAll(".trip-status-select")
        .forEach(function (select) {

            select.addEventListener(
                "change",
                function () {

                    const tripId =
                        this.dataset.tripId;

                    const newStatus =
                        this.value;

                    updateTripStatus(
                        tripId,
                        newStatus
                    );

                }
            );

        });

}


// ==========================================
// UPDATE TRIP STATUS
// ==========================================

function updateTripStatus(tripId, newStatus) {

    let trips = getTrips();

    const tripIndex =
        trips.findIndex(function (trip) {

            return trip.id === tripId;

        });


    if (tripIndex === -1) {
        return;
    }


    const trip = trips[tripIndex];

    const oldStatus = trip.status;


    // Update trip
    trip.status = newStatus;

    trips[tripIndex] = trip;


    localStorage.setItem(
        "trips",
        JSON.stringify(trips)
    );


    // Update vehicle and driver
    updateVehicleAndDriverStatus(
        trip,
        oldStatus,
        newStatus
    );


    displayTrips();
    updateTripStats();


    console.log(
        `Trip ${tripId}: ${oldStatus} → ${newStatus}`
    );

}


// ==========================================
// UPDATE VEHICLE + DRIVER STATUS
// ==========================================

function updateVehicleAndDriverStatus(trip, oldStatus, newStatus) {

    let vehicles = getVehicles();
    let drivers = getDrivers();

    // ==========================================
    // VEHICLE STATUS
    // ==========================================

    const vehicleIndex = vehicles.findIndex(function (vehicle) {

        return (
            vehicle.number === trip.vehicle ||
            vehicle.id === trip.vehicle
        );

    });

    if (vehicleIndex !== -1) {

        if (
            newStatus === "Active" ||
            newStatus === "Delayed"
        ) {

            vehicles[vehicleIndex].status = "On Trip";

        } else if (
            newStatus === "Completed"
        ) {

            vehicles[vehicleIndex].status = "Available";

        }

    }


    // ==========================================
    // DRIVER STATUS
    // ==========================================

    const driverIndex = drivers.findIndex(function (driver) {

        return (
            driver.name === trip.driver ||
            driver.id === trip.driver
        );

    });

    if (driverIndex !== -1) {

        if (
            newStatus === "Active" ||
            newStatus === "Delayed"
        ) {

            drivers[driverIndex].status = "On Trip";

        } else if (
            newStatus === "Completed"
        ) {

            drivers[driverIndex].status = "Available";

        }

    }


    // Save
    localStorage.setItem(
        "vehicles",
        JSON.stringify(vehicles)
    );

    localStorage.setItem(
        "drivers",
        JSON.stringify(drivers)
    );

}


// ==========================================
// INITIAL LOAD
// ==========================================

populateVehicleDropdown();

populateDriverDropdown();

displayTrips();

updateTripStats();