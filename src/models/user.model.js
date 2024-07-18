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
        enum: ['admin', 'usuario', 'premium'],
        default: 'usuario'
    },
    cart: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "carts"
    },
    //Genero el token y lo guardo acá.
    //Se valida el token y si es valido se elimina
    resetToken: {
        token: String,
        expire: Date
    }
});

//                           siempre en plural
const UserModel = mongoose.model("users", userSchema)

module.exports = UserModel;