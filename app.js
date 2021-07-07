const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const app = express();

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));

mongoose.connect("mongodb://localhost:27017/reddit", {
  useCreateIndex: true,
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const commentSchema = new mongoose.Schema({
  body: String,
  //   author: {
  //     type: mongoose.Schema.Types.ObjectId,
  //     ref: "User",
  //   },
});

const Comment = mongoose.model("Comment", commentSchema);

const postSchema = new mongoose.Schema({
  title: String,
  body: String,
  subreddit: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Subreddit",
  },
  //   author: {
  //     type: mongoose.Schema.Types.ObjectId,
  //     ref: "User",
  //   },
  comments: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
    },
  ],
});

const subredditSchema = new mongoose.Schema({
  name: String,
  posts: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
    },
  ],
});

const Subreddit = mongoose.model("Subreddit", subredditSchema);

const Post = mongoose.model("Post", postSchema);

app.get("/", async (req, res) => {
  const posts = await Post.find({});
  const subreddits = await Subreddit.find({});
  res.render("home", { posts, subreddits });
});

app.get("/r/:subreddit/new", (req, res) => {
  const { subreddit } = req.params;
  res.render("new", { subreddit });
});

app.post("/r/:subreddit/new", async (req, res) => {
  const { subreddit } = req.params;
  const sub = await Subreddit.findOne({ name: subreddit });
  const post = await new Post(req.body);
  post.subreddit = sub;
  sub.posts.push(post);
  await sub.save();
  await post.save();
  res.redirect("/r/" + subreddit);
});

app.get("/posts/:id", async (req, res) => {
  const { id } = req.params;
  const post = await Post.findById(id).populate("comments");
  console.log(post);
  res.render("post", { post });
});

app.get("/r/new", (req, res) => {
  res.render("newSubreddit");
});

app.get("/r/:sub", async (req, res) => {
  const subreddit = await Subreddit.findOne({ name: req.params.sub }).populate(
    "posts"
  );
  if (subreddit) {
    res.render("subreddit", { subreddit });
  } else {
    res.send("NO SUBREDDIT FOUND");
  }
});

app.post("/r/new", async (req, res) => {
  const subreddit = new Subreddit(req.body);
  await subreddit.save();
  res.redirect("/r/" + subreddit.name);
});

app.get("/posts/:id/delete", async (req, res) => {
  const { id } = req.params;
  const post = await Post.findByIdAndDelete(id);
  for (var comment of post.comments) {
    await Comment.findByIdAndDelete(comment._id);
  }
  res.redirect("/");
});

app.post("/posts/:id/comments/new", async (req, res) => {
  console.log(req.body);
  const { id } = req.params;
  const comment = new Comment(req.body);
  await comment.save();
  const post = await Post.findById(id).populate("comments");
  post.comments.push(comment);
  await post.save();
  console.log(post);
  res.redirect("/posts/" + id);
});

app.listen("3000", () => {
  console.log("Server started at port 3000");
});
