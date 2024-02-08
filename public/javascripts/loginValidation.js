const emailEl = document.querySelector("#email");
const passwordEl = document.querySelector("#password");

const form = document.querySelector("#login-form");

const checkEmail = () => {
  let valid = false;
  const email = emailEl.value.trim();
  if (!isRequired(email)) {
    showError(emailEl, "Email cannot be blank.");
  } else if (!isEmailValid(email)) {
    showError(emailEl, "Email is not valid.");
  } else {
    showSuccess(emailEl);
    valid = true;
  }
  return valid;
};

const checkPassword = () => {
  let valid = false;
  const password = passwordEl.value.trim();

  if (!isRequired(password)) {
    showError(passwordEl, "Password cannot be blank.");
  } else if (!isPasswordSecure(password)) {
    showError(
      passwordEl,
      "Password must have at least  8 characters including at least  1 lowercase character,  1 uppercase character,  1 number, and  1 special character in (!@#$%^&*)"
    );
  } else {
    showSuccess(passwordEl);
    valid = true;
  }

  return valid;
};

// ... (keep the existing isEmailValid, isPasswordSecure, isRequired, isBetween, showError, and showSuccess functions)
// Function to check if a string is not empty
const isRequired = (value) => (value === "" ? false : true);

// Function to check if a string length is between given values
const isBetween = (length, min, max) => length >= min && length <= max;

// Function to validate an email address
const isEmailValid = (email) => {
  const re =
    /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
};

// Function to validate a password
const isPasswordSecure = (password) => {
  const re = new RegExp(
    "^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})"
  );
  return re.test(password);
};

const showError = (input, message) => {
  // get the form-field element
  const formField = input.parentElement;
  // add the error class
  formField.classList.remove("success");
  formField.classList.add("error");

  // show the error message
  const error = formField.querySelector("small");
  error.textContent = message;
};

const showSuccess = (input) => {
  // get the form-field element
  const formField = input.parentElement;

  // remove the error class
  formField.classList.remove("error");
  formField.classList.add("success");

  // hide the error message
  const error = formField.querySelector("small");
  error.textContent = "";
};

// Event listener for form submit
document.querySelector("#login-form").addEventListener("submit", function (e) {
  e.preventDefault();

  // Get the username and password inputs
  const emailInput = document.querySelector("#email");
  const passwordInput = document.querySelector("#password");

  // Validate the username (which is also used for email in this case)
  if (!isRequired(emailInput.value)) {
    showError(usernameInput, "Email cannot be blank.");
  } else if (!isEmailValid(usernameInput.value)) {
    showError(emailInput, "Email is not valid.");
  } else {
    showSuccess(emailInput);
  }

  // Validate the password
  if (!isRequired(passwordInput.value)) {
    showError(passwordInput, "Password cannot be blank.");
  } else if (!isPasswordSecure(passwordInput.value)) {
    showError(
      passwordInput,
      "Password must have at least  8 characters, including at least one lowercase letter, one uppercase letter, one number, and one special character (!@#$%^&*)."
    );
  } else {
    showSuccess(passwordInput);
  }

  // Check if both inputs are valid before submitting the form
  if (
    emailInput.classList.contains("is-valid") &&
    passwordInput.classList.contains("is-valid")
  ) {
    this.submit();
  }
});

form.addEventListener("submit", function (e) {
  e.preventDefault();

  let isEmailValid = checkEmail(),
    isPasswordValid = checkPassword();

  let isFormValid = isEmailValid && isPasswordValid;

  if (isFormValid) {
    // Submit the form to the server
    form.submit();
  }
});

const debounce = (fn, delay = 500) => {
  let timeoutId;
  return (...args) => {
    // cancel the previous timer
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    // setup a new timer
    timeoutId = setTimeout(() => {
      fn.apply(null, args);
    }, delay);
  };
};

// ... (keep the existing debounce function and form input event listeners)
form.addEventListener(
  "input",
  debounce(function (e) {
    switch (e.target.id) {
      case "email":
        checkEmail();
        break;
      case "password":
        checkPassword();
        break;
    }
  })
);

// Password Toggle

const togglePassword = document.querySelector("#togglePassword");


togglePassword.addEventListener("click", function (e) {
  // toggle the type attribute
  const type =
    passwordEl.getAttribute("type") === "password" ? "text" : "password";
  passwordEl.setAttribute("type", type);
  // toggle the eye / eye slash icon
  this.classList.toggle("bi-eye");
});
