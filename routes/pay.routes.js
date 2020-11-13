const { Router } = require("express");
const router = Router();

router.post("/", async (req, res) => {
  try {
    console.log(req)
    res.status(200).send({ message: `Сообщение доставлено` });
  } catch (error) {
    res.status(500).send({ message: "Что-то пошло не так" });
  }
});

module.exports = router;
