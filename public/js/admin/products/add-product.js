const productNameEl = document.querySelector("#product_name");
const brandNameEl = document.querySelector("#brand_name");
const sizeEl = document.querySelector("#size");
const stockEl = document.querySelector("#product_stock");
const actualPriceEl = document.querySelector("#actualPrice");
const sellingPriceEl = document.querySelector("#sellingPrice");

const addProductForm = document.querySelector("#addProductForm");

const checkProductName = () => {
  let valid = false;
  const productName = productNameEl.value.trim();
  if (!isRequired(productName)) {
    showError(productNameEl, "Product name cannot be blank.");
  } else if (!isAlpha(productName)) {
    showError(productNameEl, "Product name should only contain letters.");
  } else {
    showSuccess(productNameEl);
    valid = true;
  }
  return valid;
};

const checkBrandName = () => {
  let valid = false;
  const brandName = brandNameEl.value.trim();
  if (!isRequired(brandName)) {
    showError(brandNameEl, "Brand name cannot be blank.");
  } else if (!isAlpha(brandName)) {
    showError(brandNameEl, "Brand name should only contain letters.");
  } else {
    showSuccess(brandNameEl);
    valid = true;
  }
  return valid;
};

const checkSize = () => {
  let valid = false;
  const size = sizeEl.value;
  if (!isRequired(size)) {
    showError(sizeEl, "Size cannot be blank.");
  } else if (!isPositiveInteger(size)) {
    showError(sizeEl, "Size should be a positive integer.");
  } else {
    showSuccess(sizeEl);
    valid = true;
  }
  return valid;
};

const checkStock = () => {
  let valid = false;
  const stock = stockEl.value;
  if (!isRequired(stock)) {
    showError(stockEl, "Stock cannot be blank.");
  } else if (!isPositiveInteger(stock)) {
    showError(stockEl, "Stock should be a positive integer.");
  } else {
    showSuccess(stockEl);
    valid = true;
  }
  return valid;
};

const checkActualPrice = () => {
  let valid = false;
  const actualPrice = actualPriceEl.value;
  if (!isRequired(actualPrice)) {
    showError(actualPriceEl, "Actual price cannot be blank.");
  } else if (!isPositiveInteger(actualPrice)) {
    showError(actualPriceEl, "Actual price should be a positive integer.");
  } else {
    showSuccess(actualPriceEl);
    valid = true;
  }
  return valid;
};

const checkSellingPrice = () => {
  let valid = false;
  const sellingPrice = sellingPriceEl.value;
  if (!isRequired(sellingPrice)) {
    showError(sellingPriceEl, "Selling price cannot be blank.");
  } else if (!isPositiveInteger(sellingPrice)) {
    showError(sellingPriceEl, "Selling price should be a positive integer.");
  } else {
    showSuccess(sellingPriceEl);
    valid = true;
  }
  return valid;
};

const isPositiveInteger = (value) => {
  const regex = /^\d+$/;
  return regex.test(value) && parseFloat(value) >  0;;
};

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

// Helper function to check if the input contains only alphabets
const isAlpha = (value) => {
  const regex = /^[a-zA-Z ]+$/;
  return regex.test(value);
};

const isRequired = (value) => (value === "" ? false : true);

// Image change event handler
document.getElementById("image").addEventListener("change", function () {
  if (this.files.length > 3) {
    Swal.fire({
      icon: "error",
      title: "Oops...",
      text: "You can select maximum of  3 images",
    });
    this.value = "";
  }
});

// Primary image change event handler
document.getElementById("primaryIMG").addEventListener("change", function (e) {
  let container = document.getElementById("crp-container");
  container.style.display = "block";
  let image = document.getElementById("images");
  let file = e.target.files[0];

  if (file) {
    let reader = new FileReader();
    reader.onload = function (event) {
      image.src = event.target.result;
      let cropper = new Cropper(image, {
        aspectRatio: 1 / 1,
        viewMode: 0,
        autoCrop: true,
        background: false,
      });

      document
        .getElementById("cropImageBtn")
        .addEventListener("click", function () {
          let cropedImg = cropper.getCroppedCanvas().toDataURL("image/png");
          if (cropedImg) {
            document.getElementById("prev").src = cropedImg;
            document.getElementById("result").value = cropedImg;
            container.style.display = "none";
            document.querySelector(".btn-group").style.display = "block";
          }
          cropper.destroy();
        });
    };
    reader.readAsDataURL(file);
  }
});


const debounce = (fn, delay = 50) => {
  let timeoutId;
  return (...args) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      fn.apply(null, args);
    }, delay);
  };
};

// Form submission event handler
document
  .getElementById("addProductForm")
  .addEventListener("submit", function (event) {
    event.preventDefault();

    let isProductNameValid = checkProductName(),
      isBrandNameValid = checkBrandName(),
      isSizeValid = checkSize(),
      isStockValid = checkStock(),
      isActualPriceValid = checkActualPrice(),
      isSellingPriceValid = checkSellingPrice();

    let isFormValid =
      isProductNameValid &&
      isBrandNameValid &&
      isSizeValid &&
      isStockValid &&
      isActualPriceValid &&
      isSellingPriceValid;

    if (isFormValid) {
      Swal.fire({
        title: "Are you sure?",
        text: "You want to add new product?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#0061bc",
        cancelButtonColor: "rgb(128,  128,  128)",
        confirmButtonText: "Yes",
      }).then(async (result) => {
        if (result.isConfirmed) {
          const form = document.getElementById("addProductForm");
          try {
            const formData = new FormData(form);
            const base64String = document.getElementById("result").value;
            const base64Data = base64String.split(",")[1];
            const binaryData = atob(base64Data);
            const uint8Array = new Uint8Array(binaryData.length);
            for (let i = 0; i < binaryData.length; i++) {
              uint8Array[i] = binaryData.charCodeAt(i);
            }
            const blob = new Blob([uint8Array], { type: "image/png" });
            const file = new File([blob], "image.png", { type: "image/png" });
            formData.append("primaryImage", file);

            let res = await fetch("/admin/products/add-product", {
              method: "POST",
              body: formData,
            });
            let data = await res.json();
            if (data.success) {
              Swal.fire(
                "Created!",
                "New product has been created successfully.",
                "success"
              ).then(() => location.assign("/admin/products"));
            } else {
              throw new Error(data.message);
            }
          } catch (e) {
            Swal.fire("Error!", e.message, "error");
          }
        }
      });
    }
  });

addProductForm.addEventListener(
  "input",
  debounce(function (e) {
    switch (e.target.id) {
      case "product_name":
        checkProductName();
        break;
      case "brand_name":
        checkBrandName();
        break;
      case "size":
        checkSize();
        break;
      case "product_stock":
        checkStock();
        break;
      case "actualPrice":
        checkActualPrice();
        break;
      case "sellingPrice":
        checkSellingPrice();
        break;
    }
  })
);


// Search product function
const searchProduct = async () => {
  let search = document.getElementById("searchInput").value;
  let queryLink = document.getElementById("querry");
  queryLink.href = "/products/?search=" + encodeURIComponent(search);
};
