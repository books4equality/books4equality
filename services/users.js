'use strict';

var db = require('./db'),
    logger = require('./logger');


function findOne(criteria, callback) {
	db.get().collection('users').findOne(criteria, function(err, result) {
	    if (err) {
	        return callback(err);
	    }
	    return callback(null, result);
	});
}

function findBooks(criteria, callback){
	db.get().collection('books').find(criteria).toArray(function(err, books){
		if(err){return callback(err);}

		return callback(null, books);

	});
}

function unreserveBook(criteria, callback){
	db.get().collection('books').update(criteria, $unset:{ 'reservedBy': ''});

}

module.exports = {
	findOne: findOne,
	findBooks: findBooks,
	unreserveBook: unreserveBook
};