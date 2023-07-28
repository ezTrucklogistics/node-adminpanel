var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
const cors = require("cors");
const cookie = require("cookie-session");
const flash = require("connect-flash");


//swagger
const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("./swagger.json");


const indexRouter = require("./v1/routes/index");
const usersRouter = require("./v1/routes/users.rout");
const bookRouter = require("./v1/routes/booking.rout");
const driverRouter = require("./Driver_modules/routes/driver.rout");
var app = express();

app.use(express.static(path.join(__dirname, "public")));
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(flash());

app.use(
  cookie({
    // Cookie config, take a look at the docs...
    secret: "I Love India...",
    resave: false,
    saveUninitialized: true,
    cookie: {
      secure: true,
    },
  })
);

//swagger
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));



//Database connection with mongodb
const mongoose = require("./config/database");

app.use(cors());
app.use(logger("dev"));
app.use(express.json());
app.use(
  express.urlencoded({
    extended: false,
  })
);
app.use(cookieParser());

app.use("/", indexRouter);
app.use("/v1/users", usersRouter);
app.use("/v1/book", bookRouter);
app.use("/v1/driver",driverRouter)


// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  console.log("err..........", err);
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});




module.exports = app;
