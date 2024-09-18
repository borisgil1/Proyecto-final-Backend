//Cliente
const socket = io();



// Escuchar evento para renderizar usuarios
socket.on("users", (users) => {
    const userList = document.getElementById("users-list");
    userList.innerHTML = "";

    users.forEach((user) => {
        // Crear la tarjeta del usuario
        const userItem = document.createElement("div");
        //userItem.classList.add("col-xl-4", "col-md-4", "col-sm-6", "mb-4");

        userItem.innerHTML = `
              <div class="card mb-4">
                    <div class="card-body">
                        <h4 class="card-title d-flex justify-content-between align-items-center">
                            Nombre: ${user.first_name} ${user.last_name}
                            <button class="btnDeleteUser" data-id="${user._id}">Eliminar Usuario</button>
                        </h4>
                        <h5 class="card-subtitle mb-2">
                            Email: ${user.email}
                        </h5>
                        <h5 class="card-subtitle mb-2 d-flex justify-content-between align-items-center">
                            Rol: ${user.role}
                            <button class="btnChangeRole" data-id="${user._id}">Cambiar Rol</button>
                        </h5>
                    </div>
                </div>
        `;

        userList.appendChild(userItem);

        // Agregar evento al botón de eliminar usuario
        const buttons = userItem.querySelectorAll(".btnDeleteUser");
        buttons.forEach((button) => {
            button.addEventListener("click", () => {
                const uid = button.getAttribute("data-id");
                deleteUser(uid);
            });
        });

        // Agregar evento al botón de cambiar rol
        const buttons2 = userItem.querySelectorAll(".btnChangeRole");
        buttons2.forEach((button) => {
            button.addEventListener("click", () => {
                const uid = button.getAttribute("data-id");
                changeRole(uid);
            });
        });
    });
});

// Evento para eliminar usuario
 async function deleteUser(uid) {
    socket.emit("deleteUser", uid);
}

// Evento para cambiar rol
async function changeRole(uid) {
    socket.emit("changeRole", uid);
}

