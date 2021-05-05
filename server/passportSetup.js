require('dotenv').config({
    path: __dirname + '/../.env'
});
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const inProduction = process.env.NODE_ENV === "production";
const AUTH_REDIRECT_URL = inProduction ? process.env.CLIENT_URL : process.env.DEV_CLIENT_URL;
const db = require('./db');
const bcrypt = require('bcrypt');
const LocalStrategy = require('passport-local').Strategy;

passport.use(new LocalStrategy({
    passReqToCallback: true
}, async (req, username, password, done) => {
    try {
        const result = await db.query('SELECT _id, first_name, last_name, is_admin, is_verified, is_tutor, password, image_url FROM users WHERE email = $1', [username]);
        if (result.rows[0]) {
            if (result.rows[0].password) {
                const check = await bcrypt.compare(password, result.rows[0].password);
                if (check) {
                    const data = result.rows[0];
                    return done(null, {
                        first_name: data.first_name,
                        last_name: data.last_name,
                        is_verified: data.is_verified,
                        is_admin: data.is_admin,
                        is_tutor: data.is_tutor,
                        _id: data._id,
                        image_url: data.image_url
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
        const image_url = profile._json.picture;
        const splitName = profile.displayName.split(" ");
        const last_name = splitName.length > 1 ? splitName[splitName.length - 1] : "";
        var first_name = "";
        if (splitName.length > 1) {
            for (var i = 0; i < splitName.length - 1; i++) {
                if (i === 0) {
                    first_name += splitName[i];
                } else {
                    first_name += (" " + splitName[i]);
                }
            }
        } else {
            first_name = splitName[0];
        }

        db.query('SELECT * FROM findOrCreateGoogleUser($1, $2, $3, $4);', [email, first_name, last_name, image_url], (err, res) => {
            if (err) {
                if (err.message === process.env.LOGIN_ERROR) {
                    return cb(undefined, false);
                } else {
                    return cb(err, false);
                }
            }
            const data = res.rows[0];
            return cb(err, {
                _id: data.found_id,
                first_name: data.found_firstname,
                last_name: data.found_lastname,
                is_admin: data.found_isadmin,
                is_tutor: data.found_istutor,
                is_verified: data.found_isverified,
                image_url: data.found_imageurl
            })
        });
    }
));

module.exports = db;