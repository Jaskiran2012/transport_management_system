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

    const profileName = document.getElementById("profileName");
    const profileRole = document.getElementById("profileRole");
    const profileAvatar = document.getElementById("profileAvatar");
    const welcomeName = document.getElementById("welcome");

    if (profileName) profileName.textContent = user.name;
    if (profileRole) profileRole.textContent = user.role;
    if (profileAvatar) profileAvatar.textContent = user.name.charAt(0).toUpperCase();
    if (welcomeName) welcomeName.textContent = `${user.name.split(" ")[0]}.`;


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
       Real page links (href="something.html") should navigate
       normally. Only placeholder links (href="#", e.g. Settings
       until that page exists) get intercepted so the browser
       doesn't jump to the top of the page.
    ===================================== */

    const menuItems =
        document.querySelectorAll(".menu-item");

    menuItems.forEach(function (item) {

        item.addEventListener("click", function (event) {

            if (item.getAttribute("href") === "#") {
                event.preventDefault();
            }
            // real links: let the browser navigate — the
            // destination page's own HTML already marks
            // itself "active" in the sidebar.

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