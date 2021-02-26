const express = require("express");
const app = express();
app.use(express.json());

// РОУТ на обработку платежей
app.use("/notify_pay_orders", require("../routes/notifyPayOrders.route"));

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
