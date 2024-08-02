//Controller: Operaciones del negocio. El controlador se conecta con el service. Gestiona las peticiones del cliente y las respuestas, toma parametros, datos del body...

const TicketModel = require("../models/ticket.js");
const { cartService } = require("../service/index.js")
const { productService } = require("../service/index.js");
const { addLogger } = require("../utils/logger.js");
const UserModel = require("../models/user.model.js");

class cartController {

    //Crear carrito
    async createCart(req, res) {
        try {
            const newCart = {
                products: []
            };
            await cartService.addCart(newCart);
            return res.status(201).json(newCart);
        } catch (error) {
            req.logger.error("Error al crear nuevo carrito", error);
            return res.status(500).send("Error al crear nuevo carrito");
        }
    };

    //Mostrar todos los carritos
    async getCarts(req, res) {
        try {
            const carts = await cartService.getCarts();
            return res.status(200).json({ message: "Carritos encontrados", carts });
        } catch (error) {
            req.logger.error("Error al mostrar carritos", error);
            return res.status(500).json({ message: "Error al mostrar carritos" });
        }
    };

    //Mostrar carrito por ID
    async getCartById(req, res) {
        let cid = req.params.cid;
        try {
            const cart = await cartService.getCartById(cid);
            if (cart) {
                return res.status(200).json({ message: "Carrito encontrado", cart }); // Enviar carrito junto con mensaje
            } else {
                return res.status(404).send("Carrito no encontrado")
            }
        } catch (error) {
            req.logger.error("Error al mostrar carrito", error);
            return res.status(500).send("Error al mostrar carrito");
        }
    };

    //Agregar producto a carrito
    async addProductToCart(req, res) {
        const cid = req.params.cid;
        const pid = req.params.pid;
        const quantity = req.body.quantity || 1;

        // Verificamos si hay un carrito en la petición
        if (!cid) {
            req.logger.info("Debes estar logeado para agregar productos al carrito");
            return res.status(400).render("products", { errors: { auth: "Debes estar logeado para agregar productos al carrito" } });
        }

        try {
            //Capturamos el usuario y el producto
            const user = await UserModel.findOne({ cart: cid }).exec();
            const product = await productService.getProductById(pid);

            // Verificamos si el usuario está tratando de agregar su propio producto
            if (user.email === product.owner) {
                req.logger.info("No puedes agregar tus propios productos al carrito");
                return res.status(400).render("products", { errors: { auth: "No puedes agregar tus propios productos al carrito" } });
            }

            // Agregamos el producto al carrito
            const cartUpdated = await cartService.addProductToCart(cid, pid, quantity)
            return res.status(200).json({ message: "Producto agregado al carrito con éxito", cart: cartUpdated });
        } catch (error) {
            req.logger.error("Error al agregar producto al carrito:", error);
            return res.status(500).send("Error al agregar producto al carrito:");
        }
    };

    //Eliminar producto de carrito
    async deleteProductFromCart(req, res) {
        const cid = req.params.cid;
        const pid = req.params.pid;
        try {
            const cartUpdated = await cartService.deleteProductFromCart(cid, pid);
            if (!cartUpdated) {
                return res.status(404).send({ message: "Carrito no encontrado" });
            }
            return res.status(200).send({ message: "Producto eliminado del carrito", cart: cartUpdated });
        } catch (error) {
            req.logger.error("Error al eliminar producto del carrito:", error);
            return res.status(500).send("Error al eliminar producto del carrito");
        }
    }

    //Actualizar producto y la cantidad de los productos en el carrito
    async updateCartProducts(req, res) {
        const cid = req.params.id;
        const { product, quantity } = req.body;
        try {
            const cartUpdated = await cartService.updateCart(cid, { product, quantity });
            if (!cartUpdated) {
                return res.status(404).send({ message: "Carrito no encontrado" });
            }
            return res.status(200).send({ message: "Carrito modificado", cart: cartUpdated });
        } catch (error) {
            req.logger.error("Error al modificar el carrito:", error);
            return res.status(500).send("Error al modificar el carrito");
        }
    }

    //Actualizar solo la cantidad de productos del carrito
    async updateQuantity(req, res) {
        const cid = req.params.cid;
        const pid = req.params.pid;
        const quantity = req.body.quantity;
        try {
            const cartUpdated = await cartService.updateQuantity(cid, pid, quantity);
            return res.status(200).send({ message: "Cantidad del producto actualizada", cart: cartUpdated });
        } catch (error) {
            req.logger.error("Error al modificar el carrito:", error);
            return res.status(500).send("Error al modificar el carrito");
        }
    }

    //Vaciar carrito
    async emptyCart(req, res) {
        const id = req.params.cid;
        try {
            const updatedCart = await cartService.emptyCart(id);
            if (!updatedCart) {
                return res.status(404).send({ message: "Carrito no encontrado" });
            }
            return res.status(200).send({ message: "Todos los productos del carrito han sido eliminados", cart: updatedCart });
        } catch (error) {
            req.logger.error("Error al vaciar el carrito:", error);
            return res.status(500).send("Error al vaciar el carrito");
        }
    };


    // Finalizar compra
    async purchase(req, res) {
        const cid = req.params.cid;
        const { email } = req.body;

        // Array de productos con stock
        const productsInStock = [];

        // Array de productos sin stock
        const outOfStockProducts = [];

        try {
            // Obtenemos el carrito por su id
            const cart = await cartService.getCartById(cid);
            if (!cart) {
                req.logger.error("Carrito no encontrado");
                return res.status(404).send({ message: "Carrito no encontrado" });
            }

            // Verificamos el stock de productos y actualizamos los arrays
            for (const item of cart.products) {
                const pid = item.product._id; // Capturo el id de cada producto
                const quantity = item.quantity; // Capturo cantidad de los productos en el carrito
                const product = await productService.getProductById(pid); // Busco el producto del carrito en la bdd

                if (product.stock < quantity) {
                    // Si no tienen suficiente stock los agregamos a outOfStockProducts
                    outOfStockProducts.push({
                        Producto: item.product.title,
                        Precio: item.product.price,
                    });

                } else {
                    // Si tienen stock los agregamos a productsInStock
                    productsInStock.push({ product, quantity });
                }
            }

            // Si hay productos con suficiente stock, los actualizamos en la bdd
            for (const item of productsInStock) {
                const pid = item.product._id; // Capturo el id de cada producto
                const quantity = item.quantity; // Capturo cantidad de productos en el carrito
                const updatedProduct = await productService.updateProduct(pid, { $inc: { stock: -quantity } });

                if (!updatedProduct) {
                    req.logger.error(`Error al actualizar el stock del producto con ID ${pid}`);
                    return res.status(404).send({ message: `Producto con ID ${pid} no encontrado` });
                }
            }

            ///Creamos el array de productos comprados
            const purchasedProducts = [];

            let totalAmount = 0;
            // Calculamos el total de la compra
            if (productsInStock.length > 0) {
                totalAmount = productsInStock.reduce((acc, item) => {
                    const productInCart = cart.products.find(p => p.product._id.toString() === item.product._id.toString());
                    if (!productInCart || !productInCart.product || !productInCart.product.price) {
                        req.logger.error("Producto en carrito sin precio:", productInCart);
                        return acc;
                    }

                    // Agregar productos comprados a purchasedProducts
                    purchasedProducts.push({
                        Producto: item.product.title,
                        //PRecio: productInCart.product.title, // Acceso correcto al nombre del producto
                        Precio: productInCart.product.price,
                        Cantidad: item.quantity
                    });

                    return acc + (productInCart.product.price * item.quantity);
                }, 0);

                // Creo el ticket si hay productos comprables
                const newTicket = new TicketModel({
                    code: generateRandomCode(),
                    purchase_datetime: Date.now(),
                    amount: totalAmount,
                    purchaser: email
                });

                // Guardamos el ticket
                await newTicket.save();

                // Vaciamos el carrito
                const emptyCart = await cartService.emptyCart(cid);

                if (!emptyCart) {
                    req.logger.error("Error al vaciar el carrito");
                    return res.status(404).send({ message: "Carrito no encontrado" });
                }


                // Enviamos respuesta con el ticket, productos comprados y los productos sin stock  
                req.logger.info({
                    message: "La compra ha sido finalizada",
                    Codigo: newTicket.code,
                    Comprador: newTicket.purchaser,
                    Fecha: newTicket.purchase_datetime,
                    Total_de_la_compra: newTicket.amount,
                    Productos_comprados: purchasedProducts, // Productos comprados
                    Productos_sin_Stock: outOfStockProducts.length > 0 ? outOfStockProducts : null // Productos sin stock
                });

                return res.redirect(`/purchase?codigo=${newTicket.code}&comprador=${newTicket.purchaser}&fecha=${newTicket.purchase_datetime}&total=${newTicket.amount}&productos_comprados=${encodeURIComponent(JSON.stringify(purchasedProducts))}&productos_sin_stock=${encodeURIComponent(JSON.stringify(outOfStockProducts))}`);

            } else {
                req.logger.info("No hay productos en el carrito");
                return res.status(400).json({ message: "No se pueden comprar los productos seleccionados", ProductosSinStock: outOfStockProducts });
            }

        } catch (error) {
            req.logger.error("Error al procesar la compra:", error);
            return res.status(500).send("Error al procesar la compra: " + error);
        }

        function generateRandomCode() {
            const length = 6; // Especifica la longitud del código aleatorio
            const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'; // Caracteres a usar en el código
            let code = '';
            for (let i = 0; i < length; i++) {
                const randomIndex = Math.floor(Math.random() * charset.length);
                code += charset[randomIndex];
            }
            return code;
        }
    }
}

module.exports = cartController;