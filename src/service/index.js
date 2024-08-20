//Service: Conexión entre controlador y persistencia. Recibe el repositorio, crear instancia como services y se lo manda al controlador. Instancia del repositorio. Trae la info de la bdd

const CartRepository = require("../repository/cart.repository.js");
const ProductRepository = require("../repository/product.repository.js");


const cartService = new CartRepository();
const productService = new ProductRepository();

module.exports = { cartService, productService };