const axios = require("axios");
const moment = require("moment");

const FootballGames = require("../models/footballGames");
const BasketballGames = require("../models/basketballGames");
const TennisGames = require("../models/tennisGames");

const login = "iceinblood";
const token = "54811-x38emPLqcLOEFLV";

const chunks = 10;
const sports = ["soccer", "basketball", "tennis"];

setInterval(reqTopLiveMatch, 1000 * 60 * 5);
setInterval(reqTopPreMatch, 1000 * 60 * 5);

async function reqTopLiveMatch() {
  for (let sport_type of sports) {
    await axios
      .get(
        `https://spoyer.ru/api/get.php?login=${login}&token=${token}&task=live&bookmaker=bet365&sport=${sport_type}`
      )
      .then(async ({ data }) => {
        const games = data.games_live.filter((item) => {
          const diffTime = moment()
            .subtract(165, "minutes")
            .diff(moment.unix(item.time).subtract(1, "hours"), "minutes");
          return !item.home.match(/Esports/) && diffTime < 0;
        });

        if (sport_type === "soccer") {
          sortArr("Argentina Torneo A");
          sortArr("Argentina Liga Profesional");
          sortArr("Brazil Serie A");
          sortArr("France Ligue 1");
          sortArr("Italy Serie A");
          sortArr("Spain Primera Liga");
          sortArr("England EFL Cup");
          sortArr("England Championship");
          sortArr("England National League");
          sortArr("England Premier League");
          sortArr("Germany Bundesliga I");
          sortArr("Ukraine Persha Liga");
          sortArr("Russia Division 1");
          sortArr("Russia Premier League");
          sortArr("UEFA Europa League");
          sortArr("UEFA Nations League");
          sortArr("UEFA Champions League");

          function sortArr(str) {
            games.sort((a, b) => {
              if (a.league === str) return -1;
              return 1;
            });
          }

          const activeGames = await FootballGames.find({ time_status: 1 });

          const timeGames = activeGames.filter((item) => {
            const diffTime = moment()
              .subtract(170, "minutes")
              .diff(moment(item.time, "DD.MM.YYYY HH:mm:ss"));
            if (diffTime > 0) {
              FootballGames.updateOne(
                { game_id: item.game_id },
                { time_status: 4 }
              );
              return false;
            }
            return true;
          });

          const activeGames_id = timeGames.map((item) => item.game_id);

          let y = 0 + activeGames_id.length;

          for (let game of games) {
            if (y === chunks) return;
            const status = await FootballGames.findOne({
              game_id: game.game_id,
            });
            const diffTime = moment()
              .subtract(165, "minutes")
              .diff(moment().unix(game.time));
            if (!status && diffTime > 0) {
              const time = moment
                .unix(game.time)
                .subtract(1, "hours")
                .format("DD.MM.YYYY HH:mm:ss");
              const newGame = new FootballGames({ ...game, time });
              await newGame.save();
              y++;
            }
          }
        }

        if (sport_type === "basketball") {
          const activeGames = await BasketballGames.find({ time_status: 1 });

          const timeGames = activeGames.filter((item) => {
            const diffTime = moment()
              .subtract(125, "minutes")
              .diff(moment(item.time, "DD.MM.YYYY HH:mm:ss"));
            if (diffTime > 0) {
              BasketballGames.updateOne(
                { game_id: item.game_id },
                { time_status: 4 }
              );
              return false;
            }
            return true;
          });

          const activeGames_id = timeGames.map((item) => item.game_id);

          let y = 0 + activeGames_id.length;

          for (let game of games) {
            if (y === chunks) return;
            const status = await BasketballGames.findOne({
              game_id: game.game_id,
            });
            const diffTime = moment()
              .subtract(120, "minutes")
              .diff(moment().unix(game.time));
            if (!status && diffTime > 0) {
              const time = moment
                .unix(game.time)
                .subtract(1, "hours")
                .format("DD.MM.YYYY HH:mm:ss");
              const newGame = new BasketballGames({ ...game, time });
              await newGame.save();
              y++;
            }
          }
        }

        if (sport_type === "tennis") {
          const activeGames = await TennisGames.find({ time_status: 1 });
          const activeGames_id = activeGames.map((item) => item.game_id);

          let y = 0 + activeGames_id.length;

          for (let game of games) {
            if (y === chunks) return;
            const status = await TennisGames.findOne({
              game_id: game.game_id,
            });
            if (!status) {
              const time = moment
                .unix(game.time)
                .subtract(1, "hours")
                .format("DD.MM.YYYY HH:mm:ss");
              const newGame = new TennisGames({ ...game, time });
              await newGame.save();
              y++;
            }
          }
        }
      })
      .catch((err) => {});
  }
}

async function reqTopPreMatch() {
  for (let sport_type of sports) {
    await axios
      .get(
        `https://spoyer.ru/api/get.php?login=${login}&token=${token}&task=pre&bookmaker=bet365&sport=${sport_type}`
      )
      .then(async ({ data }) => {
        const games = data.games_pre.filter(
          (item) => !item.home.match(/Esports/)
        );

        console.log(data.remain_requests);

        if (sport_type === "soccer") {
          sortArr("Argentina Torneo A");
          sortArr("Argentina Liga Profesional");
          sortArr("Brazil Serie A");
          sortArr("France Ligue 1");
          sortArr("Italy Serie A");
          sortArr("Spain Primera Liga");
          sortArr("England EFL Cup");
          sortArr("England Championship");
          sortArr("England National League");
          sortArr("England Premier League");
          sortArr("Germany Bundesliga I");
          sortArr("Ukraine Persha Liga");
          sortArr("Russia Division 1");
          sortArr("Russia Premier League");
          sortArr("UEFA Europa League");
          sortArr("UEFA Nations League");
          sortArr("UEFA Champions League");

          function sortArr(str) {
            games.sort((a, b) => {
              if (a.league === str) return -1;
              return 1;
            });
          }

          const activeGames = await FootballGames.find({ time_status: 0 });
          const activeGames_id = activeGames.map((item) => item.game_id);

          let y = 0 + activeGames_id.length;

          for (let game of games) {
            if (y === chunks) return;
            const status = await FootballGames.findOne({
              game_id: game.game_id,
            });
            if (!status) {
              const time = moment
                .unix(game.time)
                .subtract(1, "hours")
                .format("DD.MM.YYYY HH:mm:ss");
              const newGame = new FootballGames({ ...game, time });
              await newGame.save();
              y++;
            }
          }
        }

        if (sport_type === "basketball") {
          const activeGames = await BasketballGames.find({ time_status: 0 });
          const activeGames_id = activeGames.map((item) => item.game_id);

          let y = 0 + activeGames_id.length;

          for (let game of games) {
            if (y === chunks) return;
            const status = await BasketballGames.findOne({
              game_id: game.game_id,
            });
            if (!status) {
              const time = moment
                .unix(game.time)
                .subtract(1, "hours")
                .format("DD.MM.YYYY HH:mm:ss");
              const newGame = new BasketballGames({ ...game, time });
              await newGame.save();
              y++;
            }
          }
        }

        if (sport_type === "tennis") {
          const activeGames = await TennisGames.find({ time_status: 0 });
          const activeGames_id = activeGames.map((item) => item.game_id);

          let y = 0 + activeGames_id.length;

          for (let game of games) {
            if (y === chunks) return;
            const status = await TennisGames.findOne({
              game_id: game.game_id,
            });
            if (!status) {
              const time = moment
                .unix(game.time)
                .subtract(1, "hours")
                .format("DD.MM.YYYY HH:mm:ss");
              const newGame = new TennisGames({ ...game, time });
              await newGame.save();
              y++;
            }
          }
        }
      })
      .catch((err) => {});
  }
}
