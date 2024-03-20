const passwordEl = document.querySelector("#password");
const confirmPasswordEl = document.querySelector("#confirmPassword");

const resetForm = document.querySelector("#reset-password-form");

const isRequired = (value) => (value === "" ? false : true);
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
  input.classList.remove("error", "is-invalid");
  formField.classList.add("success", "is-valid");
  input.classList.add("success", "is-valid");

  // hide the error message
  const error = formField.querySelector("small");
  error.textContent = "";
};

const checkPassword = () => {
  let valid = false;

  const password = passwordEl.value.trim();

  if (!isRequired(password)) {
    showError(passwordEl.parentElement, "Password cannot be blank.");
  } else if (!isPasswordSecure(password)) {
    showError(
      passwordEl.parentElement,
      "Password must has at least 8 characters that include at least 1 lowercase character, 1 uppercase characters, 1 number, and 1 special character in (!@#$%^&*)"
    );
  } else {
    showSuccess(passwordEl.parentElement);
    valid = true;
  }

  return valid;
};

const checkConfirmPassword = () => {
  let valid = false;
  // check confirm password
  const confirmPassword = confirmPasswordEl.value.trim();
  const password = passwordEl.value.trim();

  if (!isRequired(confirmPassword)) {
    showError(
      confirmPasswordEl.parentElement,
      "Please enter the password again"
    );
  } else if (password !== confirmPassword) {
    showError(confirmPasswordEl.parentElement, "The password does not match");
  } else {
    showSuccess(confirmPasswordEl.parentElement);
    valid = true;
  }

  return valid;
};

resetForm.addEventListener("submit", function (e) {
  e.preventDefault();

  let isPasswordValid = checkPassword();
  let isConfirmPasswordValid = checkConfirmPassword();

  let isFormValid = isPasswordValid && isConfirmPasswordValid;

  if (isFormValid) {
    // Submit the form to the server
    resetForm.submit();
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

resetForm.addEventListener(
  "input",
  debounce(function (e) {
    switch (e.target.id) {
      case "password":
        checkPassword();
        break;
      case "confirmPassword":
        checkConfirmPassword();
        break;
    }
  })
);


const togglePassword = document.querySelector("#togglePassword");
const togglePasswordConfirm = document.querySelector("#togglePasswordConfirm");
const password = document.querySelector("#password");
const confirmPassword = document.querySelector("#confirmPassword");

togglePassword.addEventListener("click", function (e) {
  // toggle the type attribute
  const type =
    password.getAttribute("type") === "password" ? "text" : "password";
  password.setAttribute("type", type);
  // toggle the eye / eye slash icon
  this.classList.toggle("bi-eye");
});
togglePasswordConfirm.addEventListener("click", function (e) {
  // toggle the type attribute
  const type =
    confirmPassword.getAttribute("type") === "password" ? "text" : "password";
  confirmPassword.setAttribute("type", type);
  // toggle the eye / eye slash icon
  this.classList.toggle("bi-eye");
});
