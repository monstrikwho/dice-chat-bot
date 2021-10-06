const axios = require("axios");
const moment = require("moment");
const { create, all } = require("mathjs");
const math = create(all);

const MainStats = require("../models/mainstats");
const BasketballGames = require("../models/basketballGames");

const login = "iceinblood";
const token = "54811-x38emPLqcLOEFLV";

async function reqBasketball(type, game) {
  await axios
    .get(
      `https://spoyer.ru/api/get.php?login=${login}&token=${token}&task=${type}odds&bookmaker=bet365&game_id=${game.game_id}`
    )
    .then(async ({ data }) => {
      if (type === "live") {
        await basketballLiveGames(data, game);
      }
      if (type === "pre") {
        await basketballPreGames(data, game);
      }
    })
    .catch((err) => {});
}

async function basketballLiveGames(data, game) {
  const { sportPercent } = await MainStats.findOne();
  // ******************* ODDs *******************
  let GL = [];
  let FstH = [];
  let SndH = [];

  // Highest Scoring Half
  let HSH = {
    fh: null,
    sh: null,
    tie: null,
  };

  let odd_even = [];
  // ******************* ODDs *******************

  // Variables
  let NA = null;
  // let MA_c = 0;

  if (!data.results || !data.results[0]) return;
  data.results[0].map((item) => {
    const type = item.type;
    const parseOD =
      item.OD && +((math.evaluate(item.OD) + 1) * sportPercent).toFixed(2);

    if (type === "MG") {
      // MA_c = 0;
      return (NA = item.NA);
    }

    if (NA === "Game Lines") {
      if (type === "PA" && !item.OD) {
        return (GL[item.OR] = {
          name: item.NA,
          team1: { name: null },
          team2: { name: null },
        });
      }
      if (type === "PA" && !GL[item.OR].team1.OD) {
        GL[item.OR].team1.name = item.HD;
        return (GL[item.OR].team1.OD = parseOD);
      }
      if (type === "PA" && !GL[item.OR].team2.OD) {
        GL[item.OR].team2.name = item.HD;
        return (GL[item.OR].team2.OD = parseOD);
      }
    }

    if (NA === "1st Half") {
      if (type === "PA" && !item.OD) {
        return (FstH[item.OR] = {
          name: item.NA,
          team1: { name: null },
          team2: { name: null },
        });
      }
      if (type === "PA" && !FstH[item.OR].team1.OD) {
        FstH[item.OR].team1.name = item.HD;
        return (FstH[item.OR].team1.OD = parseOD);
      }
      if (type === "PA" && !FstH[item.OR].team2.OD) {
        FstH[item.OR].team2.name = item.HD;
        return (FstH[item.OR].team2.OD = parseOD);
      }
    }

    if (NA === "2nd Half") {
      if (type === "PA" && !item.OD) {
        return (SndH[item.OR] = {
          name: item.NA,
          team1: { name: null },
          team2: { name: null },
        });
      }
      if (type === "PA" && !SndH[item.OR].team1.OD) {
        SndH[item.OR].team1.name = item.HD;
        return (SndH[item.OR].team1.OD = parseOD);
      }
      if (type === "PA" && !SndH[item.OR].team2.OD) {
        SndH[item.OR].team2.name = item.HD;
        return (SndH[item.OR].team2.OD = parseOD);
      }
    }

    if (NA === "Highest Scoring Half") {
      if (type === "PA") {
        if (item.name === "1st Half") {
          return (HSH.fh = parseOD);
        }
        if (item.name === "2nd Half") {
          return (HSH.sh = parseOD);
        }
        if (item.name === "Tie") {
          return (HSH.tie = parseOD);
        }
      }
    }

    if (NA === "Odd/Even") {
      if (type === "PA" && !item.OD) {
        return (odd_even[item.OR] = { name: item.NA });
      }
      if (type === "PA" && !odd_even[item.OR].odd) {
        return (odd_even[item.OR].odd = parseOD);
      }
      if (type === "PA" && !odd_even[item.OR].even) {
        return (odd_even[item.OR].even = parseOD);
      }
    }
  });

  let odds = {};

  if (GL[0]) {
    GL.map((item) => {
      if (item.team1.OD && item.team2.OD) {
        odds[
          `GL_t1_${item.name}_${item.team1.name}`
            .replace(/\s/g, "")
            .replace(".", ",")
            .toLowerCase()
        ] = item.team1.OD;
        odds[
          `GL_t2_${item.name}_${item.team2.name}`
            .replace(/\s/g, "")
            .replace(".", ",")
            .toLowerCase()
        ] = item.team2.OD;
      }
    });
  }

  if (FstH[0]) {
    FstH.map((item) => {
      odds[
        `FstH_t1_${item.name}_${item.team1.name}`
          .replace(/\s/g, "")
          .replace(".", ",")
          .toLowerCase()
      ] = item.team1.OD;
      odds[
        `FstH_t2_${item.name}_${item.team2.name}`
          .replace(/\s/g, "")
          .replace(".", ",")
          .toLowerCase()
      ] = item.team2.OD;
    });
  }

  if (SndH[0]) {
    SndH.map((item) => {
      odds[
        `SndH_t1_${item.name}_${item.team1.name}`
          .replace(/\s/g, "")
          .replace(".", ",")
          .toLowerCase()
      ] = item.team1.OD;
      odds[
        `SndH_t2_${item.name}_${item.team2.name}`
          .replace(/\s/g, "")
          .replace(".", ",")
          .toLowerCase()
      ] = item.team2.OD;
    });
  }

  if (HSH.fh) {
    odds["HSH_fh"] = HSH.fh;
    odds["HSH_sh"] = HSH.sh;
    odds["HSH_tie"] = HSH.tie;
  }

  if (odd_even.length !== 0) {
    odd_even.map((item) => {
      odds[`odd_${item.name}`.replace(/\s/g, "").toLowerCase()] = item.odd;
      odds[`even_${item.name}`.replace(/\s/g, "").toLowerCase()] = item.even;
    });
  }

  await BasketballGames.updateOne(
    { game_id: +game.game_id },
    {
      odds,
      parse_time: moment().format("HH:mm:ss"),
    }
  );
}

async function basketballPreGames(data, game) {
  const { sportPercent } = await MainStats.findOne();
  const results = data.results && data.results[0];

  const main = results && results.main && results.main.sp;

  // ******************* ODDs *******************

  let GL = [];
  let FstH = [];
  let SndH = [];

  // ******************* ODDs *******************

  if (main && main["game_lines"]) {
    const interval = main["game_lines"].length / 3;
    main["game_lines"].map((item, i) => {
      if (!item.name) return;
      const isTotal = item.name === "Total";
      GL[i] = {
        name: item.name,
        team1: {
          name: main["game_lines"][i + interval].handicap
            ? isTotal
              ? `o${main["game_lines"][i + interval].handicap}`
              : main["game_lines"][i + interval].handicap
            : "",
          OD: +(main["game_lines"][i + interval].odds * sportPercent).toFixed(
            2
          ),
        },
        team2: {
          name: main["game_lines"][i + interval * 2].handicap
            ? isTotal
              ? `u${main["game_lines"][i + interval * 2].handicap}`
              : main["game_lines"][i + interval * 2].handicap
            : "",
          OD: +(
            main["game_lines"][i + interval * 2].odds * sportPercent
          ).toFixed(2),
        },
      };
    });
  }

  if (main && main["1st_half"]) {
    const interval = main["1st_half"].length / 3;
    main["1st_half"].map((item, i) => {
      if (!item.name) return;
      const isTotal = item.name === "Total";
      FstH[i] = {
        name: item.name,
        team1: {
          name: main["1st_half"][i + interval].handicap
            ? isTotal
              ? `o${main["1st_half"][i + interval].handicap}`
              : main["1st_half"][i + interval].handicap
            : "",
          OD: +(main["1st_half"][i + interval].odds * sportPercent).toFixed(2),
        },
        team2: {
          name: main["1st_half"][i + interval * 2].handicap
            ? isTotal
              ? `u${main["1st_half"][i + interval * 2].handicap}`
              : main["1st_half"][i + interval * 2].handicap
            : "",
          OD: +(main["1st_half"][i + interval * 2].odds * sportPercent).toFixed(
            2
          ),
        },
      };
    });
  }

  if (main && main["2nd_half"]) {
    const interval = main["2nd_half"].length / 3;
    main["2nd_half"].map((item, i) => {
      if (!item.name) return;
      const isTotal = item.name === "Total";
      SndH[i] = {
        name: item.name,
        team1: {
          name: main["2nd_half"][i + interval].handicap
            ? isTotal
              ? `o${main["2nd_half"][i + interval].handicap}`
              : main["2nd_half"][i + interval].handicap
            : "",
          OD: +(main["2nd_half"][i + interval].odds * sportPercent).toFixed(2),
        },
        team2: {
          name: main["2nd_half"][i + interval * 2].handicap
            ? isTotal
              ? `u${main["2nd_half"][i + interval * 2].handicap}`
              : main["2nd_half"][i + interval * 2].handicap
            : "",
          OD: +(main["2nd_half"][i + interval * 2].odds * sportPercent).toFixed(
            2
          ),
        },
      };
    });
  }

  let odds = {};

  if (GL[0]) {
    GL.map((item) => {
      if (item.team1.OD && item.team2.OD) {
        odds[
          `GL_t1_${item.name}_${item.team1.name}`
            .replace(/\s/g, "")
            .replace(".", ",")
            .toLowerCase()
        ] = +(item.team1.OD * sportPercent).toFixed(2);
        odds[
          `GL_t2_${item.name}_${item.team2.name}`
            .replace(/\s/g, "")
            .replace(".", ",")
            .toLowerCase()
        ] = +(item.team2.OD * sportPercent).toFixed(2);
      }
    });
  }

  if (FstH[0]) {
    FstH.map((item) => {
      odds[
        `FstH_t1_${item.name}_${item.team1.name}`
          .replace(/\s/g, "")
          .replace(".", ",")
          .toLowerCase()
      ] = +(item.team1.OD * sportPercent).toFixed(2);
      odds[
        `FstH_t2_${item.name}_${item.team2.name}`
          .replace(/\s/g, "")
          .replace(".", ",")
          .toLowerCase()
      ] = +(item.team2.OD * sportPercent).toFixed(2);
    });
  }

  if (SndH[0]) {
    SndH.map((item) => {
      odds[
        `SndH_t1_${item.name}_${item.team1.name}`
          .replace(/\s/g, "")
          .replace(".", ",")
          .toLowerCase()
      ] = +(item.team1.OD * sportPercent).toFixed(2);
      odds[
        `SndH_t2_${item.name}_${item.team2.name}`
          .replace(/\s/g, "")
          .replace(".", ",")
          .toLowerCase()
      ] = +(item.team2.OD * sportPercent).toFixed(2);
    });
  }

  await BasketballGames.updateOne(
    { game_id: +game.game_id },
    {
      odds,
      parse_time: moment().format("HH:mm:ss"),
    }
  );
}

module.exports = { reqBasketball };
