const mongoose = require("mongoose");

const TutorsSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    gender: {
      type: String,
      enum: ["male", "female", "non-binary"],
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
    phone: { type: String, required: true },
    address: { type: String, required: true },
    role: { type: String, default: "Tutor" },
    appliedJobId: [{ type: Number, default: Date.now() }],
  },
  { collection: "tutors" }
);

const Tutors = mongoose.model("Tutor", TutorsSchema);

module.exports = Tutors;
