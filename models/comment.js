const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema({
  body: String,
  upvotes: Number,
  downvotes: Number,
  //   author: {
  //     type: mongoose.Schema.Types.ObjectId,
  //     ref: "User",
  //   },
});

module.exports = mongoose.model("Comment", commentSchema);
