const cleanUp = require("../Models/configFiles");
const joi = require("joi");
const path = require("path");
const fs = require("fs");
const yaml = require("js-yaml");
const redis = require("redis");

let redisClient = redis.createClient({
  password: process.env.Redis_Pass,
  socket: {
    host: process.env.Redis_Host,
    port: process.env.Redis_Port,
  },
});
(async function () {
  await redisClient.connect();
})();
// connect and error events
redisClient.on("error", function (err) {
  console.log("Something went wrong ", err);
});
redisClient.on("connect", function () {
  console.log("Redis Connected!");
});

//Create a configuration file
const createConfig = async (req, res) => {
  const { Directory_Path, Files_to_Clean, Files_to_Exempt, Schedule } =
    req.body;
  const _id = req.user.id;
  if (!Directory_Path || !Files_to_Clean || !Schedule) {
    res.status(400).json({
      status: "error",
      message: "All fields are required",
    });
    return;
  }
  const configSchema = joi.object({
    Directory_Path: joi.string().pattern(/^([a-zA-Z]:)?(\/[a-zA-Z0-9]+)*\/?$/),
    Schedule: joi.string().pattern(/^\d+d$/),
  });

  try {
    //validate form fields
    const value = await configSchema.validateAsync({
      Directory_Path: Directory_Path,
      Schedule: Schedule,
    });

    const configData = {
      Directory_Path: Directory_Path,
      Files_to_Clean: Files_to_Clean,
      Files_to_Exempt: Files_to_Exempt,
      Schedule: Schedule,
      user: _id,
    };

    // Save configuration in the database
    const configFile = await cleanUp.create(configData);

    const yamlContent = yaml.dump(configData);
    const fileName = `${_id}_config.yaml`;
    const filePath = path.join(Directory_Path, fileName);

    fs.writeFile(filePath, yamlContent, (err) => {
      if (err) {
        console.error("Error creating YAML file:", err);
        res.status(500).json({
          error: "Error creating YAML file",
        });
        return;
      }

      res
        .status(201)
        .send(`${_id}: Your clean-up configuration has been created`);
    });
  } catch (err) {
    res.status(400).json({
      error: err.message,
    });
  }
};

//Get configuration files
const getConfig = async (req, res) => {
  const _id = req.user.id;
  try {
    // Check if the data is already cached in Redis
    const cachedData = await redisClient.get(_id);
    if (cachedData) {
      // Data is available in cache, return it
      const configFiles = JSON.parse(cachedData);
      res.status(200).json({
        fromCache: true,
        status: "success",
        data: configFiles,
      });
    } else {
      // Data is not cached, fetch it from the database
      const configFiles = await cleanUp.find({ user: _id }).sort({ _id: -1 });
      // Cache the data in Redis for future requests
      redisClient.set(_id, JSON.stringify(configFiles), {
        EX: 180,
        NX: true,
      });
      res.status(200).json({
        fromCache: false,
        status: "success",
        data: configFiles,
      });
    }
  } catch (error) {
    res.status(400).json({
      status: "error",
      message: error.message,
    });
  }
};

// Get a configuration file
const getAConfig = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if the data is already cached in Redis
    const cachedData = await redisClient.get(id);
    if (cachedData) {
      // Data is available in cache, return it
      const configFile = JSON.parse(cachedData);
      res.status(200).json({
        fromCache: true,
        status: "success",
        data: configFile,
      });
    } else {
      // Data is not cached, fetch it from the database
      const configFile = await cleanUp.findOne({ user: id });
      if (configFile !== null) {
        // Cache the data in Redis for future requests
        redisClient.set(id, JSON.stringify(configFile), {
          EX: 180,
          NX: true,
        });
        res.status(200).json({
          fromCache: false,
          status: "success",
          data: configFile,
        });
      }
      throw new Error("There's no clean-up configuration file.");
    }
  } catch (err) {
    res.status(400).json({
      status: "error",
      message: err.message,
    });
  }
};

//Update a configuration file
const updateAConfig = async (req, res) => {
  const { Directory_Path, Files_to_Clean, Files_to_Exempt, Schedule } =
    req.body;

  try {
    const { id } = req.params;
    const configFile = await cleanUp.findOne({ user: id });
    if (!configFile) {
      throw new Error("Not found");
    }
    configFile.Directory_Path = Directory_Path || configFile.Directory_Path;
    configFile.Files_to_Clean = Files_to_Clean || configFile.Files_to_Clean;
    configFile.Files_to_Exempt = Files_to_Exempt || configFile.Files_to_Exempt;
    configFile.Schedule = Schedule || configFile.Schedule;

    //save the changes
    configFile.save();

    res.status(200).json({
      status: "success",
      message: "Your clean-up configuration has just been updated!",
    });
  } catch (err) {
    res.status(400).json({
      status: "error",
      message: err.message,
    });
  }
};

//Delete a configuration file
const deleteAConfig = async (req, res) => {
  try {
    const { id } = req.params;
    await cleanUp.deleteOne({ user: id });
    res.status(200).json({
      status: "success",
      message: "Your clean-up Configuration has been deleted!",
    });
  } catch (err) {
    res.status(400).json({
      status: "error",
      message: err.message,
    });
  }
};

module.exports = {
  createConfig,
  getConfig,
  getAConfig,
  updateAConfig,
  deleteAConfig,
};
