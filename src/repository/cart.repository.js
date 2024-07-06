//Repository: Se conecta con la bdd, con la persistencia de la información
const CartsModel = require("../models/carts.model");
const ProductsModel = require("../models/products.model");

class CartRepository {

    //Agregar carrito
    async addCart(newCartData) {
        try {
            const newCart = await CartsModel.create(newCartData);
            console.log("Carrito creado exitosamente");
            return newCart;
        } catch (error) {
            console.error("Error al crear nuevo carrito:", error);
        }
    }

    //Obtener todos los carritos
    async getCarts() {
        try {
            const carts = await CartsModel.find();
            console.log("Carritos encontrados:", carts);
            return carts;
        } catch (error) {
            console.error("Error al obtener los carritos:", error);
        }
    }

    //Obtener carrito por id
    async getCartById(id) {
        try {
            const cart = await CartsModel.findById(id);
            if (!cart) {
                console.log(`Carrito con ID "${id}" no encontrado`);
                return null;
            } else {
                return cart;
            }
        } catch (error) {
            console.error("Error al encontrar carrito por ID:", error);
        }
    }

    //Actualizar producto y cantidad de un carrito
    async updateCart(cartId, updatedProducts) {
        try {
            const cart = await CartsModel.findById(cartId);
            if (!cart) {
                throw new Error("Carrito no encontrado");
            }
            cart.products = updatedProducts;
            await cart.save();
            return cart;
        } catch (error) {
            console.error("Error al actualizar carrito:", error);
            throw error;
        }
    }

    //Vaciar carrito
    async emptyCart(cartId) {
        try {
            const emptyCart = await CartsModel.findByIdAndUpdate(cartId, { products: [] }, { new: true });
            if (!emptyCart) {
                console.log("Carrito no encontrado");
            }
            console.log("Carrito vaciado correctamente");
            return emptyCart;
        } catch (error) {
            console.error("Error al vaciar el carrito:", error);
            throw error;
        }
    }

    //Actualizar solamente la cantidad del prodcuto en el  carrito
    async updateQuantity(cartId, productId, quantity) {
        try {
            const cart = await CartsModel.findById(cartId);
            if (!cart) {
                console.log("Carrito no encontrado");
            }
            const productIndex = cart.products.findIndex(product => product.product._id.toString() === productId);
            if (productIndex !== -1) {
                cart.products[productIndex].quantity = quantity;
                await cart.save();
                return cart;
            } else {
                console.log("Producto no encontrado en el carrito")
            }
        } catch (error) {
            console.error("Error al modificar cantidades:", error);
            throw error;
        }
    }


    //Agg producto al carrito
    async addProductToCart(cid, pid, quantity) {
        try {
            // Validamos entradas
            if (!cid || !pid || !quantity || quantity <= 0) {
                throw new Error("Parámetros inválidos. Se requiere un CID, PID y cantidad mayor que cero.");
            }
    
            const foundCart = await CartsModel.findById(cid);
            const foundProduct = await ProductsModel.findById(pid);
    
            if (!foundCart) {
                throw new Error("Carrito no encontrado");
            }
            
            if (!foundProduct) {
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
    
            console.log(foundCart);
            console.log("Producto agregado al carrito con éxito");
    
            return { message: "Producto agregado al carrito con éxito", cart: foundCart };
        } catch (error) {
            console.error("Error al agregar producto al carrito:", error);
            throw new Error("Error al agregar producto al carrito: " + error.message);
        }
    }
}

module.exports = CartRepository;