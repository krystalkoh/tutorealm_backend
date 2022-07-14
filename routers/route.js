require("dotenv").config();

const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");

const router = express.Router();
const User = require("../models/User");
const auth = require("../middleware/auth");

//LOGIN
router.post("/login", async (req, res) => {
  try {
    //Find user
    const user = await User.findOne({ username: req.body.username });
    if (!user) {
      return res
        .status(400)
        .json({ status: "error", message: "not authorised" });
    }

    const result = await bcrypt.compare(req.body.password, user.hash);
    if (!result) {
      console.log("username or password error");
      return res.status(401).json({ status: "error", message: "login failed" });
    }

    const payload = {
      id: user._id,
      username: user.username,
    };

    const access = jwt.sign(payload, process.env.ACCESS_SECRET, {
      expiresIn: "10s",
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

//RESISTRATION
router.put("/create", async (req, res) => {
  try {
    const user = await User.findOne({ username: req.body.username });
    if (user) {
      return res
        .status(400)
        .json({ status: "error", message: "duplicate username" });
    }
    const hash = await bcrypt.hash(req.body.password, 12); //12 times salt
    const createdUser = await User.create({
      username: req.body.username,
      hash,
    });
    console.log("created user", createdUser);
    res.json({ status: "ok", message: "user created" });
  } catch (error) {
    console.log("PUT /create", error);
    res.status(400),
      json({ status: "error", message: "an error has occurred" });
  }
});

// READ (protected)
router.get("/users", auth, async (req, res) => {
  const users = await User.find().select("username");
  res.json(users);
});

module.exports = router;