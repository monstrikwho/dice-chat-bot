const moment = require("moment");
const today = moment().startOf("day");

const Order = require("../models/order");
const Banker = require("../models/banker");
const Payeer = require("../models/payeer");

async function weekDonations(bot) {
  bot.command("/weekdonations", async (ctx) => {
    const qiwi_orders = Order.find({
      created_on: {
        $gte: today.toDate(),
        $lte: moment(today).endOf("day").toDate(),
      },
      type: "IN",
    })
      .sort({ amount: -1 })
      .limit(10);
    const banker_orders = Banker.find({
      created_on: {
        $gte: today.toDate(),
        $lte: moment(today).endOf("day").toDate(),
      },
      type: "IN",
    })
      .sort({ amount: -1 })
      .limit(10);
    const payeer_orders = Payeer.find({
      created_on: {
        $gte: today.toDate(),
        $lte: moment(today).endOf("day").toDate(),
      },
      type: "IN",
    })
      .sort({ m_amount: -1 })
      .limit(10);

    await ctx.reply(`Киви
    ${qiwi_orders
      .map((item) => `${item.comment} - ${item.amount} P`)
      .join("\n")}`);

    await ctx.reply(`Банкер
    ${banker_orders
      .map((item) => `${item.userId} - ${item.amount} P`)
      .join("\n")}`);

    await ctx.reply(`Пайер
    ${payeer_orders
      .map((item) => `${item.m_desc} - ${item.m_amount} P`)
      .join("\n")}`);
  });
}

module.exports = weekDonations;
