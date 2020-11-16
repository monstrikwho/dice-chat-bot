const { Router } = require("express");
const router = Router();

router.post("/", async (req, res) => {
  try {
    console.log(req.body)
    res.status(200).send('YES');
  } catch (error) {
    res.status(500).send({ message: "Что-то пошло не так" });
  }
});

module.exports = router;
