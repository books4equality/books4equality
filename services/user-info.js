'use strict';

var memoize = require('memoizeasync'),
    db = require('./db'),
    logger = require('./logger'),
    ObjectID = require('mongodb').ObjectID;

function logged_in(callback){
    if(!req.session.user){
        var err = 'Not logged in';
        return callback(err)
    }

    var signedInString = 'Signed in as: ' + req.session.user;

    return callback(null, signedInString);

};


module.exports = {
    signedInString: memoize(signedInString, {maxAge: 30000})
};