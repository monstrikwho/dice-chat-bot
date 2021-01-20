const { Schema, model } = require("mongoose");

const schema = new Schema({
  ads: Object,
  orderStats: Object,
  usersStats: Object,
  games: Object,
});

module.exports = model("MainStats", schema);

// {
//   ads: {
//     '123': Number,
//     '234': Number,
//   },
//   orderStats: {
//     lastNumberOrder: Number,
//     amountInMoney: Number,
//     amountOutMoney: Number,
//     countInOrder: Number,
//     countOutOrder: Number,
//   },
//   usersStats: {
//     countUsers: Number,
//     countUsersBlocked: Number,
//     countRefUsers: Number,
//     donatedUsers: Array,
//   },
//   games: {
//     slot: {
//       countGame: Number,
//       countWinGame: Number,
//       countAmount: Number,
//       countWinAmount: Number
//     },
//     dice: {
//       countGame: Number,
//       countWinGame: Number,
//       countAmount: Number,
//       countWinAmount: Number
//     },
//     football: {
//       countGame: Number,
//       countWinGame: Number,
//       countAmount: Number,
//       countWinAmount: Number
//     }
//   }
// }
