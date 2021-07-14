const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const subredditRoutes = require("./routers/subreddit");
const postRoutes = require("./routers/posts");
const commentRoutes = require("./routers/comments");

const app = express();

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/reddit", {
  useCreateIndex: true,
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

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

app.get(
  "/",
  catchAsync(async (req, res, next) => {
    const posts = await Post.find({});
    const subreddits = await Subreddit.find({});
    res.render("home", { posts, subreddits });
  })
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
