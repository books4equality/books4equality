'use strict';

var db = require('./db'),
    logger = require('./logger');

function findOne(criteria, callback) {
    db.get().collection('organizations').findOne(criteria, function(err, result) {
        if (err) {
            return callback(err);
        }
        return callback(null, result);
    });
}

function insert(organization, callback) {
    db.get().collection('organizations').save(organization, function(err, result) {
        if (err) {
            return callback(err);
        }
        return callback(null, result);
    });
}

module.exports = {
    findOne: findOne,
    insert: insert
};
