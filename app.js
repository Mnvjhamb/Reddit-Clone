const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const subredditRoutes = require("./routers/subreddit");
const postRoutes = require("./routers/posts");
const commentRoutes = require("./routers/comments");

const Post = require("./models/post");
const Subreddit = require("./models/subreddit");
const User = require("./models/user");
const session = require("express-session");

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
  next();
});

app.get(
  "/",
  catchAsync(async (req, res, next) => {
    const posts = await Post.find({});
    const subreddits = await Subreddit.find({});
    res.render("home", { posts, subreddits });
  })
);

app.get("/register", (req, res) => {
  res.render("register");
});

app.post("/register", async (req, res) => {
  const { email, username, password } = req.body;
  const user = await new User({ email, username });
  await User.register(user, password);
  req.login(user, (err) => {
    if (!err) {
      res.send("Successfully Registered");
    }
  });
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.post(
  "/login",
  passport.authenticate("local", {
    failureRedirect: "/login",
  }),
  (req, res) => {
    res.redirect("/");
  }
);

app.get("/r/new", (req, res, next) => {
  res.render("newSubreddit");
});

app.post(
  "/r/new",
  catchAsync(async (req, res, next) => {
    const subreddit = new Subreddit(req.body);
    await subreddit.save();
    res.redirect("/r/" + subreddit.name);
  })
);

app.use("/r/:subreddit/posts/:id/comments", commentRoutes);
app.use("/r/:subreddit/posts/:id", postRoutes);
app.use("/r/:subreddit", subredditRoutes);

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
