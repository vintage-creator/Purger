const { program } = require('commander');
const axios = require('axios');
const fs = require("fs");
const path = require("path");

const baseURL = 'http://localhost:8080/cleanup/config';

program.version("1.0.0");

const token = fs.readFileSync(path.join(__dirname, "token.txt"), "utf-8").trim();

// Use the token in API requests
axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

// Command: purger configure
program
  .command('configure')
  .description('Configure Purger settings')
  .requiredOption('--Directory_Path <path>', 'Specify Directory Path')
  .requiredOption('--Files_to_Clean <pattern>', 'Specify Files to Clean Pattern')
  .requiredOption('--Schedule <schedule>', 'Specify Files to Clean Schedule')
  .option('--Files_to_Exempt <pattern>', 'Specify Files to Exempt Pattern')
  .action(async (options) => {
    try {
      const { Directory_Path, Files_to_Clean, Files_to_Exempt, Schedule } = options;
      const payload = {
        Directory_Path,
        Files_to_Clean,
        Files_to_Exempt: Files_to_Exempt || '',
        Schedule
      };

      const response = await axios.post(baseURL, payload);
      console.log('Configuration saved successfully:', response.data);
    } catch (error) {
      console.error('Error saving configuration:', error.message);
    }
  });

  program.parse(process.argv);