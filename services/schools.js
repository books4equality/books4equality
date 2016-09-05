'use strict';

var db = require('./db');


function findSchools(callback) {
	db.get().collection('schools').find({}, { _id: 0, schoolID: 1, pageText: 1 }).toArray(function (err, schools) {
		if (err) {
			return callback(err);
		}
		return callback(null, schools);
	});
}

function getSchoolIDs(callback) {
	db.get().collection('schools').find({}, { _id: 0, schoolID: 1 }).toArray((err, schools) => {
		if (err) return callback(err)
		return callback(null, schools)
	})
}

module.exports = {
	findSchools,
	getSchoolIDs
};
