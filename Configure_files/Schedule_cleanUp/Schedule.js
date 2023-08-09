const cleanUp = require("../Models/configFiles");
const logDeletedFiles = require("../Log_cleanUps/Log");
const fs = require("fs");
const path = require("path");
const cron = require("node-cron");

module.exports = function () {
  async function getCleanupConfiguration() {
    const cleanupConfig = await cleanUp.find({}).maxTimeMS(30000000);
    if (!cleanupConfig.length) {
      console.log(chalk.red("No cleanup configuration found"));
    }
    return cleanupConfig;
  }

  async function deleteFiles(directory, deleteFile, exemptFile) {
    const ora = (await import("ora")).default; // Import ora dynamically
    const chalk = (await import("chalk")).default; // Import chalk dynamically

    fs.readdir(directory, (err, files) => {
      if (err) {
        console.error(`Error reading directory: ${chalk.red(directory)}`);
        return;
      }
      const patternRegex = new RegExp(deleteFile, "i");
      const filesToDelete = files.filter(
        (file) => patternRegex.test(file) && !exemptFile.includes(file)
      );

      const spinner = ora("Deleting now...").start();
      setTimeout(() => {
        spinner.text = chalk.magenta("Please wait...");
      }, 1000);

      // Start the deletion process
      filesToDelete.forEach((file, index) => {
        const filePath = path.join(directory, file);
        fs.unlink(filePath, (err) => {
          if (err) {
            spinner.fail(`Failed to delete file: ${chalk.red(filePath)}`);
            return;
          }
          spinner.succeed(`File deleted: ${chalk.green(filePath)}`);
          // Log the deleted file to the log file
          logDeletedFiles([filePath]);

          // Check if all files have been processed
          if (index === filesToDelete.length - 1) {
            // All files have been deleted, stop the spinner
            spinner.stop();
            console.log(chalk.yellow("Deletion process completed!"));
          }
        });
      });
    });
  }

  (async function () {
    const cleanupConfig = await getCleanupConfiguration();
    if (cleanupConfig.length > 0) {
      const { Directory_Path, Files_to_Clean, Files_to_Exempt, Schedule } =
        cleanupConfig[0];
      let daemon;

      if (Schedule.includes("d")) {
        // Parse the schedule value for days
        const days = parseInt(Schedule);
        daemon = `* 12 */${days} * *`;
      } else if (Schedule.includes("m")) {
        // Parse the schedule value for minutes
        const months = parseInt(Schedule);
        daemon = `* 3 * */${months} *`;
      } else {
        // Invalid or unrecognized schedule format
        console.error("Invalid schedule format");
        return;
      }
      cron.schedule(daemon, () => {
        deleteFiles(Directory_Path, Files_to_Clean, Files_to_Exempt);
      });
    }
  })();
};

