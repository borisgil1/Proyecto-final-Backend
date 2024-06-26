//Faker = Modulo externo. Generador de datos falsos

const { faker } = require("@faker-js/faker");

// Función para generar usuarios
const generateProducts = () => {
    return {
        id: faker.database.mongodbObjectId(),
        title: faker.commerce.productName(),
        description: faker.commerce.productDescription(),
        price: faker.commerce.price(),
        img: faker.image.url(),
        code: faker.string.uuid(),
        stock: parseInt(faker.string.numeric()),
        category: faker.commerce.department(),
        status: faker.datatype.boolean(),
        thumbnails: faker.image.url()
    };
};

module.exports = generateProducts;