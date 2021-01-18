const { Router } = require("express");
const router = Router();

const Order = require("../models/order");
const moment = require("moment");
const { getProfileBalance } = require("../helpers/qiwiMethods");
const { get } = require("./getUsers.route");

router.get("/:date", async (req, res) => {
  try {
    const orders = await Order.find({
      date: req.params.date,
      status: "SUCCESS",
    });

    let inAmount = 0;
    let outAmount = 0;
    let countIn = 0;
    let countOut = 0;
    let balance = await getProfileBalance();

    for (let order of orders) {
      if (order.type === "IN") {
        inAmount += order.amount;
        countIn++;
      }
      if (order.type === "OUT") {
        outAmount += order.amount;
        countOut++;
      }
    }

    res.status(200).send({ inAmount, outAmount, countIn, countOut, balance });
  } catch (error) {
    res.status(500).send({ message: "Что-то пошло не так" });
  }
});

module.exports = router;
