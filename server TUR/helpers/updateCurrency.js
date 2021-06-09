const { bot } = require("../init/startBot");

const axios = require("axios");
const moment = require("moment");

const MainStats = require("../models/mainstats");

async function updateCurrency() {
  setInterval(check, 1000 * 60);

  async function check() {
    const time = moment().format("HH-mm");
    if (time !== "06-00") return;

    await axios
      .get(
        `https://finance.liga.net/graph-api/get-json-for-graph/cur_f/61/cur_s/45/interval/30`
      )
      .then(async (res) => {
        const TRYRUB = res.data.data.json[0].nbu;
        await MainStats.updateOne({}, { TRYRUB });
      })
      .catch(async (err) => {
        const { moderId } = await MainStats.findOne();
        await bot.telegram.sendMessage(
          moderId,
          `Коэффициент конвертации валюты не был обнавлен.
Пожалуйста, обновите его вручную.`
        );
      });
  }
}

module.exports = updateCurrency;
