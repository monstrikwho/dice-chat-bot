require("dotenv").config();
// Init
const { bot, startBot } = require("./init/startBot");
// Commands
const setupStart = require('./commands/start')





// Commands
setupStart(bot)

bot.command('msg', ctx => {
  ctx.scene.enter('step1')
})



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


