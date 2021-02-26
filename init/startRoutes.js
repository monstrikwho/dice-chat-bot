const express = require("express");
const app = express();
app.use(express.json());

app.use("/get_users", require("../routes/getUsers.route"));
app.use("/get_games", require("../routes/getGames.route"));
app.use("/get_payments", require("../routes/getPayments.route"));
app.use("/get_blockedusers", require("../routes/blockedUsers.route"));

app.use("/post_stats", require("../routes/postStats.route"));
app.use("/post_fakeorder", require("../routes/postFakeOrder.route"));

// РОУТ на обработку платежей
app.use("/notify_pay_orders", require('../routes/notifyPayOrders.route'));


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
