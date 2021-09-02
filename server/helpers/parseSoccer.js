const axios = require("axios");
const moment = require("moment");
const { create, all } = require("mathjs");
const math = create(all);

const SportsTopGames = require("../models/sportsTopGames");
const SportFootballGames = require("../models/sportFootballGames");
const MainStats = require("../models/mainstats");

const login = "iceinblood";
const token = "54811-x38emPLqcLOEFLV";

setInterval(() => parseSoccer("live"), 1000 * 7 * 1);
setInterval(() => parseSoccer("pre"), 1000 * 60 * 2);

async function parseSoccer(type) {
  const { topGames } = await SportsTopGames.findOne({
    sport: `soccer_${type}`,
  });

  for (let y = 0; y < topGames.length; y++) {
    const game = topGames[y];
    req(type, game);
  }

  async function req(type, game) {
    await axios
      .get(
        `https://spoyer.ru/api/get.php?login=${login}&token=${token}&task=${type}odds&bookmaker=bet365&game_id=${game.game_id}`
      )
      .then(async ({ data }) => {
        if (type === "live") {
          soccerLiveGames(data, game);
        }
        if (type === "pre") {
          soccerPreGames(data, game);
        }
      })
      .catch((err) => console.log(err.message));
  }
}

async function soccerLiveGames(data, game) {
  const { sportPercent } = await MainStats.findOne();
  // ******************* ODDs *******************
  let p1 = null;
  let draw = null;
  let p2 = null;

  let FH = {}; // First Half
  let SH = {}; // Second Half

  let odd = null;
  let even = null;

  // Обе забьют
  let BTS = {
    yes: null,
    no: null,
  };
  let BTS1H = {
    yes: null,
    no: null,
  };
  let BTS2H = {
    yes: null,
    no: null,
  };

  // Totals
  let MG = {};
  let totals = {};

  // ******************* ODDs *******************

  // Variables
  let NA = null;

  if (!data.results || !data.results[0]) return;
  data.results[0].map((item) => {
    const type = item.type;
    const parseOD =
      item.OD && +((math.evaluate(item.OD) + 1) * sportPercent).toFixed(2);

    if (type === "MG") {
      return (NA = item.NA);
    }

    if (NA === "Fulltime Result") {
      if (type === "PA" && !p1) {
        return (p1 = parseOD);
      }
      if (type === "PA" && !draw) {
        return (draw = parseOD);
      }
      if (type === "PA" && !p2) {
        return (p2 = parseOD);
      }
    }

    if (NA === "Half Time Result") {
      if (type === "PA" && !FH.p1) {
        return (FH.p1 = parseOD);
      }
      if (type === "PA" && !FH.draw) {
        return (FH.draw = parseOD);
      }
      if (type === "PA" && !FH.p2) {
        return (FH.p2 = parseOD);
      }
    }

    if (NA === "To Win 2nd Half") {
      if (type === "PA" && !SH.p1) {
        return (SH.p1 = parseOD);
      }
      if (type === "PA" && !SH.draw) {
        return (SH.draw = parseOD);
      }
      if (type === "PA" && !SH.p2) {
        return (SH.p2 = parseOD);
      }
    }

    if (NA === "Match Goals") {
      if (type === "PA" && !item.OD) {
        return (MG[item.NA.replace(".", ",")] = { over: null, under: null });
      }
      if (type === "PA" && !MG[item.HA.replace(".", ",")].over) {
        totals[`${item.HA.replace(".", ",")}O`] = parseOD;
        return (MG[item.HA.replace(".", ",")].over = parseOD);
      }
      if (type === "PA" && !MG[item.HA.replace(".", ",")].under) {
        totals[`${item.HA.replace(".", ",")}U`] = parseOD;
        return (MG[item.HA.replace(".", ",")].under = parseOD);
      }
    }

    if (NA === "Alternative Match Goals") {
      if (type === "PA" && !item.OD) {
        return (MG[item.NA.replace(".", ",")] = { over: null, under: null });
      }
      if (type === "PA" && !MG[item.HA.replace(".", ",")].over) {
        totals[`${item.HA.replace(".", ",")}O`] = parseOD;
        return (MG[item.HA.replace(".", ",")].over = parseOD);
      }
      if (type === "PA" && !MG[item.HA.replace(".", ",")].under) {
        totals[`${item.HA.replace(".", ",")}U`] = parseOD;
        return (MG[item.HA.replace(".", ",")].under = parseOD);
      }
    }

    if (NA === "Both Teams to Score") {
      if (type === "PA" && !BTS.yes) {
        return (BTS.yes = parseOD);
      }
      if (type === "PA" && !BTS.no) {
        return (BTS.no = parseOD);
      }
    }

    if (NA === "Both Teams to Score in 1st Half") {
      if (type === "PA" && !BTS1H.yes) {
        return (BTS1H.yes = parseOD);
      }
      if (type === "PA" && !BTS1H.no) {
        return (BTS1H.no = parseOD);
      }
    }

    if (NA === "Both Teams to Score in 2nd Half") {
      if (type === "PA" && !BTS2H.yes) {
        return (BTS2H.yes = parseOD);
      }
      if (type === "PA" && !BTS2H.no) {
        return (BTS2H.no = parseOD);
      }
    }

    if (NA === "Goals Odd/Even") {
      if (type === "PA" && !odd) {
        return (odd = parseOD);
      }
      if (type === "PA" && !even) {
        return (even = parseOD);
      }
    }
  });

  let odds = {};

  if (p1 && p1 < 30 && p2 < 30 && draw < 30) {
    odds.p1 = p1;
    odds.draw = draw;
    odds.p2 = p2;
  }
  if (FH.p1 && FH.p1 < 30 && FH.p2 < 30 && FH.draw < 30) {
    odds.FH_p1 = FH.p1;
    odds.FH_draw = FH.draw;
    odds.FH_p2 = FH.p2;
  }
  if (SH.p1 && SH.p1 < 30 && SH.p2 < 30 && SH.draw < 30) {
    odds.SH_p1 = SH.p1;
    odds.SH_draw = SH.draw;
    odds.SH_p2 = SH.p2;
  }
  if (even) {
    odds.even = even;
    odds.odd = odd;
  }
  if (BTS.yes) {
    odds.BTS_yes = BTS.yes;
    odds.BTS_no = BTS.no;
  }
  if (BTS1H.yes) {
    odds.BTS1H_yes = BTS1H.yes;
    odds.BTS1H_no = BTS1H.no;
  }
  if (BTS2H.yes) {
    odds.BTS2H_yes = BTS2H.yes;
    odds.BTS2H_no = BTS2H.no;
  }
  if (Object.keys(totals).length !== 0) {
    odds.totals = totals;
    odds = { ...odds, ...totals };
  }

  await SportFootballGames.updateOne(
    { game_id: +game.game_id },
    {
      odds,
      parse_time: moment().format("HH:mm:ss"),
    }
  );
}

async function soccerPreGames(data, game) {
  const { sportPercent } = await MainStats.findOne();
  const results = data.results && data.results[0];

  // const asian_lines = results && results.asian_lines;
  const goals = results && results.goals;
  const half = results && results.half;
  const main = results && results.main && results.main.sp;
  // const schedule = results && results.schedule;
  // const specials = results && results.specials;

  let p1 = null;
  let draw = null;
  let p2 = null;

  let FH_p1 = null;
  let FH_draw = null;
  let FH_p2 = null;

  let SH_p1 = null;
  let SH_draw = null;
  let SH_p2 = null;

  let odd = null;
  let even = null;

  let BTS_yes = null;
  let BTS_no = null;

  let BTS1H_yes = null;
  let BTS1H_no = null;

  let BTS2H_yes = null;
  let BTS2H_no = null;

  let MG = {};
  let totals = {};

  if (main && main["full_time_result"]) {
    p1 = +(+main["full_time_result"][0].odds * sportPercent).toFixed(2);
    draw = +(+main["full_time_result"][1].odds * sportPercent).toFixed(2);
    p2 = +(+main["full_time_result"][2].odds * sportPercent).toFixed(2);
  }

  if (half && half["half_time_result"]) {
    FH_p1 = +(+half["full_time_result"][0].odds * sportPercent).toFixed(2);
    FH_draw = +(+half["full_time_result"][1].odds * sportPercent).toFixed(2);
    FH_p2 = +(+half["full_time_result"][2].odds * sportPercent).toFixed(2);
  }

  if (goals && goals["goals_odd_even"]) {
    odd = +(+goals["goals_odd_even"][0].odds * sportPercent).toFixed(2);
    even = +(+goals["goals_odd_even"][1].odds * sportPercent).toFixed(2);
  }

  if (goals && goals["both_teams_to_score"]) {
    BTS_yes = +(+goals["both_teams_to_score"][0].odds * sportPercent).toFixed(
      2
    );
    BTS_no = +(+goals["both_teams_to_score"][1].odds * sportPercent).toFixed(2);
  }

  if (goals && goals["both_teams_to_score_in_1st_half"]) {
    BTS1H_yes = +(
      +goals["both_teams_to_score_in_1st_half"][0].odds * sportPercent
    ).toFixed(2);
    BTS1H_no = +(
      +goals["both_teams_to_score_in_1st_half"][1].odds * sportPercent
    ).toFixed(2);
  }

  if (goals && goals["both_teams_to_score_in_2nd_half"]) {
    BTS2H_yes = +(
      +goals["both_teams_to_score_in_2nd_half"][0].odds * sportPercent
    ).toFixed(2);
    BTS2H_no = +(
      +goals["both_teams_to_score_in_2nd_half"][1].odds * sportPercent
    ).toFixed(2);
  }

  if (goals && goals["goals_over_under"]) {
    const interval = goals["goals_over_under"].length / 3;
    goals["goals_over_under"].map((item, i) => {
      if (item.odds.length === 0) {
        totals[item.name.replace(".", ",")] = +(
          +goals["goals_over_under"][i + interval].odds * sportPercent
        ).toFixed(2);
        totals[item.name.replace(".", ",")] = +(
          +goals["goals_over_under"][i + interval * 2].odds * sportPercent
        ).toFixed(2);
      }
    });
  }

  if (goals && goals["alternative_total_goals"]) {
    const interval = goals["alternative_total_goals"].length / 3;
    goals["alternative_total_goals"].map((item, i) => {
      if (item.odds.length === 0) {
        totals[`${item.name.replace(".", ",")}O`] = +(
          +goals["alternative_total_goals"][i + interval].odds * sportPercent
        ).toFixed(2);
        totals[`${item.name.replace(".", ",")}U`] = +(
          +goals["alternative_total_goals"][i + interval * 2].odds *
          sportPercent
        ).toFixed(2);
      }
    });
  }

  let odds = {};

  if (p1) {
    odds.p1 = p1;
    odds.draw = draw;
    odds.p2 = p2;
  }
  if (FH_p1) {
    odds.FH_p1 = FH_p1;
    odds.FH_draw = FH_draw;
    odds.FH_p2 = FH_p2;
  }
  if (SH_p1) {
    odds.SH_p1 = SH_p1;
    odds.SH_draw = SH_draw;
    odds.SH_p2 = SH_p2;
  }
  if (even) {
    odds.even = even;
    odds.odd = odd;
  }
  if (BTS_yes) {
    odds.BTS_yes = BTS_yes;
    odds.BTS_no = BTS_no;
  }
  if (BTS1H_yes) {
    odds.BTS1H_yes = BTS1H_yes;
    odds.BTS1H_no = BTS1H_no;
  }
  if (BTS2H_yes) {
    odds.BTS2H_yes = BTS2H_yes;
    odds.BTS2H_no = BTS2H_no;
  }
  if (Object.keys(totals).length !== 0) {
    odds.totals = totals;
    odds = { ...odds, ...totals };
  }

  await SportFootballGames.updateOne(
    { game_id: +game.game_id },
    {
      odds,
      parse_time: moment().format("HH:mm:ss"),
    }
  );
}
