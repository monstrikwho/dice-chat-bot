const jwt = require("jsonwebtoken");
const { Router } = require("express");
const router = Router();

const MainStats = require("../models/mainstats");

router.get("/", async (req, res) => {
  const { webhook } = await MainStats.findOne({});

  jwt.verify(req.query.token, webhook.authSecret, function (err, data) {
    if (err === null) {
      return res.send({ status: true });
    }
    res.send({ status: false });
  });
});

module.exports = router;
