const mongoose = require("mongoose");
const blogSchema = new mongoose.Schema(
  {
    heading: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    contentImage: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

const Blog = mongoose.model("Blog", blogSchema);
module.exports = Blog;
