
var express = require('express');
var path = require('path');
const bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
const crypto = require('crypto');
var logger = require('morgan');
const http = require('http')
const { Server } = require('socket.io')
const db = require('./db/db_config')
const mysql = require('mysql')
const socket = require('./routes/socket')
const fs = require('fs')
const session = require('express-session')
var flash = require('connect-flash');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var cobaRouter = require('./routes/coba');

var app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

db.connect(err => {
  if (err) throw err;
})
const server = http.createServer(app)
const io = new Server(server)

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret: 'personaBlog',
  resave: true,
  saveUninitialized: true,
  cookie: { maxAge: 60000 },
}))
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/coba', cobaRouter);
socket(io)

server.listen(2500, () => console.log("App run in port 2500"))

module.exports = app;
