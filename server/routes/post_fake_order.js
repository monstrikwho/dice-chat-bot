const { Router } = require("express");
const router = Router();

const { bot } = require("../init/startBot");

const fs = require("fs");
const moment = require("moment");
const nodeHtmlToImage = require("node-html-to-image");

const pushPhoto = async (txnId, amount) => {
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
        padding-top: 20px;
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
        <div class="number-order">
          <div class="name">UID:</div>
          <div class="no">${randomInteger(364984576, 727186107)}</div>
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
      await bot.telegram.sendPhoto("-1001483381769", {
        source: `./images/${txnId}.png`,
      });
      fs.unlinkSync(`./images/${txnId}.png`);
    })
    .catch(async (err) => {
      console.log(err.message);
    });
};

router.post("/", async (req, res) => {
  const amount = req.body.amount;
  if (!amount) {
    return res.send({ status: false });
  }
  pushPhoto(randomInteger(123123123, 987987987), amount);
  res.send({ status: true });
});

function randomInteger(min, max) {
  let rand = min + Math.random() * (max + 1 - min);
  return Math.floor(rand);
}

module.exports = router;
