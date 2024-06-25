// Middleware
//Diferenciar porque un usario no se puede identificar correctamente
//Controlar los errores, la autenticación del usuario y errores

const passport = require("passport");

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
                res.status(401).send({ error: info.messege ? info.messege : info.toString() });
            }
            //Si marcha bien req.user guarda el usuario y avanzamos con el next
            req.user = user;
            next();
        })(req, res, next)
    }
}


//Autorización según el rol
const authorization = (role) => {
    //Retorna metodo asincronico
    return async (req, res, next) => {
        //Si en el usuario q tenemos cargado el rol no coincide con el rol que yo estoy pasando por parametro mensaje negativo
        if (req.user.role !== role) {
            return res.status(403).send({ messege: "No tienes permiso, no eres " + role });
        }
        next();
    }
}

const authorization2 = (role) => {

    return (req, res, next) => {
        
    // Permitir acceso si el usuario no está autenticado
    if (!req.user) {
        return next();
    }

    // Permitir acceso si el usuario está autenticado y no es administrador, (admin)
    if (req.user.role !== role) {
        return next();
    }

    // Denegar acceso si el usuario es administrador
    return res.status(403).send({ message: "No tienes permiso para acceder a esta ruta como administrador" });
}} ;



module.exports = { passportCall, authorization, authorization2 };