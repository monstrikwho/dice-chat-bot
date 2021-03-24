const { Router } = require("express");
const router = Router();
const axios = require("axios");

const MainStats = require("../models/mainstats");

// await axios.post(`http://localhost:5000/post_set_token`, {
//   token: "b12028ee3f86a0c23d36e65280a185bf",
// });

const setWebHook = async (hookUrl) => {
  // Установить вебхук
  return await axios
    .put(
      `https://edge.qiwi.com/payment-notifier/v1/hooks?hookType=1&param=https%3A%2F%2Fdice-bots.ru/${hookUrl}%2F&txnType=2`
    )
    .then((res) => res.data.hookId)
    .catch((err) => console.log(err.message));
};

const deleteActiveHook = async (hookId) => {
  // Удалить вебхук
  return await axios
    .delete(`https://edge.qiwi.com/payment-notifier/v1/hooks/${hookId}`)
    .then((res) => res.data.response)
    .catch((err) => console.log(err.message));
};

const getProfileWallet = async () => {
  return await axios
    .get(`https://edge.qiwi.com/person-profile/v1/profile/current`)
    .then((res) => res.data.authInfo.personId)
    .catch((err) => console.log(err.message));
};

router.post("/", async (req, res) => {
  const token = req.body.token;
  if (!token) return;

  axios.defaults.headers.common["Accept"] = "application/json";
  axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

  const { webhook } = await MainStats.findOne();

  const deleteStatus = await deleteActiveHook(webhook.hookId); // 'Hook deleted'

  if (deleteStatus !== "Hook deleted") {
    return res.send({ status: false, message: deleteStatus });
  }

  const newHookId = await setWebHook(webhook.hookUrl); // bcb50cb4-157b-4554-af5b-44d31d5fad51

  const wallet = await getProfileWallet();

  await MainStats.updateOne(
    {},
    {
      "webhook.hookId": newHookId,
      "webhook.qiwiToken": token,
      "webhook.qiwiWallet": wallet,
    }
  );

  res.send({ status: true });
});

module.exports = router;
