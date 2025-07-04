const express = require("express");
const router = express.Router();
const User = require("../models/user.js");
const bcrypt = require("bcrypt");

// GET

router.get("/sign-up", (req, res) => {
    res.render("auth/sign-up.ejs");
});

router.get("/sign-in", (req, res) => {
    res.render("auth/sign-in.ejs");
});

router.get("/sign-out", (req, res) => {
    req.session.destroy();
    res.redirect("/")
})

// POST

router.post("/sign-up", async (req, res) => {
    const userInDatabase = await User.findOne({ username: req.body.username });  // checks for unique username
    if (userInDatabase) {
        return res.send("Username already taken.");
    }

    if (req.body.password !== req.body.confirmPassword) {  // confirms matching password
        return res.send("Passwords must match");
    }

    const hashedPassword = bcrypt.hashSync(req.body.password, 10);  // hashes password x 10
    req.body.password = hashedPassword;

    const user = await User.create(req.body);                 // creates the user
    res.send(`Thanks for signing up ${user.username}`);

});

router.post("/sign-in", async (req, res) => {
    const userInDatabase = await User.findOne({ username: req.body.username });
    if (!userInDatabase) {
        return res.send("Login failed. Please try again.")
    }

    const validPassword = bcrypt.compareSync(
        req.body.password,
        userInDatabase.password
    );
    if (!validPassword) {
        return res.send("Login failed. Please try again.");
    }

    req.session.user = {
        username: userInDatabase.username,
        _id: userInDatabase._id,
    };

    res.redirect("/")
});







module.exports = router;