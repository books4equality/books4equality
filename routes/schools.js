'use strict'

var express = require('express'),
	schools = require('../services/schools'),
	router = express.Router();

router.get('/', function(req, res, next) {

	schools.findSchools(function(err, schools){
		if(err) { 
			console.log(err);
			return res.status(500).send(); 
		}

		var schoolList = "";

		schools.forEach(function(school){
			schoolList += school.pageText;
		});

		res.render('school', {
    	text: schoolList
  	});

	});

});

module.exports = router;
