/* =========================================================
   TRANSITOPS
   Login Page Logic
========================================================= */


/* =========================================================
   ELEMENTS
========================================================= */

const loginForm = document.getElementById("loginForm");

const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");

const emailError = document.getElementById("emailError");
const passwordError = document.getElementById("passwordError");

const rememberMe = document.getElementById("rememberMe");

const passwordToggle =
    document.getElementById("passwordToggle");

const loginButton =
    document.getElementById("loginButton");

const forgotPassword =
    document.getElementById("forgotPassword");

const toast =
    document.getElementById("toast");

const toastMessage =
    document.getElementById("toastMessage");


/* =========================================================
   DEMO USER
   Temporary authentication.
   Real RBAC will be added later.
========================================================= */

const DEMO_USER = {
    email: "admin@transitops.com",
    password: "admin123",
    name: "Admin User",
    role: "Fleet Manager"
};


/* =========================================================
   INITIALIZE
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    loadRememberedEmail();

    animateStats();

});


/* =========================================================
   PASSWORD VISIBILITY
========================================================= */

passwordToggle.addEventListener("click", () => {

    const isPassword =
        passwordInput.type === "password";

    passwordInput.type =
        isPassword ? "text" : "password";

    passwordToggle.setAttribute(
        "aria-label",
        isPassword
            ? "Hide password"
            : "Show password"
    );

});


/* =========================================================
   EMAIL MEMORY
========================================================= */

function loadRememberedEmail() {

    const savedEmail =
        localStorage.getItem("transitopsRememberedEmail");

    if (savedEmail) {

        emailInput.value = savedEmail;

        rememberMe.checked = true;
    }

}


/* =========================================================
   FORM SUBMIT
========================================================= */

loginForm.addEventListener("submit", async (event) => {

    event.preventDefault();

    clearErrors();


    const email =
        emailInput.value.trim().toLowerCase();

    const password =
        passwordInput.value.trim();


    /* Validate */

    if (!validateForm(email, password)) {
        return;
    }


    /* Loading state */

    setLoading(true);


    /*
        Simulate authentication request.

        Later this will be replaced with:
        API / backend authentication.
    */

    await delay(900);


    const isDemoUser =
        email === DEMO_USER.email &&
        password === DEMO_USER.password;

    handleSuccessfulLogin(
        email,
        isDemoUser ? DEMO_USER.name : getDisplayName(email),
        isDemoUser ? DEMO_USER.role : "Fleet Manager"
    );

});


/* =========================================================
   FORM VALIDATION
========================================================= */

function validateForm(email, password) {

    let isValid = true;


    /* Email */

    if (!email) {

        showError(
            emailError,
            "Email address is required."
        );

        isValid = false;

    } else if (!isValidEmail(email)) {

        showError(
            emailError,
            "Please enter a valid email address."
        );

        isValid = false;

    }


    /* Password */

    if (!password) {

        showError(
            passwordError,
            "Password is required."
        );

        isValid = false;

    } else if (password.length < 6) {

        showError(
            passwordError,
            "Password must be at least 6 characters."
        );

        isValid = false;

    }


    return isValid;
}


/* =========================================================
   EMAIL VALIDATION
========================================================= */

function isValidEmail(email) {

    const emailPattern =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    const looseEmailPattern = /^[^\s@]+\.[a-z]{2,}$/i;

    return emailPattern.test(email) || looseEmailPattern.test(email);

}


/* =========================================================
   SUCCESSFUL LOGIN
========================================================= */

function handleSuccessfulLogin(email, name, role) {

    /* Remember email */

    if (rememberMe.checked) {

        localStorage.setItem(
            "transitopsRememberedEmail",
            email
        );

    } else {

        localStorage.removeItem(
            "transitopsRememberedEmail"
        );

    }


    /* Store temporary session */

    const session = {

        email,

        name,

        role,

        loginTime: new Date().toISOString()

    };


    localStorage.setItem(
        "transitopsSession",
        JSON.stringify(session)
    );


    setLoading(false);


    showToast(
        `Welcome back, ${name}.`
    );


    /*
        Dashboard doesn't exist yet.

        Once dashboard.html is created,
        this will become:

       
    */
    window.location.href = "dashboard.html";

}


/* =========================================================
   FORGOT PASSWORD
========================================================= */

forgotPassword.addEventListener("click", (event) => {

    event.preventDefault();

    showToast(
        "Password recovery will be available soon."
    );

});


/* =========================================================
   ERROR HELPERS
========================================================= */

function showError(element, message) {

    element.textContent = message;

}


function clearErrors() {

    emailError.textContent = "";
    passwordError.textContent = "";

}


/* =========================================================
   LOADING
========================================================= */

function setLoading(isLoading) {

    if (isLoading) {

        loginButton.classList.add("loading");

    } else {

        loginButton.classList.remove("loading");

    }

}


/* =========================================================
   TOAST
========================================================= */

let toastTimeout;

function showToast(message) {

    toastMessage.textContent = message;

    toast.classList.add("show");


    clearTimeout(toastTimeout);


    toastTimeout = setTimeout(() => {

        toast.classList.remove("show");

    }, 3500);

}


/* =========================================================
   STATS ANIMATION
========================================================= */

function animateStats() {

    const statElements =
        document.querySelectorAll(
            ".stat-value[data-target]"
        );


    statElements.forEach((element) => {

        const target =
            Number(element.dataset.target);

        let current = 0;

        const increment =
            Math.max(1, Math.ceil(target / 30));


        const timer =
            setInterval(() => {

                current += increment;


                if (current >= target) {

                    current = target;

                    clearInterval(timer);

                }


                if (element.textContent.includes("%")) {

                    element.textContent =
                        `${current}%`;

                } else if (target < 10) {

                    element.textContent =
                        current.toString().padStart(2, "0");

                } else {

                    element.textContent =
                        current.toString();

                }

            }, 25);

    });

}


/* =========================================================
   UTILITY
========================================================= */

function delay(milliseconds) {

    return new Promise((resolve) => {

        setTimeout(resolve, milliseconds);

    });

}


function getDisplayName(email) {

    const username = email.split("@")[0];
    const namePart = username.split(/\d/)[0].replace(/[._-]+/g, " ").trim();

    return namePart
        .replace(/\b\w/g, (letter) => letter.toUpperCase()) || "User";

}