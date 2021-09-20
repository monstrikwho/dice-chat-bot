const { bot } = require("../init/startBot");
const axios = require("axios");

const User = require("../models/user");
const SportRates = require("../models/sportRates");
const SportFootballGames = require("../models/footballGames");
const BasketballGames = require("../models/basketballGames");
const TennisGames = require("../models/tennisGames");

const sports = ["soccer", "basketball", "tennis"];

const login = "iceinblood";
const token = "54811-x38emPLqcLOEFLV";

const chunks = 10;

setInterval(checkResGames, 1000 * 60 * 5);
async function checkResGames() {
  const footballGames = await SportFootballGames.find({
    time_status: [0, 1, 4],
  });
  const basketballGames = await BasketballGames.find({
    time_status: [0, 1, 4],
  });
  const tennisGames = await TennisGames.find({ time_status: [0, 1, 4] });

  const games = [...footballGames, ...basketballGames, ...tennisGames];

  for (let game of games) {
    const game_id = game.game_id;
    await axios
      .get(
        `https://spoyer.ru/api/get.php?login=${login}&token=${token}&task=result&bookmaker=bet365&game_id=${game_id}`
      )
      .then(async ({ data }) => {
        const results = data.results && data.results[0];
        if (!results) return;

        if (game.time_status === 4 && results.time_status !== "3") return;

        if (results.time_status === "3" && results.sport_id === "1") {
          return await SportFootballGames.updateOne(
            { game_id },
            { results, time_status: results.time_status }
          );
        }
        if (results.time_status === "3" && results.sport_id === "18") {
          return await BasketballGames.updateOne(
            { game_id },
            { results, time_status: results.time_status }
          );
        }
        if (results.time_status === "3" && results.sport_id === "13") {
          return await TennisGames.updateOne(
            { game_id },
            { results, time_status: results.time_status }
          );
        }

        if (results.sport_id === "1") {
          const activeGames = await SportFootballGames.find({ time_status: 1 });
          if (activeGames.length < chunks) {
            await SportFootballGames.updateOne(
              { game_id },
              { time_status: results.time_status }
            );
          }
        }
        if (results.sport_id === "18") {
          const activeGames = await BasketballGames.find({ time_status: 1 });
          if (activeGames.length < chunks) {
            await BasketballGames.updateOne(
              { game_id },
              { time_status: results.time_status }
            );
          }
        }
        if (results.sport_id === "13") {
          const activeGames = await TennisGames.find({ time_status: 1 });
          if (activeGames.length < chunks) {
            await TennisGames.updateOne(
              { game_id },
              { time_status: results.time_status }
            );
          }
        }
      })
      .catch((err) => {});
  }
}

setInterval(checkSportRates, 1000 * 60 * 5);
async function checkSportRates() {
  for (let type_sport of sports) {
    const rates = await SportRates.find({
      status: "active",
      typeSport: type_sport,
    });

    for (let i = 0; i < rates.length; i++) {
      let game = null;

      if (type_sport === "soccer") {
        game = await SportFootballGames.findOne({
          game_id: rates[i].game_id,
          time_status: 3,
        });
      }
      if (type_sport === "tennis") {
        game = await TennisGames.findOne({
          game_id: rates[i].game_id,
          time_status: 3,
        });
      }
      if (type_sport === "basketball") {
        game = await BasketballGames.findOne({
          game_id: rates[i].game_id,
          time_status: 3,
        });
      }

      if (game) {
        calcBid(
          rates[i].userId,
          rates[i].rate_id,
          rates[i].rates,
          rates[i].odds,
          game,
          type_sport
        );
      }
    }
  }
}

async function calcBid(userId, rate_id, rates, odds, game, type_sport) {
  let winSum = 0;

  if (type_sport === "soccer") {
    for (let [key, value] of Object.entries(rates)) {
      const score = game.results.ss.split("-");
      const scoreFH = game.results.scores[1];
      const scoreSH = game.results.scores[2];

      if (key !== "totals" && value !== 0) {
        if (key === "p1" && +score[0] > +score[1]) {
          winSum += value * odds[key];
        }

        if (key === "draw" && +score[0] === +score[1]) {
          winSum += value * odds[key];
        }

        if (key === "p2" && +score[0] < +score[1]) {
          winSum += value * odds[key];
        }

        if (key === "even" && (+score[0] + +score[1]) % 2 === 0) {
          winSum += value * odds[key];
        }

        if (key === "odd" && (+score[0] + +score[1]) % 2 !== 0) {
          winSum += value * odds[key];
        }

        if (key === "FH_p1" && +scoreFH.home > +scoreFH.away) {
          winSum += value * odds[key];
        }

        if (key === "FH_draw" && +scoreFH.home === +scoreFH.away) {
          winSum += value * odds[key];
        }

        if (key === "FH_p2" && +scoreFH.home < +scoreFH.away) {
          winSum += value * odds[key];
        }

        if (key === "SH_p1" && +scoreSH.home > +scoreSH.away) {
          winSum += value * odds[key];
        }

        if (key === "SH_draw" && +scoreSH.home === +scoreSH.away) {
          winSum += value * odds[key];
        }

        if (key === "SH_p2" && +scoreSH.home < +scoreSH.away) {
          winSum += value * odds[key];
        }

        if (key === "BTS_yes" && +score[0] > 0 && +score[1] > 0) {
          winSum += value * odds[key];
        }

        if (key === "BTS_no" && +score[0] === 0 && +score[1] === 0) {
          winSum += value * odds[key];
        }

        if (key === "BTS1H_yes" && +scoreFH.home > 0 && +scoreFH.away > 0) {
          winSum += value * odds[key];
        }

        if (key === "BTS1H_no" && +scoreFH.home === 0 && +scoreFH.away === 0) {
          winSum += value * odds[key];
        }

        if (key === "BTS2H_yes" && +scoreSH.home > 0 && +scoreSH.away > 0) {
          winSum += value * odds[key];
        }

        if (key === "BTS2H_no" && +scoreSH.home === 0 && +scoreSH.away === 0) {
          winSum += value * odds[key];
        }

        const type = key.match(/U|O/g);
        const total = +key.replace(type, "").replace(",", ".");

        if (type && type[0] === "O") {
          if (total > +score[0] + +score[1]) {
            winSum += value * odds[key];
          }
        }

        if (type && type[0] === "U") {
          if (total < +score[0] + +score[1]) {
            winSum += value * odds[key];
          }
        }
      }
    }
  }

  if (type_sport === "basketball") {
    const score = game.results.ss.split("-");
    const q1 = game.results.scores[1];
    const q2 = game.results.scores[2];
    const h1 = game.results.scores[3];
    const q3 = game.results.scores[4];
    const q4 = game.results.scores[5];
    const h2 = +q3.home + +q3.away + +q4.home + +q4.away;

    for (let [key, value] of Object.entries(rates)) {
      if (value !== 0) {
        if (
          key.match(/(?:gl|spread)/g) &&
          key.match(/(?:gl|spread)/g).length === 2
        ) {
          const keyArr = key.split("_");
          const t = +keyArr[1].replace("t", "");
          const spread = +keyArr[3];
          if (t === 1 && +score[0] + spread > +score[1]) {
            winSum += value * odds[key];
          }
          if (t === 2 && +score[1] + spread > +score[0]) {
            winSum += value * odds[key];
          }
        }
        if (
          key.match(/(?:fsth|spread)/g) &&
          key.match(/(?:fsth|spread)/g).length === 2
        ) {
          const keyArr = key.split("_");
          const t = +keyArr[1].replace("t", "");
          const spread = +keyArr[3];
          if (t === 1 && +h1.home + spread > +h1.away) {
            winSum += value * odds[key];
          }
          if (t === 2 && +h1.away + spread > +h1.home) {
            winSum += value * odds[key];
          }
        }
        if (
          key.match(/(?:sndh|spread)/g) &&
          key.match(/(?:sndh|spread)/g).length === 2
        ) {
          const keyArr = key.split("_");
          const t = +keyArr[1].replace("t", "");
          const spread = +keyArr[3];
          if (t === 1 && +h2.home + spread > +h2.away) {
            winSum += value * odds[key];
          }
          if (t === 2 && +h2.away + spread > +h2.home) {
            winSum += value * odds[key];
          }
        }
        if (
          key.match(/(?:gl|total)/g) &&
          key.match(/(?:gl|total)/g).length === 2
        ) {
          const keyArr = key.split("_");
          const total = +keyArr[3].replace(/o|u/, "");
          const type = keyArr[3].match(/o|u/)[0].toUpperCase();
          if (+score[0] + +score[1] > total && type === "O") {
            winSum += value * odds[key];
          }
          if (+score[0] + +score[1] < total && type === "U") {
            winSum += value * odds[key];
          }
        }
        if (
          key.match(/(?:fsth|total)/g) &&
          key.match(/(?:fsth|total)/g).length === 2
        ) {
          const keyArr = key.split("_");
          const total = +keyArr[3].replace(/o|u/, "");
          const type = keyArr[3].match(/o|u/)[0].toUpperCase();
          if (+h1.home + +h1.away > total && type === "O") {
            winSum += value * odds[key];
          }
          if (+h1.home + +h1.awat < total && type === "U") {
            winSum += value * odds[key];
          }
        }
        if (
          key.match(/(?:sndh|total)/g) &&
          key.match(/(?:sndh|total)/g).length === 2
        ) {
          const keyArr = key.split("_");
          const total = +keyArr[3].replace(/o|u/, "");
          const type = keyArr[3].match(/o|u/)[0].toUpperCase();
          if (+h2.home + +h2.away > total && type === "O") {
            winSum += value * odds[key];
          }
          if (+h2.home + +h2.away < total && type === "U") {
            winSum += value * odds[key];
          }
        }
        if (
          key.match(/(?:gl|moneyline)/g) &&
          key.match(/(?:gl|moneyline)/g).length === 2
        ) {
          const keyArr = key.split("_");
          const numbTeam = +keyArr[1].replace("t", "");
          if (+score[0] > +score[1] && numbTeam === 1) {
            winSum += value * odds[key];
          }
          if (+score[0] < +score[1] && numbTeam === 2) {
            winSum += value * odds[key];
          }
        }
        if (
          key.match(/(?:fsth|moneyline)/g) &&
          key.match(/(?:fsth|moneyline)/g).length === 2
        ) {
          const keyArr = key.split("_");
          const numbTeam = +keyArr[1].replace("t", "");
          if (+h1.home > +h1.away && numbTeam === 1) {
            winSum += value * odds[key];
          }
          if (+h1.home < +h1.away && numbTeam === 1) {
            winSum += value * odds[key];
          }
        }
        if (
          key.match(/(?:sndh|moneyline)/g) &&
          key.match(/(?:sndh|moneyline)/g).length === 2
        ) {
          const keyArr = key.split("_");
          const numbTeam = +keyArr[1].replace("t", "");
          if (+h2.home > +h2.away && numbTeam === 1) {
            winSum += value * odds[key];
          }
          if (+h2.home < +h2.away && numbTeam === 1) {
            winSum += value * odds[key];
          }
        }
        if (key === "HSH_fh") {
          if (+h1.home + +h1.away > +h2.home + +h2.away) {
            winSum += value * odds[key];
          }
        }
        if (key === "HSH_sh") {
          if (+h1.home + +h1.away < +h2.home + +h2.away) {
            winSum += value * odds[key];
          }
        }
        if (key === "HSH_tie") {
          if (+h1.home + +h1.away === +h2.home + +h2.away) {
            winSum += value * odds[key];
          }
        }
        if (key.match(/odd/)) {
          const type = key.replace("odd_", "");
          if (type === "match") {
            if ((+score[0] + +score[1]) % 2 !== 0) {
              winSum += value * odds[key];
            }
          }
          if (type === "1sthalf") {
            if ((+h1.home + +h1.away) % 2 !== 0) {
              winSum += value * odds[key];
            }
          }
          if (type === "2ndhalf") {
            if ((+h2.home + +h2.away) % 2 !== 0) {
              winSum += value * odds[key];
            }
          }
          if (type === "1stquarter") {
            if ((+q1.home + +q1.away) % 2 !== 0) {
              winSum += value * odds[key];
            }
          }
          if (type === "2ndquarter") {
            if ((+q2.home + +q2.away) % 2 !== 0) {
              winSum += value * odds[key];
            }
          }
          if (type === "3rdquarter") {
            if ((+q3.home + +q3.away) % 2 !== 0) {
              winSum += value * odds[key];
            }
          }
          if (type === "4thquarter") {
            if ((+q4.home + +q4.away) % 2 !== 0) {
              winSum += value * odds[key];
            }
          }
        }
        if (key.match(/even/)) {
          const type = key.replace("even_", "");
          if (type === "match") {
            if ((+score[0] + +score[1]) % 2 === 0) {
              winSum += value * odds[key];
            }
          }
          if (type === "1sthalf") {
            if ((+h1.home + +h1.away) % 2 === 0) {
              winSum += value * odds[key];
            }
          }
          if (type === "2ndhalf") {
            if ((+h2.home + +h2.away) % 2 === 0) {
              winSum += value * odds[key];
            }
          }
          if (type === "1stquarter") {
            if ((+q1.home + +q1.away) % 2 === 0) {
              winSum += value * odds[key];
            }
          }
          if (type === "2ndquarter") {
            if ((+q2.home + +q2.away) % 2 === 0) {
              winSum += value * odds[key];
            }
          }
          if (type === "3rdquarter") {
            if ((+q3.home + +q3.away) % 2 === 0) {
              winSum += value * odds[key];
            }
          }
          if (type === "4thquarter") {
            if ((+q4.home + +q4.away) % 2 === 0) {
              winSum += value * odds[key];
            }
          }
        }
      }
    }
  }

  if (type_sport === "tennis") {
    let m_score = {
      p1: 0,
      p2: 0,
    };
    let s1_score = {
      p1: 0,
      p2: 0,
    };
    let s2_score = {
      p1: 0,
      p2: 0,
    };
    let s3_score = {
      p1: 0,
      p2: 0,
    };

    const score = game.results.ss.split(",");
    score.map((item, i) => {
      const ss = item.split("-");
      if (i === 0) {
        s1_score.p1 += ss[0];
        s1_score.p2 += ss[1];
        if (ss[0] > ss[1]) {
          m_score.p1++;
        } else {
          m_score.p2++;
        }
      }
      if (i === 1) {
        s2_score.p1 += ss[0];
        s2_score.p2 += ss[1];
        if (ss[0] > ss[1]) {
          m_score.p1++;
        } else {
          m_score.p2++;
        }
      }
      if (i === 2) {
        s3_score.p1 += ss[0];
        s3_score.p2 += ss[1];
        if (ss[0] > ss[1]) {
          m_score.p1++;
        } else {
          m_score.p2++;
        }
      }
    });

    for (let [key, value] of Object.entries(rates)) {
      if (value !== 0) {
        if (key === "tw_p1_match" && m_score.p1 > m_score.p2) {
          winSum += value * odds[key];
        }
        if (key === "tw_p2_match" && m_score.p1 < m_score.p2) {
          winSum += value * odds[key];
        }
        if (key === "tw_p1_set1" && s1_score.p1 > s1_score.p2) {
          winSum += value * odds[key];
        }
        if (key === "tw_p2_set1" && s1_score.p1 < s1_score.p2) {
          winSum += value * odds[key];
        }
        if (key === "tw_p1_set2" && s2_score.p1 > s2_score.p2) {
          winSum += value * odds[key];
        }
        if (key === "tw_p2_set2" && s2_score.p1 < s2_score.p2) {
          winSum += value * odds[key];
        }
        if (key === "tw_p1_set3" && s3_score.p1 > s3_score.p2) {
          winSum += value * odds[key];
        }
        if (key === "tw_p2_set3" && s3_score.p1 < s3_score.p2) {
          winSum += value * odds[key];
        }
        if (key.match(/tgs1_over/)) {
          const total = +key.replace("tgs1_over_", "");
          if (s1_score.p1 + s1_score.p2 > total) {
            winSum += value * odds[key];
          }
        }
        if (key.match(/tgs2_over/)) {
          const total = +key.replace("tgs2_over_", "");
          if (s2_score.p1 + s2_score.p2 > total) {
            winSum += value * odds[key];
          }
        }
        if (key.match(/tgs3_over/)) {
          const total = +key.replace("tgs3_over_", "");
          if (s3_score.p1 + s3_score.p2 > total) {
            winSum += value * odds[key];
          }
        }
        if (key.match(/tgs1_under/)) {
          const total = +key.replace("tgs1_under_", "");
          if (s1_score.p1 + s1_score.p2 < total) {
            winSum += value * odds[key];
          }
        }
        if (key.match(/tgs2_under/)) {
          const total = +key.replace("tgs2_under_", "");
          if (s2_score.p1 + s2_score.p2 < total) {
            winSum += value * odds[key];
          }
        }
        if (key.match(/tgs3_under/)) {
          const total = +key.replace("tgs3_under_", "");
          if (s3_score.p1 + s3_score.p2 < total) {
            winSum += value * odds[key];
          }
        }
        if (key.match(/tgm_over/)) {
          const total = +key.replace("tgm_over_", "");
          const tgm =
            s1_score.p1 +
            s1_score.p2 +
            s2_score.p1 +
            s2_score.p2 +
            s3_score.p1 +
            s3_score.p2;
          if (tgm > total) {
            winSum += value * odds[key];
          }
        }
        if (key.match(/tgm_under/)) {
          const total = +key.replace("tgm_under_", "");
          const tgm =
            s1_score.p1 +
            s1_score.p2 +
            s2_score.p1 +
            s2_score.p2 +
            s3_score.p1 +
            s3_score.p2;
          if (tgm < total) {
            winSum += value * odds[key];
          }
        }
        if (key.match(/(?:sb|2-0)/g) && key.match(/(?:sb|2-0)/g).length === 2) {
          const t = +key.split("_")[1].replace("p", "");
          if (t === 1 && m_score.p1 === 2 && m_score.p2 === 0) {
            winSum += value * odds[key];
          }
          if (t === 2 && m_score.p1 === 0 && m_score.p2 === 2) {
            winSum += value * odds[key];
          }
        }
        if (key.match(/(?:sb|2-1)/g) && key.match(/(?:sb|2-1)/g).length === 2) {
          const t = +key.split("_")[1].replace("p", "");
          if (t === 1 && m_score.p1 === 2 && m_score.p2 === 1) {
            winSum += value * odds[key];
          }
          if (t === 2 && m_score.p1 === 1 && m_score.p2 === 2) {
            winSum += value * odds[key];
          }
        }
        if (key === "TS2" && score.length === 2) {
          winSum += value * odds[key];
        }
        if (key === "TS3" && score.length === 3) {
          winSum += value * odds[key];
        }
        if (key === "MTGOE_odd") {
          const tgm =
            s1_score.p1 +
            s1_score.p2 +
            s2_score.p1 +
            s2_score.p2 +
            s3_score.p1 +
            s3_score.p2;
          if (tgm % 2 !== 0) {
            winSum += value * odds[key];
          }
        }
        if (key === "MTGOE_even") {
          const tgm =
            s1_score.p1 +
            s1_score.p2 +
            s2_score.p1 +
            s2_score.p2 +
            s3_score.p1 +
            s3_score.p2;
          if (tgm % 2 === 0) {
            winSum += value * odds[key];
          }
        }
        if (key.match(/S2W/)) {
          const t = +key.replace("S2W_p", "");
          if (t === 1 && s2_score.p1 > s2_score.p2) {
            winSum += value * odds[key];
          }
          if (t === 2 && s2_score.p1 < s2_score.p2) {
            winSum += value * odds[key];
          }
        }
        if (key.match(/S3W/)) {
          const t = +key.replace("S3W_p", "");
          if (t === 1 && s3_score.p1 > s3_score.p2) {
            winSum += value * odds[key];
          }
          if (t === 2 && s3_score.p1 < s3_score.p2) {
            winSum += value * odds[key];
          }
        }
      }
    }
  }

  const { mainBalance } = await User.findOne({ userId });

  if (winSum > 0) {
    await bot.telegram.sendMessage(
      userId,
      `Ваша ставка #${rate_id} выиграла 
Ваш выигрыш составил ${+winSum.toFixed(2)} P`
    );
    await SportRates.updateOne(
      { rate_id },
      {
        result: { name: "win", cash: +winSum.toFixed(2) },
        status: "cashout",
        game_res: game.results,
      }
    );
    await User.updateOne(
      { userId },
      { mainBalance: +(mainBalance + winSum).toFixed(2) }
    );
  }

  if (winSum === 0) {
    await bot.telegram.sendMessage(userId, `Ваша ставка #${rate_id} проиграла`);
    await SportRates.updateOne(
      { rate_id },
      {
        result: { name: "lose", cash: 0 },
        status: "cashout",
        game_res: game.results,
      }
    );
  }
}
