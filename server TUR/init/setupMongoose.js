const mongoose = require("mongoose");

mongoose.Promise = global.Promise;

module.exports = () => {
  mongoose.connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
  });
};
