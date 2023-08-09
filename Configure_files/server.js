const dotenv = require("dotenv");
dotenv.config();
const mongoose = require("mongoose");
const purgerdb = require("./config/mongo_config.js");
const express = require("express");
const app = express();
const cors = require("cors");
const authRoute = require("./Routes/auth");
const cleanUpRoute = require("./Routes/cleanUpConfig");
const treblle = require("@treblle/express");
const rateLimiter = require("./config/rate_limiter");
const cronDaemon = require("./Schedule_cleanUp/Schedule.js");

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

const port = process.env.NODE_ENV === "production" ? process.env.PORT : 8080 

app.get("/", (req, res)=>{
    res.status(200).send("Welcome to Purger!, pronounced as (/pur-jar/)");
});



mongoose.connection.once("open", async()=>{
    const chalk = (await import('chalk')).default; // Import chalk dynamically
    console.log(chalk.blue("Connected to MongoDB."));
    app.listen(port, (err)=>{
        if(err) {
            throw new Error("Error connecting to the server");
        }
        console.log(chalk.bgRed(`Server is running on http://localhost:${port}` ));
    });
    cronDaemon();
   
});

mongoose.connection.on('error', async(err) => {
    const chalk = (await import('chalk')).default; // Import chalk dynamically
    console.error(chalk.red('MongoDB connection error:', err));
    process.exit(1);
  });