// ==========================================
// VEHICLES - TRANSITOPS
// ==========================================

const addVehicleBtn = document.getElementById("addVehicleBtn");
const vehicleFormPanel = document.getElementById("vehicleFormPanel");
const cancelVehicleBtn = document.getElementById("cancelVehicleBtn");
const vehicleForm = document.getElementById("vehicleForm");
const vehicleStatusFilter = document.getElementById("vehicleStatusFilter");


// ==========================================
// GET VEHICLES
// ==========================================

function getVehicles() {
    return JSON.parse(localStorage.getItem("vehicles")) || [];
}


// ==========================================
// SAVE VEHICLES
// ==========================================

function saveVehicles(vehicles) {
    localStorage.setItem("vehicles", JSON.stringify(vehicles));
}


// ==========================================
// REMOVE EXISTING DUPLICATES
// ==========================================

function removeDuplicateVehicles() {

    const vehicles = getVehicles();

    const uniqueVehicles = [];
    const numbers = new Set();

    vehicles.forEach(function (vehicle) {

        const number =
            String(vehicle.number || "")
                .trim()
                .toLowerCase();

        if (!number || numbers.has(number)) {
            return;
        }

        numbers.add(number);
        uniqueVehicles.push(vehicle);
    });

    saveVehicles(uniqueVehicles);
}


// ==========================================
// OPEN FORM
// ==========================================

addVehicleBtn.addEventListener("click", function () {
    vehicleFormPanel.style.display = "block";
});


// ==========================================
// CLOSE FORM
// ==========================================

cancelVehicleBtn.addEventListener("click", function () {

    vehicleFormPanel.style.display = "none";
    vehicleForm.reset();
});


// ==========================================
// ADD VEHICLE
// ==========================================

vehicleForm.addEventListener("submit", function (event) {

    event.preventDefault();

    const vehicleNumber =
        document
            .getElementById("vehicleNumber")
            .value
            .trim();

    let vehicles = getVehicles();


    // Duplicate check
    const duplicate = vehicles.some(function (vehicle) {

        return (
            String(vehicle.number)
                .trim()
                .toLowerCase()
            ===
            vehicleNumber.toLowerCase()
        );
    });


    if (duplicate) {

        alert("Vehicle number already exists.");

        return;
    }


    // Create vehicle
    const vehicle = {

        number: vehicleNumber,

        type:
            document.getElementById("vehicleType").value,

        model:
            document.getElementById("vehicleModel").value,

        capacity:
            document.getElementById("vehicleCapacity").value,

        registrationDate:
            document.getElementById("registrationDate").value,

        status:
            document.getElementById("vehicleStatus").value
    };


    // Generate ID
    let highestId = 0;

    vehicles.forEach(function (existingVehicle) {

        if (!existingVehicle.id) {
            return;
        }

        const idNumber =
            parseInt(
                String(existingVehicle.id)
                    .replace(/\D/g, ""),
                10
            );

        if (!isNaN(idNumber) && idNumber > highestId) {
            highestId = idNumber;
        }
    });


    vehicle.id =
        "VH-" +
        String(highestId + 1).padStart(3, "0");


    vehicles.push(vehicle);

    saveVehicles(vehicles);


    displayVehicles();
    updateVehicleStats();


    vehicleForm.reset();
    vehicleFormPanel.style.display = "none";

});


// ==========================================
// CREATE VEHICLE ROW
// ==========================================

function createVehicleRow(vehicle) {

    return `
        <tr>

            <td>${vehicle.number}</td>

            <td>${vehicle.type}</td>

            <td>${vehicle.model}</td>

            <td>${vehicle.capacity} kg</td>

            <td>${vehicle.registrationDate}</td>

            <td>

                <select
                    class="vehicle-status-select"
                    data-vehicle-number="${vehicle.number}"
                >

                    <option value="Available"
                        ${vehicle.status === "Available"
                            ? "selected"
                            : ""}>
                        Available
                    </option>

                    <option value="On Trip"
                        ${vehicle.status === "On Trip"
                            ? "selected"
                            : ""}>
                        On Trip
                    </option>

                    <option value="Maintenance"
                        ${vehicle.status === "Maintenance"
                            ? "selected"
                            : ""}>
                        Maintenance
                    </option>

                </select>

            </td>

        </tr>
    `;
}


// ==========================================
// DISPLAY VEHICLES
// ==========================================

function displayVehicles(vehiclesToDisplay = null) {

    const tableBody =
        document.getElementById("vehiclesTableBody");

    const vehicles =
        vehiclesToDisplay || getVehicles();


    if (vehicles.length === 0) {

        tableBody.innerHTML = `
            <tr>
                <td colspan="6"
                    style="text-align:center;">
                    No vehicles found.
                </td>
            </tr>
        `;

        return;
    }


    tableBody.innerHTML = "";


    vehicles.forEach(function (vehicle) {

        tableBody.innerHTML +=
            createVehicleRow(vehicle);

    });


    addVehicleStatusListeners();
}


// ==========================================
// STATUS DROPDOWN LISTENERS
// ==========================================

function addVehicleStatusListeners() {

    const statusDropdowns =
        document.querySelectorAll(
            ".vehicle-status-select"
        );


    statusDropdowns.forEach(function (dropdown) {

        dropdown.addEventListener(
            "change",
            function () {

                const vehicleNumber =
                    this.dataset.vehicleNumber;

                const newStatus =
                    this.value;


                updateVehicleStatus(
                    vehicleNumber,
                    newStatus
                );
            }
        );

    });
}


// ==========================================
// UPDATE VEHICLE STATUS
// ==========================================

function updateVehicleStatus(
    vehicleNumber,
    newStatus
) {

    let vehicles = getVehicles();


    const index =
        vehicles.findIndex(function (vehicle) {

            return (
                String(vehicle.number)
                    .toLowerCase()
                ===
                String(vehicleNumber)
                    .toLowerCase()
            );

        });


    if (index === -1) {
        return;
    }


    vehicles[index].status = newStatus;

    saveVehicles(vehicles);


    updateVehicleStats();


    console.log(
        vehicleNumber,
        "status changed to",
        newStatus
    );
}


// ==========================================
// UPDATE STATS
// ==========================================

function updateVehicleStats() {

    const vehicles = getVehicles();


    const total =
        vehicles.length;


    const available =
        vehicles.filter(
            vehicle =>
                vehicle.status === "Available"
        ).length;


    const onTrip =
        vehicles.filter(
            vehicle =>
                vehicle.status === "On Trip"
        ).length;


    const maintenance =
        vehicles.filter(
            vehicle =>
                vehicle.status === "Maintenance"
        ).length;


    document.getElementById(
        "totalVehicles"
    ).textContent = total;


    document.getElementById(
        "availableVehicles"
    ).textContent = available;


    document.getElementById(
        "onTripVehicles"
    ).textContent = onTrip;


    document.getElementById(
        "maintenanceVehicles"
    ).textContent = maintenance;
}


// ==========================================
// STATUS FILTER
// ==========================================

vehicleStatusFilter.addEventListener(
    "change",
    function () {

        const selectedStatus =
            this.value;


        const vehicles =
            getVehicles();


        if (selectedStatus === "all") {

            displayVehicles(vehicles);

            return;
        }


        const filteredVehicles =
            vehicles.filter(
                vehicle =>
                    vehicle.status ===
                    selectedStatus
            );


        displayVehicles(filteredVehicles);
    }
);


// ==========================================
// INITIAL LOAD
// ==========================================

removeDuplicateVehicles();

displayVehicles();

updateVehicleStats();




