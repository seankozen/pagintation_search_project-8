var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

const sequelize = require('./models').sequelize;
const pug = require('pug');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var booksRouter = require('./routes/books');
const { Console } = require('console');

var app = express();

// Add static middleware
app.use('/static', express.static('public'));

// view engine setup
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);      //Use index.js routes
app.use('/books', booksRouter); //Use book.js routes


(async() => {
  try {
    await sequelize.authenticate();
    console.log('Connection has been established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }

})();

// catch 404 and forward to error handler
app.use((req, res, next) => {
  const error = new Error("The page you are looking for does not exist.");
  error.status = 404;
  res.status(404).render("page-not-found", {error});
  next(error);
});

// error handler
app.use(function(err, req, res, next) {
  if(err.status === 404) {
    console.log("There has been a 404 error");
    res.render("page-not-found", {err});
  } else {
    err.message = err.message || "Something is wrong with the server.";
    res.locals.error = err;
    // render the error page
    res.status(err.status || 500);
    res.render('error', {err});
    console.log("Error 500: Global error handler called.")
  }
});

module.exports = app;