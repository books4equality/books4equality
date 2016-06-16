'use strict';
var mongoose = require('mongoose');

function connect(){
	var url = process.env.MONGO_URL || 'mongodb://localhost:27017/b4e';
	if (process.env.OPENSHIFT_MONGODB_DB_HOST) {
	    url = process.env.OPENSHIFT_MONGODB_DB_URL + process.env.OPENSHIFT_APP_NAME;
	}

	mongoose.connect(url);
	var db = mongoose.connection;
	db.on('error', console.error.bind(console, 'Mongoose connection error'));
	db.once('open', function(){
	    console.log('Mongoose connected');
	});
}

module.exports = {
	connect: connect
}
