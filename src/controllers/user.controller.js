//Registro Controller
const UserModel = require("../models/user.model.js");
const jwt = require("jsonwebtoken");
const { createHash } = require("../utils/hashbcrypt.js");
const { isValidPassword } = require("../utils/hashbcrypt.js");
const CartsModel = require("../models/carts.model.js");

class UserController {

    //Registro con JWT
    async registerJwt(req, res) {

        let { first_name, last_name, email, password, age } = req.body;

        try {
            //Verificar si el usuario existe en la bdd
            const existingUser = await UserModel.findOne({ email })

            //si es usuario existe
            if (existingUser) {
                return res.status(400).send("El usuario ya existe")
            }

             //Creamos carrito asosiado al usuario y lo guardo
            const cart = new CartsModel()
            await cart.save();

            //si no existe lo creo
            const newUser = new UserModel({
                first_name,
                last_name,
                age,
                email,
                password: createHash(password),
                cart: cart._id,
            })

            //Lo guardo en la bdd
            await newUser.save();

            //Generamos el token
            const token = jwt.sign({
                first_name: newUser.first_name,
                last_name: newUser.last_name,
                email: newUser.email,
                age: newUser.age,
                role: newUser.role,
            }, "coderhouse", { expiresIn: "24h" });

            //Enviar token desde una cookie
            //                Clave        valor          tiempo     solo se accede desde http
            res.cookie("coderCookieToken", token, { maxAge: 60 * 60 * 1000, httpOnly: true });

            //una vez me registro me lleva al perfil
            res.redirect("/profile");

        } catch (error) {
            res.status(500).send("Error interno del servidor")
            console.log(error)
        }
    }


    //Login con JWT 
    async loginJwt(req, res) {
        let { email, password } = req.body;
        try {

            //verificacion si exite usuario con ese mail
            let user = await UserModel.findOne({ email });

            //Si no existe el usuario retorna error
            if (!user) {
                console.log("Este usuario no existe");
                return res.status(400).send("El usuario no existe");
            }

            //si existe verifico la contraseña
            if (!isValidPassword(password, user)) {
                return res.status(401).send("Contraseña incorrecta");
            }

            //Generamos el token
            const token = jwt.sign(
                {
                    first_name: user.first_name,
                    last_name: user.last_name,
                    email: user.email,
                    age: user.age,
                    role: user.role,
                    cart: user.cart
                },
                "coderhouse",
                { expiresIn: "24h" }

            );

            //Establecer token como cookie 
            //                Clave        valor       tiempo, 1hr       la cookie  solo se accede desde http  
            res.cookie("coderCookieToken", token, { maxAge: 60 * 60 * 1000, httpOnly: true });
            res.redirect("/profile");

        } catch (error) {
            res.status(500).send("Error interno del servidor")
            console.log(error)
        }
    }


    //Cerrar sesion con JWT:
    async logoutJwt(req, res) {
        //limpio la cookie del token
        res.clearCookie("coderCookieToken");
        //Redirigir al login.
        res.redirect("/login");
    }


    //Version Github 
    async gitHub(req, res) {
        router.get("/githubcallback", passport.authenticate("github", {
            failureRedirect: "/login"
        }), async (req, res) => {
            //La estrategia de Github nos retornará el usuario, entonces los agrego a mi objeto de Session: 
            req.session.user = req.user;
            //habilita la ruta
            req.session.login = true;
            //Redirijo al perfil
            res.redirect("/profile");
        })
    }

    async githubCallback(req, res) {
        try {
            // La estrategia de Github nos retornará el usuario, entonces los agrego a mi objeto de Session: 
            req.session.user = req.user;
            // Habilita la ruta
            req.session.login = true;
            // Redirijo al perfil
            res.redirect("/profile");
        } catch (error) {
            console.error('Error en el callback de GitHub:', error);
            res.status(500).send('Error interno del servidor');
        }
    };


    async profile(req, res) {
        if (!req.session.login) {
            return res.redirect("/login")
        }
        res.render("profile");
    }

    async products(req, res) {
                    res.render("products");
    }
    //Ruta admin
    // async admin(req, res) {
    //     // Asegúrate de que req.user contiene la información del usuario autenticado
    //     if (!req.user || req.user.role !== "admin") {
    //         return res.status(403).send("Acceso denegado");
    //     }
    //     res.render("admin");
    // }


    //Ruta current 

    // router.get("/home", passport.authenticate("jwt", { session: false }), (req, res) => {
    //     res.render("home", { usuario: req.user.email });
    // })
}


module.exports = UserController;