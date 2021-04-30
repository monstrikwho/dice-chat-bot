const { Router } = require("express");
const router = Router();

const Order = require("../models/order");

router.get("/", async (req, res) => {
  const orders = await Order.find();
  orders.reverse();
  res.send({ orders });
});

module.exports = router;
