//LOGGERS: es una herramienta que registra información importante sobre el funcionamiento de la aplicación mientras se ejecuta. Estos registros son útiles para diagnosticar problemas, rastrear eventos y ver el rendimiento del sistema. 

// - Podemos separar los mensajes en diferentes "niveles" y estos pueden ser configurados por nosotros mismos. 

// - Podemos enviar esa información a otros recursos, a partir de los elementos llamados "transportes". Entonces puedo enviar mis logs a base de datos, archivos, mails, incluso a la consola misma. 

//Winston: Es una biblioteca popular de Logging para Node JS. También permite configurar niveles de registro y enviar logs a diferentes canales.
const winston = require("winston");
//Importo configObject
const configObject = require("../config/config");
const {node_env} = configObject

//Personalizar niveles
const levels = {
    level: {
        fatal: 0,
        error: 1,
        warning: 2,
        info: 3,
        http: 4,
        debug: 5
    },

    colors: {
        fatal: "red",
        error: "yellow",
        warning: "blue",
        info: "green",
        http: "magenta",
        debug: "white"
    }
}

//Logger etapa desarollo
const loggerDes = winston.createLogger({
    //Antes del objeto transporte le paso los leves
    //Objeto niveles en su propiedad nivel 
    levels: levels.level,
    transports: [
        //Transporte de consola, le paso el nivel y el formato
        new winston.transports.Console({
            //Que tome nivel debug y superiores. El nivel es de donde empieza a registrar
            level: "info", // ponerlo en dbug
            //Colores de los niveles
            //Formato para que tenga los colores
            format: winston.format.combine(
                winston.format.colorize({ colors: levels.colors }),
                winston.format.simple()
            )
        })
    ]
})


//Logger etapa produccion
const loggerPro = winston.createLogger({
    levels: levels.level,
    transports: [
        new winston.transports.File({
            filename: "./errors.log",
            level: "error",
            format: winston.format.simple()
        })
    ]
})

//Configuracion de logger dependiendo a la variable de entorno
const logger = node_env === "production" ? loggerPro : loggerDes


//Middleware
const addLogger = (req, res, next) => {
    //req.logger es igual a mi logger de la linea 68
    req.logger = logger;
    //logger.http es un metodo de mi logger. method = get. url = ruta
    req.logger.http(`${req.method} en ${req.url} - ${new Date().toLocaleDateString()}`);
    next();
}

module.exports = { addLogger, logger };

