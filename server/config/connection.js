require("dotenv").config();

// console.log("MONGODB_URI:", process.env.MONGODB_URI);
// console.log("JWT_SECRET:", process.env.JWT_SECRET);

const mongoose = require("mongoose");

mongoose.connect(
  process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/googlebooks",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
);

module.exports = mongoose.connection;
