require("dotenv").config({ path: "../.env" });

// Init
const { bot, startBot } = require("./init/startBot");
const setupMongoose = require("./init/setupMongoose");
const server = require("./init/setupServer");

// Commands
const setupStart = require("./commands/start");

// Init
startBot();
setupMongoose();

// Commands
setupStart(bot);

// const Order = require("./models/user");
// bot.command("ss", async (ctx) => {
//   console.log("start");
//   const order = await Order.updateMany({}, { countRef: 0 });
//   console.log("end");
// });
