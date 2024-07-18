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
            //Si no hay usuario tiramos un 401
            if (!user) {
                return next();           
                //req.logger.warning("Necesitas logearte para acceder");
                //return res.status(401).send({ error: "Necesitas logearte para acceder" });
            }
            
            //Si marcha bien req.user guarda el usuario y avanzamos con el next
            req.user = user;
            next();
        })(req, res, next)
    };
};


//Autorización según el rol
const authorization = (role) => {
    //Retorna metodo asincronico
    return async (req, res, next) => {
        //Si en el usuario q tenemos cargado el rol no coincide con el rol que yo estoy pasando por parametro mensaje negativo
        if (req.user.role !== role) {
            req.logger.warning("No tienes permiso para acceder a esta ruta, no tienes el rol de  " + role);
            return res.status(403).send({ messege: "No tienes permiso para acceder a esta ruta, no tienes el rol de " + role });
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
}} ;


module.exports = { passportCall, authorization, authorization2 };