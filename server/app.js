require('dotenv').config({path: __dirname + '/../.env'});
const express = require('express');
const cors = require("cors");
const app = express();
const inProduction = process.env.NODE_ENV === "production";
const socket = require('socket.io');
const multer = require('multer');
const upload = multer();
const passport = require('passport');
const session = require('express-session');
const sslRedirect = require('heroku-ssl-redirect').default;
const path = require('path');
console.log("this is the port: " + process.env.PORT);
console.log("in production: " + inProduction);

// passportSetup will use the pool first, and then will be handed to app.js.
const db = require('./passportSetup');

app.use(sslRedirect());

const passportSocketIo = require('passport.socketio');
const cookieParser = require('cookie-parser');
const pgSession = require('connect-pg-simple')(session);
const pgConfig = new pgSession({
    pool: db,
    tableName: 'session'
})

if (inProduction) {

}

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

app.set('db', db);

app.use('/auth', require('./routes/auth'));
app.use('/admin', require('./routes/admin'));
app.use('/tutor', require('./routes/tutor'));
app.use('/course', require('./routes/course'));
app.use('/room', require('./routes/room'));

const server = app.listen(process.env.PORT);

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
    const user = socket.request.user;
    socket.on('courseId', courseId => {
        socket.join(courseId.toString());
        const numOfClients = io.sockets.adapter.rooms.get(courseId.toString()).size;
        if (numOfClients > 1) {
            io.emit('newclient', user._id);
        }
    })

    socket.on('callerPing', ping => {
        io.emit('callerPing', ping);
    })

    socket.on('calleePing', ping => {
        io.emit('calleePing', ping);
    })

    socket.on('offer', offer => {
        io.emit('offer', offer);
    })

    socket.on('answer', answer => {
        io.emit('answer', answer);
    })

    socket.on('callerCandidates', callerCandidates => {
        io.emit('callerCandidates', callerCandidates);
    })

    socket.on('calleeCandidates', calleeCandidates => {
        io.emit('calleeCandidates', calleeCandidates);
    })

    // format:
    // offer = {
    //     destination: userId,
    //     from: userId,
    //     content: content
    // }
    // answer = {
    //     destination: userId,
    //     from: userId,
    //     content: content
    // }
    // icecandidate = {
    //     destination: userId,
    //     from: userId,
    //     content: content
    // }

    socket.on('offer', offer => {
        io.emit('offer', offer);
    })

    socket.on('answer', answer => {
        io.emit('answer', answer);
    })

    socket.on('icecandidate', icecandidate => {
        io.emit('icecandidate', icecandidate);
    })
})
