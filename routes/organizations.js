'use strict';

var express = require('express'),
    passport = require('passport'),
    BasicStrategy = require('passport-http').BasicStrategy,
    isbn = require('node-isbn'),
    bodyParser = require('body-parser'),
    //logger = require('../services/logger');

//logger.info('Administrative password', ADMIN_PASS)

passport.use(new BasicStrategy(
    function(username, password, done) {
        //var ORG_PASS = (get it from mongodb?) || Math.random().toString(36).substring(7);

        //if (password !== ORG_PASS) {
        //    logger.warn('Authentication failed');
        //    return done(null, false);
        //}

        return done(null, username);
    }
));

var router = express.Router();

router.use(passport.initialize());
router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json({ limit: '10kb' }));

router.get('/organizations/organizations', passport.authenticate('basic', {session: false}), function(req, res) {
    return res.render('organizations/organizations');
});


module.exports = router;
