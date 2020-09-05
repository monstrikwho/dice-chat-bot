const fs = require("fs");
const axios = require("axios");
const cheerio = require("cheerio");
const querystring = require("querystring");
const nodeHtmlToImage = require("node-html-to-image");
const User = require("../models/user");

const getNowDay = require("./getNowDay");

const requestToday = async (id) => {
  const selectUser = await User.findOne({ userId: id });

  const nowDate = getNowDay();

  console.log(selectUser.group);
  console.log(nowDate);

  // await axios.post(
  //   `http://rasp.barsu.by/stud.php`,
  //   querystring.stringify({
  //     ft: 0,
  //     sp: 0,
  //     gp: statusId.group,
  //     nd: "2020-05-25",
  //     go: "Показать",
  //   })
  // );
};

module.exports = requestToday;
