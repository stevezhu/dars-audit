console.log('start');

const querystring = require('querystring');

const sjcl = require('sjcl');

const casper = require('casper').create({
  clientScripts: [
    'includes/jquery-2.2.3.min.js'
  ],
  pageSettings: {
    loadImages: true,
    loadPlugins: true
  },
});

const LOGIN_URL = 'https://darsweb.admin.uillinois.edu:443/darswebstu_uiuc/servlet/EASDarsServlet';
const REQUEST_AUDIT_URL = 'https://darsweb.admin.uillinois.edu/darswebstu_uiuc/servlet/RequestAuditServlet';
const VIEW_AUDITS_URL = 'https://darsweb.admin.uillinois.edu/darswebstu_uiuc/servlet/ListAuditsServlet';

var settings = {
  credentials: {
    username: casper.cli.options.username,
    password: casper.cli.options.password
  }
};

casper.start(LOGIN_URL, function() {
  this.fill('form[name="easForm"]', {
    inputEnterpriseId: settings.credentials.username,
    password: settings.credentials.password
  }, false);
  this.click('input[name=BTN_LOGIN]');
  this.capture('captures/signin.png');
});

casper.thenOpen(REQUEST_AUDIT_URL);

casper.thenOpen(VIEW_AUDITS_URL);

casper.then(function() {
  this.capture('captures/capture.png');

  this.click('input[name=DETAILS]');
});

casper.thenOpen('https://darsweb.admin.uillinois.edu/darswebstu_uiuc/ParseAudit.jsp?' + querystring.stringify({
  job_id: 2016041223254581,
  int_seq_no: 6568370,
  instidq: 73,
  instid: 001775,
  instcd: 'HYP',
  DETAILS: 'Open+Audit'
}));

casper.then(function() {
  this.capture('captures/audit.png');
});

casper.on('remote.message', function(msg) {
  this.echo('remote message caught: ' + msg);
});

casper.run();
