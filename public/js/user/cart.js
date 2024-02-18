$(document).ready(() => {
  (addToCart = async (productID) => {
    console.log(productID);
    try {
      const response = await fetch(`/cart/add-to-cart/${productID}`, {
        method: "GET",
      });

      console.log(response);
      const data = await response.json();
      console.log(data);
      if (data.status) {
        let cartCount = document.getElementById("cartCount");
        if (cartCount) {
          cartCount.innerText = data.count;
        }
        Swal.fire({
          icon: "success",
          title: "Added to Cart",
          text: "Your product has been added to the cart.",
          confirmButtonText: "Continue Shopping",
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Failed to Add to Cart",
          text: data.message,
        });
      }
    } catch (error) {
      console.log();
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Something went wrong!",
        error,
      });
    }
  }),
    (removeFromCart = async (product_ID) => {
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
          await fetch(`/cart/remove-from-cart/${product_ID}`, {
            method: "GET",
          })
            .then((response) => response.json())
            .then((data) => {
              if (data.status) {
                location.assign("/cart");
              }
            });
        }
      });
    });

  // Increase quantity
  increaseCartQuantity = async (productID) => {
    try {
      const response = await fetch(`/cart/increase-quantity/${productID}`, {
        method: "GET",
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          const quantityInput = document.querySelector(
            `#quantityInput-${productID}`
          );
          const currentQuantity = parseInt(quantityInput.value);
          quantityInput.value = currentQuantity + 1;
          location.assign("/cart");
        } else {
          Swal.fire({
            icon: "error",
            title: "Limited Stock!",
            text: "The item you selected has only a limited quantity available.",
          });
        }
      } else {
        // Handle fetch errors here
      }
    } catch (error) {
      console.error(error);
    }
  };

  // Decrease quantity
  decreaseCartQuantity = async (productId) => {
    try {
      const quantityInput = document.querySelector(
        `#quantityInput-${productId}`
      );
      const currentQuantity = parseInt(quantityInput.value);

      if (currentQuantity <= 1) {
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: "You can't decrease to zero!",
        });

        return;
      }

      const response = await fetch(`/cart/decrease-quantity/${productId}`, {
        method: "GET",
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          quantityInput.value = currentQuantity - 1;
          location.assign("/cart");
        }
      } else {
        // Handle fetch errors here
        Swal.fire({
          icon: "error",
          title: "Oops... " + response.status,
          text: "Something went wrong!",
        });
      }
    } catch (error) {
      console.error(error);
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Something went wrong!" + error,
      });
    }
  };

  //   //add to wish list function
  //   addToWishlist = async (id) => {
  //     const heart = document.getElementById(`heart${id}`);
  //     await fetch(`/view_product/add-to-wishlist/${id}`, {
  //       method: "GET",
  //     })
  //       .then((response) => response.json())
  //       .then((data) => {
  //         if (data.success) {
  //           heart.classList.remove("fa-regular");
  //           heart.classList.add("fa-solid");
  //           heart.classList.add("text-danger");
  //         } else {
  //           heart.classList.remove("fa-solid");
  //           heart.classList.remove("text-danger");
  //           heart.classList.add("fa-regular");
  //         }
  //       });
  //   };
});

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
