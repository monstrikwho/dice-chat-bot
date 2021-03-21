const Games = require("../models/games");
const MainStats = require("../models/mainstats");

module.exports.saveGames = async (data) => {
  const {
    typeGame,
    typeBalance,
    result,
    rateAmount,
    rateWinAmount,
    rateValue,
    rate,
    userId,
    date,
  } = data;

  const game = new Games(data);
  await game.save();

  if (typeBalance === "mainGame") {
    const countGame = `gamesStats.${typeGame}.countGame`;
    const countWinGame = `gamesStats.${typeGame}.countWinGame`;
    const countAmount = `gamesStats.${typeGame}.countAmount`;
    const countWinAmount = `gamesStats.${typeGame}.countWinAmount`;
    await MainStats.updateOne(
      {},
      {
        $inc: {
          [countGame]: 1,
          [countWinGame]: result === "win" ? 1 : 0,
          [countAmount]: rateAmount,
          [countWinAmount]: rateWinAmount,
        },
      }
    );
  }
};
