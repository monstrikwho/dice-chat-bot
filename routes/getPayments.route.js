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
    let countInAmount = 0;
    let countOutAmount = 0;
    let balance = await getProfileBalance();

    for (let order of orders) {
      if (order.type === "IN") {
        inAmount += order.amount;
        countInAmount++;
      }

      if (order.type === "OUT") {
        outAmount += order.amount;
        countOutAmount++;
      }
    }

    res
      .status(200)
      .send({ inAmount, outAmount, countInAmount, countOutAmount, balance });
  } catch (error) {
    res.status(500).send({ message: "Что-то пошло не так" });
  }
});

module.exports = router;
