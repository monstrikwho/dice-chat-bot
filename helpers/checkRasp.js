const axios = require("axios");
const cheerio = require("cheerio");
const querystring = require("querystring");
const dateHelper = require("./getNowDay");
const answerToRequest = require("./answerToRequest");

const User = require("../models/user");

module.exports = async () => {
  await axios
    .post(
      `http://rasp.barsu.by/stud.php`,
      querystring.stringify({
        ft: 0,
        sp: 0,
        gp: "ТМ41",
        nd: dateHelper.nextWeek(),
        go: "Показать",
      })
    )
    .then(async (res) => {
      const $ = cheerio.load(res.data, { decodeEntities: false });
      const table = $(".table-responsive tbody");

      const Monday = table.find("tr").slice(0, 8);
      // const Tuesday = table.find("tr").slice(9, 17);
      // const Wednesday = table.find("tr").slice(18, 26);
      // const Thursday = table.find("tr").slice(27, 35);
      // const Friday = table.find("tr").slice(36, 44);

      let count = 0;

      for (let i = 0; i < Monday.length; i++) {
        let td;

        if (i === 0) {
          td = $(Monday[i]).find("td").slice(2, 7);
        } else {
          td = $(Monday[i]).find("td");
        }

        const selectUser = await User.findOne({ userId: 364984576 });
        const answer = answerToRequest($, td, selectUser);

        if (answer) count++;
      }

      if (count > 1) return true;
      return false;
    })
    .catch(async (err) => {
      console.log(err);
    });
};
