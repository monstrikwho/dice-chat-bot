require("dotenv").config({ path: "../.env" });

// Init
const { bot, startBot } = require("./init/startBot");
const setupMongoose = require("./init/setupMongoose");
const server = require("./init/setupServer");

// Commands
const setupStart = require("./commands/start");
const mailing = require("./commands/mailing");
const addBalance = require("./commands/addBalance");
const checkUsers = require("./commands/checkUsers");

// Init
startBot();
setupMongoose();

// Commands
setupStart(bot);
mailing(bot);
addBalance(bot);
checkUsers(bot);

// const Order = require("./models/order");
// bot.command("ss", async (ctx) => {
//   console.log("start");
//   const order = await Order.find();
//   for (let item of order) {
//     console.log(item);
//     const { _id, txnId, type, status, amount, comment, account, date } = item;
//     if (!comment || comment.length < 2) {
//       console.log("DELETED");
//       await Order.deleteOne({
//         _id: {
//           _id,
//         },
//       });
//     }
//   }
//   console.log("end");
// });
