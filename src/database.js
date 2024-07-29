//Base de datos
const mongoose = require("mongoose");
const configObject = require ("./config/config.js");
const { mongo_url } = configObject;


//Conexión mongoose (base de datos)
mongoose.connect(mongo_url)
    .then(() => console.log("Connected to the database"))
    .catch(() => console.log("Error in the connection"))