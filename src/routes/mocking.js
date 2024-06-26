//Mock = Es una simulación de base de datos que generamos en el entorno de desarrollo

const express = require("express");
const router = express.Router();
const generateProducts = require("../utils/faker.js");


router.get("/", (req, res) => {
    //Generamos array de usuarios
    const users = [];
    for (let i = 0; i < 100; i++) {
        users.push(generateProducts())
    }
    res.send(users);
})

module.exports = router