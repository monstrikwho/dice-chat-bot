const ActiveGames = require("../models/activeGames");
const TennisGames = require("../models/tennisGames");
const FootballGames = require("../models/footballGames");
const BasketballGames = require("../models/basketballGames");
const { reqTennis } = require("./parseTennis");
const { reqFootball } = require("./parseSoccer");
const { reqBasketball } = require("./parseBasketball");

// LIVE GAMES
setInterval(async () => {
  const games = await ActiveGames.find({ typeMatch: "live" });
  for (let i = 0; i < games.length; i++) {
    const typeSport = games[i].typeSport;
    if (typeSport === "tennis") {
      const game = await TennisGames.findOne({ game_id: games[i].game_id });
      reqTennis("live", game);
    }
    if (typeSport === "soccer") {
      const game = await FootballGames.findOne({ game_id: games[i].game_id });
      reqFootball("live", game);
    }
    if (typeSport === "basketball") {
      const game = await BasketballGames.findOne({ game_id: games[i].game_id });
      reqBasketball("live", game);
    }
  }
}, 1000 * 2);

// PRE GAMES
setInterval(async () => {
  const games = await ActiveGames.find({ typeMatch: "pre" });

  for (let i = 0; i < games.length; i++) {
    const typeSport = games[i].typeSport;
    if (typeSport === "tennis") {
      const game = await TennisGames.findOne({ game_id: games[i].game_id });
      reqTennis("pre", game);
    }
    if (typeSport === "soccer") {
      const game = await FootballGames.findOne({ game_id: games[i].game_id });
      reqFootball("pre", game);
    }
    if (typeSport === "basketball") {
      const game = await BasketballGames.findOne({ game_id: games[i].game_id });
      reqBasketball("pre", game);
    }
  }
}, 1000 * 60 * 2);
