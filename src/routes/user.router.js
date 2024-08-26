const express = require("express");
const router = express.Router();
const passport = require("passport");
const UserController = require("../controllers/user.controller.js");
const userController = new UserController();

//Registro con JWT
router.post("/register", userController.registerJwt);

//Login con JWT
router.post("/login", userController.loginJwt);

//Logout con JWT
router.post("/logout", userController.logoutJwt);

//Login con Github
router.get("/github", passport.authenticate("github", { scope: ["user:email"] }));

// Callback de Github
router.get("/githubcallback", passport.authenticate("github", { failureRedirect: "/login" }), userController.githubCallback);

//Restablecer contraseña
router.post("/reset-password",  userController.resetPassword);

//Cambiar contraseña
router.post("/change-password", userController.changePassword);

//Cambio de rol
router.put("/premium/:uid", userController.changeRole);

//Eliminar usuario
router.delete("/:uid", userController.deleteUser);

//Listar usuarios
router.get("/", userController.getUsers);

module.exports = router;