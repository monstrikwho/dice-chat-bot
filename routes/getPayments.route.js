const { Router } = require("express");
const router = Router();

const Order = require("../models/order");
const moment = require("moment");
const { getProfileBalance } = require("../helpers/qiwiMethods");

router.get("/", async (req, res) => {
  try {
    const orders = await Order.find({
      date: moment().format("YYYY-MM-DD"),
      status: "SUCCESS",
    });

    let inAmount = 0;
    let outAmount = 0;
    let balance = await getProfileBalance();

    for (let order of orders) {
      if (order.type === "IN") inAmount += order.amount;
      if (order.type === "OUT") outAmount += order.amount;
    }

    res.status(200).send({ inAmount, outAmount, balance });
  } catch (error) {
    res.status(500).send({ message: "Что-то пошло не так" });
  }
});

module.exports = router;
