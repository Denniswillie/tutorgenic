require('dotenv').config({path: __dirname + '/../.env'});
const express = require('express');
const cors = require("cors");
const app = express();
const port = parseInt(process.env.PORT);
const socket = require('socket.io');
const multer = require('multer');
const upload = multer();
const passport = require('passport');
const session = require('express-session');
const bcrypt = require('bcrypt');
const LocalStrategy = require('passport-local').Strategy;
const db = require('./db');
const passportSocketIo = require('passport.socketio');
const cookieParser = require('cookie-parser');
const pgSession = require('connect-pg-simple')(session);
const pgConfig = new pgSession({
    pool: db,
    tableName: 'session'
})

app.use(cookieParser())
app.use(express.json());
app.use(express.urlencoded({
    extended: true
}));

app.use(
    cors({
        origin: process.env.CLIENT_URL,
        methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
        credentials: true
    })
);

const sessionMiddleware = session({
    cookie: {
        httpOnly: false
    },
    skey: process.env.SESSION_KEY,
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: false,
    store: pgConfig
});

app.use(sessionMiddleware);
app.use(passport.initialize());
app.use(passport.session());

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

const server = app.listen(port);

app.use('/auth', require('./routes/auth'));

const io = socket(server, {
    cors: {
        origin: process.env.CLIENT_URL,
        methods: ['GET', 'POST']
    }
})

function onAuthorizeSuccess(data, accept) {
    accept();
}

function onAuthorizeFail(data, message, error, accept) {
    if (error) {
        console.log('Failed to connect');
    }
    accept(null, false);
}

io.use(passportSocketIo.authorize({
    cookieParser: cookieParser,
    key: process.env.SESSION_KEY,
    secret: process.env.SESSION_SECRET,
    success: onAuthorizeSuccess,
    fail: onAuthorizeFail,
    store: pgConfig
}))

io.on('connection', async (socket) => {

})