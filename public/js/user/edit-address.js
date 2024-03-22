const editForm = document.querySelector("#edit-address-form");

const checkEditName = () => {
  const nameEl = document.querySelector("#edit-address-fn");
  let valid = false;
  const name = nameEl.value.trim();

  if (!isRequired(name)) {
    showError(nameEl, "Full name cannot be blank.");
  } else if (!/^[a-zA-Z\s]+$/.test(name)) {
    showError(nameEl, "Full name should not contain numbers.");
  } else {
    showSuccess(nameEl);
    valid = true;
  }
  return valid;
};

const checkEditPhone = () => {
  const phoneEl = document.querySelector("#edit-address-ph");
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

const checkEditHouseName = () => {
  const houseNameEl = document.querySelector("#edit-address-house-name");
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

const checkEditAreaStreet = () => {
  const areaStreetEl = document.querySelector("#edit-address-area");
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

const checkEditLocality = () => {
  const localityEl = document.querySelector("#edit-address-locality");
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

const checkEditTown = () => {
  const townEl = document.querySelector("#edit-address-town");
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

const checkEditState = () => {
  const stateEl = document.querySelector("#edit-address-state");
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

const checkEditZipcode = () => {
  const zipcodeEl = document.querySelector("#edit-address-zip");
  let valid = false;
  const zipcode = zipcodeEl.value;

  if (!isRequired(zipcode)) {
    showError(zipcodeEl, "ZIP code cannot be blank.");
  } else {
    showSuccess(zipcodeEl);
    valid = true;
  }
  return valid;
};

const checkEditLandmark = () => {
  const landmarkEl = document.querySelector("#edit-address-landmark");
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

const checkEditAlternatePhone = () => {
  const alternatePhoneEl = document.querySelector("#edit-alternate-phone");
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

const checkEditAddressType = () => {
  const addressTypeEl = document.querySelector(
    'input[name="address_type"]:checked'
  );
  let valid = false;

  if (!addressTypeEl) {
    showError(addressTypeEl, "Please select an address type.");
  } else {
    showSuccess(addressTypeEl);
    valid = true;
  }
  return valid;
};

editForm.addEventListener("submit", function (e) {
  e.preventDefault();

  console.log(e);
  const formData = new FormData(editForm);

  // Log the form data
  for (let [key, value] of formData.entries()) {
    console.log(`${key}: ${value}`);
  }

  let isNameValid = checkEditName(),
    isPhoneValid = checkEditPhone(),
    isHouseNameValid = checkEditHouseName(),
    isAreaStreetValid = checkEditAreaStreet(),
    isLocalityValid = checkEditLocality(),
    isTownValid = checkEditTown(),
    isStateValid = checkEditState(),
    isZipcodeValid = checkEditZipcode(),
    isLandmarkValid = checkEditLandmark(),
    isAlternatePhoneValid = checkEditAlternatePhone(),
    isAddressTypeValid = checkEditAddressType();

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
    editForm.submit();
  }
});



editForm.addEventListener(
  "input",
  debounce((e) => {
    switch (e.target.id) {
      case "edit-address-fn": // Full name
        checkEditName();
        break;
      case "edit-address-ln": // Phone
        checkEditPhone();
        break;
      case "edit-address-house-name": // House Name
        checkEditHouseName();
        break;
      case "edit-address-area": // Area/Street
        checkEditAreaStreet();
        break;
      case "edit-address-locality": // Locality
        checkEditLocality();
        break;
      case "edit-address-town": // Town
        checkEditTown();
        break;
      case "edit-address-state": // State
        checkEditState();
        break;
      case "edit-address-zip": // ZIP code
        checkEditZipcode();
        break;
      case "edit-address-landmark": // Landmark
        checkEditLandmark();
        break;
      case "edit-alternate-phone": // Alternate Phone
        checkEditAlternatePhone();
        break;
      // Assuming there's a function to check the address type, if needed
      case "edit-form-check": // Address Type
        checkAddressType();
        break;
    }
  })
);
