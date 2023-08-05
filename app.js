var createError = require("http-errors");
var express = require("express");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
const cookie = require("cookie-session");
const flash = require("connect-flash");
const swaggerUI = require("swagger-ui-express");
const swaggerJsDoc = require("swagger-jsdoc");

const indexRouter = require("./v1/routes/index");
const usersRouter = require("./v1/routes/users");
const bookRouter = require("./v1/routes/booking");
const driverRouter = require("./Driver_modules/routes/driver");
const paymentRouter = require("./Driver_modules/routes/payment")

var app = express();
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




//Database connection with mongodb
const mongoose = require("./config/database");

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
app.use("/v1/driver", driverRouter);
app.use("/v1/payment" , paymentRouter)

const options = {

	definition: {
		openapi: "3.0.0",
		info: {
			title: "Library API",
			version: "1.0.0",
			description: "A simple Express Library API",
		},
		servers: [
			{
				url: "http://localhost:4001",
			},
		],
	},
	apis: ["./v1/routes/*.js" , "./Driver_modules/routes/*.js"],
};



const specs = swaggerJsDoc(options);
app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(specs));




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
