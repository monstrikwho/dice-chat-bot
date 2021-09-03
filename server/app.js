require("dotenv").config();

// Init
require("./init/setupServer");
// require("./helpers/checkRates");
// require("./helpers/parseTopMatches");
// require("./helpers/parseSoccer");
// require("./helpers/parseTennis");
// require("./helpers/parseBasketball");
const { bot, startBot } = require("./init/startBot");
const setupMongoose = require("./init/setupMongoose");

require("./scens/setupScenes")(bot);

// Commands
const setupStart = require("./commands/start");
const setupStats = require("./helpers/checkBlockedUsers");
const updatePvpStats = require("./helpers/updatePvpStats");

// Init
startBot();
setupMongoose();

// Commands
setupStart(bot);
setupStats(bot);
updatePvpStats();
