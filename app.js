require("dotenv").config();
// Init
const { bot, startBot } = require("./init/startBot");
// Commands
const setupStart = require('./commands/start')





// Commands
setupStart(bot)
bot.command('test_message', ctx => ctx.reply('success'))


// Let's start!
startBot();







// setInterval(function(){
//   for (var i = 0; i < notes.length; i++) {
//   const curDate = new Date().getHours() + ':' + new Date().getMinutes();
//   if (notes[i]['time'] === curDate) {
//     bot.sendMessage(notes[i]['uid'], 'Напоминаю, что вы должны: '+ notes[i]['text'] + ' сейчас.');
//     notes.splice(i, 1);
//   }
// }
// }, 1000);


// const Telegraf = require("telegraf");
// const RedisSession = require("telegraf-session-redis");

// const session = require("telegraf/session");
// const Stage = require("telegraf/stage");

// const { step1, step2, step3, step4 } = require("./src/scens/start");
// const getPicScene = require("./src/scens/getPic");

// const bot = new Telegraf(process.env.TOKEN);

// const stage = new Stage([step1, step2, step3, step4, getPicScene]);
// bot.use(session());
// bot.use(stage.middleware());

// bot.command("start", (ctx) => ctx.scene.enter("step1"));
// // actions.map((item) => bot.action(item.name, item.act));

// bot.command("getPic", (ctx) => ctx.scene.enter("getRaspPic"));

// bot.launch();