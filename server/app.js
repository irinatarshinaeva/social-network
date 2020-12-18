require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const usersRouter = require('./src/routes/users');
const postsRouter = require('./src/routes/posts');
const dbConnect = require('./src/config/db');
const http = require("http");
const cors = require('cors');

const app = express();

const server = http.createServer(app);
const socket = require("socket.io");
const io = socket(server);



io.on("connection", socket => {
  // console.log(socket);
    socket.emit("your id", socket.id);
    socket.on("send message", body => {
      // console.log(body);
        io.emit("message", body)
    })
})


// const PORT = process.env.PORT || 8000;
dbConnect();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors({
  origin: 'http://localhost:8000',
  credentials: true
}))

app.use(
  session({
    name: 'sid',
    secret: process.env.SECRETSESSION,
    resave: false,
    store: new MongoStore({
      mongooseConnection: mongoose.connection,
      collection: 'sessions',
    }),
    saveUninitialized: false,
    cookie: { secure: false },
  })
);

app.use((req, res, next) => {
  res.locals.login = req.session?.user?.login;
  res.locals.id = req.session?.user?.id;
  next();
});

app.use('/', postsRouter);
app.use('/users', usersRouter);




server.listen(8000, () => console.log("Server is running on port 8000"));
