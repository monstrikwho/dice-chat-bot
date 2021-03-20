const { Router } = require("express");
const router = Router();
const jwt = require("jsonwebtoken");

const { bot } = require("../init/startBot");
const User = require("../models/user");

router.get("/", async (req, res) => {
  const { pass } = await User.findOne({
    userId: req.query.login,
  });

  if (pass == req.query.pass) {
    const token = jwt.sign(
      { userId: req.query.login },
      process.env.AUTH_SECRET_KEY,
      {
        expiresIn: 60 * 60 * 5,
      }
    );
    res.send({ status: true, token });
  } else {
    return res.send({ status: false });
  }
});

module.exports = router;
