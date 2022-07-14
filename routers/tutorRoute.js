require("dotenv").config();

const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");

const router = express.Router();
const Tutors = require("../models/TutorsSchema");

const auth = require("../middleware/auth");

//Tutors-RESISTRATION
router.put("/tutor/registration", async (req, res) => {
  try {
    const user = await Tutors.findOne({ email: req.body.email });
    if (user) {
      return res
        .status(400)
        .json({ status: "error", message: "duplicate email/username" });
    }
    const hash = await bcrypt.hash(req.body.password, 12); //12 times salt
    const createdTutor = await Tutors.create({
      email: req.body.email,
      hash,
      //gender: for later
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
      role: tutor.role
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
    console.log("POST /login", error); //for server
    res.status(400).json({ status: "error", message: "login failed" }); //for client
  }
});

//Tutor refresh
router.post("/tutor/refresh", (req, res) => {
  try {
    const decoded = jwt.verify(req.body.refresh, process.env.REFRESH_SECRET);
    console.log(decoded);

    const payload = {
      id: decoded._id,
      email: decoded.email,
      role: decoded.role
    };

    const access = jwt.sign(payload, process.env.ACCESS_SECRET, {
      //create access token
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

// READ (protected)
router.get("/users", auth, async (req, res) => {
  const users = await User.find().select("username");
  res.json(users);
});

module.exports = router;
