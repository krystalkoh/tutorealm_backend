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
    parentName: {
      type: String,
      required: true,
    },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    role: { type: String, default: "Parent" },
  },
  { collection: "parents" }
);

const Parents = mongoose.model("Parent", ParentsSchema);

module.exports = Parents;
