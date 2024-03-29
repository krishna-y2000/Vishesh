var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/user');
var app = express();
var methodOverride = require('method-override');
const PORT = process.env.PORT||3000;
var sendEmail = require('./routes/sendEmail');
app.locals.moment = require("moment");
// view engine setup

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(logger('dev'));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/public'));
app.use(express.json());
app.use(methodOverride('_method'))
app.use(cookieParser());
app.use('/', indexRouter);
app.use('/user', usersRouter);
app.use('/sendEmail',sendEmail );
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

if(!PORT)
{
  console.log("PORT not found");
}
app.listen(PORT, () => console.log(`Server at ${PORT}`)); 

module.exports = app;