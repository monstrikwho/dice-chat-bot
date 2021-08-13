const { Router } = require("express");
const router = Router();

const { bot } = require("../init/startBot");
const Users = require("../models/user");
const Payeer = require("../models/payeer");

router.post("/", async (req, res) => {
  res.send({ status: true });

  const user = await Users.findOne({ userId: req.body.m_desc });
  if (!user) return;

  const order = new Payeer({ ...req.body, type: "IN" });
  await order.save();

  await Users.updateOne(
    { userId: req.body.m_desc },
    { mainBalance: +(user.mainBalance + req.body.m_amount).toFixed(2) }
  );

  await bot.telegram.sendMessage(
    req.body.m_desc,
    `На ваш счет был зачислен баланс: ${req.body.m_amount} P
Ваш текующий баланс: ${+(user.mainBalance + req.body.m_amount).toFixed(2)}`
  );
});

module.exports = router;
