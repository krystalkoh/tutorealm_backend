require("dotenv").config();

const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");

const router = express.Router();

const Parents = require("../models/ParentsSchema");
const Tutors = require("../models/TutorsSchema");

const auth = require("../middleware/auth");

//Parents-REGISTRATION
router.put("/parent/registration", async (req, res) => {
  try {
    const user = await Parents.findOne({ email: req.body.email });
    if (user) {
      return res
        .status(400)
        .json({ status: "error", message: "duplicate email/username" });
    }
    const hash = await bcrypt.hash(req.body.password, 12); //12 times salt
    const createdParent = await Parents.create({
      email: req.body.email,
      hash,
      parentName: req.body.parentName,
      contact: {
        phone: req.body.contact.phone,
        address: req.body.contact.address,
      },
    });
    console.log("created user", createdParent);
    res.json({ status: "ok", message: "user created" });
  } catch (error) {
    console.log("PUT /create", error);
    res.status(400),
      json({ status: "error", message: "an error has occurred" });
  }
});

//PARENT LOGIN
router.post("/parent/login", async (req, res) => {
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
router.post("/parent/refresh", (req, res) => {
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

//CREATE JOB
router.put("/create", auth, async (req, res) => {
  const jobCreated = await Parents.create(req.body);
  res.json({ status: "ok", message: "created" });
});

//READ CREATED JOBS
router.get("/create", auth, async (req, res) => {
  const createdJobList = await Parents.find();
  if (createdJobList.length > 0) {
    res.json(createdJobList);
  } else {
    res.json({ status: "warning", message: "no data found" });
  }
});

//READ ALL TUTORS WHO APPLIED
router.get("/application", async (req, res) => {
  const tutorList = await Parents.find//(key)
});

//UPDATE JOB ASSIGNMENT AVAILABLITY
router.patch("/availableJobs/update", async (req, res) => {
  const updateJobs = await Parents.findOneAndUpdate({});
});

//READ TUTORS WHO APPLIED
router.get("/tutorApplications", async (req, res) => {
  const tutorApps = await Tutors.find();
});

//READ FULL TUTOR PROFILE

//UPDATE PERSONAL DETAILS
router.patch("/parent/registration", auth, async (req, res) => {
  try {
    // const hash = await bcrypt.hash(req.body.password, 12);
    const parentUser = await Parents.findOne(req.decoded.email);
    const updateParentProf = await Parents.findOneAndUpdate({
      email: req.body.email || parentUser.email,
      hash, //bcrypt.hash(req.body.password, 12) || parentUser.hash, ??
      parentName: req.body.parentName || parentUser.parentName,
      contact: {
        phone: req.body.contact.phone || parentUser.phone,
        address: req.body.contact.address || parentUser.address,
      },
    });
    console.log("created user", updateParentProf);
    res.json({ status: "ok", message: "user updated" });
    //res.json(updateParentProf)
    //cosnt hash = await bcrypt.hash(parentUserpassword, 12);
    //const updateHash = await Tutors.updateOne(user.hash, hash);
  } catch (error) {
    console.log("PATCH /update", error);
    res
      .status(400)
      .json({ status: "error", message: "parent personal info update failed" });
  }
});

//UPDATE (NEW ASSIGNMENT)
router.patch("/newAssignment", async (req, res) => {
  const parent = await Parents.findOneandUpdate(
    { email: req.body.email },
    {
      $push: {
        assignment: req.body.assignment,
      },
    }
  );
  res.json(parent);
});
module.exports = router;
