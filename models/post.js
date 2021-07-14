const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
  title: String,
  body: String,
  subreddit: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Subreddit",
  },
  upvotes: Number,
  downvotes: Number,
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

module.exports = mongoose.model("Post", postSchema);
