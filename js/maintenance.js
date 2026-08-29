const addMaintenanceBtn =
    document.getElementById("addMaintenanceBtn");

const maintenanceFormPanel =
    document.getElementById("maintenanceFormPanel");

const cancelMaintenanceBtn =
    document.getElementById("cancelMaintenanceBtn");

const maintenanceForm =
    document.getElementById("maintenanceForm");

const maintenanceVehicle =
    document.getElementById("maintenanceVehicle");

const maintenanceStatusFilter =
    document.getElementById("maintenanceStatusFilter");

function getVehicles() {

    return JSON.parse(
        localStorage.getItem("vehicles")
    ) || [];

}


function getMaintenance() {

    return JSON.parse(
        localStorage.getItem("maintenance")
    ) || [];

}

addMaintenanceBtn.addEventListener(
    "click",
    function () {

        populateVehicleDropdown();

        maintenanceFormPanel.style.display = "block";

    }
);

cancelMaintenanceBtn.addEventListener(
    "click",
    function () {

        maintenanceForm.reset();

        maintenanceFormPanel.style.display = "none";

    }
);

function populateVehicleDropdown() {

    const vehicles = getVehicles();

    maintenanceVehicle.innerHTML = `
        <option value="">
            Select vehicle
        </option>
    `;

    const addedVehicles = new Set();


    vehicles.forEach(function (vehicle) {

        const number =
            String(
                vehicle.number || vehicle.id
            ).trim();


        const key =
            number.toLowerCase();


        if (addedVehicles.has(key)) {
            return;
        }


        addedVehicles.add(key);


        const option =
            document.createElement("option");


        option.value = number;

        option.textContent = number;


        maintenanceVehicle.appendChild(option);

    });

}

maintenanceForm.addEventListener(
    "submit",
    function (event) {

        event.preventDefault();


        const vehicle =
            maintenanceVehicle.value;


        const type =
            document.getElementById(
                "maintenanceType"
            ).value;


        const date =
            document.getElementById(
                "maintenanceDate"
            ).value;


        const cost =
            Number(
                document.getElementById(
                    "maintenanceCost"
                ).value
            );


        const description =
            document.getElementById(
                "maintenanceDescription"
            ).value;


        if (!vehicle) {

            alert("Please select a vehicle.");

            return;

        }

        const record = {

            vehicle: vehicle,

            type: type,

            date: date,

            cost: cost,

            description: description,

            status: "Pending"

        };

        let maintenance =
            getMaintenance();


        record.id =
            "M-" +
            String(
                maintenance.length + 1
            ).padStart(3, "0");


        maintenance.push(record);


        localStorage.setItem(
            "maintenance",
            JSON.stringify(maintenance)
        );

        updateVehicleForMaintenance(
            vehicle
        );

        displayMaintenance();

        updateMaintenanceStats();


        maintenanceForm.reset();

        maintenanceFormPanel.style.display =
            "none";


        console.log(
            "Maintenance saved:",
            record
        );

    }
);

function updateVehicleForMaintenance(
    vehicleNumber
) {

    let vehicles =
        getVehicles();


    const vehicleIndex =
        vehicles.findIndex(
            function (vehicle) {

                return (
                    vehicle.number === vehicleNumber ||
                    vehicle.id === vehicleNumber
                );

            }
        );


    if (vehicleIndex !== -1) {

        vehicles[vehicleIndex].status =
            "Maintenance";

    }


    localStorage.setItem(
        "vehicles",
        JSON.stringify(vehicles)
    );

}

function displayMaintenance() {

    const tableBody =
        document.getElementById(
            "maintenanceTableBody"
        );


    const maintenance =
        getMaintenance();


    if (maintenance.length === 0) {

        tableBody.innerHTML = `
            <tr>
                <td colspan="7"
                    style="text-align:center;">
                    No maintenance records yet.
                </td>
            </tr>
        `;

        return;

    }


    tableBody.innerHTML = "";


    maintenance.forEach(
        function (record) {

            const row = `
                <tr>

                    <td>${record.id}</td>

                    <td>${record.vehicle}</td>

                    <td>${record.type}</td>

                    <td>${record.date}</td>

                    <td>₹${record.cost}</td>

                    <td>${record.description}</td>

                    <td>

                        <select
                            class="maintenance-status-select"
                            data-id="${record.id}"
                        >

                            <option value="Pending"
                                ${record.status === "Pending"
                                    ? "selected"
                                    : ""}>
                                Pending
                            </option>

                            <option value="In Progress"
                                ${record.status === "In Progress"
                                    ? "selected"
                                    : ""}>
                                In Progress
                            </option>

                            <option value="Completed"
                                ${record.status === "Completed"
                                    ? "selected"
                                    : ""}>
                                Completed
                            </option>

                        </select>

                    </td>

                </tr>
            `;


            tableBody.innerHTML += row;

        }
    );


    // Add status listeners

    document
        .querySelectorAll(
            ".maintenance-status-select"
        )
        .forEach(
            function (select) {

                select.addEventListener(
                    "change",
                    function () {

                        updateMaintenanceStatus(
                            this.dataset.id,
                            this.value
                        );

                    }
                );

            }
        );

}

function updateMaintenanceStatus(
    recordId,
    newStatus
) {

    let maintenance =
        getMaintenance();


    const index =
        maintenance.findIndex(
            function (record) {

                return record.id === recordId;

            }
        );


    if (index === -1) {
        return;
    }


    maintenance[index].status =
        newStatus;


    localStorage.setItem(
        "maintenance",
        JSON.stringify(maintenance)
    );


    // If completed → vehicle available
    if (newStatus === "Completed") {

        makeVehicleAvailable(
            maintenance[index].vehicle
        );

    }


    // If pending/in progress → vehicle maintenance
    else {

        updateVehicleForMaintenance(
            maintenance[index].vehicle
        );

    }


    displayMaintenance();

    updateMaintenanceStats();

}

function makeVehicleAvailable(
    vehicleNumber
) {

    let vehicles =
        getVehicles();


    const vehicleIndex =
        vehicles.findIndex(
            function (vehicle) {

                return (
                    vehicle.number === vehicleNumber ||
                    vehicle.id === vehicleNumber
                );

            }
        );


    if (vehicleIndex !== -1) {

        vehicles[vehicleIndex].status =
            "Available";

    }


    localStorage.setItem(
        "vehicles",
        JSON.stringify(vehicles)
    );

}

function updateMaintenanceStats() {

    const maintenance =
        getMaintenance();


    const total =
        maintenance.length;


    const pending =
        maintenance.filter(
            record =>
                record.status === "Pending"
        ).length;


    const inProgress =
        maintenance.filter(
            record =>
                record.status === "In Progress"
        ).length;


    const completed =
        maintenance.filter(
            record =>
                record.status === "Completed"
        ).length;


    document.getElementById(
        "totalMaintenance"
    ).textContent = total;


    document.getElementById(
        "pendingMaintenance"
    ).textContent = pending;


    document.getElementById(
        "inProgressMaintenance"
    ).textContent = inProgress;


    document.getElementById(
        "completedMaintenance"
    ).textContent = completed;

}

maintenanceStatusFilter.addEventListener(
    "change",
    function () {

        const selectedStatus =
            this.value;


        const maintenance =
            getMaintenance();


        const filtered =
            selectedStatus === "all"
                ? maintenance
                : maintenance.filter(
                    record =>
                        record.status ===
                        selectedStatus
                );


        displayFilteredMaintenance(
            filtered
        );

    }
);

function displayFilteredMaintenance(
    records
) {

    const tableBody =
        document.getElementById(
            "maintenanceTableBody"
        );


    if (records.length === 0) {

        tableBody.innerHTML = `
            <tr>
                <td colspan="7"
                    style="text-align:center;">
                    No maintenance records found.
                </td>
            </tr>
        `;

        return;

    }


    tableBody.innerHTML = "";


    records.forEach(
        function (record) {

            tableBody.innerHTML += `
                <tr>

                    <td>${record.id}</td>

                    <td>${record.vehicle}</td>

                    <td>${record.type}</td>

                    <td>${record.date}</td>

                    <td>₹${record.cost}</td>

                    <td>${record.description}</td>

                    <td>

                        <select
                            class="maintenance-status-select"
                            data-id="${record.id}"
                        >

                            <option value="Pending"
                                ${record.status === "Pending"
                                    ? "selected"
                                    : ""}>
                                Pending
                            </option>

                            <option value="In Progress"
                                ${record.status === "In Progress"
                                    ? "selected"
                                    : ""}>
                                In Progress
                            </option>

                            <option value="Completed"
                                ${record.status === "Completed"
                                    ? "selected"
                                    : ""}>
                                Completed
                            </option>

                        </select>

                    </td>

                </tr>
            `;

        }
    );

}

document
    .getElementById("maintenanceSearch")
    .addEventListener(
        "input",
        function () {

            const search =
                this.value.toLowerCase();


            const maintenance =
                getMaintenance();


            const filtered =
                maintenance.filter(
                    function (record) {

                        return (

                            record.vehicle
                                .toLowerCase()
                                .includes(search)

                            ||

                            record.type
                                .toLowerCase()
                                .includes(search)

                            ||

                            record.description
                                .toLowerCase()
                                .includes(search)

                        );

                    }
                );


            displayFilteredMaintenance(
                filtered
            );

        }
    );

populateVehicleDropdown();

displayMaintenance();

updateMaintenanceStats();