const { Router } = require("express");
const router = Router();
const jwt = require("jsonwebtoken");

const User = require("../models/user");
const MainStats = require("../models/mainstats");

router.get("/", async (req, res) => {
  const { pass } = await User.findOne({
    userId: req.query.login,
  });

  const { webhook } = await MainStats.findOne({});

  if (pass == req.query.pass) {
    const token = jwt.sign({ userId: req.query.login }, webhook.authSecret, {
      expiresIn: 60 * 60 * 5,
    });
    res.send({ status: true, token });
  } else {
    return res.send({ status: false });
  }
});

module.exports = router;
