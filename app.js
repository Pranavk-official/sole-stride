require('dotenv').config()
const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const expressLayouts = require('express-ejs-layouts');
const logger = require('morgan');
const connectDB = require('./src/config/db');
const authRouter = require('./src/routes/auth');
const adminRouter = require('./src/routes/admin');
const shopRouter = require('./src/routes/shop');
const usersRouter = require('./src/routes/users');

const app = express();
connectDB();
// view engine setup
app.use(expressLayouts)
app.set('layout', './layouts/userLayout.ejs');
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Middlewares
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', authRouter);
app.use('/', usersRouter);
app.use('/', shopRouter);
app.use('/admin', adminRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
