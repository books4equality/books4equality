'use strict';

var db = require('./db'),
    logger = require('./logger'),
    ObjectID = require('mongodb').ObjectID;

function parseTags(tags) {
    function isEmpty(element) {
        return element;
    }

    return tags.split(',').filter(isEmpty);
}

function tags(callback) {
    var tags = ['anatomy', 'chemistry', 'french', 'ornithology', 'biology'];

    process.nextTick(function() {
        return callback(null, tags);
    });
}

function find(options, callback) {
    var criteria = {
        $query: {
            available: true
        },
        limit: 100
    };

    if (options.title) {
        criteria.$query.title = { $regex: options.title };
    }

    if (options.tags) {
        var tags = parseTags(options.tags);
        if (tags.length > 0) {
            criteria.$query.tags = { $in: tags };
        }
    }

    if (options.orderby) {
        criteria.$orderby = {};
        criteria.$orderby[options.orderby] = -1;
    }

    logger.info('search criteria %j', criteria);

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
