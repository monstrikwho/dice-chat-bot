const axios = require("axios");
const moment = require("moment");

const SportsTopGames = require("../models/sportsTopGames");
const SportFootballGames = require("../models/sportFootballGames");
const BasketballGames = require("../models/basketballGames");
const TennisGames = require("../models/tennisGames");

const login = "iceinblood";
const token = "54811-x38emPLqcLOEFLV";

const chunks = 10;
const sports = ["soccer", "basketball", "tennis"];

setInterval(reqTopMatch, 1000 * 30 * 1);
async function reqTopMatch() {
  for (let sport_type of sports) {
    await axios
      .get(
        `https://spoyer.ru/api/get.php?login=${login}&token=${token}&task=live&bookmaker=bet365&sport=${sport_type}`
      )
      .then(async ({ data }) => {
        const timeReq = +data.time_request.toFixed(2);
        const allGames = data.games_live.filter(
          (item) => !item.home.match(/Esports/)
        );

        let topGames = allGames.slice(0, chunks);

        if (sport_type === "soccer") {
          for (let i = 0; i < topGames.length; i++) {
            const time = moment
              .unix(topGames[i].time)
              .subtract(1, "hours")
              .format("DD.MM.YYYY HH:mm:ss");
            topGames[i].time = time;
            const game = await SportFootballGames.findOne({
              game_id: topGames[i].game_id,
            });
            if (!game) {
              const newGame = new SportFootballGames(topGames[i]);
              newGame.time = time;
              await newGame.save();
            }
          }
        }

        if (sport_type === "basketball") {
          for (let i = 0; i < topGames.length; i++) {
            const time = moment
              .unix(topGames[i].time)
              .subtract(1, "hours")
              .format("DD.MM.YYYY HH:mm:ss");
            topGames[i].time = time;
            const game = await BasketballGames.findOne({
              game_id: topGames[i].game_id,
            });
            if (!game) {
              const newGame = new BasketballGames(topGames[i]);
              newGame.time = time;
              await newGame.save();
            }
          }
        }

        if (sport_type === "tennis") {
          for (let i = 0; i < topGames.length; i++) {
            const time = moment
              .unix(topGames[i].time)
              .subtract(1, "hours")
              .format("DD.MM.YYYY HH:mm:ss");
            topGames[i].time = time;
            const game = await TennisGames.findOne({
              game_id: topGames[i].game_id,
            });
            if (!game) {
              const newGame = new TennisGames(topGames[i]);
              newGame.time = time;
              await newGame.save();
            }
          }
        }

        await SportsTopGames.updateOne(
          { sport: `${sport_type}_live` },
          { topGames, timeUpd: moment().format("HH:mm:ss"), timeReq }
        );
      })
      .catch((err) => console.log(err.message));

    await axios
      .get(
        `https://spoyer.ru/api/get.php?login=${login}&token=${token}&task=pre&bookmaker=bet365&sport=${sport_type}`
      )
      .then(async ({ data }) => {
        const timeReq = +data.time_request.toFixed(2);
        const allGames = data.games_pre.filter(
          (item) => !item.home.match(/Esports/)
        );

        let topGames = allGames.slice(0, chunks);

        if (sport_type === "soccer") {
          for (let i = 0; i < topGames.length; i++) {
            const time = moment
              .unix(topGames[i].time)
              .subtract(1, "hours")
              .format("DD.MM.YYYY HH:mm:ss");
            topGames[i].time = time;
            const game = await SportFootballGames.findOne({
              game_id: topGames[i].game_id,
            });
            if (!game) {
              const newGame = new SportFootballGames(topGames[i]);
              newGame.time = time;
              await newGame.save();
            }
          }
        }

        if (sport_type === "basketball") {
          for (let i = 0; i < topGames.length; i++) {
            const time = moment
              .unix(topGames[i].time)
              .subtract(1, "hours")
              .format("DD.MM.YYYY HH:mm:ss");
            topGames[i].time = time;
            const game = await BasketballGames.findOne({
              game_id: topGames[i].game_id,
            });
            if (!game) {
              const newGame = new BasketballGames(topGames[i]);
              newGame.time = time;
              await newGame.save();
            }
          }
        }

        if (sport_type === "tennis") {
          for (let i = 0; i < topGames.length; i++) {
            const time = moment
              .unix(topGames[i].time)
              .subtract(1, "hours")
              .format("DD.MM.YYYY HH:mm:ss");
            topGames[i].time = time;
            const game = await TennisGames.findOne({
              game_id: topGames[i].game_id,
            });
            if (!game) {
              const newGame = new TennisGames(topGames[i]);
              newGame.time = time;
              await newGame.save();
            }
          }
        }

        await SportsTopGames.updateOne(
          { sport: `${sport_type}_pre` },
          { topGames, timeUpd: moment().format("HH:mm:ss"), timeReq }
        );
      })
      .catch((err) => console.log(err.message));
  }
}
