const express = require("express");
const router = express.Router({ mergeParams: true });
const Comment = require("../models/comment");
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
    req.session.returnTo = req.originalUrl;
    req.flash("error", "Please Login");
    res.redirect("/login");
  }
};

router.post(
  "/new",
  isLoggedIn,
  catchAsync(async (req, res, next) => {
    console.log(req.body);
    const { id } = req.params;
    const comment = new Comment(req.body);
    comment.upvotes = 0;
    comment.downvotes = 0;
    await comment.save();
    const post = await Post.findById(id).populate("comments");
    post.comments.push(comment);
    await post.save();
    console.log(post);
    req.flash("success", "Comment Added");
    res.redirect("/r/" + req.params.subreddit + "/posts/" + req.params.id);
  })
);

router.get(
  "/:commentId/upvote",
  isLoggedIn,
  catchAsync(async (req, res, next) => {
    const comment = await Comment.findById(req.params.commentId);
    console.log(comment);
    if (comment.upvotes >= 0 || comment.upvotes) {
      comment.upvotes += 1;
    } else {
      comment.upvotes = 0;
    }

    await comment.save();
    res.redirect("/r/" + req.params.subreddit + "/posts/" + req.params.id);
  })
);
router.get(
  "/:commentId/downvote",
  isLoggedIn,
  catchAsync(async (req, res, next) => {
    const comment = await Comment.findById(req.params.commentId);
    if (comment.downvotes >= 0 || comment.downvotes) {
      comment.downvotes += 1;
    } else {
      comment.downvotes = 0;
    }

    await comment.save();
    res.redirect("/r/" + req.params.subreddit + "/posts/" + req.params.id);
  })
);

module.exports = router;
