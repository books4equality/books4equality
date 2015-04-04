var express = require('express');

var router = express.Router();

module.exports = router;


'use strict';

var express = require('express'),
    passport = require('passport'),
    BasicStrategy = require('passport-http').BasicStrategy,
    isbn = require('node-isbn'),
    bodyParser = require('body-parser'),
    logger = require('../services/logger');



passport.use(new BasicStrategy(
    function(username, password, done) {
        /*
	var ORG_PASS = false || Math.random().toString(36).substring(7);

        if (password !== ORG_PASS) {
            logger.warn('Authentication failed');
            return done(null, false);
        }
	*/

        return done(null, username);
    }
));

var router = express.Router();

router.use(passport.initialize());
router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json({ limit: '10kb' }));


router.get('/organizations', function(req, res, next) {
    res.render('organizations');
});


module.exports = router;


