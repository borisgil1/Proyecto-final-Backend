//App: Inicializa el servidor

// Importaciones y configuraciones iniciales
const express = require("express");
const exphbs = require("express-handlebars");
const socket = require("socket.io");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const MongoStore = require("connect-mongo");
const passport = require("passport");
const nodemailer = require("nodemailer");// Permite reliazar el envio de mensajería desde nuestra app
const swaggerUiExpress = require("swagger-ui-express");//Genera una interfaz grafica para ver toda la documentación.
const swaggerJSDoc = require("swagger-jsdoc"); //Permite escribir la configuración en un archivo.yaml

//Importación de rutas
const productsRouter = require("./routes/products.router.js");
const cartsRouter = require("./routes/carts.router.js");
const viewsRouter = require("./routes/views.router.js");
const userRouter = require("./routes/user.router.js");
const mockingRouter = require("./routes/mocking.js");

// Repositorios y modelos
const ProductRepository = require("./repository/product.repository.js");
const MessagesModel = require("./models/messages.model.js");
const productRepository = new ProductRepository();

// Base de datos y configuración
require("./database.js");
const initializePassport = require("./config/passport.config.js");
const configObject = require("./config/config.js");
const { port } = configObject;

// Middleware y utilidades
const errorMiddleware = require("./middleware/error.js");
const { addLogger } = require("./utils/logger.js");

// Configuración de la aplicación
const app = express();
app.engine("handlebars", exphbs.engine());
app.set("view engine", "handlebars");
app.set("views", "./src/views");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("./src/public"));
app.use(cookieParser());
app.use(session({
    secret: "secretCoder",
    resave: true,
    saveUninitialized: true,
    store: MongoStore.create({
        mongoUrl: "mongodb+srv://coderhouse:coderhouse@cluster0.2zgtivj.mongodb.net/ecommerce?retryWrites=true&w=majority&appName=Cluster0",
        ttl: 100
    })
}));

app.use(passport.initialize());
app.use(passport.session());
initializePassport();

app.use(addLogger);

//Configuración de Swagger
const swaggerOptions = {
    definition: { //Permite configurar la documentación
        openapi: "3.0.1",
        info: {
            title: "Documentation Ecommerce API",
            description: "Ecommerce",
        }
    },
    apis: ["./src/docs/**/*.yaml"], //Ubicación archivos yaml. Lee todos los archivos yaml dentro de docs
}

//Conectamos Swagger a nuestro servidor Express
const spects = swaggerJSDoc(swaggerOptions);

// Definición de rutas
app.use("/api/products", productsRouter);
app.use("/api/carts", cartsRouter);
app.use("/", viewsRouter);
app.use("/api/users", userRouter);
app.use("/api/mockingproducts", mockingRouter);
app.use("/apidocs", swaggerUiExpress.serve, swaggerUiExpress.setup(spects));

// Middleware de manejo de errores
app.use(errorMiddleware);

// Ruta de prueba para logs
app.get("/loggertest", (req, res) => {
    req.logger.http("mensaje http");
    req.logger.info("mensaje info");
    req.logger.warning("mensaje WARNING");
    req.logger.error("mensaje ERROR");
    res.send("Logs generados");
});

// Configuración del servidor
const httpServer = app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});

// Configuración de Socket.io
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

//SMTP = configuración del servicio SMTP, para enviar mensajes
const transporter = nodemailer.createTransport({
    service: "gmail",
    port: 587,
    auth: {
        user: "boris.gilp@gmail.com",
        pass: "ufhc auvf qduw nfwd"
    }
});

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
});


app.post("/send-email", async (req, res) => {
    const { email, subject, message } = req.body;
    try {
        await transporter.sendMail({
            from: 'your-email@example.com',
            to: email,
            subject: subject,
            html: message
        });
        res.json({ success: true });
    } catch (error) {
        console.error(error);
        res.json({ success: false });
    }
});