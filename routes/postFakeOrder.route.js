const { Router } = require("express");
const router = Router();

const { bot } = require("../init/startBot");

const Setting = require("../models/setting");

const fs = require("fs");
const nodeHtmlToImage = require("node-html-to-image");
const moment = require("moment");

router.post("/", async (req, res) => {
  try {
    const setting = await Setting.findOne()

    const txnId = setting.lastNumberOrder + 333;
    const amount = req.body.amount;

    await nodeHtmlToImage({
      output: `./images/${txnId}.png`,
      html: `<html><head>
      <style>
      * {
        padding: 0;
        margin: 0;
      }

      html {
        width: 400px;
      }

      body {
        padding: 10px;
        padding-top: 40px;
        width: 400px;
        height: 220px;
      }

      .card {
        position: relative;
        border-radius: 10px;
        box-shadow: 1px 2px 32px rgba(12, 12, 12, 0.2);
        background-color: #1c1c1e;
        color: #fff;
      }
      
      .title {
        padding: 10px;
        font-size: 18px;
        text-align: center;
        background-color: #2c2c2e;
        border-radius: 10px 10px 0 0;
        color: #2dbf65;
      }
      
      .date {
        padding: 10px;
        display: flex;
        justify-content: space-between;
      }
      
      .number-order {
        padding: 10px;
        display: flex;
        justify-content: space-between;
      }
      
      .amount {
        padding: 30px 0;
        text-align: center;
        font-size: 32px;
      }
    </style>
    </head>
    <body>
      <div class="card">
        <div class="title">Операция проведена успешно</div>
        <div class="date">
          <div class="name">Дата</div>
          <div class="time">${moment().format("HH:mm DD.MM.YYYY")}</div>
        </div>
        <div class="number-order">
          <div class="name">Номер транзакции:</div>
          <div class="no">${txnId}</div>
        </div>
        <div class="amount">${amount}P</div>
      </div>
    </body>
    </html>`,
      puppeteerArgs: {
        args: ["--no-sandbox", "--user-data-dir"],
      },
    })
      .then(async () => {
        await bot.telegram.sendPhoto("-1001352899773", {
          source: `./images/${txnId}.png`,
        });
        fs.unlinkSync(`./images/${txnId}.png`);
      })
      .catch(async (err) => {
        console.log(err.message);
      });
    res.status(200).send({ message: "Платеж успешно добавлен." });
  } catch (error) {
    res.status(500).send({ message: "Что-то пошло не так" });
  }
});

module.exports = router;
