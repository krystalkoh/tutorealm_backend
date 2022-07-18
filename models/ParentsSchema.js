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
    contact: {
      phone: { type: String, required: true },
      address: { type: String, required: true },
    },
    assignments: [
      {
        jobID: {type: Number, default: Date.now()},
        childName: {
          type: String,
          required: true,
          default: "name of child",
        },
        level: {
          type: String,
          enum: [
            "select",
            "P1",
            "P2",
            "P3",
            "P4",
            "P5",
            "P6",
            "Sec 1",
            "Sec 2",
            "Sec 3",
            "Sec 4",
            "Sec 5",
            "JC1",
            "JC2",
          ],
          required: true,
          default: "select",
        },
        subject: [{ type: String, default: "" }],
        time: [{ duration: String, frequency: String, days: String, default: "" }],
        rate: { type: String, default: "" },
        availability: { type: Boolean, default: true },
      },
    ],
    role: { type: String, default: "Parent" },
  },
  { collection: "parents" }
);

const Parents = mongoose.model("parents", ParentsSchema);

module.exports = Parents;
