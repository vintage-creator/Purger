const fs = require("fs");
const path = require("path");

const logFilePath = path.join(__dirname, "deletion_log.txt"); // Set the path for the log file

async function logDeletedFiles(filePaths) {
  try {
    const formattedTimestamp = new Date().toUTCString();
    const logData = filePaths.map((filePath) => `Time of deletion- ${formattedTimestamp} \tFile deleted- ${filePath}`);
    const logText = logData.join("\n") + "\n\n";
    fs.appendFileSync(logFilePath, logText); // Append the log data to the log file
  } catch (err) {
    console.error("Error writing to the log file:", err);
  }
}
module.exports = logDeletedFiles;
