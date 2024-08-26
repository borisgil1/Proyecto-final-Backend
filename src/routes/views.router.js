//Rutas para renderizar las vistas: Views, profile... 

const express = require("express");
const router = express.Router();
const ViewsController = require("../controllers/views.controller.js");
const viewsController = new ViewsController
const { passportCall } = require("../utils/util.js");
const { authorization } = require("../utils/util.js");
const { authorization2 } = require("../utils/util.js");
const { profileAuth } = require("../utils/util.js");

//vista products, muestra todos los productos
router.get("/products", passportCall("jwt"), authorization2("admin"), viewsController.renderProducts);

//vista cart, muestra los productos que tiene cada carrito
router.get("/carts/:cid", passportCall("jwt", { session: false }), viewsController.renderCart);

//Vista raiz app, productos
router.get("/", viewsController.home);

//Vista chat
router.get("/chat", passportCall("jwt"), authorization2("admin"), viewsController.chat);

//Vista login
router.get("/login", viewsController.login);

//Vista register
router.get("/register", viewsController.register);

//Vista home
router.get("/home", viewsController.home);

//Vista admin
router.get("/admin", viewsController.admin);

//Vista realtimeproducts, tienen acceso admin y premium
router.get("/realtimeproducts", passportCall("jwt"), authorization("admin", "premium"), viewsController.realTime);

//Vista contact
router.get("/contact", viewsController.contact);

//Vista profile
router.get("/profile", profileAuth("jwt", { session: false }), viewsController.profile);

//Vista purchase
router.get("/purchase", viewsController.purchase);

//Vista resetpassword
router.get("/reset-password", viewsController.resetPassword);

//Vista changepassword
router.get("/change-password", viewsController.changepassword);

//Vista confirmation
router.get("/confirmation", viewsController.confirmation);

//Carrito si no está logeado
router.get("/carts", viewsController.cartError);

//A esta ruta hay ponerle un DTO para que solo mande nombre, apellido y rol
router.get("/current", passportCall("jwt"), viewsController.current);

//Gestion de usuarios, solo admin
router.get("/users", passportCall("jwt"), authorization("admin"), viewsController.usersView);

module.exports = router;