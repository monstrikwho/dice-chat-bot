const { Router } = require("express");
const router = Router();
const axios = require("axios");

const MainStats = require("../models/mainstats");

router.get("/", async (req, res) => {
  const { webhook } = await MainStats.findOne({});

  axios.defaults.headers.common["Accept"] = "application/json";
  axios.defaults.headers.common[
    "Authorization"
  ] = `Bearer ${webhook.qiwiToken}`;

  const balance = await axios
    .get(
      `https://edge.qiwi.com/funding-sources/v2/persons/${webhook.qiwiWallet}/accounts`
    )
    .then((res) => res.data.accounts[0].balance.amount)
    .catch((err) => err.message);

  res.send({ balance });
});

module.exports = router;
