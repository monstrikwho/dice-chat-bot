const { Router } = require("express");
const router = Router();

const Order = require("../models/order");

router.get("/", async (req, res) => {
  try {
    const orders = await Order.find({
      data: { payment: { status: "SUCCESS" } },
    });
    res.status(200).send(orders);
  } catch (error) {
    res.status(500).send({ message: "Что-то пошло не так" });
  }
});

module.exports = router;
