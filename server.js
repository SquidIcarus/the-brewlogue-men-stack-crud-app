const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const app = express();

const mongoose = require("mongoose");
const methodOverride = require("method-override");
const morgan = require("morgan");

const port = process.env.PORT ? process.env.PORT : "5500"

mongoose.connect(process.env.MONGODB_URI);

mongoose.connection.on('connected', () => {
    console.log(`Connected to MongoDB ${mongoose.connection.name}.`);
});

app.use(express.urlencoded({ extrended: false }));
app.use(methodOverride('_method'));

app.listen(port, () => {
    console.log(`The express app is ready on port ${port}!`);
});

// GET

app.get("/", async (req, res) => {
    res.send("hello, friend!");
});