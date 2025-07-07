const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const app = express();

const mongoose = require("mongoose");
const methodOverride = require("method-override");
const morgan = require("morgan");
const path = require("path");
const session = require("express-session");

const authController = require("./controllers/auth.js");

const port = process.env.PORT ? process.env.PORT : "5500"

mongoose.connect(process.env.MONGODB_URI);

mongoose.connection.on('connected', () => {
    console.log(`Connected to MongoDB ${mongoose.connection.name}.`);
});

// SCHEMA IMPORTS
const Beer = require("./models/beer.js");
const Rating = require("./models/rating.js");
const Comment = require("./models/comment.js");

// MIDDLEWARE STACK

app.use(express.urlencoded({ extrended: false }));
app.use(methodOverride('_method'));
app.use(morgan("dev"));
app.use(
    session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: true,
    })
);

app.use("/auth", authController)

app.use(express.static(path.join(__dirname, "public")));

function requireAdmin(req, res, next) {                           // middleware to check if user is admin                 
    if (!req.session.user || req.session.user.role !== 'admin') {
        return res.render("forbidden.ejs", { user: req.session.user });
    }
    next();
};

function requireLogin(req, res, next) {        // middleware function to 
    if (!req.session.user) {                    // check if user is logged in
        return res.redirect("/auth/sign-in");   // if not, redirect to sign in to comment
    }
    next();
}

// GET

app.get("/", async (req, res) => {
    res.render("index.ejs", {
        user: req.session.user,
    });
});

app.get("/beers", async (req, res) => {
    const allBeers = await Beer.find();
    res.render("beers/index.ejs", {
        beers: allBeers,
        user: req.session.user     // passes user data to views
    });
});

app.get("/beers/new", requireAdmin, (req, res) => {       //   `requireAdmin` applied middleware to protect admin routes
    res.render("beers/new.ejs", { user: req.session.user })
});

app.get("/beers/:beerId", async (req, res) => {
    try {
        const foundBeer = await Beer.findById(req.params.beerId).populate('createdBy');
        const comments = await Comment.find({ beer: req.params.beerId }).populate('commentBy')

        res.render("beers/show.ejs", {
            beer: foundBeer,
            comments: comments,
            user: req.session.user
        });
    } catch (err) {
        console.error("Couldn't get beer data", err);
        res.status(500).send("Error beer won't load")
    }
});

app.get("/beers/:beerId/edit", requireAdmin, async (req, res) => {
    const foundBeer = await Beer.findById(req.params.beerId);
    console.log(foundBeer);
    res.render("beers/edit.ejs", {
        beer: foundBeer,
        user: req.session.user
    });
});

app.get("/brewden", (req, res) => {
    if (req.session.user && req.session.user.role === 'admin') {    // checks for admin role to enter brewden
        res.render("brewden.ejs", { user: req.session.user });
    } else {
        res.render("forbidden.ejs", { user: req.session.user });
    }
});

//POST

app.post("/beers", requireAdmin, async (req, res) => {
    try {
        const newBeer = {
            ...req.body,    // spreads all properties from the requested body into the new object
            createdBy: req.session.user._id
        };
        await Beer.create(newBeer);
        res.redirect("/beers");
    } catch (err) {
        console.error("Error saving beer", err);
        res.status(500).send("Error connecting to save beer, try again later");
    }
});

app.post("/beers/:beerId/comments", requireLogin, async (req, res) => {
    try {
        const newComment = {
            comment: req.body.comment,
            commentBy: req.session.user._id,
            beer: req.params.beerId
        };
        await Comment.create(newComment);
        res.redirect(`/beers/${req.params.beerId}`);
    } catch (err) {
        console.error("Couldn't save comment", err);
        res.status(500).send("I am error, comment not saved")
    }
});

//PUT

app.put("/beers/:beerId", requireAdmin, async (req, res) => {
    try {
        await Beer.findByIdAndUpdate(req.params.beerId, req.body);
        res.redirect(`/beers/${req.params.beerId}`);
    } catch (err) {
        console.error("Error updating beer", err);
        res.status(500).send("Error updating beer to database");
    }
});

//DELETE
app.delete("/beers/:beerId", requireAdmin, async (req, res) => {
    await Beer.findByIdAndDelete(req.params.beerId);
    res.redirect("/beers");
});

app.delete("/beers/:beerId/comments/:commentId", requireLogin, async (req, res) => {  // route to delete comment, uses requireLogin middleware function
    try {
        const comment = await Comment.findById(req.params.commentId);
        if (comment.commentBy.toString() !== req.session.user._id.toString() && req.session.user.role !== 'admin') { // checks if comment from user or admin
            return res.send("You can only delete your own comments");
        }
        await Comment.findByIdAndDelete(req.params.commentId);        // delete comment and 
        res.redirect(`/beers/${req.params.beerId}`);                  // redirect to beers index page
    } catch (err) {
        console.error("Error, couldn't delete comment", err);
        res.status(500).send("Error, couldn't delete comment");
    }
});



app.listen(port, () => {
    console.log(`The express app is ready on port ${port}!`);
});