const express = require("express");
const app = express();
const cors = require("cors");

app.use(cors());
app.use(express.json());

app.post("/orders", async (req, res) => {
  res.status(200).end();
});

const server = app.listen(process.env.PORT, () => {
  console.log("Server up on PORT: " + process.env.PORT);
});

module.exports = server;
