//Base de datos
const mongoose = require("mongoose");
const configObject = require ("./config/config.js");
const { mongo_url } = configObject;


//Conexión mongoose (base de datos)
mongoose.connect(mongo_url)
    .then(() => console.log("Conectados a la Base de datos"))
    .catch(() => console.log("Error en la conexión"))