const Games = require("../models/games");
const MainStats = require("../models/mainstats");

module.exports.saveGames = async (data) => {
  try {
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

    const stats = await MainStats.findOne({});

    const game = new Games(data);
    await game.save();

    const countGame = `gamesStats.${typeBalance}.${typeGame}.countGame`;
    const countWinGame = `gamesStats.${typeBalance}.${typeGame}.countWinGame`;
    const countAmount = `gamesStats.${typeBalance}.${typeGame}.countAmount`;
    const countWinAmount = `gamesStats.${typeBalance}.${typeGame}.countWinAmount`;

    const countGameValue = stats.gamesStats[typeBalance][typeGame].countGame;
    const countWinGameValue =
      stats.gamesStats[typeBalance][typeGame].countWinGame;
    const countAmountValue =
      stats.gamesStats[typeBalance][typeGame].countAmount;
    const countWinAmountValue =
      stats.gamesStats[typeBalance][typeGame].countWinAmount;

    await MainStats.updateOne(
      {},
      {
        [countGame]: countGameValue + 1,
        [countWinGame]: countWinGameValue + (result === "win" ? 1 : 0),
        [countAmount]: +(+countAmountValue + +rateAmount).toFixed(2),
        [countWinAmount]: +(+countWinAmountValue + +rateWinAmount).toFixed(2),
      }
    );
  } catch (error) {}
};
