const express = require("express");
// const https = require("https");
const cors = require("cors");
// const fs = require("fs");
var proxy = require("express-http-proxy");

const app = express();

app.use(cors());
app.use(express.urlencoded({ extended: true }));

app.use(
  "/verify_pay",
  proxy("https://188.165.91.109:5000/verify_pay/", {
    https: true,
  })
);
app.use("/verify_pay", require("../routes/pay.routes"));

// async function startRoutes() {
//   try {
//     https
//       .createServer(
//         {
//           key: fs.readFileSync("./cert/server.key"),
//           cert: fs.readFileSync("./cert/server.crt"),
//         },
//         app
//       )
//       .listen(process.env.PORT, function () {
//         console.log(`Server listens on port: ${process.env.PORT}`);
//       });
//   } catch (e) {
//     console.log("Server Error", e.message);
//     process.exit(1);
//   }
// }
async function startRoutes() {
  try {
    app.listen(process.env.PORT, () =>
      console.log(`Express has been started on port ${process.env.PORT}...`)
    );
  } catch (e) {
    console.log("Server Error", e.message);
    process.exit(1);
  }
}

module.exports = { app, startRoutes };
