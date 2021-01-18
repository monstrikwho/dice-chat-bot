const { Router } = require("express");
const router = Router();

const User = require("../models/user");
const Order = require("../models/order");
const moment = require("moment");

router.get("/:date", async (req, res) => {
  try {
    const users = await User.find({ regDate: req.params.date });

    let newUsers = 0;
    let refUsers = 0;
    let donateUsers = 0;
    let activeUsers = 0;

    for (let user of users) {
      // Записываем кол-во новых юзеров
      newUsers++;

      // Записывем новых рефералов
      if (user.isRef !== 1) refUsers++;

      // Записываем донатеров из новых юзеров
      const orderFlag = await Order.find({ comment: user.userId });
      if (orderFlag.length !== 0) donateUsers++;

      // Записываем активных юзеров (не заблоченых)
      if (!user.isBlocked) activeUsers++;
    }

    res.status(200).send({
      newUsers,
      refUsers,
      donateUsers,
      activeUsers,
    });
  } catch (error) {
    res.status(500).send({ message: "Что-то пошло не так" });
  }
});

module.exports = router;
