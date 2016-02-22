'use strict';

var db = require('./db'),
    subdomain = require('express-subdomain');

function findSchools(callback) {
  db.get().collection('schools').find({}, {_id: 0, shortName: 1}).toArray(function(err, schools) {
      if (err) {
          return callback(err);
      }

      return callback(null, schools);
  });
}

function createSubdomains(callback) {
  findSchools(function(err, schools) {
    if (err) {
        return callback(err);
    }
    return callback(null, schools)
  });
}

module.exports = {
  createSubdomains: createSubdomains
}
