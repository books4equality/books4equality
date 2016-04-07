var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var session = require('express-session');
var request = require('request');
var schoolServices = require('../services/schools.js');

function createSchool(pageText, callback) {
  var router2 = express.Router();
  router.get('/', function(req, res, next) {
    res.render('school', {
      text: pageText
    });
  });

  return callback(null, router);
}

module.exports = {
  createSchool: createSchool
};
