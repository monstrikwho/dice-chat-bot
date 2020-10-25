const moment = require("moment");
const axios = require("axios");
const cheerio = require("cheerio");
const querystring = require("querystring");
const Extra = require("telegraf/extra");

const dateHelper = require("../helpers/getNowDay");
const checkRasp = require("../helpers/checkRasp");
const getRaspPhoto = require("../helpers/getRaspPhoto");

const User = require("../models/user");

module.exports = async (bot) => {
  let every30m = setInterval(checkDate, 1000 * 60 * 30);
  let every5m = null;
  let flag = false;

  function checkDate() {
    const today = new Date().getDay();
    if (today === 3 && moment().hours() === 1) flag = true;
    if (today === 3 && flag && moment().hours() > 12) {
      remove30m();
      every5m = setInterval(checkRasp5m, 1000 * 60 * 5);
    }
  }

  async function checkRasp5m() {
    const status = await checkRasp();
    if (status) {
      remove5m();
      const allUser = await User.find();
      for (let { userId } of allUser) {
        try {
          await bot.telegram.sendMessage(
            userId,
            "Появилось расписание на следующую неделю. Нажмите на кнопку ниже, чтобы показать.",
            Extra.markup((m) =>
              m.inlineKeyboard([
                [
                  m.callbackButton(
                    "Показать расписание",
                    "Показать расписание"
                  ),
                ],
              ])
            )
          );
        } catch (err) {
          console.log("Cообщение не было доставлено");
        }
      }
      flag = false;
      every30m = setInterval(checkDate, 1000 * 60 * 5);
    }
  }

  var remove30m = () => clearInterval(every30m);
  var remove5m = () => clearInterval(every5m);

  //

  const sendPhoto = async (ctx) => {
    const selectUser = await User.findOne({ userId: ctx.from.id });
    const nextWeek = await dateHelper.nextWeek();
    const user = {
      data() {
        if (selectUser.person === "Студент") {
          return {
            ft: 0,
            sp: 0,
            gp: selectUser.group,
            nd: nextWeek,
            go: "Показать",
          };
        }
        if (selectUser.person === "Преподаватель") {
          return {
            kf: 0,
            tch: selectUser.teacherName,
            nd: nextWeek,
            go: "Показать",
          };
        }
      },
      url() {
        if (selectUser.person === "Студент") {
          return `http://rasp.barsu.by/stud.php`;
        }
        if (selectUser.person === "Преподаватель") {
          return `http://rasp.barsu.by/teach.php`;
        }
      },
    };

    return await axios
      .post(user.url(), querystring.stringify(user.data()))
      .then(async (res) => {
        const $ = cheerio.load(res.data, { decodeEntities: false });
        const table = $(".table-responsive tbody");

        const Monday = table.find("tr").slice(0, 8);
        const Tuesday = table.find("tr").slice(9, 17);
        const Wednesday = table.find("tr").slice(18, 26);
        const Thursday = table.find("tr").slice(27, 35);
        const Friday = table.find("tr").slice(36, 44);

        const week = [Monday, Tuesday, Wednesday, Thursday, Friday];

        await getRaspPhoto($, week, selectUser);
      })
      .catch(async (err) => {
        console.log(err);
      });
  };

  bot.action("Показать расписание", async (ctx) => {
    const today = new Date().getDay();
    if (today === 3) {
      try {
        await ctx.deleteMessage();
      } catch (error) {
        console.log("Пользователь нажал на кнопку два раза");
      }
      await ctx.replyWithChatAction("typing");
      await sendPhoto(ctx);
    }
    if (today > 3 || today === 0) {
      ctx.reply(
        'Вы можете посмотреть расаписание на следующую неделю во вкладке "Полное".'
      );
    }
    if (today === 1 && today === 2) {
      ctx.reply(
        "Вы как-то поздно нажали на кнопку) Пока что на следующую неделю нету расписания. Бот вас оповестит в среду, как только оно появится."
      );
    }
  });
};
