const express = require("express");
const app = express();
const cors = require("cors");

app.use(cors());
app.use(express.json());

app.use("/get_user_data", require("../routes/get_user_data"));
app.use("/get_orders_data", require("../routes/get_orders_data"));
app.use("/get_games_data", require("../routes/get_games_data"));
app.use("/get_pvpdice", require("../routes/pvpDiceGame"));
app.use("/get_pvpfootball", require("../routes/pvpFootballGame"));
app.use("/get_pvpbouling", require("../routes/pvpBoulingGame"));
app.use("/get_settings", require("../routes/get_settings"));
app.use("/get_stats", require("../routes/get_stats"));
app.use("/post_settings", require("../routes/post_settings"));
app.use("/post_update_user", require("../routes/post_update_user"));

const server = app.listen(process.env.PORT, () => {
  console.log("Server up on PORT: " + process.env.PORT);
});

module.exports = server;
