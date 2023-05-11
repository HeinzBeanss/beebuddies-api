// Packages
require("dotenv").config();
const createError = require("http-errors");
const express = require("express");
const session = require("express-session");
const mongoose = require("mongoose");
const logger = require("morgan");
const cookieParser = require("cookie-parser");
const compression = require("compression");
const helmet = require("helmet");
const RateLimit = require("express-rate-limit");
const path = require('path');
var cors = require('cors');

// Models
const User = require("./models/user");
const Post = require("./models/post");
const Comment = require("./models/comment");

// Database Setup
const mongodb = process.env.MONGODB_URI || process.env.mongodb;
mongoose.connect(mongodb, { 
    useUnifiedTopology: true, 
    useNewUrlParser: true 
  });

// Routes
const apiRouter = require("./routes/api");

// Application
const app = express();

const limiter = RateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 20,
});
app.use(limiter);
app.use(compression()); // Compress all routes
app.use(helmet());

app.use(express.json());
app.use(cors());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


app.use("/api", apiRouter);

app.get("/", (req, res, next) => {
    res.redirect("/api");
});

// Catch 404 and forward to error handler
app.use(function(req, res, next) {
    next(createError(404));
});
  
// Error Handler
app.use(function(err, req, res, next) {
  // Set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // Render the error page
  res.status(err.status || 500);
  res.render('error');
});
  
// Listen on Port specified or fall back to 3000
app.listen(process.env.PORT || '4000');