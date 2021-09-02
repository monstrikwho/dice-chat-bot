const axios = require("axios");
const moment = require("moment");
const { create, all } = require("mathjs");
const math = create(all);

const SportsTopGames = require("../models/sportsTopGames");
const TennisGames = require("../models/tennisGames");
const MainStats = require("../models/mainstats");

const login = "iceinblood";
const token = "54811-x38emPLqcLOEFLV";

setInterval(() => parseTennis("live"), 1000 * 7 * 1);
setInterval(() => parseTennis("pre"), 1000 * 60 * 2);

async function parseTennis(type) {
  const { topGames } = await SportsTopGames.findOne({
    sport: `tennis_${type}`,
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
          tennisLiveGames(data, game);
        }
        if (type === "pre") {
          tennisPreGames(data, game);
        }
      })
      .catch((err) => console.log(err.message));
  }
}

async function tennisLiveGames(data, game) {
  const { sportPercent } = await MainStats.findOne();
  // ******************* ODDs *******************

  let TW = [];

  let TGS1 = [];
  let TGS2 = [];
  let TGS3 = [];

  let TGM = [];

  let SB = [];

  let TS2 = null;
  let TS3 = null;

  let MTGOE_odd = null;
  let MTGOE_even = null;

  let S2W = {
    p1: null,
    p2: null,
  };
  let S3W = {
    p1: null,
    p2: null,
  };

  // ******************* ODDs *******************

  let NA = null;

  if (!data.results || !data.results[0]) return;
  data.results[0].map((item) => {
    const type = item.type;
    const parseOD =
      item.OD && +(math.evaluate(item.OD) + 1 + sportPercent).toFixed(2);

    if (type === "MG") {
      MA_c = 0;
      return (NA = item.NA);
    }

    if (NA === "To Win") {
      if (type === "PA" && !item.OD) {
        return (TW[item.OR] = { name: item.NA });
      }
      if (type === "PA" && !TW[item.OR].p1) {
        return (TW[item.OR].p1 = parseOD);
      }
      if (type === "PA" && !TW[item.OR].p2) {
        return (TW[item.OR].p2 = parseOD);
      }
    }

    if (NA === "Total Games in Set 1") {
      if (type === "PA" && !item.OD) {
        return (TGS1[item.OR] = { name: item.NA });
      }
      if (type === "PA" && !TGS1[item.OR].over) {
        return (TGS1[item.OR].over = parseOD);
      }
      if (type === "PA" && !TGS1[item.OR].under) {
        return (TGS1[item.OR].under = parseOD);
      }
    }

    if (NA === "Total Games in Set 2") {
      if (type === "PA" && !item.OD) {
        return (TGS2[item.OR] = { name: item.NA });
      }
      if (type === "PA" && !TGS2[item.OR].over) {
        return (TGS2[item.OR].over = parseOD);
      }
      if (type === "PA" && !TGS2[item.OR].under) {
        return (TGS2[item.OR].under = parseOD);
      }
    }

    if (NA === "Total Games in Set 3") {
      if (type === "PA" && !item.OD) {
        return (TGS3[item.OR] = { name: item.NA });
      }
      if (type === "PA" && !TGS3[item.OR].over) {
        return (TGS3[item.OR].over = parseOD);
      }
      if (type === "PA" && !TGS3[item.OR].under) {
        return (TGS3[item.OR].under = parseOD);
      }
    }

    if (NA === "Total Games in Match") {
      if (type === "PA" && !item.OD) {
        return (TGM[item.OR] = { name: item.NA });
      }
      if (type === "PA" && !TGM[item.OR].over) {
        return (TGM[item.OR].over = parseOD);
      }
      if (type === "PA" && !TGM[item.OR].under) {
        return (TGM[item.OR].under = parseOD);
      }
    }

    if (NA === "Set Betting") {
      if (type === "PA" && !item.OD) {
        return (SB[item.OR] = { name: item.NA });
      }
      if (type === "PA" && !SB[item.OR].p1) {
        return (SB[item.OR].p1 = parseOD);
      }
      if (type === "PA" && !SB[item.OR].p2) {
        return (SB[item.OR].p2 = parseOD);
      }
    }

    if (NA === "Total Sets") {
      if (type === "PA" && item.NA === "2 Sets") {
        return (TS2 = parseOD);
      }
      if (type === "PA" && item.NA === "3 Sets") {
        return (TS3 = parseOD);
      }
    }

    if (NA === "Match Total Games Odd/Even") {
      if (type === "PA" && item.NA === "Odd") {
        return (MTGOE_odd = parseOD);
      }
      if (type === "PA" && item.NA === "Even") {
        return (MTGOE_even = parseOD);
      }
    }

    if (NA === "Set 2 Winner") {
      if (type === "PA" && !S2W.p1) {
        return (S2W.p1 = parseOD);
      }
      if (type === "PA" && !S2W.p2) {
        return (S2W.p2 = parseOD);
      }
    }

    if (NA === "Set 3 Winner") {
      if (type === "PA" && !S3W.p1) {
        return (S3W.p1 = parseOD);
      }
      if (type === "PA" && !S3W.p2) {
        return (S3W.p2 = parseOD);
      }
    }
  });

  let odds = {};

  if (TW[0]) {
    TW.map((item) => {
      if (item.p1 && item.p2) {
        odds[
          `TW_p1_${item.name}`
            .replace(/\s/g, "")
            .replace(".", ",")
            .toLowerCase()
        ] = item.p1;
        odds[
          `TW_p2_${item.name}`
            .replace(/\s/g, "")
            .replace(".", ",")
            .toLowerCase()
        ] = item.p2;
      }
    });
  }

  if (TGS1[0]) {
    TGS1.map((item) => {
      if (item.over && item.under) {
        odds[
          `TGS1_over_${item.name}`
            .replace(/\s/g, "")
            .replace(".", ",")
            .toLowerCase()
        ] = item.over;
        odds[
          `TGS1_under_${item.name}`
            .replace(/\s/g, "")
            .replace(".", ",")
            .toLowerCase()
        ] = item.under;
      }
    });
  }

  if (TGS2[0]) {
    TGS2.map((item) => {
      if (item.over && item.under) {
        odds[
          `TGS2_over_${item.name}`
            .replace(/\s/g, "")
            .replace(".", ",")
            .toLowerCase()
        ] = item.over;
        odds[
          `TGS2_under_${item.name}`
            .replace(/\s/g, "")
            .replace(".", ",")
            .toLowerCase()
        ] = item.under;
      }
    });
  }

  if (TGS3[0]) {
    TGS3.map((item) => {
      if (item.over && item.under) {
        odds[
          `TGS3_over_${item.name}`
            .replace(/\s/g, "")
            .replace(".", ",")
            .toLowerCase()
        ] = item.over;
        odds[
          `TGS3_under_${item.name}`
            .replace(/\s/g, "")
            .replace(".", ",")
            .toLowerCase()
        ] = item.under;
      }
    });
  }

  if (TGM[0]) {
    TGM.map((item) => {
      if (item.over && item.under) {
        odds[
          `TGM_over_${item.name}`
            .replace(/\s/g, "")
            .replace(".", ",")
            .toLowerCase()
        ] = item.over;
        odds[
          `TGM_under_${item.name}`
            .replace(/\s/g, "")
            .replace(".", ",")
            .toLowerCase()
        ] = item.under;
      }
    });
  }

  if (SB[0]) {
    SB.map((item) => {
      if (item.p1 && item.p2) {
        odds[
          `SB_p1_${item.name}`
            .replace(/\s/g, "")
            .replace(".", ",")
            .toLowerCase()
        ] = item.p1;
        odds[
          `SB_p2_${item.name}`
            .replace(/\s/g, "")
            .replace(".", ",")
            .toLowerCase()
        ] = item.p2;
      }
    });
  }

  if (TS2) {
    odds.TS2 = TS2;
    odds.TS3 = TS3;
  }

  if (MTGOE_odd) {
    odds.MTGOE_odd = MTGOE_odd;
    odds.MTGOE_even = MTGOE_even;
  }

  if (S2W.p1) {
    odds.S2W_p1 = S2W.p1;
  }
  if (S2W.p2) {
    odds.S2W_p2 = S2W.p2;
  }

  if (S3W.p1) {
    odds.S3W_p1 = S3W.p1;
  }
  if (S3W.p2) {
    odds.S3W_p2 = S3W.p2;
  }

  await TennisGames.updateOne(
    { game_id: +game.game_id },
    {
      odds,
      parse_time: moment().format("HH:mm:ss"),
    }
  );
}

async function tennisPreGames(data, game) {
  const { sportPercent } = await MainStats.findOne();
  const results = data.results && data.results[0];

  const main = results && results.main && results.main.sp;

  // ******************* ODDs *******************

  let tw_p1_match = null;
  let tw_p2_match = null;
  let tw_p1_set1 = null;
  let tw_p2_set1 = null;

  let TGS1 = [];

  let SB = [];

  let TS2 = null;
  let TS3 = null;

  // ******************* ODDs *******************

  if (main && main["to_win_match"]) {
    tw_p1_match = +(+main["to_win_match"][0].odds * sportPercent).toFixed(2);
    tw_p2_match = +(+main["to_win_match"][1].odds * sportPercent).toFixed(2);
  }

  if (main && main["first_set_winner"]) {
    tw_p1_set1 = +(+main["first_set_winner"][0].odds * sportPercent).toFixed(2);
    tw_p2_set1 = +(+main["first_set_winner"][1].odds * sportPercent).toFixed(2);
  }

  if (main && main["set_betting"]) {
    const int = main["set_betting"].length / 3;
    main["set_betting"].map((item, i) => {
      if (item.name) {
        SB[i] = {
          name: item.name,
          p1: +(+main["set_betting"][i + int].odds * sportPercent).toFixed(2),
          p2: +(+main["set_betting"][i + int * 2].odds * sportPercent).toFixed(
            2
          ),
        };
      }
    });
  }

  if (main && main["total_sets"]) {
    TS2 = +(+main["total_sets"][0].odds * sportPercent).toFixed(2);
    TS3 = +(+main["total_sets"][1].odds * sportPercent).toFixed(2);
  }

  if (main && main["1st_set_total_games"]) {
    const int = main["1st_set_total_games"].length / 3;
    main["1st_set_total_games"].map((item, i) => {
      if (item.name) {
        TGS1[i] = {
          name: item.name,
          over: +(
            +main["1st_set_total_games"][i + int].odds * sportPercent
          ).toFixed(2),
          under: +(
            +main["1st_set_total_games"][i + int * 2].odds * sportPercent
          ).toFixed(2),
        };
      }
    });
  }

  let odds = {};

  if (tw_p1_match) {
    odds.tw_p1_match = tw_p1_match;
    odds.tw_p2_match = tw_p2_match;
  }

  if (tw_p1_set1) {
    odds.tw_p1_set1 = tw_p1_set1;
    odds.tw_p2_set1 = tw_p2_set1;
  }

  if (TGS1[0]) {
    TGS1.map((item) => {
      if (item.over && item.under) {
        odds[
          `TGS1_over_${item.name}`
            .replace(/\s/g, "")
            .replace(".", ",")
            .toLowerCase()
        ] = item.over;
        odds[
          `TGS1_under_${item.name}`
            .replace(/\s/g, "")
            .replace(".", ",")
            .toLowerCase()
        ] = item.under;
      }
    });
  }

  if (SB[0]) {
    SB.map((item) => {
      if (item.p1 && item.p2) {
        odds[
          `SB_p1_${item.name}`
            .replace(/\s/g, "")
            .replace(".", ",")
            .toLowerCase()
        ] = item.p1;
        odds[
          `SB_p2_${item.name}`
            .replace(/\s/g, "")
            .replace(".", ",")
            .toLowerCase()
        ] = item.p2;
      }
    });
  }

  if (TS2) {
    odds.TS2 = TS2;
    odds.TS3 = TS3;
  }

  await TennisGames.updateOne(
    { game_id: +game.game_id },
    {
      odds,
      parse_time: moment().format("HH:mm:ss"),
    }
  );
}
