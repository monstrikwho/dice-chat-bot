const { Schema, model } = require("mongoose");

const schema = new Schema({
  week: String,
  games: Object,
  payments: Object,
  users: Object,
});

module.exports = model("WeekStats", schema);

// {
//   week: '2021-01-21',
//   games: {
//     countGames: Number,
//     winGames: Number,
//     amountRate: Number,
//     amountWinCash: Number,
//     slot: {
//       countGames: Number,
//       winGames: Number,
//       amoutnRate: Number,
//       amountWinCash: Number
//     },
//     dice: {
//       countGames: Number,
//       winGames: Number,
//       amoutnRate: Number,
//       amountWinCash: Number
//     },
//     football: {
//       countGames: Number,
//       winGames: Number,
//       amoutnRate: Number,
//       amountWinCash: Number
//     }
//   },
//   payments: {
//     amountInCash: Number,
//     amountOutCash: Number,
//     balance: Number
//   },
//   users: {
//     newUsers: Array,
//     refUsers: Array,
//     donaters: Array
//   }
// }