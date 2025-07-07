const mongoose = require("mongoose");

const ratingSchema = new mongoose.Schema({
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    ratedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    beer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Beer',
        required: true
    }
});

ratingSchema.index({ createdBy: 1, beer: 1 }, { unique: true }); // only onew rating per user per beer

module.exports = mongoose.model("Rating", ratingSchema);