//Controlador de vista
const CartRepository = require("../repository/cart.repository.js");
const ProductsModel = require("../models/products.model.js");
const cartRepository = new CartRepository();
const UserDTO = require("../dto/user.dto.js");
const { addLogger } = require("../utils/logger.js");


//Vista productos
class viewsController {
    async renderProducts(req, res) {
        const page = parseInt(req.query.page) || 1;
        const limit = 9;
        try {
            const products = await ProductsModel.paginate({}, { limit, page });
            const final = products.docs.map(products => {
                const { _id, ...rest } = products.toObject();
                return { _id, ...rest };
            })

            //Verifico si req.user estpa definido 
            //Paso el user DTO a la vista
            //const userDto = new UserDTO(req.user.first_name, req.user.last_name, req.user.role, req.user.cart, req.user.age);
            const userDto = req.user 
            ? new UserDTO(req.user.first_name, req.user.last_name, req.user.role, req.user.cart ? req.user.cart.toString() : '', req.user.age)
            : null;

            res.render("products", {
                products: final,
                hasPrevPage: products.hasPrevPage,
                hasNextPage: products.hasNextPage,
                prevPage: products.prevPage,
                nextPage: products.nextPage,
                currentPage: products.page,
                totalPages: products.totalPages,
                user: userDto,
            });

        } catch (error) {
            req.logger.error("Error interno del servidor", error)
            res.status(500).json({ error: "Error interno del servidor" + error });
        }
    };

    //Vista cart, muestra los productos que tiene cada carrito
    async renderCart(req, res) {
        let cid = req.params.cid;
        try {
            const cart = await cartRepository.getCartById(cid);
            
            if (cart) {

                // Calcular el precio total del carrito
                let totalPrice = 0;
                cart.products.forEach(item => {
                    totalPrice += item.product.price * item.quantity;
                });
                totalPrice = parseFloat(totalPrice.toFixed(2)); // Redondear a dos decimales

                // Renderizar la vista de carrito con los datos del carrito
                const productsInCar = cart.products.map(item => ({
                    //Lo convertimos a objeto para pasar las restricciones de Exp Handlebars. 
                    product: item.product.toObject(),
                    quantity: item.quantity,
                    productId: item.product._id,
                }));

                const userDto = new UserDTO(req.user.first_name, req.user.last_name, req.user.email);
                //Guardo en variable el cartId y el correo del usuario
                const cartId = req.user.cart.toString();
                const email = req.user.email;

                res.render("carts", { products: productsInCar, totalPrice, email, user: userDto, cartId });

            } else {
                req.logger.error("Carrito no encontrado");
                return res.status(404).send("Carrito no encontrado")
            }
        } catch (error) {
            req.logger.error("Error al mostrar carrito", error);
            return res.status(500).send("Error al mostrar carrito");
        }
    };

    async login(req, res) {
        res.render("login");
    }

    async chat(req, res) {
        res.render("chat");
    };

    async register(req, res) {
        res.render("register");
    }

    async home(req, res) {
        res.render("home");
    };

    async admin(req, res) {
        // Verificar si no hay usuario en la sesión o si el rol del usuario no es "admin"
        if (!req.session.user || req.session.user.role !== "admin") {
            req.logger.warning("Acceso denegado, no eres admin");
            return res.status(403).send("Acceso denegado, no eres admin");
        }
        res.render("admin");
    };

    async realTime(req, res) {
        const userDto = new UserDTO(req.user.first_name, req.user.last_name, req.user.role, req.user.cart, req.user.age, req.user.email);
        res.render("realTimeProducts", { user: userDto});
    };

    async reset(req, res) {
        res.render("reset");
    };

    async contact(req, res) {
        res.render("contact");
    };

    async resetPassword(req, res) {
        res.render("reset-password");
    }

    async changepassword(req, res) {
        res.render("change-password");
    };

    async confirmation(req, res) {
        res.render("confirmation");
    };

    async cartError(req, res) {
        res.render("cart-error");
    };

    async current (req, res) {
        const userDto = new UserDTO(req.user.first_name, req.user.last_name, req.user.role, req.user.cart, req.user.age, req.user.email);
        const isAdmin = req.user.role === 'admin';
        res.send(("profile", { user: userDto, isAdmin }));
    };

    async profile(req, res) {
        //Valido si hay usuario autenticado
        if (!req.user) {
            const isAdmin = false;
            return res.render("profile", { user: null, isAdmin });
        }
        //Si hay usuario autenticado creo el DTO con los datos del usaurio : 
        const userDto = new UserDTO(req.user.first_name, req.user.last_name, req.user.role, req.user.cart, req.user.age);
        const isUser = req.user.role === 'usuario';
        const isAdmin = req.user.role === 'admin';
        const isPremium = req.user.role === 'premium';
        res.render("profile", { user: userDto, isAdmin, isPremium, isUser });
    }

    async purchase(req, res) {
        const { codigo, comprador, fecha, total } = req.query;

        res.render("purchase", {
            codigo,
            comprador,
            fecha,
            total
        });
    };
}

module.exports = viewsController;