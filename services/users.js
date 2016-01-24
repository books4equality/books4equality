'use strict';

var db = require('./db'),
    logger = require('./logger');


function findOne(email, callback) {
	var criteria = {'email': email};
	
	db.get().collection('users').findOne(criteria, function(err, result) {
	    if (err) {
	        return callback(err);
	    }
	    return callback(null, result);
	});
}


/*
function findBooks(criteria, callback){
	db.get().collection('books').find(criteria).toArray(function(err, books){
		if(err){return callback(err);}

		return callback(null, books);

	});
}

function findOneBook(criteria, callback){
	db.get().collection('books').findOne(criteria, function(err, book){
		if(err){ return callback(err); }

		return callback(null, book);
	});
}

function unreserveBook(criteria, callback){
	var updateQuery = {
		$unset:{ '_meta.reservedBy': ''},
		$set:{'_meta.available':true}
	};

	db.get().collection('books').update(criteria, updateQuery, function(err, result){
		if(err){ return callback(err);}

		return callback(null, result);
	});
}

function signOutBook(criteria, callback){
	var timeStamp = new Date();
	var signOutInfo = { 'signOutDate': timeStamp };

	var updateQuery = {
		$set: {'_meta.signOutInfo': signOutInfo}
	};

	db.get().collection('books').update(criteria, updateQuery, function(err, result){
		if(err){ return callback(err); }

		return callback(null, result);

	});
}

function signInExistingBook(criteria, callback){
		var updateQuery = {
		$unset:{ 
			'_meta.reservedBy': '',
			'_meta.signOutInfo': ''					
		},
		$set:{'_meta.available':true}
	};

	db.get().collection('books').update(criteria, updateQuery, function(err, result){
		if(err){ return callback(err); }

		return callback(null, result);
	});
}

*/

module.exports = {
	findOne: findOne,
	//signOutBook: signOutBook,
	//signInExistingBook: signInExistingBook,
	//findBooks: findBooks,
	//findOneBook: findOneBook,
	//unreserveBook: unreserveBook
};