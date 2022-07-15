require("dotenv").config();

const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");

const router = express.Router();
const Tutors = require("../models/TutorsSchema");
const Parents = require("../models/ParentsSchema");

const auth = require("../middleware/auth");

//Tutors-REGISTRATION
router.put("/tutor/registration", async (req, res) => {
  try {
    const user = await Tutors.findOne({ email: req.body.email });
    if (user) {
      return res
        .status(400)
        .json({ status: "error", message: "duplicate email/username" });
    }
    const hash = await bcrypt.hash(req.body.password, 12);
    const createdTutor = await Tutors.create({
      email: req.body.email,
      hash,
      gender: req.body.gender,
      name: req.body.name,
      edulevel: req.body.edulevel,
      contact: {
        phone: req.body.contact.phone,
        address: req.body.contact.address,
      },
    });
    console.log("created user", createdTutor);
    res.json({ status: "ok", message: "user created" });
  } catch (error) {
    console.log("PUT /create", error);
    res.status(400),
      json({ status: "error", message: "an error has occurred" });
  }
});

//TUTOR LOGIN
router.post("/tutor/login", async (req, res) => {
  try {
    const tutor = await Tutors.findOne({ email: req.body.email });
    if (!tutor) {
      return res
        .status(400)
        .json({ status: "error", message: "not authorised" });
    }

    const result = await bcrypt.compare(req.body.password, tutor.hash);
    if (!result) {
      console.log("username or password error");
      return res.status(401).json({ status: "error", message: "login failed" });
    }

    const payload = {
      id: tutor._id,
      email: tutor.email,
      role: tutor.role,
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

//TUTOR REFRESH TOKEN
router.post("/tutor/refresh", (req, res) => {
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

//READ AVAILABLE JOBS
router.get("/jobs", auth, async (req, res) => {
  try {
    const jobs = await Parents.find({ availability: true });
  res.json(jobs);
  } catch (error) {
    res.status(401).json({
      status: "error",
      message: "can't find jobs",
    });
  }
  
});

//UPDATE PROFILE
router.patch("/tutor/registration", auth, async (req, res) => {
  const user = await Tutors.findOne({ email: "1234@gmail.com"});
  console.log("email doesnt work"); //can find by payload ID?

  const updateProfile = await Tutors.findOneAndUpdate(req.body.email, {
    email: req.body.email || user.email,
    hash: bcrypt.hash(req.body.password, 12) || user.hash,
    gender: req.body.gender || user.gender,
    name: req.body.name || user.name,
    edulevel: req.body.edulevel || user.edulevel,
    contact: {
      phone: req.body.contact.phone || user.phone,
      address: req.body.contact.address || user.address,
    },
  });
  res.json(updateProfile);
  //needto double check this
  // const hash = await bcrypt.hash(updateProfile.password, 12);
  // const updateHash = await Tutors.updateOne(user.hash, hash || user.hash);
});

// READ APPLIED JOBS
// router.get("/tutor/applied", auth, async (req, res) => {
//   //When the value of $exists operator is set to true, then this operator matches the document that contains the specified field(including the documents where the value of that field is null).
//   const user = await Tutors.find();
//   const applied = await Tutors.find({ jobCode: { $exists: true, $ne: [] } });
//   res.json(applied);
// });

//UPDATE APPLIED JOBS
router.patch("tutor/applied", auth, async (req, res) => {});

// READ (protected)
// router.get("/users", auth, async (req, res) => {
//   const users = await User.find().select("username");
//   res.json(users);
// });

module.exports = router;

