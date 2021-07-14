const express = require("express");
const router = express.Router({ mergeParams: true });
const Subreddit = require("../models/subreddit");

const catchAsync = (func) => {
  return function (req, res, next) {
    func(req, res, next).catch(next);
  };
};

router.get(
  "/",
  catchAsync(async (req, res, next) => {
    const subreddit = await Subreddit.findOne({
      name: req.params.subreddit,
    }).populate("posts");
    if (subreddit) {
      res.render("subreddit", { subreddit });
    } else {
      res.send("NO SUBREDDIT FOUND");
    }
  })
);

router.get("/new", (req, res, next) => {
  const { subreddit } = req.params;
  res.render("new", { subreddit });
});

router.post(
  "/new",
  catchAsync(async (req, res, next) => {
    const { subreddit } = req.params;
    const sub = await Subreddit.findOne({ name: subreddit });
    const post = await new Post(req.body);
    post.subreddit = sub;
    post.upvotes = 0;
    post.downvotes = 0;
    sub.posts.push(post);
    await sub.save();
    await post.save();
    res.redirect("/r/" + subreddit);
  })
);

module.exports = router;
