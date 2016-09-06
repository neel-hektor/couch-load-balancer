var jwt = require('jsonwebtoken');
var SECRET_KEY = require('../config.json').key;
var maxValidity = require('../test.json').maxValidity;

var createToken = function (store, exp, callback) {
  var currentTicks = new Date().getTime() / 1000;

  jwt.sign(
      {
        nbf: parseInt(currentTicks),
        exp: parseInt(exp ? exp : currentTicks + maxValidity),
        iss: store
      },
      SECRET_KEY,
      {
        algorithm: 'HS256'
      },
      function (err, token) {
        if (err) {
          callback(err);
        }
        callback(null, token);
      });
};

module.exports = {
  createToken: createToken
};

