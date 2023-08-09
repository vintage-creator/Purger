const { program } = require('commander');
const path = require('path');
const fs = require('fs');

program
  .command('logs')
  .description('Log the deleted files')
  .action(() => {
    const directoryPath = path.join(__dirname, '..', "Configure_files", 'Log_cleanUps');
    const deletionLogPath = path.join(directoryPath, 'deletion_log.txt');

    if (fs.existsSync(deletionLogPath)) {
      const logText = fs.readFileSync(deletionLogPath, 'utf-8');
      console.log(logText);
    } else {
      console.log(`No deletion logs found in ${directoryPath}`);
      console.log('Consider running "purger-app configure" to create clean up files.');
    }
  });

// Parse the command-line arguments
program.parse(process.argv);
