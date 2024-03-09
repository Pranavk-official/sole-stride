$(document).ready(function () {
 let addImgCount = 0;
 let changeProdImg = []; // Array to track which secondary images are being changed or deleted

 previewImg = (e) => {
  console.log(e.target.value)
    let image = URL.createObjectURL(e.target.files[0]);
    let imgPreview = document.getElementById("img" + e.target.id);
    imgPreview.src = image;
 };

 addSecImage = () => {
    const secImage = document.querySelector(".secondary-img");
    const img = document.createElement("img");
    img.setAttribute("src", "");
    img.setAttribute("id", "img" + addImgCount);
    img.setAttribute("style", "width: 5rem;");
    img.setAttribute("class", "border rounded mt-1 mb-2");
    secImage.appendChild(img);

    const inpWrap = document.createElement("div");
    inpWrap.setAttribute("class", "col-sm-10 col-md-9 d-flex align-self-start");
    secImage.appendChild(inpWrap);

    const inp = document.createElement("input");
    inp.setAttribute("type", "file");
    inp.setAttribute("name", "images");
    inp.setAttribute("accept", ".jpeg,.png,.jpg,.webp");
    inp.setAttribute("class", "form-control mb-2 mt-3 prod-img");
    inp.setAttribute("id", addImgCount);
    inp.setAttribute("onchange", `previewImg(event,'${addImgCount}','prod_img_2')`);
    inpWrap.appendChild(inp);

    const dlt = document.createElement("i");
    dlt.setAttribute("class", "fa-regular fa-circle-xmark m-3");
    dlt.setAttribute("style", "cursor: pointer;");
    dlt.setAttribute("onclick", `deleteImg('${addImgCount}','sec_img','${addImgCount}')`);
    inpWrap.appendChild(dlt);
    addImgCount++;
 };

 // Function to delete existing image
 deleteImg = (img_id, path, filename) => {
    if (path == "secondary_img") {
      changeProdImg.push(img_id);
    }
    document.getElementById("img" + filename).remove();
    document.getElementById(filename).parentElement.remove();
 };

});
