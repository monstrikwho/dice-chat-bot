require("dotenv").config();
const cors = require("cors");
const express = require("express");
const mongoose = require("mongoose");

// Init
const { bot, startBot } = require("./init/startBot");
// Commands
const setupStart = require("./commands/start");

// Commands
setupStart(bot);

bot.command("msg", (ctx) => {
  setInterval(function () {
    const curDate =
      new Date().getHours() +
      ":" +
      new Date().getMinutes() +
      ":" +
      new Date().getSeconds();
    bot.telegram.sendMessage(ctx.from.id, curDate);
  }, 1000);
  console.log(ctx.from.id);
});

// Let's start!
startBot();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const PORT = process.env.MONGO_PORT || 5000;

async function start() {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
    });
    app.listen(PORT, () =>
      console.log(
        `\x1b[32m`,
        `App has been started on port ${PORT}...`,
        `\x1b[0m`
      )
    );
  } catch (e) {
    console.log("Server Error", e.message);
    process.exit(1);
  }
}

start()
