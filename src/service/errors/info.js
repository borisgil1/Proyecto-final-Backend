//Generamos una funcion que lanza por consola un mensaje del error

//Revisamos si se mandaron todos los datos para Agregar un producto y si esos datos son correctos
const generateProductError = (product) => {
    return `Los datos están incompletos o son incorrectos. Verifique que los datos sean correctos. Recuerde que los datos correctos son:
- Titulo: String, pero recibimos: ${typeof product.title === 'string' ? product.title : typeof product.title} 
- Descripción: String, pero recibimos: ${typeof product.description === 'string' ? product.description : typeof product.description} 
- Precio: Number, pero recibimos: ${typeof product.price === 'number' ? product.price : typeof product.price}
- Imagen: String, pero recibimos: ${typeof product.img === 'string' ? product.img : typeof product.img}
- Código: String, pero recibimos: ${typeof product.code === 'string' ? product.code : typeof product.code}
- Cantidad: Number, pero recibimos: ${typeof product.stock === 'number' ? product.stock : typeof product.stock}
- Categoría: String, pero recibimos: ${typeof product.category === 'string' ? product.category : typeof product.category}
- Estatus: Boolean, pero recibimos: ${typeof product.status === 'boolean' ? product.status : typeof product.status}
- Miniatura: [String], pero recibimos: ${Array.isArray(product.thumbnails) ? product.thumbnails.join(', ') : typeof product.thumbnails}`;
};

module.exports = { generateProductError };