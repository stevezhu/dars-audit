const _ = require('lodash');
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
const AUDIT_URL = 'https://darsweb.admin.uillinois.edu/darswebstu_uiuc/ParseAudit.jsp';

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
  this.capture('captures/view_audits.png');
});

var audits;
var auditInfo = {};
casper.then(function() {
  audits = this.evaluate(function() {
    var audits = [];
    var $inputs = $('input[name=DETAILS]');
    $inputs.each(function() {
      var $input = $(this);
      var match = $input.attr('onclick').match(/OnViewAudit\('(\d+?)', '(\d+?)'\)/);
      var audit = {
        job_id: match[1],
        int_seq_no: match[2]
      };
      audits.push(audit);
    });
    return audits;
  });
  auditInfo = this.evaluate(function() {
    return {
      instidq: $('input[name=instidq]').val(),
      instid: $('input[name=instid]').val(),
      instcd: $('input[name=instcd]').val()
    };
  });
  auditInfo.DETAILS = 'Open+Audit';
}).then(function() {
  this.each(audits, function(self, audit) {
    audit = _.defaults(audit, auditInfo);
    self.thenOpen(AUDIT_URL + '?' + querystring.stringify(audit));
    self.then(function() {
      this.capture('captures/audit' + audit.job_id + '.png');
    });
  });
});

casper.on('remote.message', function(msg) {
  this.echo('remote message caught: ' + msg);
});

casper.run();
