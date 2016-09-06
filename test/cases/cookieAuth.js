var request = require('request');
var testConfig = require('../test.json');

var hostname = testConfig.host;
var store = testConfig.store;

module.exports = {
  name: 'Cookie Based Auth (PouchDb Simulation)',
  description: 'cookie based session validation',
  run: function (done) {
    var jwtGenerator = require('../helpers/tokenGenerator');
    jwtGenerator.createToken(store, null, function (err, token) {
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

      hostname += '/' + store;

      cookieJar.setCookie(sessionCookie, hostname);

      request.get(
          {
            url: hostname,
            jar: cookieJar
          },
          function (error, response) {
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
    });
  }
};
