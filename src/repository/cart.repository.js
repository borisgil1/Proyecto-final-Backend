//Repository: Se conecta con la bdd, con la persistencia de la información
const CartsModel = require("../models/carts.model");
const ProductsModel = require("../models/products.model");
const { logger } = require("../utils/logger.js");

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
            logger.info(`Carritos encontrados: ${JSON.stringify(carts, null, 2)}`);
            return carts;
        } catch (error) {
            logger.error("Error al obtener los carritos:", error);
        }
    }

    async getCartById(id) {
        try {
            const cart = await CartsModel.findById(id);
            if (!cart) {
                logger.warning(`Carrito con ID "${id}" no encontrado`);
                return null;
            } else {
                logger.info(`Carrito encontrado exitosamente: ${JSON.stringify(cart, null, 2)}`);
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
                logger.warning(`Carrito con ID "${cartId}" no encontrado`);
                throw new Error("Carrito no encontrado");
            }
            cart.products = updatedProducts;
            await cart.save();
            logger.info(`Carrito actualizado correctamente: ${JSON.stringify(cart, null, 2)}`);
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
                logger.warning("Carrito no encontrado");
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
                logger.warning("Carrito no encontrado");
            }
            const productIndex = cart.products.findIndex(product => product.product._id.toString() === productId);
            if (productIndex !== -1) {
                cart.products[productIndex].quantity = quantity;
                await cart.save();
                logger.info("Cantidad del producto actualizada", { cartId, productId, quantity });
                return cart;
            } else {
                logger.warning("Producto no encontrado en el carrito")
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
                logger.warning("Parámetros inválidos. Se requiere un CID, PID y cantidad mayor que cero.", { cid, pid, quantity });
                throw new Error("Parámetros inválidos. Se requiere un CID, PID y cantidad mayor que cero.");
            }
            const foundCart = await CartsModel.findById(cid);
            const foundProduct = await ProductsModel.findById(pid);

            if (!foundCart) {
                logger.warning("Carrito no encontrado", { cid });
                throw new Error("Carrito no encontrado");
            }
            if (!foundProduct) {
                logger.warning("Producto no encontrado", { pid });
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


  
    async deleteProductFromCart(cartId, productId) {
        try {
            const cart = await CartsModel.findById(cartId);
            if (!cart) {
                logger.warning(`Carrito con ID "${cartId}" no encontrado`);
                throw new Error(`Carrito con ID "${cartId}" no encontrado`);
            }
            // Verificar si el carrito contiene el producto
            const productIndex = cart.products.findIndex(p => p.product.toString() === productId);
            if (productIndex === -1) {
                logger.warning(`Producto con ID "${productId}" no encontrado en el carrito`);
                throw new Error(`Producto con ID "${productId}" no encontrado en el carrito`);
            }

            // Eliminar el producto del carrito
            cart.products.splice(productIndex, 1);
            await cart.save();
            logger.info(`Producto con ID "${productId}" eliminado del carrito con ID "${cartId}"`);
            return cart;
        } catch (error) {
            logger.error("Error al eliminar el producto del carrito", error);
            throw new Error("Error al eliminar el producto del carrito");
        }
    }
}

module.exports = CartRepository;