const sendStart = require('../helpers/sendStart')

function setupStart(bot) {
  // Start command
  bot.start( async ctx => {
    console.log(ctx.from)
    if (ctx.from) {
      sendStart(ctx)
    }
  })
}

// Exports
module.exports = setupStart