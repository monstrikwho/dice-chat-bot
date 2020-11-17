const express = require("express");
const fs = require("fs");
const https = require("https");
const cors = require("cors");
// var proxy = require("express-http-proxy");

const app = express();

app.use(cors());
app.use(express.urlencoded({ extended: true }));

// app.use(
//   "/",
//   proxy("https://188.165.91.109:5000", {
//     https: true,
//   })
// );
app.use("/verify_pay", require("../routes/pay.routes"));
app.post("/verify_pay", (req, res) => {
  console.log(req.body); // Call your action on the request here
  res.status(200).end(); // Responding is important
});

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
