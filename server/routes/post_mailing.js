const { Router } = require("express");
const router = Router();
const Extra = require("telegraf/extra");
const Markup = require("telegraf/markup");

const { bot } = require("../init/startBot");
const Users = require("../models/user");

const sending = async (users, message, btnStart) => {
  for (let { userId } of users) {
    try {
      await bot.telegram.sendMessage(userId, message, btnStart);
      if (btnStart) {
        await Users.updateOne({ userId }, { btnStart: false });
      }
    } catch (error) {}
  }
};

router.post("/", async (req, res) => {
  const message = req.body.textArea;
  const btnStart =
    req.body.btnStart === "true"
      ? Extra.markup(Markup.keyboard([["/start"]]).resize())
      : null;

  const users = await Users.find({ isBlocked: false });

  sending(users, message, btnStart);

  res.send({ status: true });
});

module.exports = router;
