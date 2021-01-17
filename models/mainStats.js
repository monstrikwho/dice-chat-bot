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
//     countMainBalanceUsers: Number,
//   },
//   games: {
//     slot: {
//       rate: Object,  -- none
//       value: Object,  -- none
//       countGame: Number,
//       countWinGame: Number,
//       countAmount: Number,
//     },
//     dice: {
//       rate: Object,  -- none
//       value: Object  -- none
//       countGame: Number,
//       countWinGame: Number,
//       countAmount: Number,
//     },
//     football: {
//       rate: Object,  -- none
//       value: Object  -- none
//       countGame: Number,
//       countWinGame: Number,
//       countAmount: Number,
//     }
//   }
// }
