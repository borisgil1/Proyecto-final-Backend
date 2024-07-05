//Controller: Operaciones del producto. El controlador se conecta con el service. Gestiona las peticiones del cliente y las respuestas, toma información, datos del body...

const { productService } = require("../service/index");
//Errores
const CustomError = require("../service/errors/custom-error");
const { generateProductError } = require("../service/errors/info");
const EErrors = require("http-errors");


class productController {

    //Mostar productos
    async getProducts(req, res) {
        try {
            const products = await productService.getProducts();
            return res.send(products);
        } catch (error) {
            console.error("Error al mostrar productos", error);
            return res.status(500).send("Error al mostrar productos");
        }
    };

    //Mostrar productos por ID
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
            return res.status(500).send("Error al encontrar el producto");
        }
    };


    //Agregar productos
    async addProduct(req, res, next) {
        const newProduct = req.body;
        try {

            //Middleware Error
            if (!newProduct.title || !newProduct.description || !newProduct.price || !newProduct.img || !newProduct.code || !newProduct.stock || !newProduct.category || !newProduct.thumbnails) {
                throw CustomError.createError({
                    name: "Nuevo Producto",
                    cause: generateProductError(newProduct),
                    message: "Error al intentar agregar producto",
                    code: EErrors.TIPO_INVALIDO
                });
            }

            const product = await productService.addProduct(newProduct);
            res.json({ message: "El producto ha sido agregado", product: product });
        } catch (error) {
            next(error);
        }
    }


    //Actualizar productos
    async updateProduct(req, res) {
        const { id } = req.params;
        const { title, description, price, img, code, stock, category } = req.body;
        try {
            const productUpdated = await productService.updateProduct(id, { title, description, price, img, code, stock, category });
            if (!productUpdated) {
                return res.status(500).send({ message: "Error al modificar producto" });
            }
            console.log("Producto modificado:", productUpdated);
            return res.status(200).send({ message: "Producto modificado", product: productUpdated });
        } catch (error) {
            console.error("Error al modificar el producto:", error);
            return res.status(500).send("Error al modificar el producto");
        }
    }

    //Eliminar productos
    async deleteProduct(req, res) {
        const id = req.params.pid;
        console.log(id)
        try {
            const productToDelete = await productService.deleteProduct(id);
            if (!productToDelete) {
                return res.status(404).send({ message: "Producto no encontrado" });
            }
            console.log("Producto eliminado:", productToDelete);
            return res.status(200).send({ message: "Producto eliminado correctamente", product: productToDelete });
        } catch (error) {
            console.error("Error al eliminar el producto:", error);
            return res.status(500).send("Error al eliminar el producto");
        }
    }
}
module.exports = productController;