const dotenv = require("dotenv");
dotenv.config();
const mongoose = require("mongoose");
const express = require("express");
const authRoute = require("./Routes/auth");
const cleanUpRoute = require("./Routes/cleanUpConfig");
const treblle = require("@treblle/express");
const rateLimiter = require("./config/rate_limiter")
const app = express();
const cors = require("cors");
const purgerdb = require("./config/mongo_config.js");
purgerdb();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(rateLimiter);
app.use(treblle({
    //treblle account config
    apiKey: process.env.APIkey,
    projectId: process.env.ProjectId
}));

app.use("/auth", authRoute);
app.use("/cleanup", cleanUpRoute);


const port = process.env.NODE_ENV === "production" ? process.env.PORT : 6000 

app.get("/", (req, res)=>{
    res.status(200).send("Welcome to Purger");
});

mongoose.connection.once("open", ()=>{
    console.log("Connected to MongoDB")
    app.listen(port, (err)=>{
        if(err) {
            throw new Error("Error connecting to the server");
        }
        console.log(`Server is running on http://localhost:${port}` )
    });
})
process.on("uncaughtException", err => {
    console.error(err);
    process.exit(1);
})