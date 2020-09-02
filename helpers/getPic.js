const fs = require("fs");
const axios = require("axios");
const cheerio = require("cheerio");
const querystring = require("querystring");
const nodeHtmlToImage = require("node-html-to-image");

const Stage = require("telegraf/stage");
const Scene = require("telegraf/scenes/base");


const getRaspPic = new Scene("getRaspPic");
getRaspPic.enter(async (ctx) => {
  await axios
    .post(
      `http://rasp.barsu.by/stud.php`,
      querystring.stringify({
        ft: 0,
        sp: 0,
        gp: "ТМ31",
        nd: "2020-05-25",
        go: "Показать",
      })
    )
    .then((res) => {
      const $ = cheerio.load(res.data);
      const table = $(".table-responsive tbody");
      //   const table = $(".table-responsive");

      const Monday = table.find("tr").slice(0, 8);
      const Tuesday = table.find("tr").slice(9, 17);
      const Wednesday = table.find("tr").slice(18, 26);
      const Thursday = table.find("tr").slice(27, 35);
      const Friday = table.find("tr").slice(36, 44);
      const Saturday = table.find("tr").slice(45, 53);

      const applyArr = (arr) => {
        let text = "";
        $(arr).each((i, item) => (text += `<tr>${$(item).html()}</tr>`));
        return text;
      };

      // Динамически менять размеры в стилях, ибо расписание может быть разное и высота строк меняется..
      const styles = `<head>
                    <style>
                      html {
                          width: 620px;
                          height: 280px;
                      }
                      table {
                        border-collapse: collapse;
                        border-spacing: 0;
                        background-color: #fff;
                        border: 1px solid #ddd;
                        max-width: 100%;
                        background-color: transparent;
                      }
                      td, th {
                        border: 1px solid #ddd;
                        padding: 5px;
                        border-bottom-width: 2px;
                      }
                      th {
                        text-align: center;
                        background-color: #9dc6f2;
                      }
                    </style>
                  </head>`;

      nodeHtmlToImage({
        output: "./src/images/img.png",
        html: `<html>${styles}<body><table>${applyArr(
          Monday
        )}</table></body></html>`,
      }).then(async () => {
        ctx.replyWithPhoto({
          source: fs.readFileSync("./src/images/img.png"),
        });
      });
    })
    .catch((er) => console.log(er));
});



module.exports = getRaspPic;