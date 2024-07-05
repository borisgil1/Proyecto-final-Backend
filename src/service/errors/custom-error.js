//Creamos una clase para generar muchos errores

class CustomError extends Error {
    //Metodo crear error
    //Si quiero que este metodo se use sin necesidad de instanciar la clase usamos el prefijo static
    static createError({name = "Error", cause = "Unknown", message, code = 1}) {
        const error = new Error(message);
        error.name = name;
        error.cause = cause;
        error.code = code;
        //Lanzamos el error
        throw error 
        //Esto detiene la ejecucion de la app, por eso tenemos que capturarlo
    }
}

module.exports = CustomError;