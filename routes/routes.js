const express = require("express");
const router = express.Router();
const dbDriver = require("../db.js");
const jwt = require("jsonwebtoken");
const { tokenKey } = require("../key");
const auth = require("../middleware/auth");

router.post("/user/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await dbDriver.getUser({ username, password });
    if (!user) {
      return res
        .status(401)
        .send({ error: "Login failed! Check authentication credentials" });
    }
    const key = await jwt.sign({ id: user.id }, tokenKey);
    res.send({ login: user.login, key });
  } catch (error) {
    res.status(400).send(error);
  }
});

router.get("/me/", auth, async (req, res) => {
  try {
    const user = await dbDriver.getUserById({ id: req.userId });
    if (user) {
      return res.status(200).json({ user });
    } else {
      return res.status(401).json({ message: "Not authorized" });
    }
  } catch (error) {
    res.status(400).send(error);
  }
});

module.exports = router;
