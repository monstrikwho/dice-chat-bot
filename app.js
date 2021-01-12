require("dotenv").config();

// Init
const { bot, startBot } = require("./init/startBot");
const { startRoutes } = require("./init/startRoutes");
const setupMongoose = require("./init/setupMongoose");

// Commands
const setupStart = require("./commands/start");
const mailing = require("./commands/mailing");

// Init
startBot();
startRoutes();
setupMongoose();

// Commands
setupStart(bot);
mailing(bot);


const fs = require("fs");
const nodeHtmlToImage = require("node-html-to-image");
bot.command("bot", async (ctx) => {
  // Отпарвляем photo ордерa в паблик
  await nodeHtmlToImage({
    output: `./111.png`,
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
      
      .status {
        height: 60px;
        width: 60px;
        display: flex;
        justify-content: center;
        align-items: center;
        position: absolute;
        left: calc(50% - 30px);
        top: -30px;
        font-size: 28px;
        background-color: #fff;
        border-radius: 50%;
        box-shadow: 1px 2px 32px rgba(12, 12, 12, 0.2);
      }
      
      .nav {
        padding-top: 40px;
        padding-bottom: 20px;
        font-size: 26px;
        text-align: center;
        background-color: #42f581;
        border-radius: 10px;
      }
      
      .amount {
        padding: 30px 0;
        text-align: center;
        font-size: 32px;
      }
      
      .desc {
        padding-right: 15px;
        padding-bottom: 5px;
        font-size: 14px;
        color: #b5acac;
        text-align: right;
      }
      
      .card {
        position: relative;
        border-radius: 10px;
        box-shadow: 1px 2px 32px rgba(12, 12, 12, 0.2);
      }
    </style>
    </head><body>
      <div class="card">
        <div class="status">👌</div>
        <div class="nav">
          <div class="title">Перевод на карту</div>
          </div>
        <div class="amount">230 ₽</div>
        <div class="desc">
          <div class="number-order">no: 23423323</div>
        </div>
      </div>
    </body></html>`,
    puppeteerArgs: {
      args: ["--no-sandbox", "--user-data-dir"],
    },
  })
    .then(async () => {
      await bot.telegram.sendPhoto(ctx.from.id, {
        source: `./111.png`,
      });
      fs.unlinkSync(`./111.png`);
    })
    .catch(async (err) => {
      console.log(err.message);
    });
});
