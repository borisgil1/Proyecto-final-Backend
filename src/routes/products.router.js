const express = require("express");
const router = express.Router();
const ProductController = require("../controllers/product.controller.js");
const productController = new ProductController();
const { passportCall } = require("../utils/util.js");

//Mostar productos - limite
router.get("/", productController.getProducts);

//Mostrar productos por ID
router.get("/:id", productController.getProductById);

//Agregar productos - Autenticada
router.get("/", passportCall("jwt", { session: false }), productController.addProduct);

//Actualizar productos
router.put("/:id", productController.updateProduct)

//Eliminar productos
router.delete("/:pid", passportCall("jwt", { session: false }), productController.deleteProduct)

module.exports = router;