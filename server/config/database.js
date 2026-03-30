const mongoose = require("mongoose");
require("dotenv").config();

exports.connect = () => {
    const mongoUrl = process.env.MONGODB_URL || "mongodb://localhost:27017/studynotion";
    mongoose.connect(mongoUrl, {
        useNewUrlParser: true,
        useUnifiedTopology:true,
    })
    .then(() => console.log("DB Connected Successfully"))
    .catch( (error) => {
        console.log("DB Connection Failed");
        console.error(error);
        console.log("Please make sure MongoDB is running or set MONGODB_URL in .env file");
        // Don't exit process, just log the error
    } )
};