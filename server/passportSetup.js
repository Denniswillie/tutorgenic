require('dotenv').config({
    path: __dirname + '/../.env'
});
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const inProduction = process.env.NODE_ENV === "production";
const AUTH_REDIRECT_URL = inProduction ? process.env.DOMAIN_NAME : process.env.CLIENT_URL;
const db = require('./db');
const bcrypt = require('bcrypt');
const LocalStrategy = require('passport-local').Strategy;

passport.use(new LocalStrategy({
    passReqToCallback: true
}, async (req, username, password, done) => {
    try {
        const result = await db.query('SELECT _id, firstName, lastName, password FROM users WHERE email = $1', [username]);
        if (result.rows[0]) {
            if (result.rows[0].password) {
                const check = await bcrypt.compare(password, result.rows[0].password);
                if (check) {
                    const data = result.rows[0];
                    return done(null, {
                        firstName: data.firstname,
                        lastName: data.lastname,
                        _id: data._id
                    })
                } else {
                    return done(null, false, {
                        message: "incorrect password"
                    })
                }
            } else {
                return done(null, false, {
                    message: "Login by using Google login."
                })
            }
        } else {
            return done(null, false, {
                message: "email does not exist"
            })
        }
    } catch (err) {
        console.log(err);
        return done(null, false, {
            message: err
        });
    }
}));

passport.serializeUser((user, done) => {
    done(null, user);
})

passport.deserializeUser((user, done) => {
    done(null, user);
})

passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: AUTH_REDIRECT_URL + "/auth/google/tutorgenic",
        userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo"
    },
    function (accessToken, refreshToken, profile, cb) {
        // const googleId = profile.id;
        const email = profile.emails[0].value;
        const splitName = profile.displayName.split(" ");
        const lastName = splitName.length > 1 ? splitName[splitName.length - 1] : "";
        var firstName = "";
        if (splitName.length > 1) {
            for (var i = 0; i < splitName.length - 1; i++) {
                if (i === 0) {
                    firstName += splitName[i];
                } else {
                    firstName += (" " + splitName[i]);
                }
            }
        } else {
            firstName = splitName[0];
        }

        db.query('SELECT * FROM findOrCreateGoogleUser($1, $2, $3);', [email, firstName, lastName], (err, res) => {
            if (err) {
                if (err.message === process.env.LOGIN_ERROR) {
                    return cb(undefined, false);
                } else {
                    return cb(err, false);
                }
            }
            if (err) {
                return cb(undefined, false);
            }
            return cb(err, {
                _id: res.rows[0].found_id,
                firstName: res.rows[0].found_firstname,
                lastName: res.rows[0].found_lastname
            })
        });
    }
));

module.exports = db;