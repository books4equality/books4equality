'use strict';

var db = require('./db'),
    logger = require('./logger');

function register(user, callback) {
    var criteria = {
        id: user.id
    };
    var $set = {
        timestampAccess: new Date()
    };

    var update = {
        $set: $set,
        $setOnInsert: user
    };

    var options = {
        upsert: true, // create user if it doesn't exist yet
        new: true
    };

    db.get().collection('users').findAndModify(criteria, [], update, options, function(err, result) {
        if (err) {
            return callback(err);
        }
        return callback(null, result.value);
    });
}

module.exports = {
    register: register
};
