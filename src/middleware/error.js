//Requerrir un objeto con todos los errores enumerados en el diccionario de errores
//Errores = diccionario de errores

const EErrors = require("../service/errors/enum.js");

const errorMiddleware = (error, req, res, next) => {
    console.log(error.cause);
    // Estructura de selección. Analizamos el código del error y revisamos los diferentes casos
    switch (error.code) {
        case EErrors.TIPO_INVALIDO:
            res.status(400).send({ status: "error", error: error.name, message: error.message, cause: error.cause });
            break;
        // default: cuando no coincide con ninguno de los casos
        default:
            res.status(500).send({ status: "error", error: "Error desconocido" });
    }
};

module.exports = errorMiddleware;