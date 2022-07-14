const mongoose = require("mongoose");

const ParentsSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    hash: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    level: {
      type: String,
      required: true
    },
    subject: [{type: String}],
    edulevel: {
      type: String,
      required: true
    },
    time: [{frequency: String, duration: String}],
    rate: {type: String},
  },
  { collection: "parents" }
);

const Parents = mongoose.model("parents", ParentsSchema);

module.exports = Parents;