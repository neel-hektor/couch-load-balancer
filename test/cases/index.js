'use strict';

var fs = require('fs');
var path = require('path');
var async = require('async');

var currentFile = path.basename(__filename);

var tests = fs
    .readdirSync(__dirname)
    .filter(function (file) {
      return (fs.lstatSync(path.join(__dirname, file)).isFile()) && (file !== currentFile);
    });

async.each(tests,
    function (test, callback) {
      test = require(path.join(__dirname, test));
      test.run(function (err, result) {
        if (err) {
          callback(err);
        } else {
          console.log('Name: ', test.name, '\t', 'Status: ', result.code);
        }
      });
    },
    function (err) {
      if (err) {
        console.log(err);
      } else {
        console.log('All tests have been processed successfully');
      }
    });
