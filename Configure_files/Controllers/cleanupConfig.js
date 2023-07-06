const cleanUp = require("../Models/configFiles");
const joi = require("joi");
const path = require("path");
const fs = require("fs");
const yaml = require("js-yaml");
const redis = require("redis");
const redisClient = redis.createClient();

//Redis server listening on port 6379
  redisClient.on('error', (error) => console.error(`Error: ${error}`));

//Create a configuration file
const createConfig = async (req, res) => {
  const { Directory_Path, Files_to_Clean, Files_to_Exempt, Schedule } =
    req.body;
    console.log(req.user)
  const _id = req.user._id;
  if (!Directory_Path || !Files_to_Clean || !Files_to_Exempt || !Schedule) {
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
  const { _id } = req.user;
  try {
    // Check if the data is already cached in Redis
    redisClient.get(_id, async (err, cachedData) => {
      if (err) {
        throw new Error("Error retrieving cached data");
      }

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
            EX: 180, NX: true
        });
        res.status(200).json({
          fromCache: false,
          status: "success",
          data: configFiles,
        });
      }
    });
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
    redisClient.get(id, async (err, cachedData) => {
      if (err) {
        throw new Error("Error retrieving cached data");
      }

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
        const configFile = await cleanUp.findById(id);
        res.status(200).json({
          status: "success",
          data: configFile,
        });
      }
    });
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
    const { id } = req.params; // /tasks/:id
    const configFile = await cleanUp.findById(id);
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
      message: "Clean-up configuration has been updated!",
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
    await cleanUp.deleteOne(id);
    res.status(200).json({
      status: "success",
      message: "Clean-up Configuration is deleted",
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
