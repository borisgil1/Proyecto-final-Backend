//Repository: Se conecta con la bdd, con la persistencia de la información
const CartsModel = require("../models/carts.model");
const ProductsModel = require("../models/products.model");
const {logger} = require("../utils/logger.js");

class CartRepository {
    async addCart(newCartData) {
        try {
            const newCart = await CartsModel.create(newCartData);
            logger.info("Carrito creado exitosamente");
            return newCart;
        } catch (error) {
            logger.error("Error al crear nuevo carrito:", error);
        }
    }

    async getCarts() {
        try {
            const carts = await CartsModel.find();
            logger.info("Carritos encontrados:", carts);
            return carts;
        } catch (error) {
            logger.error("Error al obtener los carritos:", error);
        }
    }

    async getCartById(id) {
        try {
            const cart = await CartsModel.findById(id);
            if (!cart) {
                logger.warn(`Carrito con ID "${id}" no encontrado`);
                return null;
            } else {
                return cart;
            }
        } catch (error) {
                logger.error("Error al encontrar carrito por ID:", error);
        }
    }

    //Actualizar producto y cantidad del producto de un carrito
    async updateCart(cartId, updatedProducts) {
        try {
            const cart = await CartsModel.findById(cartId);
            if (!cart) {
                logger.warn(`Carrito con ID "${cartId}" no encontrado`);
                throw new Error("Carrito no encontrado");
            }
            cart.products = updatedProducts;
            await cart.save();
            logger.info("Carrito actualizado correctamente", cart);
            return cart;
        } catch (error) {
            logger.error("Error al actualizar carrito:", error);
            throw error;
        }
    }

    async emptyCart(cartId) {
        try {
            const emptyCart = await CartsModel.findByIdAndUpdate(cartId, { products: [] }, { new: true });
            if (!emptyCart) {
                logger.warn("Carrito no encontrado");
            }
            logger.info("Carrito vaciado correctamente");
            return emptyCart;
        } catch (error) {
            logger.error("Error al vaciar el carrito:", error);
            throw error;
        }
    }

    //Actualizar solamente la cantidad del prodcuto en el  carrito
    async updateQuantity(cartId, productId, quantity) {
        try {
            const cart = await CartsModel.findById(cartId);
            if (!cart) {
                logger.warn("Carrito no encontrado");
            }
            const productIndex = cart.products.findIndex(product => product.product._id.toString() === productId);
            if (productIndex !== -1) {
                cart.products[productIndex].quantity = quantity;
                await cart.save();
                logger.info("Cantidad de producto actualizada", { cartId, productId, quantity });
                return cart;
            } else {
                logger.warn("Producto no encontrado en el carrito")
            }
        } catch (error) {
            logger.error("Error al modificar cantidades:", error);
            throw error;
        }
    }

    //Agg producto al carrito
    async addProductToCart(cid, pid, quantity) {
        try {
            // Validamos entradas
            if (!cid || !pid || !quantity || quantity <= 0) {
                logger.warn("Parámetros inválidos. Se requiere un CID, PID y cantidad mayor que cero.", { cid, pid, quantity });
                throw new Error("Parámetros inválidos. Se requiere un CID, PID y cantidad mayor que cero.");
            }
            const foundCart = await CartsModel.findById(cid);
            const foundProduct = await ProductsModel.findById(pid);

            if (!foundCart) {
                logger.warn("Carrito no encontrado", { cid });
                throw new Error("Carrito no encontrado");
            }
            if (!foundProduct) {
                logger.warn("Producto no encontrado", { pid });
                throw new Error("Producto no encontrado");
            }

            // Validamos si el producto está en el carrito
            const existingProductIndex = foundCart.products.findIndex(
                product => product.product._id.toString() === pid
            );

            if (existingProductIndex !== -1) {
                foundCart.products[existingProductIndex].quantity += quantity;
            } else {
                foundCart.products.push({
                    product: foundProduct,
                    quantity: quantity,
                });
            }

            await foundCart.save();

            logger.info(`Producto "${foundProduct.title}" agregado al carrito con éxito`);
            return { message: "Producto agregado al carrito con éxito", cart: foundCart };

        } catch (error) {
            logger.error("Error al agregar producto al carrito:", error);
            throw new Error("Error al agregar producto al carrito: " + error.message);
        }
    }
}

module.exports = CartRepository;