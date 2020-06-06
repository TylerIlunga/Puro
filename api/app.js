const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const express = require('express');
const eSession = require('express-session');
const logger = require('morgan');
const routes = require('./src/routes');
const { jwt, session } = require('./src/config');
const app = express();
const sessionStore = new eSession.MemoryStore();
const oneHour = new Date().getTime() + 60 * 60 * 1000;

app.use(cookieParser(jwt.J_SECRET));
// app.use(
//   cors({
//     credentials: true,
//     origin: ['http://127.0.0.1:1111'],
//   }),
// );
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(logger('dev'));
app.use(
  // NOTE: Use https://github.com/roccomuso/memorystore#readme for PROD
  eSession({
    name: 'p_sid',
    cookie: { maxAge: oneHour, httpOnly: false },
    store: sessionStore,
    saveUninitialized: false,
    resave: true,
    secret: session.S_SECRET,
  }),
);
app.use('/', routes);

module.exports = app;
