var request = require('request');
var testConfig = require('../test.json');

var hostname = testConfig.host;
var store = testConfig.store;
var username = testConfig.username;

module.exports = {
  name: 'Basic Auth (Replication Simulation)',
  description: 'Header based request authorization',
  run: function (done) {
    var jwtGenerator = require('../helpers/tokenGenerator');
    jwtGenerator.createToken(store, null, function (err, token) {
      if (err || !token) {
        return done(err);
      }


      if (!(hostname.toLowerCase().startsWith('http://'))) {
        hostname = 'http://' + hostname
      }

      hostname += '/' + store;

      var authHash = new Buffer(username + ':' + token).toString('base64');

      request.get(
          {
            url: hostname,
            headers: {
              'Authorization': 'Basic ' + authHash
            }
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
