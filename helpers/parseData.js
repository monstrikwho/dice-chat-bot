const axios = require("axios");
const cheerio = require("cheerio");

const Weeks = require("../models/weeks");
const Teachers = require("../models/teachers");

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

async function parseTeachers() {
  await axios.post(`http://rasp.barsu.by/teach.php`).then((res) => {
    const $ = cheerio.load(res.data);

    const selectElem = $('select[name="tch"]');
    const optionElem = selectElem.find("option");

    $(optionElem).each(async (i, item) => {
      if ($(item).val() === "0") return;

      const status = await Teachers.findOne({ lastName: $(item).val() });
      if (!status) {
        const teachers = new Teachers({
          lastName: $(item).val(),
        });
        await teachers.save();
      }
    });
  });
}

module.exports = { parseWeeks, parseTeachers };
