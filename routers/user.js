const express = require("express");
const router = express.Router({ mergeParams: true });
const Subreddit = require("../models/subreddit");
const Post = require("../models/post");
const user = require("../models/user");
const passport = require("passport");

const catchAsync = (func) => {
  return function (req, res, next) {
    func(req, res, next).catch(next);
  };
};

router.get(
  "/",
  catchAsync(async (req, res, next) => {
    const posts = await Post.find({});
    const subreddits = await Subreddit.find({});
    res.render("home", { posts, subreddits });
  })
);

router.get("/register", (req, res) => {
  res.render("register");
});

router.post("/register", async (req, res) => {
  const { email, username, password } = req.body;
  const user = await new User({ email, username });
  await User.register(user, password);
  req.login(user, (err) => {
    if (!err) {
      const returnURL = req.session.returnTo || "/";
      req.flash("success", "Successfully Registered");
      res.redirect(returnURL);
    }
  });
});

router.get("/login", (req, res) => {
  res.render("login");
});

router.get("/logout", (req, res) => {
  req.logout();
  req.flash("success", "Successfully Logged Out");
  res.redirect("/");
});

router.post(
  "/login",
  passport.authenticate("local", {
    failureFlash: true,
    failureRedirect: "/login",
  }),
  (req, res) => {
    const returnURL = req.session.returnTo || "/";
    req.flash("success", "Successfully LoggedIn");
    res.redirect(returnURL);
  }
);

router.get("/r/new", (req, res, next) => {
  res.render("newSubreddit");
});

router.post(
  "/r/new",
  catchAsync(async (req, res, next) => {
    const subreddit = new Subreddit(req.body);
    await subreddit.save();
    req.flash("success", "Successfully Created the Subreddit");
    res.redirect("/r/" + subreddit.name);
  })
);

module.exports = router;
