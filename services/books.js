'use strict';

var db = require('./db'),
    ObjectID = require('mongodb').ObjectID;

function tags(callback) {
    var tags = ['anatomy', 'chemistry', 'french', 'ornithology', 'biology'];

    process.nextTick(function() {
        return callback(null, tags);
    });
}

function find(options, callback) {
    var criteria = {
        available: true
    };

    db.get().collection('books').find(criteria).toArray(function(err, books) {
        if (err) {
            return callback(err);
        }
        return callback(null, books);
    });
}

function findOne(id, callback) {
    var oid = new ObjectID(id)
    var criteria = {
        _id: oid,
        available: true
    };

    db.get().collection('books').findOne(criteria, function(err, book) {
        if (err) {
            return callback(err);
        }
        return callback(null, book);
    })
}

module.exports = {
    tags: tags,
    find: find,
    findOne: findOne
};
