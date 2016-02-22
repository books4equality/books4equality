'use strict'

var express = require('express');

var router = express.Router();

function createSchool(schoolID, callback) {
  router.get('/', function(req, res, next) {
    res.send('Welcome to ' + schoolID + ' B4E!');
  });

  return callback(null, router);
}

router.get('/b', function(req, res, next) {
  res.send('Welcome to UVM B4E!');
});

module.exports = {
  createSchool: createSchool,
  router: router
}
