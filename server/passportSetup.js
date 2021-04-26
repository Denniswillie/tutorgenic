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
        const result = await db.query('SELECT _id, username, password FROM users WHERE username = $1', [username]);
        if (result.rows[0]) {
            const check = await bcrypt.compare(password, result.rows[0].password);
            if (check) {
                const data = result.rows[0];
                return done(null, {
                    username: data.username,
                    _id: data._id
                })
            } else {
                return done(null, false, {
                    message: "incorrect password"
                })
            }
        } else {
            return done(null, false, {
                message: "incorrect username"
            })
        }
    } catch (err) {
        console.log(err);
        return done(null, false);
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
        const email = profile.emails[0].value;
        const googleId = profile.id;
        const fullName = profile.displayName;
        db.query('SELECT * FROM findOrCreateGoogleUser($1, $2, $3);', [email, fullName, googleId], (err, res) => {
            return cb(err, {
                _id: res.rows[0].found_id,
                username: res.rows[0].found_username
            })
        });
    }
));

module.exports = db;