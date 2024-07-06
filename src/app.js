//App: Inicializa el servidor

//Express
const express = require("express");
//Creamos nuestra app
const app = express();
//Rutas
const productsRouter = require("./routes/products.router.js");
const cartsRouter = require("./routes/carts.router.js");
const viewsRouter = require("./routes/views.router.js");
const userRouter = require("./routes/user.router.js");
const mockingRouter = require("./routes/mocking.js");
//Handlebars
const exphbs = require("express-handlebars");
//Socket
const socket = require("socket.io");
//Repository para la vista realTimeProducts
const ProductRepository = require("./repository/product.repository.js");
const productRepository = new ProductRepository();
//Base de datos
require("./database.js");
//Chat
const MessagesModel = require("./models/messages.model.js")
//Cookies 
const session = require("express-session");
const cookieParser = require("cookie-parser");
//FileStore
const FileStore = require("session-file-store");
//const fileStore = new FileStore(session);
//MongoStore
const MongoStore = require("connect-mongo");
//Passport
const passport = require("passport");
const initializePassport = require("./config/passport.config.js");
//Config Object
const configObject = require("./config/config.js")
const { port } = configObject;
//Program
//const program = require ("program");
//Nodemailer: Permite reliazar el envio de mensajería desde nuestra app
const nodemailer = require("nodemailer");
//Middleware - Error
const errorMiddleware = require("./middleware/error.js");
//Logger
const {addLogger} = require("./utils/logger.js");


//Handlebar
app.engine("handlebars", exphbs.engine());
app.set("view engine", "handlebars");
app.set("views", "./src/views");


//Middleware
app.use(express.json())
app.use(express.urlencoded({ extended: true }));
app.use(express.static("./src/public"));
app.use(cookieParser());
app.use(session({
    secret: "secretCoder",
    resave: true,
    saveUninitialized: true,
    store: MongoStore.create({
        mongoUrl: "mongodb+srv://coderhouse:coderhouse@cluster0.2zgtivj.mongodb.net/ecommerce?retryWrites=true&w=majority&appName=Cluster0", ttl: 100
    })
}))


//Passport
app.use(passport.initialize());
app.use(passport.session());
initializePassport();


//Middleware - Logger
app.use(addLogger);


//Rutas
app.use("/api/products", productsRouter);
app.use("/api/carts", cartsRouter);
app.use("/", viewsRouter);
app.use("/api/users", userRouter);
app.use("/api/mockingproducts", mockingRouter);
//Middleware - error
app.use(errorMiddleware);


// Ruta de prueba para logs
app.get("/loggertest", (req, res) => {
    req.logger.http("mensaje http");
    req.logger.info("mensaje info");
    req.logger.warning("mensaje WARNING");      
    req.logger.error("mensaje ERROR");
    res.send("Logs generados");
 });


//Listen
const httpServer = app.listen(port, () => {
    console.log(`Escuchando en el puerto ${port}`);
})


//SMTP = configuración del servicio SMTP, para enviar mensajes
const transporter = nodemailer.createTransport({
    service: "gmail",
    port: 587,
    auth: {
        user: "boris.gilp@gmail.com",
        pass: "ufhc auvf qduw nfwd"
    }
})


//instancia Socket del servidor
const io = socket(httpServer);


//Conección cliente
io.on("connection", async (socket) => {
    console.log("Un cliente se conectó");

    //Enviar mensaje para renderizar productos
    const products = await productRepository.getProducts();
    socket.emit("products", products);

    //Recibir evento eliminar producto
    socket.on("deleteProduct", async (pid) => {
        await productRepository.deleteProduct(pid);
        console.log(pid)
        //Enviamos array actualizado
        socket.emit("products", await productRepository.getProducts());
    })

    //Recibir evento agg producto desde cliente
    socket.on("addProduct", async (producto) => {
        await productRepository.addProduct(producto);
        //Enviamos array actualizado
        socket.emit("products", await productRepository.getProducts());
    })


    //Recibir evento para el Chat
    //Recupera los mensaje de mongo
    socket.on("message", async (data) => {
        await MessagesModel.create(data);
        //obtengo mensajes de mongo
        const messages = await MessagesModel.find();
        socket.emit("message", messages);
    })

});


////////////////////////////////////////////////////////////////////////////////////////////////

//Envio de correos
app.post("/mail", async (req, res) => {
    const { email, subject, message } = req.body;
    try {
        await transporter.sendMail({
            from: "Baris Gamer <boris.gilp@gmail.com>",
            to: email,
            subject: "subject",
            //cuerpo del mensaje
            html: `
            <p>${message}</p>
            <img src="cid:gogeta" alt="Imagen">`,
            //Enviar imagen adjunta y en el cuerpo del mail
            attachments: [{
                filename: "gogeta.jpg",
                path: "./src/public/img/gogeta.jpg",
                cid: "gogeta"
            },
            {
                filename: "gogeta.jpg",
                path: "./src/public/img/gogeta.jpg" // Se envía como adjunto
            }]
        })
        res.send("Correo enviado correctamente")
    } catch (error) {
        res.status(500).send("Error al enviar el correo")
        console.log(error)
    }
})