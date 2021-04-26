require('dotenv').config({
    path: __dirname + '/../../.env'
})
const multer = require('multer');
const upload = multer();
const router = require('express').Router();
const passport = require('passport');
const db = require('../db');
const inProduction = process.env.NODE_ENV === "production";
const bcrypt = require('bcrypt');

router.get('/isLoggedIn', async (req, res) => {
    res.send({
        isLoggedIn: req.isAuthenticated(),
        user: req.user
    })
})

router.post('/register', upload.none(), async (req, res, next) => {
    console.log("fsdfs");
    const username = req.body.username;
    const password = req.body.password;
    const fullName = req.body.fullName;
    try {
        var hashed = await bcrypt.hash(password, 5);
        await db.query('INSERT INTO users(username, password, fullname) values($1, $2, $3)', [username, hashed, fullName]);
        next();
    } catch (err) {
        console.log(err);
        res.send({
            success: false
        })
    }
}, passport.authenticate('local', {
    failWithError: true
}), (req, res, next) => {
    res.send({
        success: true
    })
}, (err, req, res, next) => {
    res.send({
        success: false
    })
})

router.post('/login', upload.none(), passport.authenticate('local', {
    failWithError: true
}), (req, res, next) => {
    res.send({
        isLoggedIn: true
    })
}, (err, req, res, next) => {
    res.send({
        isLoggedIn: false
    })
});

router.get('/logout', upload.none(), async (req, res) => {
    req.logout();
    res.redirect(process.env.CLIENT_URL);
})

module.exports = router;