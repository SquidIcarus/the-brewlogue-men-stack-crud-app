const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
        minLength: 8,
    },
    role:
    {
        type: String,
        enum: ['user', 'admin'], 
        default: 'user'
    },
});

const User = mongoose.model("User", userSchema);

module.exports = User;