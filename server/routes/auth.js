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
    const firstName = req.body.firstName;
    const lastName = req.body.lastName;
    const email = req.body.username;
    const password = req.body.password;
    try {
        const existingData = await db.query('SELECT * FROM users WHERE email = $1', [email]);
        if (existingData.rows.length > 0) {
            throw new Error('Account already exists');
        }
        var hashed = await bcrypt.hash(password, 5);
        await db.query('INSERT INTO users(firstName, lastName, email, password) values($1, $2, $3, $4)', [firstName, lastName, email, hashed]);
        passport.authenticate('local', (err, user, info) => {
            if (err) {
                return res.send({
                    success: false
                })
            }
            if (user) {
                req.login(user, (err) => {
                    if (err) {
                        return next(err);
                    }
                    return res.send({
                        success: true
                    })
                });
            } else {
                return res.send({
                    success: false
                })
            }
        })(req, res, next);
    } catch (err) {
        console.log(err);
        res.send({
            success: false
        })
    }
})

router.post('/login', upload.none(), (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
        if (err) {
            console.log(err);
            return res.send({
                isLoggedIn: false,
            })
        }
        if (user) {
            req.login(user, (err) => {
                if (err) {
                    return next(err);
                }
                return res.send({
                    isLoggedIn: true
                })
            });
        } else {
            return res.send({
                isLoggedIn: false
            })
        }
    })(req, res, next);
})

router.get('/logout', upload.none(), async (req, res) => {
    req.logout();
    res.redirect(process.env.CLIENT_URL);
})

router.get("/google",
    passport.authenticate('google', {
        scope: ["profile", "email"]
    })
);

router.get("/google/tutorgenic",
    passport.authenticate('google', {
        failureRedirect: process.env.CLIENT_URL + '/googlefailure',
        successRedirect: process.env.CLIENT_URL
    })
);



module.exports = router;