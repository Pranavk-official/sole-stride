const oldPasswordEl = document.querySelector("#oldPassword");
const newPasswordEl = document.querySelector("#newPassword");
const confirmPasswordEl = document.querySelector("#confirmNewPassword");

const form = document.querySelector("#reset-password-form");


const checkOldPassword = () => {
  let valid = false;

  const password = oldPasswordEl.value.trim();

  if (!isRequired(password)) {
    showError(oldPasswordEl.parentElement, "Password cannot be blank.");
  } else if (!isPasswordSecure(password)) {
    showError(
      oldPasswordEl.parentElement,
      "Password must has at least 8 characters that include at least 1 lowercase character, 1 uppercase characters, 1 number, and 1 special character in (!@#$%^&*)"
    );
  } else {
    showSuccess(oldPasswordEl.parentElement);
    valid = true;
  }

  return valid;
};
const checkPassword = () => {
  let valid = false;

  const password = newPasswordEl.value.trim();


  if (!isRequired(password)) {
    showError(newPasswordEl.parentElement, "Password cannot be blank.");
  } else if (!isPasswordSecure(password)) {
    showError(
      newPasswordEl.parentElement,
      "Password must has at least 8 characters that include at least 1 lowercase character, 1 uppercase characters, 1 number, and 1 special character in (!@#$%^&*)"
    );
  }else if(password === oldPasswordEl.value.trim()){
    showError(newPasswordEl.parentElement, "New password cannot be same as old password");
  } else {
    showSuccess(newPasswordEl.parentElement);
    valid = true;
  }

  return valid;
};

const checkConfirmPassword = () => {
  let valid = false;
  // check confirm password
  const confirmPassword = confirmPasswordEl.value.trim();
  const password = newPasswordEl.value.trim();

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

const isPasswordSecure = (password) => {
  const re = new RegExp(
    "^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})"
  );
  return re.test(password);
};

// const isRequired = (value) => (value === "" ? false : true);
const isBetween = (length, min, max) =>
  length < min || length > max ? false : true;

// const showError = (input, message) => {
//   // get the form-field element
//   const formField = input.parentElement;
//   // add the error class
//   formField.classList.remove("success", "is-valid");
//   input.classList.remove("success", "is-valid");
//   formField.classList.add("error", "is-invalid");
//   input.classList.add("error", "is-invalid");

//   // show the error message
//   const error = formField.querySelector("small");
//   error.textContent = message;
// };

// const showSuccess = (input) => {
//   // get the form-field element
//   const formField = input.parentElement;

//   // remove the error class
//   formField.classList.remove("error", "is-invalid");
//   input.classList.remove("error", "is-invalid");
//   formField.classList.add("success", "is-valid");
//   input.classList.add("success", "is-valid");

//   // hide the error message
//   const error = formField.querySelector("small");
//   error.textContent = "";
// };

form.addEventListener("submit", async function (e) {
  e.preventDefault();

  let isOldPasswordValid = checkOldPassword(),
    isPasswordValid = checkPassword(),
    isConfirmPasswordValid = checkConfirmPassword();

  let isFormValid = isOldPasswordValid &&
    isPasswordValid &&
    isConfirmPasswordValid;

  if (isFormValid) {

    Swal.fire({
      title: 'Are you sure?',
      text: 'You want to change your password?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, change it!'
    }).then(async (result) => {
      if (result.isConfirmed) {
        const confirmed = await Swal.fire({
          title: 'Are you sure?',
          text: 'You want to reset your password.',
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: 'Yes, reset!',
          cancelButtonText: 'No, cancel!',
          reverseButtons: true
        });
    
        if (confirmed.isConfirmed) {
          const formData = new FormData(form);
          const response = await fetch('/user/reset-password', {
            method: 'POST',
            body: formData
          });
    
          if (response.ok) {
            Swal.fire({
              title: 'Success!',
              text: 'Password has been reset.',
              icon: 'success',
              timer: 1500
            }).then(()=>{
              location.assign('/user/profile');
            });
          } else {
            Swal.fire({
              title: 'Error!',
              text: 'Something went wrong.',
              icon: 'error',
              timer: 1500
            });
          }
        }
        // form.submit()
      }
    });
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

form.addEventListener(
  "input",
  debounce(function (e) {
    switch (e.target.id) {
      case "oldPassword":
        checkOldPassword();
        break;
      case "newPassword":
        checkPassword();
        break;
      case "confirmNewPassword":
        checkConfirmPassword();
        break;
    }
  })
);

// Password Toggle

const toggleOldPassword = document.querySelector("#toggleOldPassword");
const togglePassword = document.querySelector("#toggleNewPassword");
const togglePasswordConfirm = document.querySelector("#toggleNewPasswordConfirm");
const password = document.querySelector("#newPassword");
const confirmPassword = document.querySelector("#confirmNewPassword");

toggleOldPassword.addEventListener("click", function (e) {
  // toggle the type attribute
  const type =
    oldPasswordEl.getAttribute("type") === "password" ? "text" : "password";
  oldPasswordEl.setAttribute("type", type);
  // toggle the eye / eye slash icon
  this.classList.toggle("bi-eye");

});
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
