const removeFromCart = async (productId, variantId) => {
  Swal.fire({
    title: "Are you sure?",
    text: `Are you sure want to remove this product from cart`,
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Yes, Remove it!",
  }).then(async (result) => {
    if (result.isConfirmed) {
      await fetch(`/user/cart/remove-from-cart/${productId}/${variantId}`, {
        method: "GET",
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.status) {
            location.reload();
          }
        });
    }
  });
};

// Common function to handle fetch call and error handling
const updateCartQuantity = async (url, productID, variantId) => {
  try {
    const response = await fetch(url, {
      method: "GET",
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(error);
    Swal.fire({
      icon: "error",
      title: "Oops...",
      text: "Something went wrong!" + error,
    });
    return null; // Return null if an error occurs
  }
};

// Increase quantity
const increaseCartQuantity = async (productID, variantId) => {
  const data = await updateCartQuantity(
    `/user/cart/increase-quantity/${productID}/${variantId}`,
    productID,
    variantId
  );
  console.log(data);
  if (data && data.success) {
    const cart = data.cart;
    console.log(cart.price);
    const quantityInput = document.querySelector(
      `#quantityInput-${productID}-${variantId}`
    );
    const itemTotal = document.querySelector(
      `#itemTotal-${productID}-${variantId}`
    );

    const cartTotal = document.querySelector(`#cartTotal`);
    const grandTotal = document.querySelector(`#grandTotal`);

    grandTotal.innerHTML = `₹${data.totalPrice}`;
    itemTotal.innerHTML = `₹${cart.itemTotal}`;
    cartTotal.innerHTML = `₹${data.totalPrice}`;
  } else {
    Swal.fire({
      icon: "error",
      title: "Limited Stock!",
      text: "The item you selected has only a limited quantity available.",
    }).then(() => {
      location.assign("/user/cart");
    });
  }
};

// Decrease quantity
const decreaseCartQuantity = async (productId, variantId) => {
  const quantityInput = document.querySelector(
    `#quantityInput-${productId}-${variantId}`
  );
  const currentQuantity = parseInt(quantityInput.value);

  if (currentQuantity <= 1) {
    Swal.fire({
      icon: "error",
      title: "Oops...",
      text: "You can't decrease to zero!",
    }).then(() => {
      location.assign("/user/cart");
    });
    return;
  }

  const data = await updateCartQuantity(
    `/user/cart/decrease-quantity/${productId}/${variantId}`,
    productId,
    variantId
  );
  if (data && data.success) {
    const cart = data.cart;
    const cartTotal = document.querySelector(`#cartTotal`);
    const grandTotal = document.querySelector(`#grandTotal`);
    const itemTotal = document.querySelector(
      `#itemTotal-${productId}-${variantId}`
    );
    cartTotal.innerHTML = `₹${data.totalPrice}`;
    grandTotal.innerHTML = `₹${data.totalPrice}`;
    itemTotal.innerHTML = `₹${cart.itemTotal}`;
  } else {
    Swal.fire({
      icon: "error",
      title: "Oops... " + (data ? data.status : ""),
      text: "Something went wrong!",
    });
  }
};

// Add to Wishlist
const addToWishlist = async (productId) => {
  console.log(productId);

  const heart = document.getElementById(`wishlist-${productId}`);
  const response = await fetch(`/user/add-to-wishlist/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      productId,
    }),
  });

  if (response.redirected) {
    window.location.href = response.url;
    return;
  }

  if (response.ok) {
    const data = await response.json();
    if (data.success) {
      if (heart) {
        heart.classList.remove("btn-outline-danger");
        heart.classList.add("btn-danger");
      }
      Swal.fire({
        icon: "success",
        title: "Success!",
        text: "Product added to wishlist.",
      });
    } else {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: data.message, // Display the message from the backend
      });
    }
  } else {
    // Handle server errors based on status code
    switch (response.status) {
      case 401:
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: "Please log in to add product to wishlist",
        });
        break;
      case 404:
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: "Product or user not found",
        });
        break;
      case 400:
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: "Product already exists in wishlist",
        });
        break;
      default:
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: "There was an error adding the product to your wishlist.",
        });
    }
  }
};
