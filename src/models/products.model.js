const mongoose = require("mongoose");
const mongoosePaginate = require ("mongoose-paginate-v2");

//Schema
const productSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    img: {
        type: String,
        required: true
    },
    code: {
        type: String,
        unique: true,
        required: true
    },
    stock: {
        type: Number,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    status: {
        type: Boolean,
        required: true
    },
    thumbnails: {
        type: [String]
    },
    owner: {
        type: String,
        required: true
    }
})

productSchema.plugin(mongoosePaginate);

const ProductsModel = mongoose.model("products", productSchema)

module.exports = ProductsModel;