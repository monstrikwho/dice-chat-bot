const { Router } = require("express");
const router = Router();

router.post("/", async (req, res) => {
  try {
    console.log(req.body)
  } catch (error) {
    req.status(500).json({ message: "Что-то пошло не так" });
  }
});

module.exports = router;
