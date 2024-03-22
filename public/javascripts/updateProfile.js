const updateForm = document.querySelector("#update-form");

const checkFirstName = () => {
  const firstNameEl = document.querySelector("#account-fn");
  let valid = false;
  const firstName = firstNameEl.value.trim();

  if (!isRequired(firstName)) {
    showError(firstNameEl, "First name cannot be blank.");
  } else if (!isAlpha(firstName)) {
    showError(firstNameEl, "First name should only contain letters.");
  } else {
    showSuccess(firstNameEl);
    valid = true;
  }
  return valid;
};

const checkLastName = () => {
  const lastNameEl = document.querySelector("#account-ln");
  let valid = false;
  const lastName = lastNameEl.value.trim();

  if (!isRequired(lastName)) {
    showError(lastNameEl, "Last name cannot be blank.");
  } else if (!isAlpha(lastName)) {
    showError(lastNameEl, "Last name should only contain letters.");
  } else {
    showSuccess(lastNameEl);
    valid = true;
  }
  return valid;
};

const checkPhone = () => {
  const phoneEl = document.querySelector("#account-phone");
  let valid = false;
  const phone = phoneEl.value.trim();

  if (!isRequired(phone)) {
    showError(phoneEl, "Phone number cannot be blank.");
  } else if (!isIndianPhoneNumber(phone)) {
    showError(phoneEl, "Phone number is not valid.");
  } else {
    showSuccess(phoneEl);
    valid = true;
  }
  return valid;
};

const isIndianPhoneNumber = (phone) => {
  // Check if the phone number is a valid Indian number
  // Indian phone numbers are  10 digits long
  const re = /^\d{10}$/;
  return re.test(phone);
};

const isAlpha = (value) => {
  const regex = /^[a-zA-Z]+$/;
  return regex.test(value);
};

const isRequired = (value) => (value === "" ? false : true);

const showError = (input, message) => {
  const formField = input.parentElement;
  formField.classList.remove("success", "is-valid");
  input.classList.remove("success", "is-valid");
  formField.classList.add("error", "is-invalid");
  input.classList.add("error", "is-invalid");
  const error = formField.querySelector("small");
  error.textContent = message;
};

const showSuccess = (input) => {
  const formField = input.parentElement;
  formField.classList.remove("error", "is-invalid");
  input.classList.remove("error", "is-invalid");
  formField.classList.add("success", "is-valid");
  input.classList.add("success", "is-valid");
  const error = formField.querySelector("small");
  error.textContent = "";
};

updateForm.addEventListener("submit", async function (e) {
  e.preventDefault();

  let isFirstNameValid = checkFirstName(),
    isLastNameValid = checkLastName(),
    isPhoneValid = checkPhone();

  let isFormValid = isFirstNameValid && isLastNameValid && isPhoneValid;

  if (isFormValid) {
    const formData = new FormData(updateForm);
    const body = Object.fromEntries(formData.entries());
    console.log(body);
    Swal.fire({
      title: "Are you sure?",
      text: "You want to update your profile?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, Update!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await fetch("/user/profile", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
          });

          const data = await response.json();

          if (response.ok) {
            Swal.fire({
              title: "Success!",
              text: data.message,
              icon: "success",
              timer: 1500,
            }).then(() => {
              location.assign("/user/profile");
            });
          } else {
            Swal.fire({
              title: "Error!",
              text: data.message || "Something went wrong.",
              icon: "error",
              timer: 1500,
            });
          }
        } catch (error) {
          console.error(error);
          Swal.fire({
            title: "Error!",
            text: "An error occurred while updating your profile.",
            icon: "error",
            timer: 1500,
          });
        }
      }
    });
  }
});
