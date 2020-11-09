const express = require("express");
const cors = require("cors");

var app = express();
app.use(cors());
app.use(express.urlencoded({ extended: true }));

app.use("/verify_pay", require("../routes/pay.routes"));

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
