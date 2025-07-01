const mongoose = require("mongoose");

const beerSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
    },
    style: {
        type: String,
        required: true,
    },
    flavorProfile: {
        type: String,
        required: true,
    },
    abv: {
        type: Number,
        required: true,
    },
    ibu: {
        type: Number,
        required: true,
    },
    malt: {
        type: String,
        required: true,
    },
    hops: {
        type: String,
        required: true,
    },
    foodPairing: {
        type: String,
        required: true,
    },
    availability: {
        type: String,
        required: true
    },
});

module.exports = new mongoose.model("Beer", beerSchema);