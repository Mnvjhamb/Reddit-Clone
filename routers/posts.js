const express = require("express");
const router = express.Router({ mergeParams: true });
const mongoose = require("mongoose");
const Post = require("../models/post");

const catchAsync = (func) => {
  return function (req, res, next) {
    func(req, res, next).catch(next);
  };
};

const isLoggedIn = (req, res, next) => {
  if (req.user) {
    next();
  } else {
    res.redirect("/login");
  }
};

router.get(
  "/",
  catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const post = await Post.findById(id)
      .populate("comments")
      .populate("subreddit");
    console.log(post);
    res.render("post", { post });
  })
);

router.get(
  "/upvote",
  isLoggedIn,
  catchAsync(async (req, res, next) => {
    const post = await Post.findById(req.params.id);
    console.log(post);
    if (post.upvotes >= 0 || post.upvotes) {
      post.upvotes += 1;
    } else {
      post.upvotes = 0;
    }
    await post.save();
    res.redirect("/r/" + req.params.subreddit + "/posts/" + req.params.id);
  })
);
router.get(
  "/downvote",
  isLoggedIn,
  catchAsync(async (req, res, next) => {
    const post = await Post.findById(req.params.id);
    if (post.downvotes >= 0 || post.downvotes) {
      post.downvotes += 1;
    } else {
      post.downvotes = 0;
    }
    await post.save();
    res.redirect("/r/" + req.params.subreddit + "/posts/" + req.params.id);
  })
);

router.get(
  "/delete",
  isLoggedIn,
  catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const post = await Post.findByIdAndDelete(id);
    for (var comment of post.comments) {
      await Comment.findByIdAndDelete(comment._id);
    }
    res.redirect("/");
  })
);

module.exports = router;
