const mongoose = require("mongoose");

//Schema
const userSchema = new mongoose.Schema({
    first_name: {
        type: String,
        required: true
    },
    last_name: {
        type: String,
        //required: true
    },
    email: {
        type: String,
        required: true,
        index: true, 
        unique: true 
    },
    password: {
        type: String,
        //required: true
    },
    age: {
        type: Number,
        //required: true
    },
    role: {
        type: String,
        enum: ['admin', 'usuario'],
        default: 'usuario'
    },
    cart: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "carts"
    }
})

//                           siempre en plural
const UserModel = mongoose.model("usuarios", userSchema)

module.exports = UserModel;