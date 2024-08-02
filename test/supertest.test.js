//Testing con supertest
//Mocha, dependecia para testing
//SuperTest: Librería que permite ejecutar peticiones http:
const supertest = require("supertest");
const mongoose = require("mongoose");
//Assert = modulo nativo de node que permite hacer validaciones
const assert = require("assert");

//Conectamos a la base de datos de pruebas
before(async function () {
    await mongoose.connect("mongodb+srv://coderhouse:coderhouse@cluster0.2zgtivj.mongodb.net/production?retryWrites=true&w=majority&appName=Cluster0", {
    });
});

//Constante requester, se encarga de hacer las peticiones al servidor
const requester = supertest("http://localhost:3000");


describe("Testing E-commerce", () => {
    //Testing de productos
    describe("Testing de products, users y carts: ", () => {

        // Limpiamos las colecciones antes de cada prueba
        beforeEach(async () => {
            await mongoose.connection.dropDatabase();
        });

        it("Endpoint POST /api/products debe crear un producto correctamente.", async () => {

            //Se crea un producto de prueba
            const newProductTesting = {
                title: "Producto de prueba",
                description: "Este es un producto de prueba Supertest",
                price: 1000,
                img: "imagen_de_prueba.jpg",
                code: 1234,
                stock: 100,
                category: "categoría de prueba",
                status: true,
                thumbnails: ["thumbnail_de_prueba.jpg"]
            }

            //Se envia el producto
            const response = await requester.post("/api/products").send(newProductTesting);

            //Se valida si el retorno (lo que viene en el body) tiene una propiedad _id
            assert.ok(response.body.product._id, "El producto no tiene la propiedad `_id`.");
        })

        //Testing de usuarios
        it("Si se crea un usuario sin el campo password, el módulo debe responder con un status 400", async () => {
            const newUserTesting = {
                first_name: "RobertoTesting",
                last_name: "Gil",
                email: "roberto@resting.com",
                age: 20,
                role: "user",
                cart: [],
            }

            const { statusCode } = await requester.post("/api/users/register").send(newUserTesting);

            //Se valida si el codigo de estado es 400
            assert.equal(statusCode, 400, "El status code no es 400");
        })

        //Testing de carritos
        it("Endpoint POST /api/carts debe crear un carrito (Array vacío) correctamente.", async () => {
            const response = await requester.post("/api/carts");

            //Se valida si el carrito es un array
            assert.ok(Array.isArray(response.body.products), "El carrito no es un array.");
        });

    })

    //Test 2: Registro de usuarios

    describe("Test avanzado: ", () => {

        //Variable global de la cookie
        let cookie;

        it("Debe registrase correctamente un usuario.", async () => {

            //Se crea un usuario de prueba
            const testingUser = {
                first_name: "Testing",
                last_name: "Gil",
                email: "testing@testing.com",
                password: "1234",
                age: 20,
                role: "user",
                cart: [],
            }

            //Registro del usuario
            const response = await requester.post("/api/users/register").send(testingUser);

            //Validacion del registro mediando la redireccion, code 302
            assert.equal(response.status, 302, "El registro no redirige correctamente");
        })


        it("El usuario debe loguearse correctamente y recuperar la cookie", async () => {

            //Usuario de prueba y contraseña
            const login = {
                email: "testing@testing.com",
                password: "1234",
            }

            //Se loguea el usuario
            const result = await requester.post("/api/users/login").send(login);

            //Se guarda la cookie de los headers
            const cookieResult = result.headers["set-cookie"][0];

            //Validación de la existencia de la cookie
            assert.ok(cookieResult, "La cookie no existe.");

            //Se separa el nombre y valor de la cookie y se guarda en la variable global
            cookie = {
                name: cookieResult.split("=")[0],
                value: cookieResult.split("=")[1]
            }

            //Validacion de los datos recuperados
            assert.equal(cookie.name, "coderCookieToken");
            //Validacion de que tenga un value asociado
            assert.ok(cookie.value, "La cookie no tiene un valor.");
        })

        //Prueba de la ruta current
        it("Debe ingresar a la ruta current y se debe enviar la cookie con el usuario", async () => {

            //Ingreso ruta current con la cookie
            const response = await requester.get("/current").set("Cookie", [`${cookie.name}=${cookie.value}`]);

            //Validacion del correo del usuario
            assert.equal(response.body.user.email, "testing@testing.com");
        })
    })

    //Desconexión de la BD
    after(async () => {
        await mongoose.disconnect();
    })

});