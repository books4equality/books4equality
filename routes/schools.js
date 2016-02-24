'use strict'

var express = require('express');

function createSchool(pageText, callback) {
  var router = express.Router();
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
