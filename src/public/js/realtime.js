//Cliente
const socket = io();
const role = document.getElementById("role").textContent;
const email = document.getElementById("email").textContent;


// Escuchar evento para renderizar productos
socket.on("products", (products) => {
    const listProducts = document.getElementById("lista-productos");
    listProducts.innerHTML = "";
    products.forEach((product) => {
        // Crear la tarjeta del producto
        const card = document.createElement("div");
        card.classList.add("col-xl-4", "col-md-4", "col-sm-6", "mb-4");

        card.innerHTML = `
            <div class="card text-center h-100">
                <div class="card-header bg-primary text-white">
                    <h5 class="card-title">${product.title}</h5>
                </div>
                <div class="card-body">
                    <img src="${product.img}" class="card-img-top" alt="${product.title}">
                    <p class="card-text">${product.description}</p>
                    <p class="card-text">Precio: $${product.price.toFixed(2)}</p>
                </div>
                <div class="card-footer">
                    <button class="btn btn-danger btn-delete" data-id="${product._id}">Eliminar</button>
                </div>
            </div>
        `;

        listProducts.appendChild(card);


        // Agregar evento al botón de eliminar producto
        const buttons = card.querySelectorAll(".btn-delete");

        buttons.forEach((button) => {

            //Verificamos si el rol es premium
            if (role === "premium") {
                //Si es premium validamos que el usuario sea el propietario del producto
                if (product.owner !== email) {
                    button.style.display = "none"; // Ocultar el botón si no es el propietario
                }
                //Si no es admin ni premium denegamos el acceso
            } else if (role !== "admin") {
                // Si no es admin ni premium, ocultar el botón de eliminar
                button.style.display = "none";
            }

            button.addEventListener("click", () => {
                const pid = button.getAttribute("data-id");
                deleteProduct(pid);
            });
        });
    });
});



// Evento para eliminar producto
function deleteProduct(pid) {
    socket.emit("deleteProduct", pid);
}

// Evento para agregar producto
document.getElementById("btnEnviar").addEventListener("click", addProduct);

function addProduct() {
    //Obtenemos el rol y el correo del usuario de la vista real time
    //const role = document.getElementById("role").textContent;
    const role = "premium";
    const email = document.getElementById("email").textContent;

    //Ternario, si el usuario es premium se asigna owner premum, si no se asigna admin
    const owner = role === "premium" ? email : "admin";

    const productForm = document.getElementById("productForm");

    const product = {
        title: document.getElementById("title").value,
        description: document.getElementById("description").value,
        price: document.getElementById("price").value,
        img: document.getElementById("img").value,
        code: document.getElementById("code").value,
        stock: document.getElementById("stock").value,
        category: document.getElementById("category").value,
        status: document.getElementById("status").value === "true",
        owner
    };
    socket.emit("addProduct", product);
    productForm.reset();
}
