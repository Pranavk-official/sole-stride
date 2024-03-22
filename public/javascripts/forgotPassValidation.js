const emailEl = document.querySelector("#email");


const form = document.querySelector("#forgot-pass-form");


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


const showError = (input, message) => {
  // get the form-field element
  const formField = input.parentElement;
  // add the error class
  formField.classList.remove("success", "is-valid");
  input.classList.remove("success", "is-valid");
  formField.classList.add("error", "is-invalid");
  input.classList.add("error", "is-invalid");

  // show the error message
  const error = formField.querySelector("small");
  error.textContent = message;
};

const showSuccess = (input) => {
  // get the form-field element
  const formField = input.parentElement;

  // remove the error class
  formField.classList.remove("error", "is-invalid");
  formField.classList.add("success", "is-valid");
  input.classList.remove("error", "is-invalid");
  input.classList.add("success", "is-valid");

  // hide the error message
  const error = formField.querySelector("small");
  error.textContent = "";
};

// Event listener for form submit
document.querySelector("#forgot-pass-form").addEventListener("submit", function (e) {
  e.preventDefault();

  // Get the username and password inputs
  const emailInput = document.querySelector("#email");

  // Validate the username (which is also used for email in this case)
  if (!isRequired(emailInput.value)) {
    showError(emailInput, "Email cannot be blank.");
  } else if (!isEmailValid(usernameInput.value)) {
    showError(emailInput, "Email is not valid.");
  } else {
    showSuccess(emailInput);
  }

  // Check if both inputs are valid before submitting the form
  if (
    emailInput.classList.contains("is-valid") 
  ) {
    this.submit();
  }
});

form.addEventListener("submit", function (e) {
  e.preventDefault();

  let isEmailValid = checkEmail()

  let isFormValid = isEmailValid ;

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
    }
  })
);

