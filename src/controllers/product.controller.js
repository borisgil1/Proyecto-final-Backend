//Controller: Operaciones del producto. El controlador se conecta con el service. Gestiona las peticiones del cliente y las respuestas, toma información, datos del body...

const { productService } = require("../service/index");
//Errores
const CustomError = require("../service/errors/custom-error");
const { generateProductError } = require("../service/errors/info");
const EErrors = require("http-errors");
const { addLogger } = require("../utils/logger.js");
const UserModel = require("../models/user.model.js");


class productController {
    //Mostrar todos los productos
        async getProducts(req, res) {
        try {
            const products = await productService.getProducts();
            return res.send({messege: "Productos recuperados exitosamente", products});
        } catch (error) {
            req.logger.error("Error al mostrar productos", error);
            return res.status(500).send("Error al mostrar productos");
        }
    };


    async getProductById(req, res) {
        let id = req.params.id;
        try {
            const product = await productService.getProductById(id);
            if (product) {
                return res.status(201).send({ message: "Producto encontrado exitosamente", product });
            } else {
                return res.send("Producto no encontrado");
            }
        } catch (error) {
            req.logger.error("Error al encontrar el producto", error);
            return res.status(500).send("Error al encontrar el producto");
        }
    };


    async addProduct(req, res, next) {
        const newProduct = req.body;
    
        try {
            // Middleware Error
            if (!newProduct.title || !newProduct.description || !newProduct.price || !newProduct.img || !newProduct.code || !newProduct.stock || !newProduct.category || !newProduct.thumbnails) {
                throw CustomError.createError({
                    name: "Nuevo Producto",
                    cause: generateProductError(newProduct),
                    message: "Error al intentar agregar producto",
                    code: EErrors.TIPO_INVALIDO
                });
            }
    
            const product = await productService.addProduct(newProduct);
            req.logger.info("El nuevo producto ha sido agregado exitosamente", product);
            res.json({ message: "El producto ha sido agregado", product: product });
        } catch (error) {
            req.logger.error("Error al agregar nuevo producto", error);
            next(error);
        }
    }


    async updateProduct(req, res) {
        const { id } = req.params;
        const { title, description, price, img, code, stock, category } = req.body;
        try {
            const productUpdated = await productService.updateProduct(id, { title, description, price, img, code, stock, category });
            if (!productUpdated) {
                return res.status(500).send({ message: "Producto no encontrado" });
            }
            return res.status(200).send({ message: "Producto actualizado", product: productUpdated });
        } catch (error) {
            req.logger.error("Error al actualizar producto:", error);
            return res.status(500).send("Error al actualizar producto");
        }
    }


    async deleteProduct(req, res) {
        const id = req.params.pid;
        const userRole = req.user.role;
   
        try {
            //Busca el producto por su ID
            const productToDelete = await productService.deleteProduct(id);
            if (!productToDelete) {
                return res.status(404).send({ message: "Producto no encontrado" });
            }

            //Verificamos el rol del usuario
            if (userRole === "premium") {
            //Si es premium validamos que el usuario sea el propietario del producto
                if (productToDelete.owner !== req.user.email) {
                    req.logger.warn("El usuario no es el propietario del producto");
                    return res.status(403).send({ message: "No eres el propietario del producto" });
                }

            } else if (userRole !== "admin") {
                //Si es usuario no es admin ni premium denegamos el acceso
                req.logger.warn("Acceso denegado, no eres admin ni premium");
                return res.status(403).send({ message: "No tienes permiso para eliminar este producto" });
            }

            //Eliminamos el producto
            await productService.deleteProduct(id);
            req.logger.info("El producto ha sido eliminado exitosamente", productToDelete);
            return res.status(200).send({ message: "Producto eliminado correctamente", product: productToDelete });

        } catch (error) {
            req.logger.error("Error al eliminar el producto:", error);
            return res.status(500).send("Error al eliminar el producto");
        }
    }
}


module.exports = productController;