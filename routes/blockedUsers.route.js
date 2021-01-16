const { Router } = require("express");
const router = Router();

const { bot } = require("../init/startBot");
const Users = require("../models/user");

router.get("/", async (req, res) => {
  try {
    const users = await Users.find({});
    
    let countBlocked = 0;

    for (let user of users) {
      try {
        await bot.telegram.sendChatAction(user.userId, "typing");
        await Users.updateOne({ userId: user.userId }, { isBlocked: false });
      } catch (error) {
        await Users.updateOne({ userId: user.userId }, { isBlocked: true });
        countBlocked++;
      }
    }

    res.status(200).send(countBlocked);
  } catch (error) {
    res.status(500).send({ message: "Что-то пошло не так" });
  }
});

module.exports = router;
