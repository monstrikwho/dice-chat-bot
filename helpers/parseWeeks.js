const axios = require("axios");
const cheerio = require("cheerio");
const Weeks = require("../models/weeks");

async function parseWeeks() {
  await axios.post(`http://rasp.barsu.by/stud.php`).then((res) => {
    const $ = cheerio.load(res.data);

    const selectElem = $('select[name="nd"]');
    const optionElem = selectElem.find("option");

    $(optionElem).each(async (i, item) => {
      if ($(item).val() === "0") return;

      const status = await Weeks.findOne({ weekString: $(item).val() });
      if (!status) {
        const week = new Weeks({
          weekString: $(item).val(),
        });
        await week.save();
      }
    });
  });
}

module.exports = parseWeeks;
