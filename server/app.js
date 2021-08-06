require("dotenv").config();

// Init
const { bot, startBot } = require("./init/startBot");
const setupMongoose = require("./init/setupMongoose");
const server = require("./init/setupServer");

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

// const axios = require("axios");
// const moment = require("moment");
// const SportsTopGames = require("./models/sportsTopGames");
// const SportFootballGames = require("./models/sportFootballGames");

// const { create, all } = require("mathjs");
// const math = create(all);

// const login = "tarasiuk";
// const token = "02185-7p3inJMv7HsfsXK";

// const chunks = 3;
// const typesMatch = ["pre"];
// const sports = ["soccer"];
// const typesMatch = ["live", "pre"];
// const sports = ["soccer", "basketball", "tennis"];

// setInterval(() => {
//   for (let i = 0; i < sports.length; i++) {
//     for (let k = 0; k < typesMatch.length; k++) {
//       req(sports[i], typesMatch[k]);
//     }
//   }
//   async function req(sport, type) {
//     await axios
//       .get(
//         `https://spoyer.ru/api/get.php?login=${login}&token=${token}&task=${type}&bookmaker=bet365&sport=${sport}`
//       )
//       .then(async ({ data }) => {
//         const timeReq = +data.time_request.toFixed(2);
//         const allGames = type === "live" ? data.games_live : data.games_pre;
//         const topGames = allGames.slice(0, chunks);

//         const status = await SportsTopGames.findOne({
//           sport: `${sport}_${type}`,
//         });

//         if (!status) {
//           const newGame = new SportsTopGames({
//             sport: `${sport}_${type}`,
//             topGames,
//             timeUpd: moment().format("HH:mm:ss"),
//             timeReq,
//           });
//           await newGame.save();
//         }

//         await SportsTopGames.updateOne(
//           { sport: `${sport}_${type}` },
//           { topGames, timeUpd: moment().format("HH:mm:ss"), timeReq }
//         );

//         console.log(`Parse matches ${sport}_${type}`);
//       })
//       .catch((err) => console.log(err.message));
//   }
// }, 1000 * 60 * 1566);

// setInterval(async () => {
//   for (let i = 0; i < sports.length; i++) {
//     for (let type of typesMatch) {
//       const { topGames } = await SportsTopGames.findOne({
//         sport: `${sports[i]}_${type}`,
//       });
//       for (let y = 0; y < topGames.length; y++) {
//         const game = topGames[y];
//         req(sports[i], type, game);
//       }
//     }
//   }

//   async function req(sport, type, game) {
//     await axios
//       .get(
//         `https://spoyer.ru/api/get.php?login=${login}&token=${token}&task=${type}odds&bookmaker=bet365&game_id=${game.game_id}`
//       )
//       .then(async ({ data }) => {
//         if (sport === "soccer") {
//           saveSoccerData(data, game, type);
//         }
//       })
//       .catch((err) => console.log(err.message));
//   }

//   async function saveSoccerData(data, game, type) {
//     if (type === "live") {
//       // голы матча NA: 'Match Goals'
//       // aльтернативные голы матча NA: 'Alternative Match Goals'
//       // голы чет/нечет NA: 'Goals Odd/Even'
//       // обе команды забьют NA: 'Both Teams to Score'
//       // const p1 = +(math.evaluate(data.results[0][37].OD) + 1).toFixed(2);
//       // const draw = +(math.evaluate(data.results[0][38].OD) + 1).toFixed(2);
//       // const p2 = +(math.evaluate(data.results[0][39].OD) + 1).toFixed(2);
//       // const update_at = moment
//       //   .unix(data.stats.update_at)
//       //   .utc()
//       //   .local()
//       //   .format("HH:mm:ss");
//       // const status = await SportFootballGames.findOne({
//       //   game_id: +game.game_id,
//       // });
//       // if (!status) {
//       //   const newGame = new SportFootballGames({
//       //     ...game,
//       //     odds: {
//       //       p1,
//       //       draw,
//       //       p2,
//       //     },
//       //     update_at,
//       //     parse_time: moment().format("HH:mm:ss"),
//       //   });
//       //   await newGame.save();
//       // }
//       // await SportFootballGames.updateOne(
//       //   { game_id: +game.game_id },
//       //   {
//       //     odds: { p1, draw, p2 },
//       //     update_at,
//       //     parse_time: moment().format("HH:mm:ss"),
//       //   }
//       // );
//     }

//     if (type === "pre") {
//       const p1 = data.results[0]?.schedule?.sp?.main[0]?.odds || "";
//       const draw = data.results[0]?.schedule?.sp?.main[1]?.odds || "";
//       const p2 = data.results[0]?.schedule?.sp?.main[2]?.odds || "";
//       const goals_over_under =
//         data.results[0]?.goals?.sp?.goals_over_under || [];
//       const alternative_total_goals =
//         data.results[0]?.goals?.sp?.alternative_total_goals || [];
//       const goals_odd_even = data.results[0]?.goals?.sp?.goals_odd_even || [];
//       const both_teams_to_score =
//         data.results[0]?.goals?.sp?.both_teams_to_score || [];

//       const update_at =
//         (data.results[0]?.schedule?.updated_at ??
//           moment
//             .unix(data.results[0]?.schedule?.updated_at)
//             .utc()
//             .local()
//             .format("HH:mm:ss")) ||
//         "";

//       const status = await SportFootballGames.findOne({
//         game_id: +game.game_id,
//       });

//       if (!status) {
//         const newGame = new SportFootballGames({
//           ...game,
//           odds: {
//             p1,
//             draw,
//             p2,
//             goals_over_under,
//             alternative_total_goals,
//             goals_odd_even,
//             both_teams_to_score,
//           },
//           update_at,
//           parse_time: moment().format("HH:mm:ss"),
//         });
//         await newGame.save();
//       }

//       await SportFootballGames.updateOne(
//         { game_id: +game.game_id },
//         {
//           odds: {
//             p1,
//             draw,
//             p2,
//             goals_over_under,
//             alternative_total_goals,
//             goals_odd_even,
//             both_teams_to_score,
//           },
//           update_at,
//           parse_time: moment().format("HH:mm:ss"),
//         }
//       );

//       console.log(`Parse one match n.${game.game_id}`);
//     }
//   }
// }, 1000 * 60 * 5556);
