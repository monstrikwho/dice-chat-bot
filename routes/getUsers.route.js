const { Router } = require("express");
const router = Router();

const User = require("../models/user");

router.post("/", async (req, res) => {
  try {
    const users = await User.find()
    res.status(200).send(users);
  } catch (error) {
    res.status(500).send({ message: "Что-то пошло не так" });
  }
});

module.exports = router;
