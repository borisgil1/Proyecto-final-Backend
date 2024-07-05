//Estrategias de passport y JWT, son middlwares. Autenticación y autorización

const passport = require("passport");
const UserModel = require("../models/user.model.js");
const jwt = require("passport-jwt");
const local = require("passport-local");
const { isValidPassword, createHash } = require("../utils/hashbcrypt.js");

const LocalStrategy = local.Strategy;
//Instanciar nueva estragegia
const JWTStrategy = jwt.Strategy;
//Decodificar el tooken que está dentro de la cookie
const ExtractJwt = jwt.ExtractJwt;
//GitHub
const GitHubStrategy = require("passport-github2");

 //Funcion que decofidica la cookie, extractor de cookies
const cookieExtractor = (req) => {
    // inicializar la variable token como null
    let token = null;
    //Si hay request y existen las cookies guardamos el token
    if (req && req.cookies) {
        //Si se dan las conidicones el token va a estar cargado con esta cookie 
        token = req.cookies["coderCookieToken"];
        //Si hay cookie me guardo el token
    }
    //Si existe lo guardamos, y si lo podemos guardar lo enviamos, lo retornamos
    return token;
}


const initializePassport = () => {
    //Register strategy local
    passport.use("register", new LocalStrategy({
        passReqToCallback: true,
        usernameField: "email",
    }, async (req, username, password, done) => {
        const { first_name, last_name, email, age } = req.body;

        try {
            let user = await UserModel.findOne({ email });

            if (user) {
                return done(null, false);
            } else {
                let newUser = {
                    first_name,
                    last_name,
                    email,
                    password: createHash(password),
                    age,
                };

                let result = await UserModel.create(newUser);
                return done(null, result);
            }
        } catch (error) {
            return done(error);
        }
    }));

    //Login strategy local
    passport.use("login", new LocalStrategy({
        usernameField: "email",
    }, async (email, password, done) => {
        try {
            let user = await UserModel.findOne({ email });

            if (!user) {
                return done(null, false);
            }

            if (!isValidPassword(password, user)) {
                return done(null, false);
            }

            return done(null, user);
        } catch (error) {
            return done(error);
        }
    }));

    passport.serializeUser((user, done) => {
        done(null, user._id);
    });

    passport.deserializeUser(async (id, done) => {
        try {
            let user = await UserModel.findById(id);
            done(null, user);
        } catch (error) {
            done(error, null);
        }
    });

    //Estrategia GitHub
    passport.use("github", new GitHubStrategy({
        clientID: "Iv23li2pdqvE2618g9dw",
        clientSecret: "8f2037334139d81d5e04da2843dd036837cee757",
        callbackURL: "http://localhost:8080/api/users/githubcallback"

    }, async (accessToken, refreshToken, profile, done) => {
        //Veo los datos del perfil
        console.log("Profile:", profile);

        try {
            let user = await UserModel.findOne({ email: profile._json.email });

            if (!user) {
                //Crear nuevo usuario si no existe
                let newUser = {
                    first_name: profile._json.name,
                    last_name: "",
                    age: 36,
                    email: profile._json.email,
                    password: ""
                }

                let result = await UserModel.create(newUser);
                done(null, result);
            } else {
                done(null, user);
            }
        } catch (error) {
            return done(error);
        }
    }))

   //Estrategia JWT autorizacion y autenticación
   //    jwt: nombre de la estrategia
    passport.use("jwt", new JWTStrategy({
        //Extrae el token de la cookie
        //Extrae la info del request = jwtRequest    funcion que extrae la cookie
        jwtFromRequest: ExtractJwt.fromExtractors([cookieExtractor]),
        //Palabra secreta
        secretOrKey: "coderhouse", //misma que tenemos en la app
        //Funcion callback, payload(toda la info del usuario), y metodo done (next)
        //La función cb que se ejecuta una vez que el token ha sido extraído y decodificado. Recibe dos argumentos:
    }, async (jwt_payload, done) => {
        try {
            //retorna done, la data del usuario queda cargada en la app
            //null por convencion de callback y jwtpayload=la data del usario
            return done(null, jwt_payload)
            //Queda cargada en la app la data del usuario, si no error
        } catch (error) {
            return done(error)
        }
    }));
}

module.exports = initializePassport;