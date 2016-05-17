const cp = require('child_process');
const readline = require('readline');
const argv = require('yargs').argv;
const cheerio = require('cheerio');
const _ = require('lodash');

const ETX_CHAR = String.fromCharCode(3);

const casper_process = cp.spawn('casperjs', [
  'casper_dars.js',
  '--username=' + argv.username,
  '--password=' + argv.password
]);


const PATTERNS = {
  HEADER_DATA: />PREPARED: (\d\d\/\d\d\/\d\d) - (\d\d:\d\d) (\d{9})<\/span>.+?>PROGRAM CODE: (\d+?) ?([a-z]+?) CATALOG YEAR: (\d+?)<\/span>.+?>ADVISOR:(.*?)<\/span>(.+)$/i,
  PROGRAM_NAME: /> (.+?)<\/span>/ig,
  UNDERLINE: /(?:^|<div class="underline"> <\/div>)(.*?)<div class="underline"> <\/div>/ig
};

var html = "";

readline.createInterface({
  input: casper_process.stdout,
  terminal: false
}).on('line', function(line) {
  if (line === ETX_CHAR) {
    var $ = cheerio.load(html, { normalizeWhitespace: true });
    html = $('pre').html();

    var match;

    match = PATTERNS.UNDERLINE.exec(html); // first match is header data
    var headerText = match[1];
    match = PATTERNS.HEADER_DATA.exec(headerText);

    var headerData = {
      creationDate: new Date(match[1] + ' ' + match[2]),
      uin: parseInt(match[3]),
      programCode: match[4] + ' ' + match[5],
      catalogYear: match[6],
      advisor: match[7],
      programName: []
    };

    var programNameHTML = match[8];
    while (match = PATTERNS.PROGRAM_NAME.exec(programNameHTML)) {
      headerData.programName.push(match[1]);
    }
    console.log(headerData);

    // while (match = PATTERNS.UNDERLINE.exec(html)) {
    //   console.log("match", match[1].trim());
    // }

    html = ""; // reset html

    // reset patterns
    _.each(PATTERNS, function(pattern, key) {
      pattern.lastIndex = 0;
    });
  } else {
    html += line;
  }
});

casper_process.stderr.on('data', function(data) {
  console.log(`stderr: ${data}`);
});

casper_process.on('close', function(code) {
  console.log(`child process exited with code ${code}`);
});
