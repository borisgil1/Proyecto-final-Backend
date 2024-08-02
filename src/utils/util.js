// Middleware
//Diferenciar porque un usario no se puede identificar correctamente
//Controlar los errores, la autenticación del usuario y errores

const passport = require("passport");
const { addLogger } = require("../utils/logger.js").addLogger;

//Remplazo el middleware nativo por este customizado
//Recibo la estrategia como parametro
const passportCall = (strategy) => {
    //Retorno funcion asincona, recibe req, res, next
    return async (req, res, next) => {
        //Usar metodo authenticate, estrategia y funcion cb
        passport.authenticate(strategy, (error, user, info) => {
            //si hay error terminamos la funcion y avanzamos con el next
            if (error) {
                return next(error);
            }
            //Si no hay usuario se envía una respuesta
            if (!user) {
                req.logger.warning("Necesitas logearte para acceder");
                return res.status(401).send({ error: "No estás autenticado" });
            }

            //Si marcha bien req.user guarda el usuario y avanzamos con el next
            req.user = user;
            next();
        })(req, res, next)
    };
};

//Permite ingresar a la ruta profile sin autenticarse
const profileAuth = (strategy) => {
    return async (req, res, next) => {
        passport.authenticate(strategy, (error, user, info) => {
            if (error) {
                return next(error);
            }
            if (!user) {
                return next();
            }
            req.user = user;
            next();
        })(req, res, next)
    };
};

//Autorización según el rol
const authorization = (...allowedRoles) => { //Acepta multiples roles
    //Retorna metodo asincronico
    return async (req, res, next) => {
        const userRole = req.user.role;
        if (!allowedRoles.includes(userRole)) { //Verifica si el rol de usuario está en la lista de permitidos
            //Si en el usuario q tenemos cargado el rol no coincide con el rol que yo estoy pasando por parametro mensaje negativo
            req.logger.warning("No tienes permiso para acceder a esta ruta, no tienes el rol de " + allowedRoles );
            return res.status(403).send({ messege: "No tienes permiso para acceder a esta ruta, no tienes el rol de " + allowedRoles });
        }
        next();
    };
};

const authorization2 = (role) => {
    return (req, res, next) => {

        // Permitir acceso si el usuario no está autenticado
        if (!req.user) {
            return next();
        }

        // Denegar acceso si el usuario es administrador
        if (req.user.role === role) {
            req.logger.warning("No tienes permiso para acceder a esta ruta como administrador");
            return res.status(403).send({ message: "No tienes permiso para acceder a esta ruta como administrador" });
        }

        // Permitir acceso si el usuario está autenticado y no es administrador
        next();
    }
};

module.exports = { passportCall, authorization, authorization2, profileAuth };