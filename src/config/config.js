// Multiple entornos
// Dotenv dependencia que permite manjear las variables de entorno desde archivos .env
const dotenv = require("dotenv");

// Program tiene todas las configuraciones para los argumentos que se generé en commander(utils)
const program = require("../utils/commander.js"); 

// Obtener la configuración de modo de programs
const { mode } = program.opts(); //En mode recivo desarrollo o produccion
//Dependiendo del valor que tenga mode, toma un archivo o el otro, la variable de mongo va a ser diferente

// Configurar dotenv
dotenv.config({
    // Especifica si tomo el archivo produccion o desarrollo según el modo proporcionado como argumento
    // Si el modo es 'produccion', carga .env.production; de lo contrario, carga .env.development
    path: mode === "production" ? "./.env.production" : "./.env.development"
});

// Crear el objeto de configuración y enviamos los datos
const configObject = {
    // Enviar el puerto que viene de process.env.PUERTO
    port: process.env.PORT,
    // Enviar la URL de MongoDB que viene de process.env.MONGO_URL
    mongo_url: process.env.MONGO_URL,
}

module.exports = configObject;