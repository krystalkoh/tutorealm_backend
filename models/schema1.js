const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },
    hash: {
      type: String,
      required: true,
    },
  },
  { collection: "users" }
);

const User = mongoose.model("User", UserSchema);

module.exports = User;