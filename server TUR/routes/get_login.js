const { Router } = require("express");
const router = Router();

const { bot } = require("../init/startBot");
const User = require("../models/user");

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
}

router.get("/", async (req, res) => {
  const userStatus = await User.findOne({
    userId: req.query.login,
    userRights: "admin",
  });

  if (!userStatus) {
    return res.send({ status: false });
  }

  res.send({ status: true });

  const pass = getRandomInt(1111, 9999);
  await bot.telegram.sendMessage(req.query.login, pass);
  await User.updateOne({ userId: req.query.login }, { pass });
});

module.exports = router;
