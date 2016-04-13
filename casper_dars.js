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
});

casper.on('remote.message', function(msg) {
  this.echo('remote message caught: ' + msg);
});

casper.run();
