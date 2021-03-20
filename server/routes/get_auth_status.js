const jwt = require("jsonwebtoken");
const { Router } = require("express");
const router = Router();

router.get("/", async (req, res) => {
  jwt.verify(
    req.query.token,
    process.env.AUTH_SECRET_KEY,
    function (err, data) {
      if (err === null) {
        return res.send({ status: true });
      }
      res.send({ status: false });
    }
  );
});

module.exports = router;
