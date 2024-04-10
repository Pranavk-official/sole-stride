const editAddress = document.querySelector("#edit-address-modal");

const editAddressForm = document.querySelector("#edit-address-form");

editAddress.addEventListener("show.bs.modal", async (e) => {
  try {
    const editButton = e.relatedTarget;
    const addressId = editButton.getAttribute("data-address-id");

    const response = await fetch(`/user/address/edit-address/${addressId}`);
    if (!response.ok) {
      // If the response is not okay, throw an error
      throw new Error("Network response was not ok");
    }

    const data = await response.json();

    const address = data.address;
    console.log(address);

    document.getElementById("edit-address-fn").value = address.name;
    document.getElementById("edit-address-ph").value = address.phone;
    document.getElementById("edit-address-house-name").value =
      address.house_name;
    document.getElementById("edit-address-area").value = address.area_street;
    document.getElementById("edit-address-locality").value = address.locality;
    document.getElementById("edit-address-town").value = address.town;
    document.getElementById("edit-address-state").value = address.state;
    document.getElementById("edit-address-zip").value = address.zipcode;
    document.getElementById("edit-address-landmark").value = address.landmark;
    document.getElementById("edit-alternate-phone").value =
      address.alternate_phone;

    const addressTypeHome = document.getElementById("edit-flexRadioDefault1");
    const addressTypeWork = document.getElementById("edit-flexRadioDefault2");
    if (address.address_type === "HOME") {
      addressTypeHome.checked = true;
      addressTypeWork.checked = false;
    } else if (address.address_type === "WORK") {
      addressTypeHome.checked = false;
      addressTypeWork.checked = true;
    }

    editAddressForm.action = `/user/address/edit-address/${addressId}`;
    return;
  } catch (error) {
    // Use SweetAlert to display the error message
    Swal.fire({
      icon: "error",
      title: "Oops...",
      text: error.message || "Something went wrong!",
    });
  }
});

async function deleteAddress(addressId) {
  Swal.fire({
    title: "Are you sure?",
    text: "You won't be able to revert this!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Yes, delete it!",
  }).then(async (result) => {
    if (result.isConfirmed) {
      try {
        const response = await fetch(
          `/user/address/delete-address/${addressId}`,
          {
            method: "DELETE",
          }
        );

        if (!response.ok) {
          throw new Error("Network response was not ok");
        }

        Swal.fire("Deleted!", "Your address has been deleted.", "success").then(
          () => location.reload()
        );
        // Optionally, refresh the page or remove the address from the DOM here
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: "Something went wrong!" + error,
        });
      }
    }
  });
}


const form = document.querySelector("#add-address");

const checkName = () => {
  const nameEl = document.querySelector("#address-fn");
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

const checkPhone = () => {
  const phoneEl = document.querySelector("#address-ph");
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

const isIndianPhoneNumber = (phone) => {
  const re = /^\d{10}$/;
  return re.test(phone);
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
  if (error) {
    error.textContent = "";
  }
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
      case "address-fn": // Assuming this is the full name field
        checkName();
        break;
      case "address-ln": // Assuming this is the phone number field
        checkPhone();
        break;
      case "address-house-name": // Assuming this is the house name field
        checkHouseName();
        break;
      case "address-area": // Assuming this is the area/street field
        checkAreaStreet();
        break;
      case "address-locality": // Assuming this is the locality field
        checkLocality();
        break;
      case "address-town": // Assuming this is the town field
        checkTown();
        break;
      case "address-state": // Assuming this is the state field
        checkState();
        break;
      case "address-zip": // Assuming this is the ZIP code field
        checkZipcode();
        break;
      case "address-landmark": // Assuming this is the landmark field
        checkLandmark();
        break;
      case "alternate-phone": // Assuming this is the alternate phone number field
        checkAlternatePhone();
        break;
      case "address_type": // Assuming this is the address type field
        checkAddressType();
        break;
      // Add more cases as needed for other fields in your form
    }
  })
);
