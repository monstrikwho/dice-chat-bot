const express = require("express");
const app = express();
const cors = require("cors");

app.use(cors());
app.use(express.json());

// РОУТ на обработку платежей
app.use("/notify_pay_orders", require("../routes/notifyPayOrders.route"));

app.use("/get_login", require("../routes/get_login"));
app.use("/get_pass", require("../routes/get_pass"));
app.use("/get_auth_status", require("../routes/get_auth_status"));
app.use("/get_stats", require("../routes/get_stats"));
app.use("/get_user_data", require("../routes/get_user_data"));
app.use("/get_orders_data", require("../routes/get_orders_data"));
app.use("/get_games_data", require("../routes/get_games_data"));
app.use("/get_settings", require("../routes/get_settings"));
app.use("/get_qiwi_balance", require("../routes/get_qiwi_balance"));
app.use("/post_mailing", require("../routes/post_mailing"));
app.use("/post_settings", require("../routes/post_settings"));
app.use("/post_update_user", require("../routes/post_update_user"));
app.use("/post_fake_order", require("../routes/post_fake_order"));
app.use("/post_set_token", require("../routes/post_set_token"));

const server = app.listen(process.env.PORT, () => {
  console.log("Server up on PORT: " + process.env.PORT);
});

module.exports = server;
