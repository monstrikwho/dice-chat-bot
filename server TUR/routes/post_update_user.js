const { Router } = require("express");
const router = Router();

const { bot } = require("../init/startBot");
const Users = require("../models/user");

router.post("/", async (req, res) => {
  const userId = req.body.userId;
  const demoBalance = +req.body.demoBalance;
  const mainBalance = +req.body.mainBalance;
  const userRights = req.body.userRights;

  const user = await Users.findOne({ userId });

  const countUserDemoBalance = user.demoBalance;
  const countUserMainBalance = user.mainBalance;
  const countUserRights = user.userRights;

  await Users.updateOne({ userId }, { demoBalance, mainBalance, userRights });

  if (demoBalance > countUserDemoBalance) {
    try {
      await bot.telegram.sendMessage(
        userId,
        `DEMO hesabınıza yatırılan miktar: ${
          demoBalance - countUserDemoBalance
        } TL`
      );
    } catch (error) {}
  }
  if (mainBalance > countUserMainBalance) {
    try {
      await bot.telegram.sendMessage(
        userId,
        `Ana hesabınıza yatırılan miktar: ${
          mainBalance - countUserMainBalance
        } TL`
      );
    } catch (error) {}
  }
  if (userRights === "admin" && countUserRights !== "admin") {
    try {
      await bot.telegram.sendMessage(
        userId,
        `Size yönetici hakları verildi. 
Giriş yapmak için giriş bilgileriniz: ${userId}`
      );
    } catch (error) {}
  }

  res.send({ status: true });
});

module.exports = router;
