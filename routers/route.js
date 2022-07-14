require("dotenv").config();

const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");

const router = express.Router();
const Tutors = require("../models/TutorsSchema");
const Parents = require("../models/ParentsSchema");

const auth = require("../middleware/auth");

//Tutors-RESISTRATION
router.put("/TutorRegistration", async (req, res) => {
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

//Parents-REGISTRATION
router.put("/ParentRegistration", async (req, res) => {
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

//LOGIN
router.post("/login", async (req, res) => {
  try {
    //Find user
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

router.post("/refresh", (req, res) => {
  try {
    const decoded = jwt.verify(req.body.refresh, process.env.REFRESH_SECRET);
    console.log(decoded);

    const payload = {
      id: decoded.id,
      username: decoded.username,
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

//PARENT UPDATE (new child)
router.patch("/newChild", async (req, res) => {
    const parent = await Parents.findOneandUpdate(
      // { email: req.body.email }, search by jwt
      {$push: {children: {
        childName: req.body.children.childName
      }}}
    );
    res.json(parent);
  });
module.exports = router;
