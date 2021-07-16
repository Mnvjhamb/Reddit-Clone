const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const subredditRoutes = require("./routers/subreddit");
const postRoutes = require("./routers/posts");
const commentRoutes = require("./routers/comments");
const userRoutes = require("./routers/user");

const Post = require("./models/post");
const Subreddit = require("./models/subreddit");
const User = require("./models/user");

const session = require("express-session");
const flash = require("connect-flash");

const passport = require("passport");
const localStrategy = require("passport-local");

const app = express();

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/reddit", {
  useCreateIndex: true,
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

app.use(
  session({
    secret: "Thisisasecret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
      maxAge: 1000 * 60 * 60 * 24 * 7,
    },
  })
);
app.use(flash());

const catchAsync = (func) => {
  return function (req, res, next) {
    func(req, res, next).catch(next);
  };
};

class ExpressError extends Error {
  constructor(message, status) {
    super();
    this.message = message;
    this.status = status;
  }
}

app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate()));

passport.serializeUser(function (user, done) {
  done(null, user.id);
});

passport.deserializeUser(function (id, done) {
  User.findById(id, function (err, user) {
    done(err, user);
  });
});

app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.subreddit = null;
  res.locals.post = null;
  next();
});

app.use("/r/:subreddit/posts/:id/comments", commentRoutes);
app.use("/r/:subreddit/posts/:id", postRoutes);
app.use("/r/:subreddit", subredditRoutes);
app.use("/", userRoutes);

app.all("*", (req, res, next) => {
  next(new ExpressError("Page not found", 404));
});

app.use((err, req, res, next) => {
  const { status = 500, message = "SOMTHING WENT WRONg" } = err;
  console.log(err);
  res.status(status).send(message);
});

app.listen("3000", () => {
  console.log("Server started at port 3000");
});
