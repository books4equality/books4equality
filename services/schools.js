'use strict';

var db = require('./db');

function findSchools(callback) {
  db.get().collection('schools').find({}, {_id: 0, shortName: 1, pageText: 1}).toArray(function(err, schools) {
      if (err) {
          return callback(err);
      }

      return callback(null, schools);
  });
}

module.exports = {
  findSchools: findSchools
};
