const mongoose = require("mongoose");

const contactSchema = new mongoose.Schema(
  {
    facebookLink: {
      type: String,
      required: true,
      default: null
    },
    instagramLink: {
      type: String,
      required: true,
      default: null
    },
    twitterLink: {
      type: String,
      required: true,
      default: null
    },
    contactNo: [{ 
      type: Number,
      required: true,
    }]
  },
  { timestamps: true }
);

const Contact = mongoose.model("Contact", contactSchema);
module.exports = User;
