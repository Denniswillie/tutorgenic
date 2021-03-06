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
    app.use(express.static('client/build'));
    app.get('/home', (req, res) => {
        res.sendFile(path.join(__dirname, '../client/build/index.html'));
    })
    app.get('/tutorDashboard', (req, res) => {
        res.sendFile(path.join(__dirname, '../client/build/index.html'));
    })
    app.get('/apply', (req, res) => {
        res.sendFile(path.join(__dirname, '../client/build/index.html'));
    })
    app.get('/admin', (req, res) => {
        res.sendFile(path.join(__dirname, '../client/build/index.html'));
    })
    app.get('/googlefailure', (req, res) => {
        res.sendFile(path.join(__dirname, '../client/build/index.html'));
    })
    app.get('/room/*', (req, res) => {
        res.sendFile(path.join(__dirname, '../client/build/index.html'));
    })
    app.get('/tutor/*', (req, res) => {
        res.sendFile(path.join(__dirname, '../client/build/index.html'));
    })
    app.get('/search/*', (req, res) => {
        res.sendFile(path.join(__dirname, '../client/build/index.html'));
    })
}

app.use(cookieParser())
app.use(express.json());
app.use(express.urlencoded({
    extended: true
}));

app.use(
    cors({
        origin: inProduction ? process.env.CLIENT_URL : process.env.DEV_CLIENT_URL,
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

const server = app.listen(inProduction ? process.env.PORT : 5000);

const io = socket(server, {
    cors: {
        origin: inProduction ? process.env.CLIENT_URL : process.env.DEV_CLIENT_URL,
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
    var roomId;
    socket.on('courseId', courseId => {
        roomId = courseId.toString();
        socket.join(roomId);
        const numOfClients = io.sockets.adapter.rooms.get(roomId).size;
        if (numOfClients > 1) {
            socket.to(roomId).emit('newclient', user._id);
        }
    })

    socket.on("send-changes", delta => {
        socket.to(roomId).emit("receive-changes", delta)
    })

    socket.on('disconnect', () => {
        io.in(roomId).emit('disconnected', user._id);
    })

    socket.on('callerPing', ping => {
        socket.to(roomId).emit('callerPing', ping);
    })

    socket.on('calleePing', ping => {
        socket.to(roomId).emit('calleePing', ping);
    })

    socket.on('offer', offer => {
        socket.to(roomId).emit('offer', offer);
    })

    socket.on('answer', answer => {
        socket.to(roomId).emit('answer', answer);
    })

    socket.on('callerCandidates', callerCandidates => {
        socket.to(roomId).emit('callerCandidates', callerCandidates);
    })

    socket.on('calleeCandidates', calleeCandidates => {
        socket.to(roomId).emit('calleeCandidates', calleeCandidates);
    })
})
