/* =========================================
   TRANSITOPS DASHBOARD JAVASCRIPT
========================================= */


document.addEventListener("DOMContentLoaded", function () {

    /* =====================================
       CHECK LOGIN
    ===================================== */

    const session = localStorage.getItem("transitopsSession");

    if (!session) {
        window.location.href = "../index.html";
        return;
    }

    const user = JSON.parse(session);


    /* =====================================
       CURRENT DATE
    ===================================== */

    const dateElement = document.getElementById("currentDate");

    if (dateElement) {

        const today = new Date();

        const options = {
            day: "numeric",
            month: "long",
            year: "numeric"
        };

        dateElement.textContent =
            today.toLocaleDateString("en-IN", options);
    }


    /* =====================================
       LOGOUT
    ===================================== */

    const logoutBtn = document.getElementById("logoutBtn");

    if (logoutBtn) {

        logoutBtn.addEventListener("click", function () {

            /* Remove current login session */
            localStorage.removeItem("transitopsSession");

            /* Return to login page */
            window.location.href = "../index.html";

        });
    }


    /* =====================================
       MOBILE SIDEBAR
    ===================================== */

    const mobileMenu =
        document.getElementById("mobileMenu");

    const sidebar =
        document.querySelector(".sidebar");

    if (mobileMenu && sidebar) {

        mobileMenu.addEventListener("click", function () {

            sidebar.classList.toggle("open");

        });
    }


    /* =====================================
       SIDEBAR NAVIGATION
    ===================================== */

    const menuItems =
        document.querySelectorAll(".menu-item");

    menuItems.forEach(function (item) {

        item.addEventListener("click", function (event) {

            event.preventDefault();

            menuItems.forEach(function (menu) {
                menu.classList.remove("active");
            });

            item.classList.add("active");

        });

    });


    /* =====================================
       PERFORMANCE FILTER
    ===================================== */

    const performanceFilter =
        document.getElementById("performanceFilter");

    if (performanceFilter) {

        performanceFilter.addEventListener(
            "change",
            function () {

                console.log(
                    "Selected:",
                    performanceFilter.value
                );

            }
        );
    }


    /* =====================================
       SEARCH
    ===================================== */

    const searchInput =
        document.querySelector(".search-box input");

    if (searchInput) {

        searchInput.addEventListener(
            "input",
            function () {

                const value =
                    searchInput.value.toLowerCase();

                console.log("Searching:", value);

            }
        );
    }

});