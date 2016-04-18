const cp = require('child_process');
const readline = require('readline');
const argv = require('yargs').argv;
const cheerio = require('cheerio');

const ETX_CHAR = String.fromCharCode(3);

const casper_process = cp.spawn('casperjs', [
  'casper_dars.js',
  '--username=' + argv.username,
  '--password=' + argv.password
]);

var html = "";

readline.createInterface({
  input: casper_process.stdout,
  terminal: false
}).on('line', function(line) {
  if (line === ETX_CHAR) {
    var $ = cheerio.load(html);
    console.log($.html());

    html = ""; // reset html
  } else {
    html += line + '\n';
  }
});

casper_process.stderr.on('data', function(data) {
  console.log(`stderr: ${data}`);
});

casper_process.on('close', function(code) {
  console.log(`child process exited with code ${code}`);
});
