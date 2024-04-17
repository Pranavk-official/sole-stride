// new-category

$("#category_image").on("change", (e) => {
  let container = document.getElementById("category-crp-container");
  container.style.display = "block";
  let image = document.getElementById("categoryIMG");
  let file = e.target.files[0];
  $(".button-grp").hide();
  if (file) {
    // Create a new FileReader to read the selected image file
    var reader = new FileReader(file);
    reader.onload = function (event) {
      // Set the source of the image element in the Cropper container
      document.getElementById("categoryIMG").src = event.target.result;
      // Initialize Cropper.js with the updated image source
      let cropper = new Cropper(image, {
        aspectRatio: 1 / 1,
        viewMode: 0,
        autoCrop: true,
        background: false,
      });

      $("#cropImageBtn").on("click", function () {
        var cropedImg = cropper.getCroppedCanvas();
        if (cropedImg) {
          cropedImg = cropedImg.toDataURL("image/png");
          document.getElementById("category_prev").src = cropedImg;
          document.getElementById("cropped_category").value = cropedImg;
          container.style.display = "none";
          document.getElementById("categoryIMG").src = "";
          $(".button-grp").show();
        }
        cropper.destroy();
      });
    };
    reader.readAsDataURL(file);
  }
});

// add new category
$("#add-category").validate({
  rules: {
    category_name: {
      required: true,
      maxlength: 20,
    },
    category_image: {
      required: true,
    },
  },
  submitHandler: function (form) {
    Swal.fire({
      title: "Are you sure?",
      text: "You want to add new Category?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#0061bc",
      cancelButtonColor: "rgb(128, 128, 128)",
      confirmButtonText: "Yes",
    }).then(async (result) => {
      if (result.isConfirmed) {
        const form = document.getElementById("add-category");
        try {
          const formData = new FormData(form);
          console.log(formData);
          const base64String =
            document.getElementById("cropped_category").value;
          const base64Data = base64String.split(",")[1];
          const binaryData = atob(base64Data);
          const uint8Array = new Uint8Array(binaryData.length);
          for (let i = 0; i < binaryData.length; i++) {
            uint8Array[i] = binaryData.charCodeAt(i);
          }
          const blob = new Blob([uint8Array], {
            type: "image/png",
          });
          const file = new File([blob], "image.png", {
            type: "image/png",
          });
          formData.append("category_image", file);
          console.log(formData);
          //   log the form data to the console using loop
          for (const [key, value] of formData.entries()) {
            console.log(`${key}: ${value}`);
          }
          const body = Object.fromEntries(formData);
          console.log(body);

          let res = await fetch("/admin/category/add-category", {
            method: "POST",
            body: formData,
          });
          console.log(res);
          let data = await res.json();
          if (data.success) {
            Swal.fire(
              "Created!",
              "New category has been created successfully.",
              "success"
            ).then(() => location.assign("/admin/category"));
          } else {
            throw new Error(data.error);
          }
        } catch (e) {
          console.log(e);
          Swal.fire("Error!", e.message, "error");
        }
      }
    });
  },
});

// edit category
$("#edit-category").validate({
  rules: {
    name: {
      required: true,
      maxlength: 20,
    },
  },
  submitHandler: function (form) {
    Swal.fire({
      title: "Are you sure?",
      text: "You want to Edit this Category?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#0061bc",
      cancelButtonColor: "rgb(128, 128, 128)",
      confirmButtonText: "Yes",
    }).then(async (result) => {
      if (result.isConfirmed) {
        const form = document.getElementById("edit-category");
        try {
          const formData = new FormData(form);
          let body = Object.fromEntries(formData);
          let id = body.category_id;
          console.log(body);
          const image_string =
            document.getElementById("cropped_category").value;
          if (image_string) {
            const base64String = image_string;
            const base64Data = base64String.split(",")[1];
            const binaryData = atob(base64Data);
            const uint8Array = new Uint8Array(binaryData.length);
            for (let i = 0; i < binaryData.length; i++) {
              uint8Array[i] = binaryData.charCodeAt(i);
            }
            const blob = new Blob([uint8Array], {
              type: "image/png",
            });
            const file = new File([blob], "image.png", {
              type: "image/png",
            });
            formData.append("category_image", file);
            let res = await fetch(`/admin/category/edit-category/${id}`, {
              method: "POST",
              body: formData,
            });
            let data = await res.json();
            if (data.success) {
              Swal.fire(
                "Editted!",
                "Category Edited successfully.",
                "success"
              ).then(() => location.assign("/admin/category"));
            } else {
              throw new Error(data.message);
            }
          } else {
            let res = await fetch(`/admin/category/edit-category/${id}`, {
              method: "POST",
              body: JSON.stringify(body),
              headers: { "Content-Type": "application/json" },
            });
            let data = await res.json();
            if (data.success) {
              Swal.fire(
                "Editted!",
                "Category Edited successfully.",
                "success"
              ).then(() => location.assign("/admin/category"));
            } else {
              throw new Error(data.message);
            }
          }
        } catch (e) {
          Swal.fire("Error!", e.message, "error");
        }
      }
    });
  },
});

// deleting category
const deleteCategory = (id, imageName) => {
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
          `/admin/category/delete-category?id=${id}&image=${imageName}`
        );
        const data = await response.json();
        if (data.success) {
          Swal.fire("Deleted!", "Your file has been deleted.", "success").then(
            () => {
              location.assign("/admin/category");
            }
          );
        } else {
          Swal.fire("Error!", data.message, "error");
        }
      } catch (err) {
        console.error(err);
        Swal.fire("Error!", err.message, "error");
      }
    }
  });
};
