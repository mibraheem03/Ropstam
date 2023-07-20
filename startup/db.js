const mongoose = require("mongoose");
require('dotenv').config()

const uri = `${process.env.MONGODB}`;

// Connect to MongoDB
module.exports = function () {
    mongoose.set('strictQuery', true);
    mongoose.connect(uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
        .then(() => {
            console.log("Connected to MongoDB");
        })
        .catch((error) => {
            console.error("Error connecting to MongoDB:", error);
        });
}