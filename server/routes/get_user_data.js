const { Router } = require("express");
const router = Router();

const User = require("../models/user");

router.get("/", async (req, res) => {
  const users = await User.find();
  res.send({ users });
});

module.exports = router;
