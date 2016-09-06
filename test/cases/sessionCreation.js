var request = require('request');
var hostname = require('../test.json').host;

module.exports = {
  name: 'Session creation (Pouchdb Simulation )',
  description: 'simulate the _session call to be forwarded to Auth tower',
  run: function (done) {

    if (!hostname.toLowerCase().startsWith('http://')) {
      hostname = 'http://' + hostname
    }
    hostname += '/_session';

    request.post(hostname, function (error, response) {
      if (!error && response.statusCode == 200) {
        return done(null, {
          code: 'Success'
        });
      } else {
        return done(error, {
          code: 'Failure'
        });
      }
    });
  }
};
