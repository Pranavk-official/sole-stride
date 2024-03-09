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
      await fetch(`/cart/remove-from-cart/${productId}/${variantId}`, {
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
    `/cart/increase-quantity/${productID}/${variantId}`,
    productID,
    variantId
  );
  if (data && data.success) {
    const cart = data.cart;
    console.log(cart.price);
    const quantityInput = document.querySelector(
      `#quantityInput-${productID}-${variantId}`
    );
    const itemTotal = document.querySelector(
      `#itemTotal-${productID}-${variantId}`
    );

    const cartTotal = document.querySelector(
      `#cartTotal`
    );
    const grandTotal = document.querySelector(
      `#grandTotal`
    );

    grandTotal.innerHTML = `$${data.totalPrice}`;
    itemTotal.innerHTML = `$${cart.price}`;
    cartTotal.innerHTML = `$${data.totalPrice}`;
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
    `/cart/decrease-quantity/${productId}/${variantId}`,
    productId,
    variantId
  );
  if (data && data.success) {
    const cart = data.cart;
    const cartTotal = document.querySelector(
      `#cartTotal`
    );
    const grandTotal = document.querySelector(
      `#grandTotal`
    );
    const itemTotal = document.querySelector(
      `#itemTotal-${productId}-${variantId}`
    );
    cartTotal.innerHTML = `$${data.totalPrice}`;
    grandTotal.innerHTML = `$${data.totalPrice}`;
    itemTotal.innerHTML = `$${cart.price}`;
  } else {
    Swal.fire({
      icon: "error",
      title: "Oops... " + (data ? data.status : ""),
      text: "Something went wrong!",
    });
  }
};


//   //   //add to wish list function
//   //   addToWishlist = async (id) => {
//   //     const heart = document.getElementById(`heart${id}`);
//   //     await fetch(`/view_product/add-to-wishlist/${id}`, {
//   //       method: "GET",
//   //     })
//   //       .then((response) => response.json())
//   //       .then((data) => {
//   //         if (data.success) {
//   //           heart.classList.remove("fa-regular");
//   //           heart.classList.add("fa-solid");
//   //           heart.classList.add("text-danger");
//   //         } else {
//   //           heart.classList.remove("fa-solid");
//   //           heart.classList.remove("text-danger");
//   //           heart.classList.add("fa-regular");
//   //         }
//   //       });
//   //   };
// });

// const submitOrder = document.getElementById("submitOrder");
// if (submitOrder) {
//   submitOrder.addEventListener("click", async (e) => {
//     e.preventDefault();
//     let form = document.getElementById("orderForm");
//     if (form) {
//       let formData = new FormData(form);
//       const body = Object.fromEntries(formData);
//       console.log(body);
//       await fetch("/user/place-order", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(body),
//       })
//         .then((response) => response.json())
//         .then((data) => {
//           if (data.success) {
//             location.assign("/shop/order-success");
//           }
//         });
//     } else {
//       console.error("Form element not found");
//     }
//   });
// }
