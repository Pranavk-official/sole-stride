const form = document.querySelector("#add-address");

const checkName = () => {
  const nameEl = document.querySelector("#address-fn");
  let valid = false;
  const name = nameEl.value.trim();

  if (!isRequired(name)) {
    showError(nameEl, "Full name cannot be blank.");
  } else if (!isAlpha(name)) {
    showError(nameEl, "Full name should only contain letters.");
  } else {
    showSuccess(nameEl);
    valid = true;
  }
  return valid;
};

const checkPhone = () => {
  const phoneEl = document.querySelector("#address-ln");
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

const checkHouseName = () => {
  const houseNameEl = document.querySelector("#address-house-name");
  let valid = false;
  const houseName = houseNameEl.value.trim();

  if (!isRequired(houseName)) {
    showError(houseNameEl, "House name cannot be blank.");
  } else {
    showSuccess(houseNameEl);
    valid = true;
  }
  return valid;
};

const checkAreaStreet = () => {
  const areaStreetEl = document.querySelector("#address-area");
  let valid = false;
  const areaStreet = areaStreetEl.value.trim();

  if (!isRequired(areaStreet)) {
    showError(areaStreetEl, "Area/Street cannot be blank.");
  } else {
    showSuccess(areaStreetEl);
    valid = true;
  }
  return valid;
};

const checkLocality = () => {
  const localityEl = document.querySelector("#address-locality");
  let valid = false;
  const locality = localityEl.value.trim();

  if (!isRequired(locality)) {
    showError(localityEl, "Locality cannot be blank.");
  } else {
    showSuccess(localityEl);
    valid = true;
  }
  return valid;
};

const checkTown = () => {
  const townEl = document.querySelector("#address-town");
  let valid = false;
  const town = townEl.value.trim();

  if (!isRequired(town)) {
    showError(townEl, "Town cannot be blank.");
  } else {
    showSuccess(townEl);
    valid = true;
  }
  return valid;
};

const checkState = () => {
  const stateEl = document.querySelector("#address-state");
  let valid = false;
  const state = stateEl.value;

  if (state === "india") {
    showError(stateEl, "Please select your state.");
  } else {
    showSuccess(stateEl);
    valid = true;
  }
  return valid;
};

const checkZipcode = () => {
  const zipcodeEl = document.querySelector("#address-zip");
  let valid = false;
  const zipcode = zipcodeEl.value;

  if (!isRequired(zipcode)) {
    showError(zipcodeEl, "ZIP code cannot be blank.");
  } else if (zipcode <  0) {
    showError(zipcodeEl, "ZIP code cannot be negative.");
  } else {
    showSuccess(zipcodeEl);
    valid = true;
  }
  return valid;
};

const checkLandmark = () => {
  const landmarkEl = document.querySelector("#address-landmark");
  let valid = false;
  const landmark = landmarkEl.value.trim();

  if (!isRequired(landmark)) {
    showError(landmarkEl, "Landmark cannot be blank.");
  } else {
    showSuccess(landmarkEl);
    valid = true;
  }
  return valid;
};

const checkAlternatePhone = () => {
  const alternatePhoneEl = document.querySelector("#alternate-phone");
  let valid = false;
  const alternatePhone = alternatePhoneEl.value.trim();

  if (!isRequired(alternatePhone)) {
    showError(alternatePhoneEl, "Alternate phone number cannot be blank.");
  } else if (!isIndianPhoneNumber(alternatePhone)) {
    showError(alternatePhoneEl, "Alternate phone number is not valid.");
  } else {
    showSuccess(alternatePhoneEl);
    valid = true;
  }
  return valid;
};

const checkAddressType = () => {
  const addressTypeEl = document.querySelector('input[name="address_type"]:checked');
  let valid = false;

  if (!addressTypeEl) {
    showError(addressTypeEl, "Please select an address type.");
  } else {
    showSuccess(addressTypeEl);
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
  const error = formField.querySelector("div.invalid-feedback");
  error.textContent = message;
};

const showSuccess = (input) => {
  const formField = input.parentElement;
  formField.classList.remove("error", "is-invalid");
  input.classList.remove("error", "is-invalid");
  formField.classList.add("success", "is-valid");
  input.classList.add("success", "is-valid");
  const error = formField.querySelector("div.invalid-feedback");
  error.textContent = "";
};

form.addEventListener("submit", function (e) {
  e.preventDefault();

  let isNameValid = checkName(),
    isPhoneValid = checkPhone(),
    isHouseNameValid = checkHouseName(),
    isAreaStreetValid = checkAreaStreet(),
    isLocalityValid = checkLocality(),
    isTownValid = checkTown(),
    isStateValid = checkState(),
    isZipcodeValid = checkZipcode(),
    isLandmarkValid = checkLandmark(),
    isAlternatePhoneValid = checkAlternatePhone(),
    isAddressTypeValid = checkAddressType();

  let isFormValid =
    isNameValid &&
    isPhoneValid &&
    isHouseNameValid &&
    isAreaStreetValid &&
    isLocalityValid &&
    isTownValid &&
    isStateValid &&
    isZipcodeValid &&
    isLandmarkValid &&
    isAlternatePhoneValid &&
    isAddressTypeValid;

  if (isFormValid) {
    form.submit();
  }
});
