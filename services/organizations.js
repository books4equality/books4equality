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

function find(options, callback) {
    var criteria = {
        $query: { }
    };

    var hints = {
        limit: 100
    };

    if (options.skip) {
        hints.skip = parseInt(options.skip);
    }

    logger.info('search criteria %j', criteria);
    logger.info('search hints %j', hints);

    db.get().collection('organizations').find(criteria, hints).toArray(function(err, books) {
        if (err) {
            return callback(err);
        }
        return callback(null, organizations);
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
    insert: insert,
    find: find
};
