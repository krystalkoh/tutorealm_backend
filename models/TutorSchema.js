const mongoose = require("mongoose");

const TutorSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    gender: {
      type: String,
      enum: ["male", "female", "non-binary"]
  },
    hash: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    edulevel: {
      type: String,
      required: true,
    },
    contact: {
      phone: { type: String, required: true },
      address: { type: String, required: true },
    },
  },
  { collection: "tutors" }
);

const Tutor = mongoose.model("Tutor", TutorSchema);

module.exports = Tutor;
