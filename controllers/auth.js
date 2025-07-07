const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");

const User = require("../models/user.js");

// GET

router.get("/sign-up", (req, res) => {
    res.render("auth/sign-up.ejs", {
        isAdminSignup: false,
        user: req.session.user || null  // checks if user exists OR if undefined NULL
    });
});

router.get("/admin/sign-up", (req, res) => {
    res.render("auth/sign-up.ejs", {
        isAdminSignup: true,
        user: req.session.user || null
    });
});

router.get("/sign-in", (req, res) => {
    res.render("auth/sign-in.ejs", {
        user: req.session.user || null
    });
});

router.get("/sign-out", (req, res) => {
    req.session.destroy();
    res.redirect("/")
});

// POST

router.post("/sign-up", async (req, res) => {
    const userInDatabase = await User.findOne({ username: req.body.username });  // checks for unique username
    if (userInDatabase) {
        return res.send(`Username already taken. Return to <a href="/auth/sign-up">Sign Up</a> page`);
    }

    if (req.body.password !== req.body.confirmPassword) {  // confirms matching password
        return res.send(`Passwords must match. Return to <a href="/auth/sign-up">Sign Up</a> page.`);
    }

    const hashedPassword = bcrypt.hashSync(req.body.password, 10);  // hashes password x 10
    req.body.password = hashedPassword;

    const user = await User.create({      // create user with default 'user' role
        username: req.body.username,
        password: hashedPassword,
        role: 'user'
    });

    res.send(`Thanks for signing up ${user.username}! <a href="/auth/sign-in">Log In here</a>`);

});
// ADMIN SIGNUP ROUTE
router.post("/admin/sign-up", async (req, res) => {
    if (req.body.adminCode !== process.env.ADMIN_SECRET_CODE) {
        return res.send(`Invalid admin code. Return to Admin <a href="/auth/admin/sign-up">Sign Up</a> page`);
    }

    const userInDatabase = await User.findOne({ username: req.body.username });
    if (userInDatabase) {
        return res.send(`Username already taken. Return to Admin <a href="/auth/admin/sign-up">Sign Up</a> page.`);
    }

    if (req.body.password !== req.body.confirmPassword) {
        return res.send(`Passwords must match. Return to Admin <a href="/auth/admin/sign-up">Sign Up</a> page.`);
    }

    if (req.body.adminCode !== process.env.ADMIN_SECRET_CODE) {
        return res.send(`Invalid admin code. Return to Admin <a href="/auth/admin/sign-up">Sign Up</a> page`);
    }

    const hashedPassword = bcrypt.hashSync(req.body.password, 10);

    const user = await User.create({
        username: req.body.username,
        password: hashedPassword,
        role: 'admin'
    });

    res.send(`Admin account created successfully. Welcome ${user.username}! <a href="/auth/sign-in">Log in here.</a>`);
});

// USER SIGNUP ROUTE
router.post("/sign-in", async (req, res) => {
    const userInDatabase = await User.findOne({ username: req.body.username });
    if (!userInDatabase) {
        return res.send(`Login failed. Please try again. Return to <a href="/auth/sign-in">Log In</a> page.`)
    }

    const validPassword = bcrypt.compareSync(
        req.body.password,
        userInDatabase.password
    )

    if (!validPassword) {
        return res.send(`Login failed. Please try again. Return to <a href="/auth/sign-in">Log In</a> page.`);
    }

    req.session.user = {
        username: userInDatabase.username,
        _id: userInDatabase._id,
        role: userInDatabase.role
    };

    res.redirect("/")
});


module.exports = router;