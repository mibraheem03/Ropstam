const express = require("express");
const mongoose = require("mongoose");

const app = express();
const auth = require("./routes/auth.js");
const carRouter = require("./routes/car.js");
require("./startup/db")();

app.use(express.json());
app.use("/api/user", auth);
app.use("/api/car", carRouter);


app.listen(3000, () => {
  console.log("Server listening on port 3000");
});