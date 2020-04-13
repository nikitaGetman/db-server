const express = require("express");
const router = express.Router();
const dbDriver = require("../db.js");
const jwt = require("jsonwebtoken");
const { tokenKey } = require("../key");
const auth = require("../middleware/auth");

// USER
router.post("/user/login/", async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await dbDriver.getUser({ username, password });
    if (!user) {
      return res
        .status(401)
        .send({ error: "Login failed! Check authentication credentials" });
    }
    const key = await jwt.sign({ id: user.id }, tokenKey);
    res.send({ user, key });
  } catch (error) {
    res.status(400).send(error);
  }
});
router.get("/user/me/", auth, async (req, res) => {
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
router.get("/user/fields/", auth, async (req, res) => {
  try {
    const fields = await dbDriver.getUserFields({ id: req.userId });
    return res.status(200).json({ user_data: fields });
  } catch (error) {
    res.status(500).send(error);
  }
});
router.get("/user/all-fields/", async (req, res) => {
  try {
    const fields = await dbDriver.getAllFields({ id: req.userId });
    return res.status(200).json({ fields });
  } catch (error) {
    res.status(500).send(error);
  }
});
router.get("/user/services/", auth, async (req, res) => {
  try {
    const services = await dbDriver.getUserServices({ user: req.userId });
    return res.status(200).json({ services });
  } catch (error) {
    res.status(500).send(error);
  }
});
router.get("/user/data-groups/", async (req, res) => {
  try {
    const groups = await dbDriver.getAllDataGroups();
    return res.status(200).json({ groups });
  } catch (error) {
    res.status(500).send(error);
  }
});
router.post("/field/", auth, async (req, res) => {
  try {
    const value = req.body.value.value;
    const field = req.body.value.field.id;
    const user = req.userId;
    await dbDriver.setUserValue({ value, field, user });
    return res.status(200).json({ value, field });
  } catch (error) {
    res.status(500).send(error);
  }
});

// SERVICE
router.post("/service/login/", async (req, res) => {
  try {
    const { username, password } = req.body;
    const service = await dbDriver.getService({ username, password });
    if (!service) {
      return res
        .status(401)
        .send({ error: "Login failed! Check authentication credentials" });
    }
    const key = await jwt.sign({ id: service.id }, tokenKey);
    res.send({ user: service, key });
  } catch (error) {
    res.status(400).send(error);
  }
});
router.get("/service/me/", auth, async (req, res) => {
  try {
    const service = await dbDriver.getServiceById({ id: req.userId });
    if (service) {
      return res.status(200).json({ service });
    } else {
      return res.status(401).json({ message: "Not authorized" });
    }
  } catch (error) {
    res.status(400).send(error);
  }
});

router.get("/service/list/", async (req, res) => {
  try {
    const services = await dbDriver.getServices();
    return res.status(200).json({ services });
  } catch (error) {
    res.status(500).send(error);
  }
});
router.post("/service/delete/", auth, async (req, res) => {
  try {
    const service = req.body.service.service;
    const user = req.userId;

    await dbDriver.deleteService({ service, user });
    return res.status(200).json({ service });
  } catch (error) {
    res.status(500).send(error);
  }
});
router.post("/service/assign/", auth, async (req, res) => {
  try {
    const service = req.body.service.id;
    const user = req.userId;

    await dbDriver.assignService({ service, user });
    return res.status(200).json({ service });
  } catch (error) {
    res.status(500).send(error);
  }
});
router.get("/service/permissions/", auth, async (req, res) => {
  try {
    const permission = await dbDriver.getServicePermissions({
      service: req.userId,
    });
    return res.status(200).json({ permission });
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
});
router.get("/service/users/", auth, async (req, res) => {
  try {
    const users = await dbDriver.getServiceUsers({
      service: req.userId,
    });
    return res.status(200).json({ users });
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
});
router.post("/service/permissions/", auth, async (req, res) => {
  try {
    await dbDriver.setServicePermissions({
      service: req.userId,
      data: req.body,
    });
    return res.status(200).json({ status: "ok" });
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
});

module.exports = router;
