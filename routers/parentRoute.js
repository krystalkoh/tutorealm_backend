require("dotenv").config();

const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");

const router = express.Router();
const Parents = require("../models/ParentsSchema");
const Tutors = require("../models/TutorsSchema");

const auth = require("../middleware/auth");
const { hash } = require("bcrypt");

//Parents-REGISTRATION
router.put("/registration", async (req, res) => {
  try {
    const user = await Parents.findOne({ email: req.body.email });
    if (user) {
      return res
        .status(400)
        .json({ status: "error", message: "duplicate email/username" });
    }
    const hash = await bcrypt.hash(req.body.password, 12);
    const createdParent = await Parents.create({
      email: req.body.email,
      hash,
      parentName: req.body.parentName,
      phone: req.body.phone,
      address: req.body.address,
      role: undefined,
      // jobCreationID: 0,
    });
    console.log("created user", createdParent);
    res.json({ status: "ok", message: "user created" });
  } catch (error) {
    console.log("PUT /create", error);
    res.status(400).json({ status: "error", message: "an error has occurred" });
  }
});

//Parent-LOGIN
router.post("/login", async (req, res) => {
  try {
    const parent = await Parents.findOne({ email: req.body.email });
    if (!parent) {
      return res
        .status(400)
        .json({ status: "error", message: "not authorised" });
    }

    const result = await bcrypt.compare(req.body.password, parent.hash);
    if (!result) {
      console.log("username or password error");
      return res.status(401).json({ status: "error", message: "login failed" });
    }

    const payload = {
      id: parent._id,
      email: parent.email,
      role: parent.role,
    };

    const access = jwt.sign(payload, process.env.ACCESS_SECRET, {
      expiresIn: "20m",
      jwtid: uuidv4(),
    });

    const refresh = jwt.sign(payload, process.env.REFRESH_SECRET, {
      expiresIn: "30d",
      jwtid: uuidv4(),
    });

    const response = { access, refresh };

    res.json(response);
  } catch (error) {
    console.log("POST /login", error);
    res.status(400).json({ status: "error", message: "login failed" });
  }
});

//PARENT REFRESH TOKEN
router.post("/refresh", (req, res) => {
  try {
    const decoded = jwt.verify(req.body.refresh, process.env.REFRESH_SECRET);
    console.log(decoded);

    const payload = {
      id: decoded._id,
      email: decoded.email,
      role: decoded.role,
    };

    const access = jwt.sign(payload, process.env.ACCESS_SECRET, {
      expiresIn: "20m",
      jwtid: uuidv4(),
    });

    const response = { access };
    res.json(response);
  } catch (error) {
    console.log("POST/ refresh", error);
    res.status(401).json({
      status: "error",
      message: "unauthorised",
    });
  }
});

//UPDATE (CREATE NEW ASSIGNMENT)
router.patch("/create", auth, async (req, res) => {
  // console.log(req.decoded.email);
  // maybe throw in try {} catch () {}
  const createJob = await Parents.findOneAndUpdate(
    { email: req.decoded.email },
    {
      $push: {
        assignments: {
          childName: req.body.childName,
          level: req.body.level,
          subject: req.body.subject,
          duration: req.body.duration,
          frequency: req.body.frequency,
          days: req.body.days,
          rate: req.body.rate,
        },
      },
    },
    { new: true }
  );
  // console.log(createJob);
  res.json(createJob);
});

//READ CREATED JOBS CHEAT CODE: NO FALSE ASSIGNMENTS
router.get("/created", auth, async (req, res) => {
  console.log(`accessing get assignments endpoint`);
  try {
    const createdJobList = await Parents.find({
      "assignments.availability": true,
    });
    console.log(createdJobList);

    // if (createdJobList.length > 0) {
    res.json(createdJobList);
    // } else {
    //   res.json({ status: "warning", message: "no data found" });
    // }
  } catch (error) {
    console.log(error);
    res.status(500).json({ status: "not ok", message: "error has occurred" });
  }
});

//READ CREATED JOBS
// router.get("/createdagg", auth, async (req, res) => {
//   console.log(`accessing get assignments endpoint`);
//   try {
//     const createdJobList = await Parents.find({
//       assignments: { $elemMatch: { availability: { $eq: true } } },
//     });
//     console.log(createdJobList);

//     const availJobs = createdJobList.map((item) => {
//       for (const assignment of item) {
//         console.log(`${assignment}`);
//       }
//     });

// PLEASE GOD
// console.log(`this is filtered ${availJobs}`);

// if (createdJobList.length > 0) {
// res.json(createdJobList);
// } else {
//   res.json({ status: "warning", message: "no data found" });
// }
//   } catch (error) {
//     console.log(error);
//     res.status(500).json({ status: "not ok", message: "error has occurred" });
//   }
// });

//TUTORS WHO CLICKED APPLY
router.patch("/tutorApplied", (req, res) => {
  //jobID from Parents collection will be pushed/populate into Tutors collection appliedJobID array.
});

// READ ALL TUTORS WHO APPLIED -- Need to access Tutors collection to retrieve jobID
// router.post("/tutorsApplied/:id", auth, async (req, res) => {
//   const tutorList = await Tutors.find({
//     appliedJobId: { $contains: req.params.id },
//   });
//   res.json(tutorList);
// });

//UPDATE JOB ASSIGNMENT AVAILABLITY / true false, approving/rejecting application
router.patch("/availableJobs/approval", async (req, res) => {
  const updateJobs = await Parents.findOneAndUpdate(
    { jobID: req.body.jobID },
    { availability: false }
  );
  res.json(updateJobs);
});

//EDITING JOB ASSIGNMENT PROPER
router.patch("/availableJobs/edit", auth, async (req, res) => {
  try {
    const user = await Parents.findOne({ email: req.decoded.email });
    const editJobs = await Parents.findOneAndUpdate(
      { jobID: req.body.jobID },
      {
        $set: {
          assignments: {
            childName:
              req.body.assignments.childName || user.assignments.childName,
            level: req.body.assignments.level || user.assignments.level,
            // subject:
          },
        },
      },
      { new: true }
    );
    console.log("edit jobs", editJobs);
    res.json({ status: "ok", message: "edit successful" });
    res.json(editJobs);
  } catch (error) {
    console.log("PATCH /edit", error);
    res.status(401).json({ status: "error", message: "edit unsuccessful" });
  }
});

//DELETING JOB ASSIGNMENT
// router.delete("/parent/removeJob", auth, async (req, res) => {
//   const shredderMech = await Parents.delete();
// });

//READ TUTORS WHO APPLIED
// router.get("/parent/tutorApplications", auth, async (req, res) => {
//   const tutorApps = await Tutors.find//({tutor application key});
// });

//READ FULL TUTOR PROFILE
//router.get("/parent/tutorProfileFull", ayth, async (req, res) => {

// })

//UPDATE PERSONAL DETAILS
router.patch("/registration", auth, async (req, res) => {
  try {
    const parentUser = await Parents.findOne({ email: req.decoded.email });
    if (!parentUser) {
      return res
      .status(400)
      .json({ status: "error", message: "unauthorized" });
    };
    const updateParentProf = await Parents.findOneAndUpdate(
      { email: req.decoded.email },
      {
        $set: {
          email: req.body.email || parentUser.email,
          // make one for password in long term goal
          parentName: req.body.parentName || parentUser.parentName,
          phone: req.body.phone || parentUser.phone,
          address: req.body.address || parentUser.address,
        },
      },
      { new: true }
    );
    console.log("updated user", updateParentProf);
    res.json(updateParentProf);
  } catch (error) {
    console.log("PATCH /update", error);
    res
      .status(401)
      .json({ status: "error", message: "parent personal info update failed" });
  }
});

module.exports = router;
