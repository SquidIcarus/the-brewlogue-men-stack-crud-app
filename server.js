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

const Beer = require("./models/beer.js");
const beer = require("./models/beer.js");

app.use(express.urlencoded({ extrended: false }));
app.use(methodOverride('_method'));
app.use(morgan("dev"));

app.listen(port, () => {
    console.log(`The express app is ready on port ${port}!`);
});

// GET

app.get("/", async (req, res) => {
    res.render("index.ejs");
});

app.get("/beers", async (req, res) => {
    const allBeers = await Beer.find();
    res.render("beers/index.ejs", { beers: allBeers });
});

app.get("/beers/new", (req, res) => {
    res.render("beers/new.ejs");
});

app.get("/beers/:beerId", async (req, res) => {
    const foundBeer = await Beer.findById(req.params.beerId);
    res.render("beers/show.ejs", { beer: foundBeer });
});

app.delete("/beers/:beerId", async (req, res) => {
    await Beer.findByIdAndDelete(req.params.beerId);
    res.redirect("/beers");
});

app.get("/beers/:beerId/edit", async (req, res) => {
    const foundBeer = await Beer.findById(req.params.beerId);
    console.log(foundBeer);
    res.render("beers/edit.ejs", {
        beer: foundBeer,
    });
});

//POST

app.post("/beers", async (req, res) => {
    try {
        await Beer.create(req.body);
        res.redirect("/beers");
    } catch (err) {
        console.error("Error saving beer", err);
        res.status(500).send("Error saving beer to database");
    }
});

//PUT

app.put("/beers/:beerId", async (req, res) => {
    try {
        await Beer.findByIdAndUpdate(req.params.beerId, req.body);
        res.redirect(`/beers/${req.params.beerId}`);
    } catch (err) {
        console.error("Error updating beer", err);
        res.status(500).send("Error updating beer to database");
    }
});
