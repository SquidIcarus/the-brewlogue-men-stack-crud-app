const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    comment: {
        type: String,
        require: true,
        minLength: 1,
        maxLength: 300
    },
    commentBy: {
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

module.exports = mongoose.model("Comment", commentSchema);