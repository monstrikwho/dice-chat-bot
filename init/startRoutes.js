const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.urlencoded({ extended: true }));

app.post("/verify_pay", (req, res) => {
  console.log(req.body); // Call your action on the request here
  res.status(200).end(); // Responding is important
});

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
