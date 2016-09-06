var request = require('request');
var testConfig = require('../test.json');

var hostname = testConfig.host;
var store = testConfig.store;

module.exports = {
  name: 'Cookie Based Auth (PouchDb Simulation) expired Session',
  description: 'cookie based session validation',
  run: function (done) {
    var jwtGenerator = require('../helpers/tokenGenerator');
    var currentTicks = (new Date().getTime() / 1000) - 3600;
    jwtGenerator.createToken(store, currentTicks, function (err, token) {
      if (err || !token) {
        return done(err);
      }

      request = request.defaults({
        jar: true
      });

      var cookieJar = request.jar();
      var sessionCookie = request.cookie('AuthSession=' + token);

      if (!(hostname.toLowerCase().startsWith('http://'))) {
        hostname = 'http://' + hostname
      }

      hostname += '/xyz';

      cookieJar.setCookie(sessionCookie, hostname);

      request.get(
          {
            url: hostname,
            jar: cookieJar
          },
          function (error, response) {
            if (error || response.statusCode === 200) {
              return done(error, {
                code: 'Failure'
              });
            }
            else {
              return done(null, {
                code: 'Success'
              });
            }
          });
    });
  }
};
