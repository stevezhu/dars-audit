const cp = require('child_process');
const argv = require('yargs').argv;

var credentials = {
  username: argv.username,
  password: argv.password
};
console.log('argv', JSON.stringify(credentials));

const casper_process = cp.spawn('casperjs', [
  'casper_dars.js',
  '--username=' + argv.username,
  '--password=' + argv.password
]);

casper_process.stdout.on('data', (data) => {
  console.log(`stdout: ${data}`);
});

casper_process.stderr.on('data', (data) => {
  console.log(`stderr: ${data}`);
});

casper_process.on('close', (code) => {
  console.log(`child process exited with code ${code}`);
});
