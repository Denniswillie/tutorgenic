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
    const first_name = req.body.first_name;
    const last_name = req.body.last_name;
    const email = req.body.username;
    const password = req.body.password;
    const image_url = "https://www.pngitem.com/pimgs/m/150-1503945_transparent-user-png-default-user-image-png-png.png";
    try {
        const existingData = await db.query('SELECT * FROM users WHERE email = $1', [email]);
        if (existingData.rows.length > 0) {
            throw new Error('Account already exists');
        }
        var hashed = await bcrypt.hash(password, 5);
        await db.query('INSERT INTO users(first_name, last_name, email, password, image_url) values($1, $2, $3, $4, $5)', [first_name, last_name, email, hashed, image_url]);
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