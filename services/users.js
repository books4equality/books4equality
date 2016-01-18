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
	var updateQuery = {$unset:{ '_meta.reservedBy': ''},$set:{'_meta.available':true}};

	db.get().collection('books').update(criteria, updateQuery, function(err, result){
		if(err){ return callback(err);}

		return callback(null, result);
	});
}

module.exports = {
	findOne: findOne,
	findBooks: findBooks,
	unreserveBook: unreserveBook
};