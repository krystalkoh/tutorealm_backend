// const mongoose = require("mongoose");

// const AssignmentsSchema = new mongoose.Schema(
//     {
//         // jobKey: {type: Number, default: Date.now()},
//         // parentSourceName: {type: mongoose.Schema.Types.ObjectId, ref: "Parents"},
//         parentJobID: {type: Number, default: Date.now()}, 
//         // appliedJobID: { type: Number, default: Date.now()},
//         childName: {
//           type: String,
//           required: true,
//           default: "name of child",
//         },
//         level: {
//           type: String,
//           enum: [
//             "P1",
//             "P2",
//             "P3",
//             "P4",
//             "P5",
//             "P6",
//             "Sec 1",
//             "Sec 2",
//             "Sec 3",
//             "Sec 4",
//             "Sec 5",
//             "JC1",
//             "JC2",
//           ],
//           required: true,
//           default: "",
//         },
//         subject: [{ type: String, default: "" }],
//         duration: {type: String, default: ""}, 
//         frequency: {type: String, default: ""}, 
//         days: {type: String, default: ""},
//         rate: { type: String, default: "" },
//         availability: { type: Boolean, default: true },
//       },
//   { collection: "assignments" }
// );

// const Assignments = mongoose.model("Assignments", AssignmentsSchema);

// module.exports = Assignments;
